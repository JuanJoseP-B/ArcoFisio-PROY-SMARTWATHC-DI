import Toybox.Lang;

// Variants of the main face (canvas 04), the water level behind them and the
// small text helpers of the date and clock. Pure.
module FaceModel {

    enum {
        VARIANT_REST,
        VARIANT_ROUTINE,
        VARIANT_NO_SENSOR
    }

    const WEEK_GOAL = 5;

    // Without a sensor the face warns first; otherwise a pending routine is
    // the main action of the day.
    function variant(hasSensor as Boolean, routinePending as Boolean) as Number {
        if (!hasSensor) {
            return VARIANT_NO_SENSOR;
        }
        return routinePending ? VARIANT_ROUTINE : VARIANT_REST;
    }

    // Water height as a fraction of the screen: it grows with the sessions of
    // the week, sits lower when something is pending and at its minimum
    // without a sensor.
    function waterLevel(kind as Number, sessions as Number) as Float {
        if (kind == VARIANT_NO_SENSOR) {
            return 0.10f;
        }
        if (kind == VARIANT_ROUTINE) {
            return 0.22f;
        }
        var done = sessions < 0 ? 0 : (sessions > WEEK_GOAL ? WEEK_GOAL : sessions);
        return 0.12f + 0.34f * done / WEEK_GOAL;
    }

    // n-th (1-based) word of a space separated list, e.g. day names.
    function word(list as String, index as Number) as String {
        var chars = list.toCharArray();
        var current = 1;
        var out = "";
        for (var i = 0; i < chars.size(); i++) {
            if (chars[i] == ' ') {
                current += 1;
            } else if (current == index) {
                out = out + chars[i].toString();
            }
        }
        return out;
    }

    // "18:04" in 24 h; "6:04" in 12 h.
    function clock(hour as Number, minute as Number, is24Hour as Boolean) as String {
        var shown = hour;
        if (!is24Hour) {
            shown = hour % 12;
            if (shown == 0) {
                shown = 12;
            }
        }
        return shown.format("%d") + ":" + minute.format("%02d");
    }
}
