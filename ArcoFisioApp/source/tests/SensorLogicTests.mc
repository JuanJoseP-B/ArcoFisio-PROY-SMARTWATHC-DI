import Toybox.Lang;
import Toybox.Math;
import Toybox.Test;

// Unit tests for the pure sensor helpers: cadence measurement and the
// calibration stability hold.

module SensorLogicTests {

    const SAMPLE_PERIOD_MS = 40; // 25 Hz

    function newHold() as CalibrationHold {
        return new CalibrationHold(3000, 20, 4.0f, 2500);
    }

    // Milli-g gravity for an arm raised `degrees` from hanging along -z.
    function gravityAt(degrees as Numeric) as Array<Numeric> {
        var r = Math.toRadians(degrees.toDouble());
        return [1000 * Math.sin(r), 0, -1000 * Math.cos(r)];
    }

    // Feeds samples of one posture every 40 ms; returns the time after the last one.
    function feed(hold as CalibrationHold, degrees as Numeric, fromMs as Number, durationMs as Number) as Number {
        var t = fromMs;
        while (t <= fromMs + durationMs) {
            hold.addSample(gravityAt(degrees), t);
            t += SAMPLE_PERIOD_MS;
        }
        return t;
    }

    (:test)
    function cadenceNeedsACompleteWindow(logger as Logger) as Boolean {
        var meter = new CadenceMeter(2000);
        meter.addSamples(25, 1000);
        meter.addSamples(25, 2000);
        return meter.hz() == null;
    }

    (:test)
    function cadenceCountsBatches(logger as Logger) as Boolean {
        var meter = new CadenceMeter(2000);
        meter.addSamples(25, 1000); // opens the window
        meter.addSamples(25, 2000);
        meter.addSamples(25, 3000);
        var hz = meter.hz();
        logger.debug("batches: " + hz);
        return hz != null && AngleMathTests.closeTo(hz, 25, 0.01d);
    }

    (:test)
    function cadenceCountsSingleSamples(logger as Logger) as Boolean {
        var meter = new CadenceMeter(2000);
        for (var t = 0; t <= 2000; t += 100) {
            meter.addSamples(1, t);
        }
        var hz = meter.hz();
        logger.debug("polling: " + hz);
        return hz != null && AngleMathTests.closeTo(hz, 10, 0.01d);
    }

    (:test)
    function cadenceResetForgetsTheValue(logger as Logger) as Boolean {
        var meter = new CadenceMeter(1000);
        meter.addSamples(1, 0);
        meter.addSamples(10, 1000);
        var before = meter.hz();
        meter.reset();
        return before != null && meter.hz() == null;
    }

    (:test)
    function holdCompletesAfterThreeStillSeconds(logger as Logger) as Boolean {
        var hold = newHold();
        feed(hold, 0, 0, 2960);
        var early = hold.isDone();
        hold.addSample(gravityAt(0), 3000);
        var ref = hold.gravityRef();
        if (early || !hold.isDone() || ref == null) {
            return false;
        }
        var angle = AngleMath.computeAngle(gravityAt(0), ref);
        return AngleMathTests.closeTo(angle, 0, 0.01d) && hold.restartCount() == 0;
    }

    (:test)
    function holdReportsRemainingTime(logger as Logger) as Boolean {
        var hold = newHold();
        var untouched = hold.remainingMs();
        feed(hold, 0, 0, 1000);
        return untouched == 3000 && hold.remainingMs() == 2000
            && AngleMathTests.closeTo(hold.progress(), 0.3333d, 0.001d);
    }

    (:test)
    function holdRestartsOnMovement(logger as Logger) as Boolean {
        var hold = newHold();
        var t = feed(hold, 0, 0, 2000);
        // The arm moves 30 degrees: the countdown starts again from there.
        hold.addSample(gravityAt(30), t);
        var restartedAt = hold.lastRestartMs();
        var afterMove = hold.remainingMs();
        feed(hold, 30, t + SAMPLE_PERIOD_MS, 2000);
        var stillRunning = !hold.isDone();
        feed(hold, 30, t + 2080, 1000);
        var ref = hold.gravityRef();
        return hold.restartCount() == 1 && restartedAt == t && afterMove == 3000
            && stillRunning && ref != null
            && AngleMathTests.closeTo(AngleMath.computeAngle(gravityAt(30), ref), 0, 0.01d);
    }

    (:test)
    function holdToleratesSmallNoise(logger as Logger) as Boolean {
        var hold = newHold();
        var t = 0;
        var i = 0;
        while (t <= 3000) {
            hold.addSample(gravityAt(i % 2 == 0 ? 1.5d : -1.5d), t);
            t += SAMPLE_PERIOD_MS;
            i += 1;
        }
        return hold.isDone() && hold.restartCount() == 0;
    }

    (:test)
    function holdRejectsSlowDrift(logger as Logger) as Boolean {
        var hold = newHold();
        var t = 0;
        // 6 degrees over 3 seconds: every step is tiny but the arm did not stay put.
        while (t <= 3000) {
            hold.addSample(gravityAt(6.0d * t / 3000), t);
            t += SAMPLE_PERIOD_MS;
        }
        return !hold.isDone() && hold.restartCount() >= 1;
    }

    (:test)
    function holdRestartsAfterAGapWithoutSamples(logger as Logger) as Boolean {
        var hold = newHold();
        var t = feed(hold, 0, 0, 2000);
        // Same posture, but nothing arrived for longer than the allowed gap.
        hold.addSample(gravityAt(0), t + 2600);
        return !hold.isDone() && hold.restartCount() == 1 && hold.remainingMs() == 3000;
    }

    (:test)
    function holdIgnoresVectorsWithoutDirection(logger as Logger) as Boolean {
        var hold = newHold();
        for (var t = 0; t <= 4000; t += SAMPLE_PERIOD_MS) {
            hold.addSample([0, 0, 0], t);
        }
        return !hold.isDone() && !hold.hasSamples() && hold.remainingMs() == 3000;
    }

    (:test)
    function holdNeedsEnoughSamples(logger as Logger) as Boolean {
        var hold = newHold();
        // One sample per second covers the time but not the sample count.
        for (var t = 0; t <= 4000; t += 1000) {
            hold.addSample(gravityAt(0), t);
        }
        return !hold.isDone();
    }

    (:test)
    function holdStopsChangingOnceDone(logger as Logger) as Boolean {
        var hold = newHold();
        var t = feed(hold, 0, 0, 3000);
        hold.addSample(gravityAt(90), t);
        var ref = hold.gravityRef();
        return hold.isDone() && hold.restartCount() == 0 && ref != null
            && AngleMathTests.closeTo(AngleMath.computeAngle(gravityAt(0), ref), 0, 0.01d);
    }
}
