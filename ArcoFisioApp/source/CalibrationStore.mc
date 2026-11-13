import Toybox.Application;
import Toybox.Lang;

// Persists the "arm down" gravity reference with Application.Storage so the
// calibration survives closing the app.
module CalibrationStore {

    const KEY_GRAVITY_REF = "gravityRef";

    // Stored reference as a unit vector, or null when there is none or the
    // stored value is not a usable vector.
    function load() as Array<Double>? {
        var stored = null;
        try {
            stored = Application.Storage.getValue(KEY_GRAVITY_REF);
        } catch (e) {
            return null;
        }
        if (!(stored instanceof Lang.Array) || stored.size() != 3) {
            return null;
        }
        var vec = [] as Array<Numeric>;
        for (var i = 0; i < 3; i++) {
            var component = stored[i];
            if (!(component instanceof Lang.Float) && !(component instanceof Lang.Double)
                && !(component instanceof Lang.Number)) {
                return null;
            }
            vec.add(component as Numeric);
        }
        return AngleMath.normalize(vec);
    }

    // Saves the reference. Returns false when the watch could not store it.
    function save(gravityRef as Array<Double>) as Boolean {
        try {
            Application.Storage.setValue(KEY_GRAVITY_REF, [gravityRef[0], gravityRef[1], gravityRef[2]]);
            return true;
        } catch (e) {
            return false;
        }
    }
}
