import Toybox.Lang;

// Zone of an angle against the target and the pain arc. Port of
// src/domain/zones.ts, with the pain-arc priority as a rule (see
// EngineConfig). Pure.
module Zones {

    enum {
        ZONE_FAR,
        ZONE_APPROACH,
        ZONE_NEAR,
        ZONE_TARGET,
        ZONE_OVERSHOOT,
        ZONE_PAIN
    }

    // Both limits of the arc are included. Null limits mean no arc.
    function isInPainArc(angle as Float, painFrom as Float?, painTo as Float?) as Boolean {
        if (painFrom == null || painTo == null) {
            return false;
        }
        return angle >= painFrom && angle <= painTo;
    }

    // Within the tolerance, limits included.
    function isOnTarget(angle as Float, target as Float, tolerance as Float) as Boolean {
        var delta = angle - target;
        return (delta < 0 ? -delta : delta) <= tolerance;
    }

    function isOvershoot(angle as Float, target as Float, tolerance as Float) as Boolean {
        return angle > target + tolerance;
    }

    function classify(angle as Float, config as RunConfig) as Number {
        var inArc = isInPainArc(angle, config.painFrom, config.painTo);
        if (inArc && config.painRule == EngineConfig.PAIN_RULE_PAIN_FIRST) {
            return ZONE_PAIN;
        }
        if (isOnTarget(angle, config.target, config.tolerance)) {
            return ZONE_TARGET;
        }
        if (isOvershoot(angle, config.target, config.tolerance)) {
            return ZONE_OVERSHOOT;
        }
        if (inArc) {
            return ZONE_PAIN;
        }
        if (angle >= config.target - EngineConfig.NEAR_MARGIN_DEG) {
            return ZONE_NEAR;
        }
        if (angle >= config.target - EngineConfig.APPROACH_MARGIN_DEG) {
            return ZONE_APPROACH;
        }
        return ZONE_FAR;
    }
}

// What a session run needs to know: the target, the tolerance, the optional
// pain arc and which priority rule is in force.
class RunConfig {
    var target as Float;
    var tolerance as Float;
    var painFrom as Float?;
    var painTo as Float?;
    var painRule as Number;

    function initialize(target as Numeric, tolerance as Numeric, painFrom as Numeric?, painTo as Numeric?, painRule as Number) {
        self.target = target.toFloat();
        self.tolerance = tolerance.toFloat();
        self.painFrom = painFrom != null ? painFrom.toFloat() : null;
        self.painTo = painTo != null ? painTo.toFloat() : null;
        self.painRule = painRule;
    }

    // True when the arc exists and the target lies inside it.
    function targetInsideArc() as Boolean {
        return Zones.isInPainArc(target, painFrom, painTo);
    }
}
