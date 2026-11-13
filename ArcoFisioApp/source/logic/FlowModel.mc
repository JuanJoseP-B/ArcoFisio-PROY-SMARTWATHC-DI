import Toybox.Lang;

// Screen identifiers, first-run routing and the back stack of the app. Pure.
module FlowModel {

    enum {
        SCREEN_LOADING,
        SCREEN_WELCOME,
        SCREEN_LANGUAGE,
        SCREEN_SENSOR,
        SCREEN_FACE,
        SCREEN_MENU,
        SCREEN_EXERCISE,
        SCREEN_WIZARD,
        SCREEN_SESSION,
        SCREEN_SOON,
        SCREEN_SETTINGS,
        SCREEN_MEASURE,
        SCREEN_DIAGNOSTICS,
        SCREEN_REST,
        SCREEN_SUMMARY,
        SCREEN_PAIN,
        SCREEN_CALIBRATE,
        SCREEN_SIMULATION
    }

    // Canvas 01: every opening shows the loading; the welcome is only for the
    // first time.
    function afterLoading(onboarded as Boolean) as Number {
        return onboarded ? SCREEN_FACE : SCREEN_WELCOME;
    }

    // Canvas 02: from Settings the language screen just goes back; in the
    // first run it continues to the sensor.
    function languageLeadsToSensor(onboarded as Boolean) as Boolean {
        return !onboarded;
    }
}

// Back stack. The root screen (the first one) is never popped: popping it
// reports that the app should exit.
class NavStack {

    private var _items as Array<Number> = [] as Array<Number>;

    function initialize() {
    }

    function top() as Number? {
        return _items.size() == 0 ? null : _items[_items.size() - 1];
    }

    function depth() as Number {
        return _items.size();
    }

    function push(screen as Number) as Void {
        _items.add(screen);
    }

    // Replaces the top screen (used by timed or one-way steps).
    function replace(screen as Number) as Void {
        if (_items.size() > 0) {
            _items[_items.size() - 1] = screen;
        } else {
            _items.add(screen);
        }
    }

    // Clears the history and leaves only `screen`.
    function reset(screen as Number) as Void {
        _items = [screen] as Array<Number>;
    }

    // Goes back one screen and returns it, or null when only the root is left.
    function pop() as Number? {
        if (_items.size() <= 1) {
            return null;
        }
        _items = _items.slice(0, _items.size() - 1) as Array<Number>;
        return top();
    }
}
