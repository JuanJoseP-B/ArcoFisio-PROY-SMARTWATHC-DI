import Toybox.Lang;
import Toybox.Math;

// Ranges, steps and defaults of the quick-session wizard (canvas 07). The
// ranges are the ones suggested in docs/05-pantallas.md. Pure.
module WizardRules {

    enum {
        STEP_ANGLE,
        STEP_REPS,
        STEP_SETS,
        STEP_REST
    }

    const STEP_COUNT = 4;

    const MINIMUMS = [10, 1, 1, 5] as Array<Number>;
    const MAXIMUMS = [180, 50, 10, 180] as Array<Number>;
    const INCREMENTS = [5, 1, 1, 5] as Array<Number>;
    const DEFAULTS = [90, 10, 3, 30] as Array<Number>;

    function minimum(step as Number) as Number {
        return MINIMUMS[step];
    }

    function maximum(step as Number) as Number {
        return MAXIMUMS[step];
    }

    // A value inside the range and on the step grid (counted from the minimum).
    function normalize(step as Number, value as Number) as Number {
        var low = MINIMUMS[step];
        var high = MAXIMUMS[step];
        var inc = INCREMENTS[step];
        if (value <= low) {
            return low;
        }
        if (value >= high) {
            return high;
        }
        var snapped = low + Math.round((value - low).toFloat() / inc).toNumber() * inc;
        return snapped > high ? high : snapped;
    }

    // One press of "+" (direction 1) or "-" (direction -1), clamped.
    function change(step as Number, value as Number, direction as Number) as Number {
        return normalize(step, value + direction * INCREMENTS[step]);
    }

    function canDecrease(step as Number, value as Number) as Boolean {
        return value > MINIMUMS[step];
    }

    function canIncrease(step as Number, value as Number) as Boolean {
        return value < MAXIMUMS[step];
    }
}
