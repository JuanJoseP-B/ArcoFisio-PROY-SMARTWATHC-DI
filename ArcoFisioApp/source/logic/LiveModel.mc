import Toybox.Lang;
import Toybox.Math;

// What the live screen says for a zone (canvas 13). Pure. The four states of
// the handoff: approaching, on target, overshoot and painful arc; far, approach
// and near all read as "approaching".
module LiveModel {

    enum {
        STATE_APPROACH,
        STATE_TARGET,
        STATE_OVERSHOOT,
        STATE_PAIN
    }

    function stateOf(zone as Number?) as Number {
        if (zone == Zones.ZONE_TARGET) {
            return STATE_TARGET;
        }
        if (zone == Zones.ZONE_OVERSHOOT) {
            return STATE_OVERSHOOT;
        }
        if (zone == Zones.ZONE_PAIN) {
            return STATE_PAIN;
        }
        return STATE_APPROACH;
    }

    // Whole degrees still to climb, never negative.
    function degreesToGo(angle as Float, target as Float) as Number {
        var gap = target - angle;
        return gap <= 0 ? 0 : (gap + 0.5f).toNumber();
    }

    // Whole degrees above the target, never negative.
    function degreesOver(angle as Float, target as Float) as Number {
        var gap = angle - target;
        return gap <= 0 ? 0 : (gap + 0.5f).toNumber();
    }

    // The dial's water level for an angle: same height as the marker
    // (docs/03: yWater = 192 + 170 cos(theta) on a 384 px circle), as a
    // fraction of the screen height measured from the bottom.
    function waterLevel(angle as Float) as Float {
        var clamped = angle < 0.0f ? 0.0f : (angle > 180.0f ? 180.0f : angle);
        return ((192.0f - 170.0f * Math.cos(Math.toRadians(clamped))) / 384.0f).toFloat();
    }

    // Repetition numbers as the summary lists them: "4, 7".
    function listReps(reps as Array<Number>) as String {
        var out = "";
        for (var i = 0; i < reps.size(); i++) {
            out += (i == 0 ? "" : ", ") + reps[i].toString();
        }
        return out;
    }
}
