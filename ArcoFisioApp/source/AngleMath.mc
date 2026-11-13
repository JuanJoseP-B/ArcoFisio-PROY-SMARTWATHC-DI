import Toybox.Lang;
import Toybox.Math;

// Pure angle math, shared by calibration and the live reading.
//
// Port of the web v1 domain (src/domain/vector.ts, angle.ts, filter.ts):
// the arm angle is the angle between the current gravity vector and the
// gravity vector stored when the arm was hanging ("arm down = 0 degrees").
// Nothing here touches sensors, storage or the screen.
module AngleMath {

    const ANGLE_MIN_DEG = 0.0f;
    const ANGLE_MAX_DEG = 180.0f;

    // Exponential filter: weight of the new reading, and the change (degrees)
    // below which the previous value is kept. Same values as web v1.
    const FILTER_ALPHA = 0.25f;
    const FILTER_DEAD_ZONE_DEG = 0.5f;

    // Vectors shorter than this have no usable direction. Unit-agnostic guard
    // against the zero vector (a resting watch reads about 1000 milli-g).
    const MIN_GRAVITY_NORM = 0.000001d;

    // Three components: x, y, z. The unit does not matter (milli-g on the watch).
    typedef Vec3 as Array<Numeric>;

    function dot(a as Vec3, b as Vec3) as Double {
        return a[0].toDouble() * b[0].toDouble()
            + a[1].toDouble() * b[1].toDouble()
            + a[2].toDouble() * b[2].toDouble();
    }

    // True for NaN and for positive or negative infinity.
    function isNotFinite(value as Double) as Boolean {
        return !((value - value) == 0.0d);
    }

    function norm(v as Vec3) as Double {
        var squared = dot(v, v);
        // A non-finite sum is returned as it is; normalize() rejects it.
        if (isNotFinite(squared)) {
            return squared;
        }
        return Math.sqrt(squared).toDouble();
    }

    // Unit vector with the direction of `v`, or null when `v` is zero, tiny
    // or not finite.
    function normalize(v as Vec3) as Array<Double>? {
        var length = norm(v);
        if (isNotFinite(length) || length < MIN_GRAVITY_NORM) {
            return null;
        }
        return [v[0].toDouble() / length, v[1].toDouble() / length, v[2].toDouble() / length];
    }

    // Angle in degrees (0..180) between two unit vectors.
    function angleBetweenUnits(a as Array<Double>, b as Array<Double>) as Float {
        var cosine = dot(a, b);
        if (cosine > 1.0d) {
            cosine = 1.0d;
        } else if (cosine < -1.0d) {
            cosine = -1.0d;
        }
        return Math.toDegrees(Math.acos(cosine)).toFloat();
    }

    // Arm angle in degrees for a gravity sample against the calibration
    // reference. Null when either vector has no usable direction.
    function computeAngle(sample as Vec3, gravityRef as Vec3) as Float? {
        var current = normalize(sample);
        var reference = normalize(gravityRef);
        if (current == null || reference == null) {
            return null;
        }
        return angleBetweenUnits(current, reference);
    }

    function clampAngle(angle as Numeric) as Float {
        var value = angle.toFloat();
        if (value < ANGLE_MIN_DEG) {
            return ANGLE_MIN_DEG;
        }
        if (value > ANGLE_MAX_DEG) {
            return ANGLE_MAX_DEG;
        }
        return value;
    }

    // Next filtered angle with the default configuration.
    function filterAngle(previous as Float?, raw as Numeric) as Float {
        return filterAngleWith(previous, raw, FILTER_ALPHA, FILTER_DEAD_ZONE_DEG);
    }

    // The first reading passes through; later ones move `alpha` of the way,
    // and changes smaller than the dead zone are ignored.
    function filterAngleWith(previous as Float?, raw as Numeric, alpha as Float, deadZone as Float) as Float {
        var target = clampAngle(raw);
        if (previous == null) {
            return target;
        }
        var delta = target - previous;
        var size = delta < 0 ? -delta : delta;
        if (size < deadZone) {
            return previous;
        }
        return clampAngle(previous + alpha * delta);
    }
}
