import Toybox.Lang;
import Toybox.Math;
import Toybox.Test;

// Unit tests for AngleMath. They mirror the web v1 examples in
// src/domain/vector.test.ts, angle.test.ts and filter.test.ts so both
// engines agree on the same inputs.

module AngleMathTests {

    // Gravity magnitude used by the v1 examples (m/s^2). The math must not
    // depend on the unit, so the same numbers are reused here.
    const G = 9.81d;

    function closeTo(actual as Numeric?, expected as Numeric, tolerance as Numeric) as Boolean {
        if (actual == null) {
            return false;
        }
        var delta = actual.toDouble() - expected.toDouble();
        if (delta < 0) {
            delta = -delta;
        }
        return delta <= tolerance.toDouble();
    }

    // Large runtime value: its square overflows to infinity. (Dividing a
    // Double by zero raises "Invalid Value" instead of returning infinity.)
    function huge() as Double {
        return 1.0e200d;
    }

    // Gravity vector for an arm raised `degrees` from the hanging position.
    function rotated(degrees as Numeric, magnitude as Numeric) as Array<Numeric> {
        var r = Math.toRadians(degrees.toDouble());
        return [magnitude.toDouble() * Math.sin(r), 0.0d, magnitude.toDouble() * Math.cos(r)];
    }

    (:test)
    function dotAndNorm(logger as Logger) as Boolean {
        return closeTo(AngleMath.dot([1, 2, 3], [4, 5, 6]), 32, 0.000001d)
            && closeTo(AngleMath.norm([3, 4, 0]), 5, 0.000001d);
    }

    (:test)
    function normalizeGivesUnitLength(logger as Logger) as Boolean {
        var unit = AngleMath.normalize([0, 0, G]);
        if (unit == null) {
            return false;
        }
        var other = AngleMath.normalize([3, 4, 12]);
        if (other == null) {
            return false;
        }
        return closeTo(unit[0], 0, 0.000001d)
            && closeTo(unit[1], 0, 0.000001d)
            && closeTo(unit[2], 1, 0.000001d)
            && closeTo(AngleMath.norm(other), 1, 0.000001d);
    }

    (:test)
    function normalizeRejectsUnusableVectors(logger as Logger) as Boolean {
        var nan = Math.sqrt(-1.0d);
        var infinity = huge() * huge();
        return AngleMath.normalize([0, 0, 0]) == null
            && AngleMath.normalize([0.000000001d, 0, 0]) == null
            && AngleMath.normalize([nan, 1, 0]) == null
            && AngleMath.normalize([infinity, 0, 0]) == null;
    }

    (:test)
    function measuresReferenceAngles(logger as Logger) as Boolean {
        var hanging = [0, 0, G];
        var expected = [0, 45, 90, 135, 180];
        for (var i = 0; i < expected.size(); i++) {
            var angle = AngleMath.computeAngle(rotated(expected[i], G), hanging);
            logger.debug("expected " + expected[i] + " got " + angle);
            if (!closeTo(angle, expected[i], 0.001d)) {
                return false;
            }
        }
        return true;
    }

    (:test)
    function angleIgnoresMagnitude(logger as Logger) as Boolean {
        return closeTo(AngleMath.computeAngle(rotated(90, 1), [0, 0, G]), 90, 0.001d)
            && closeTo(AngleMath.computeAngle(rotated(90, 40), [0, 0, 1]), 90, 0.001d);
    }

    // The watch reports milli-g integers; 1 g hanging on z, then on x.
    (:test)
    function angleWorksWithMilliG(logger as Logger) as Boolean {
        return closeTo(AngleMath.computeAngle([1000, 0, 0], [0, 0, 1000]), 90, 0.001d)
            && closeTo(AngleMath.computeAngle([707, 0, 707], [0, 0, 1000]), 45, 0.001d)
            && closeTo(AngleMath.computeAngle([12, -8, -995], [12, -8, -995]), 0, 0.01d);
    }

    (:test)
    function angleIgnoresRotationAxis(logger as Logger) as Boolean {
        var third = Math.PI / 3;
        var tilted = [0, G * Math.sin(third), G * Math.cos(third)];
        return closeTo(AngleMath.computeAngle(tilted, [0, 0, G]), 60, 0.001d)
            && closeTo(AngleMath.computeAngle([G, 0, 0], [0, G, 0]), 90, 0.001d);
    }

    (:test)
    function angleWithTiltedCalibration(logger as Logger) as Boolean {
        var ref = [3, 4, 5];
        return closeTo(AngleMath.computeAngle(ref, ref), 0, 0.01d)
            && closeTo(AngleMath.computeAngle([-3, -4, -5], ref), 180, 0.01d);
    }

    (:test)
    function angleStaysInRangeWhenCosinePassesOne(logger as Logger) as Boolean {
        var result = AngleMath.computeAngle([0.000000001d, 0, 1], [0, 0, 1]);
        return result != null && result >= 0 && result <= 180;
    }

    (:test)
    function angleIsNullWithoutDirection(logger as Logger) as Boolean {
        var hanging = [0, 0, G];
        var nan = Math.sqrt(-1.0d);
        return AngleMath.computeAngle([0, 0, 0], hanging) == null
            && AngleMath.computeAngle(hanging, [0, 0, 0]) == null
            && AngleMath.computeAngle([nan, 0, 1], hanging) == null;
    }

    (:test)
    function clampLimitsToRange(logger as Logger) as Boolean {
        return closeTo(AngleMath.clampAngle(-3), 0, 0)
            && closeTo(AngleMath.clampAngle(95), 95, 0)
            && closeTo(AngleMath.clampAngle(200), 180, 0);
    }

    (:test)
    function filterStartsFromFirstReading(logger as Logger) as Boolean {
        return closeTo(AngleMath.filterAngle(null, 42), 42, 0)
            && closeTo(AngleMath.filterAngle(null, 250), 180, 0);
    }

    (:test)
    function filterAppliesAlphaQuarter(logger as Logger) as Boolean {
        return closeTo(AngleMath.filterAngle(0.0f, 40), 10, 0.0001d)
            && closeTo(AngleMath.filterAngle(10.0f, 40), 17.5d, 0.0001d);
    }

    (:test)
    function filterIgnoresDeadZone(logger as Logger) as Boolean {
        return closeTo(AngleMath.filterAngle(50.0f, 50.4f), 50, 0)
            && closeTo(AngleMath.filterAngle(50.0f, 49.6f), 50, 0)
            && AngleMath.filterAngle(50.0f, 50.5f) > 50;
    }

    (:test)
    function filterConvergesWithinDeadZone(logger as Logger) as Boolean {
        var value = null;
        for (var i = 0; i < 60; i++) {
            value = AngleMath.filterAngle(value, 90);
        }
        logger.debug("converged to " + value);
        return closeTo(value, 90, AngleMath.FILTER_DEAD_ZONE_DEG);
    }

    (:test)
    function filterNeverLeavesRange(logger as Logger) as Boolean {
        return AngleMath.filterAngle(179.0f, 400) <= 180
            && AngleMath.filterAngle(1.0f, -400) >= 0;
    }

    (:test)
    function filterAcceptsCustomConfiguration(logger as Logger) as Boolean {
        return closeTo(AngleMath.filterAngleWith(0.0f, 10, 1.0f, 0.0f), 10, 0.0001d);
    }
}
