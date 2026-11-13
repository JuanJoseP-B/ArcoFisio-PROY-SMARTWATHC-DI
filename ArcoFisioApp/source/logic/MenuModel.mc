import Toybox.Lang;

// The seven functions of the radial menu (canvas 05) and which of them work
// with or without a sensor. Pure.
module MenuModel {

    enum {
        MEASURE,
        QUICK,
        ROUTINES,
        PAIN,
        HISTORY,
        GUIDE,
        SETTINGS
    }

    const COUNT = 7;

    function needsSensor(item as Number) as Boolean {
        return item == MEASURE || item == QUICK || item == PAIN;
    }

    function isEnabled(item as Number, hasSensor as Boolean) as Boolean {
        return hasSensor || !needsSensor(item);
    }

    // Rotates the focus around the crown.
    function step(focus as Number, delta as Number) as Number {
        return ((focus + delta) % COUNT + COUNT) % COUNT;
    }

    // Screen an item opens in this phase; the ones whose phase has not
    // arrived open the "coming soon" placeholder.
    function target(item as Number) as Number {
        if (item == MEASURE) {
            return FlowModel.SCREEN_MEASURE;
        }
        if (item == QUICK) {
            return FlowModel.SCREEN_EXERCISE;
        }
        if (item == PAIN) {
            return FlowModel.SCREEN_PAIN;
        }
        if (item == SETTINGS) {
            return FlowModel.SCREEN_SETTINGS;
        }
        return FlowModel.SCREEN_SOON;
    }

    // Angle of an item on the crown in Dc degrees (0 = 3 o'clock, counter-
    // clockwise positive): the first one at the top, then clockwise.
    function angleOf(item as Number) as Float {
        return 90.0f - item * 360.0f / COUNT;
    }
}
