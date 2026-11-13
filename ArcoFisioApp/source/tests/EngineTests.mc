import Toybox.Lang;
import Toybox.Test;

// Unit tests of the session engine (zones, repetition machine, session run).
// Samples are injected as (angle, time) pairs; no sensor is involved.
//
// Parity cases of spec v2, section 3 ("Prioridad del arco doloroso"), for
// both rules: objective 90 with arc 70-110 and a reading of 90, and
// objective 90 with arc 100-125 and a reading of 106.

module EngineTests {

    function config(target as Float, arcFrom as Float?, arcTo as Float?, rule as Number) as RunConfig {
        return new RunConfig(target, 2.0f, arcFrom, arcTo, rule);
    }

    // Feeds angles spaced `stepMs` apart from `startMs`; returns the OR of
    // the events raised.
    function feed(run as SessionRun, angles as Array<Float>, startMs as Number, stepMs as Number) as Number {
        var all = 0;
        for (var i = 0; i < angles.size(); i++) {
            all |= run.step(angles[i], startMs + i * stepMs);
        }
        return all;
    }

    // ---- Zones ---------------------------------------------------------

    (:test)
    function zonesFollowTheV1Bands(logger as Logger) as Boolean {
        var c = config(90.0f, null, null, EngineConfig.PAIN_RULE_V1);
        return Zones.classify(90.0f, c) == Zones.ZONE_TARGET
            && Zones.classify(88.0f, c) == Zones.ZONE_TARGET
            && Zones.classify(92.0f, c) == Zones.ZONE_TARGET
            && Zones.classify(92.5f, c) == Zones.ZONE_OVERSHOOT
            && Zones.classify(87.5f, c) == Zones.ZONE_NEAR
            && Zones.classify(82.0f, c) == Zones.ZONE_NEAR
            && Zones.classify(81.0f, c) == Zones.ZONE_APPROACH
            && Zones.classify(60.0f, c) == Zones.ZONE_APPROACH
            && Zones.classify(59.0f, c) == Zones.ZONE_FAR;
    }

    (:test)
    function toleranceLimitsAreIncluded(logger as Logger) as Boolean {
        return Zones.isOnTarget(88.0f, 90.0f, 2.0f)
            && Zones.isOnTarget(92.0f, 90.0f, 2.0f)
            && !Zones.isOnTarget(92.1f, 90.0f, 2.0f)
            && Zones.isInPainArc(100.0f, 100.0f, 125.0f)
            && Zones.isInPainArc(125.0f, 100.0f, 125.0f)
            && !Zones.isInPainArc(125.1f, 100.0f, 125.0f)
            && !Zones.isInPainArc(110.0f, null, null);
    }

    (:test)
    function repetitionWindowMatchesV1(logger as Logger) as Boolean {
        var engine = new RepEngine(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        var small = new RepEngine(config(8.0f, null, null, EngineConfig.PAIN_RULE_V1));
        return engine.returnAngle() == 60.0f && engine.startAngle() == 65.0f
            && small.returnAngle() == 4.0f && small.startAngle() == 6.0f;
    }

    // ---- Pain-arc priority: the two rules on the two parity cases ------

    (:test)
    function parityCase1V1ObjectiveInsideTheArcCountsAsTarget(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, 70.0f, 110.0f, EngineConfig.PAIN_RULE_V1));
        var events = run.step(90.0f, 0);
        var stats = run.stats();
        return run.zone() == Zones.ZONE_TARGET
            && (events & RepEngine.EVENT_TARGET_REACHED) != 0
            && stats.hits == 1
            && stats.painEntries == 0
            && (events & SessionRun.EVENT_ENTERED_PAIN) == 0;
    }

    (:test)
    function parityCase1PainFirstObjectiveInsideTheArcIsPain(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, 70.0f, 110.0f, EngineConfig.PAIN_RULE_PAIN_FIRST));
        var events = run.step(90.0f, 0);
        var stats = run.stats();
        return run.zone() == Zones.ZONE_PAIN
            && (events & RepEngine.EVENT_TARGET_REACHED) == 0
            && stats.hits == 0
            && stats.painEntries == 1
            && (events & SessionRun.EVENT_ENTERED_PAIN) != 0;
    }

    (:test)
    function parityCase2V1OvershootInsideTheArcIsOvershoot(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, 100.0f, 125.0f, EngineConfig.PAIN_RULE_V1));
        var events = run.step(106.0f, 0);
        var stats = run.stats();
        return run.zone() == Zones.ZONE_OVERSHOOT
            && (events & RepEngine.EVENT_OVERSHOOT) != 0
            && stats.overshoots == 1
            && stats.painEntries == 0;
    }

    (:test)
    function parityCase2PainFirstOvershootInsideTheArcIsPain(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, 100.0f, 125.0f, EngineConfig.PAIN_RULE_PAIN_FIRST));
        var events = run.step(106.0f, 0);
        var stats = run.stats();
        return run.zone() == Zones.ZONE_PAIN
            && (events & RepEngine.EVENT_OVERSHOOT) == 0
            && stats.overshoots == 0
            && stats.painEntries == 1;
    }

    (:test)
    function painFirstNeverHoldsInsideTheArc(logger as Logger) as Boolean {
        // 2 s on the target while it lies inside the arc.
        var painFirst = new SessionRun(config(90.0f, 70.0f, 110.0f, EngineConfig.PAIN_RULE_PAIN_FIRST));
        var v1 = new SessionRun(config(90.0f, 70.0f, 110.0f, EngineConfig.PAIN_RULE_V1));
        var angles = [90.0f, 90.0f, 90.0f, 90.0f, 90.0f] as Array<Float>;
        var painFirstEvents = feed(painFirst, angles, 0, 500);
        var v1Events = feed(v1, angles, 0, 500);
        return (painFirstEvents & RepEngine.EVENT_HELD) == 0
            && !painFirst.engine().isHeld()
            && (v1Events & RepEngine.EVENT_HELD) != 0;
    }

    (:test)
    function painFirstStillRegistersTheRepetitionOnReturn(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, 70.0f, 110.0f, EngineConfig.PAIN_RULE_PAIN_FIRST));
        feed(run, [90.0f, 90.0f, 55.0f] as Array<Float>, 0, 500);
        var stats = run.stats();
        return stats.repsCounted() == 1 && !stats.repHeld[0] && stats.hits == 0;
    }

    (:test)
    function painEntriesCountEachEntryAndRememberTheRepetition(logger as Logger) as Boolean {
        // Target 90, arc 100-125 under the pain-first rule: two repetitions,
        // the second one enters the arc twice.
        var run = new SessionRun(config(90.0f, 100.0f, 125.0f, EngineConfig.PAIN_RULE_PAIN_FIRST));
        feed(run, [70.0f, 90.0f, 55.0f, 70.0f, 105.0f, 95.0f, 110.0f, 55.0f] as Array<Float>, 0, 100);
        var stats = run.stats();
        return stats.repsCounted() == 2
            && stats.painEntries == 2
            && stats.painReps.size() == 2
            && stats.painReps[0] == 2
            && stats.painReps[1] == 2;
    }

    // ---- Hold: 999 ms against 1000 ms --------------------------------

    (:test)
    function holdOf999MsIsNotHeld(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        run.step(90.0f, 0);
        var events = run.step(90.0f, 999);
        return (events & RepEngine.EVENT_HELD) == 0 && !run.engine().isHeld();
    }

    (:test)
    function holdOf1000MsIsHeld(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        run.step(90.0f, 0);
        var events = run.step(90.0f, 1000);
        return (events & RepEngine.EVENT_HELD) != 0 && run.engine().isHeld();
    }

    (:test)
    function holdBothRulesAgreeWithoutAnArc(logger as Logger) as Boolean {
        var a = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        var b = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_PAIN_FIRST));
        a.step(90.0f, 0);
        b.step(90.0f, 0);
        var ea = a.step(90.0f, 1000);
        var eb = b.step(90.0f, 1000);
        var na = a.step(90.0f, 999 + 1);
        return ea == eb && (ea & RepEngine.EVENT_HELD) != 0 && na == 0;
    }

    (:test)
    function leavingTheToleranceRestartsTheHold(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        run.step(90.0f, 0);
        run.step(90.0f, 600);
        run.step(80.0f, 700);
        var events = run.step(90.0f, 1000);
        var progress = run.engine().holdProgress();
        return (events & RepEngine.EVENT_HELD) == 0 && progress == 0.0f;
    }

    (:test)
    function holdProgressIsMeasuredOnSampleTimes(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        run.step(90.0f, 1000);
        run.step(90.0f, 1500);
        var half = run.engine().holdProgress();
        run.step(90.0f, 2500);
        return half == 0.5f && run.engine().holdProgress() == 1.0f;
    }

    // ---- Repetitions ---------------------------------------------------

    (:test)
    function aRepetitionIsRegisteredOnReturnAndMayBeUnheld(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        // Reaches the target for 200 ms only, then returns: registered, not held.
        var events = feed(run, [66.0f, 85.0f, 90.0f, 70.0f, 60.0f] as Array<Float>, 0, 100);
        var stats = run.stats();
        return (events & RepEngine.EVENT_REP_COMPLETED) != 0
            && stats.repsCounted() == 1
            && !stats.repHeld[0]
            && stats.hits == 1
            && stats.repPeaks[0] == 90.0f;
    }

    (:test)
    function aHeldRepetitionIsRecordedAsHeld(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        feed(run, [70.0f, 90.0f, 90.0f, 90.0f, 90.0f, 90.0f, 59.0f] as Array<Float>, 0, 250);
        var stats = run.stats();
        return stats.repsCounted() == 1 && stats.repHeld[0] && stats.repsHeld() == 1;
    }

    (:test)
    function nothingCountsBelowTheStartAngle(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        var events = feed(run, [10.0f, 30.0f, 64.0f, 20.0f] as Array<Float>, 0, 100);
        return events == 0 && run.stats().repsCounted() == 0 && run.stats().maxAngle == 64.0f;
    }

    (:test)
    function overshootCountsOncePerRepetition(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        feed(run, [70.0f, 96.0f, 99.0f, 60.0f, 70.0f, 97.0f, 60.0f] as Array<Float>, 0, 100);
        var stats = run.stats();
        return stats.overshoots == 2 && stats.repsCounted() == 2;
    }

    // ---- Stale samples, gaps and pauses ---------------------------------

    (:test)
    function aStaleOrRepeatedSampleIsIgnored(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        run.step(90.0f, 5000);
        var repeated = run.step(90.0f, 5000);
        var older = run.step(90.0f, 4000);
        return repeated == 0 && older == 0 && !run.engine().accepted()
            && run.engine().lastSampleMs() == 5000;
    }

    (:test)
    function aSampleGapRestartsTheHold(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        run.step(90.0f, 0);
        run.step(90.0f, 500);
        // Nothing for 2 s, then a sample on the target: the old hold is gone.
        var events = run.step(90.0f, 2500);
        var first = (events & RepEngine.EVENT_HELD) == 0 && run.engine().holdProgress() == 0.0f;
        var again = run.step(90.0f, 3500);
        return first && (again & RepEngine.EVENT_HELD) != 0;
    }

    (:test)
    function aPauseRestartsTheHoldAndAStaleSampleCannotFinishIt(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        run.step(90.0f, 0);
        run.step(90.0f, 900);
        run.pause();
        // The last sample is repeated long after: it is not newer, so it
        // cannot complete the second of hold.
        var stale = run.step(90.0f, 900);
        // First sample after the pause only restarts the hold.
        var fresh = run.step(90.0f, 1000);
        var notYet = run.step(90.0f, 1999);
        var done = run.step(90.0f, 2000);
        return stale == 0
            && (fresh & RepEngine.EVENT_HELD) == 0
            && (notYet & RepEngine.EVENT_HELD) == 0
            && (done & RepEngine.EVENT_HELD) != 0;
    }

    (:test)
    function maximumFollowsTheHighestAcceptedSample(logger as Logger) as Boolean {
        var run = new SessionRun(config(90.0f, null, null, EngineConfig.PAIN_RULE_V1));
        run.step(40.0f, 0);
        run.step(120.0f, 100);
        run.step(150.0f, 50);
        return run.stats().maxAngle == 120.0f;
    }
}
