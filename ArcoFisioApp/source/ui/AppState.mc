import Toybox.Application;
import Toybox.System;
import Toybox.Graphics;
import Toybox.Lang;
import Toybox.System;
import Toybox.WatchUi;

// What the whole app shares: the saved choices, the sensor, the quick-session
// wizard and the navigation. Screens read from here and call its methods;
// the routing rules themselves live in FlowModel.
class AppState {

    var reader as SensorReader;
    var tracker as ArmTracker;

    var language as Number;
    var onboarded as Boolean;
    var sensorAllowed as Boolean;
    var wizard as WizardModel;
    var weekSessions as Number;
    var demoRoutine as Boolean;

    // True after a button press, false after a tap: only then the focus
    // outline is drawn.
    var keyMode as Boolean = false;
    var menuFocus as Number = 0;
    // Menu item whose placeholder screen is open.
    var soonItem as Number = 0;

    private var _stack as NavStack = new NavStack();
    private var _screen as Screen;

    function initialize(reader as SensorReader, tracker as ArmTracker) {
        self.reader = reader;
        self.tracker = tracker;

        var deviceSpanish = System.getDeviceSettings().systemLanguage == System.LANGUAGE_SPA;
        language = LanguageModel.normalize(Prefs.read(Prefs.KEY_LANGUAGE), LanguageModel.defaultFor(deviceSpanish));
        onboarded = Prefs.readFlag(Prefs.KEY_ONBOARDED);
        sensorAllowed = Prefs.readFlag(Prefs.KEY_SENSOR_ALLOWED);
        wizard = WizardModel.restore(Prefs.read(Prefs.KEY_WIZARD));
        weekSessions = Prefs.readNumber(Prefs.KEY_WEEK_SESSIONS, 0);
        demoRoutine = Prefs.readFlag(Prefs.KEY_DEMO_ROUTINE);
        Tr.setLanguage(language);

        _stack.reset(FlowModel.SCREEN_LOADING);
        _screen = new LoadingScreen(self);
    }

    // The sensor starts with the app only after the person allowed it.
    function startSensorIfAllowed() as Void {
        if (sensorAllowed) {
            reader.start();
        }
    }

    function current() as Screen {
        return _screen;
    }

    // ---- Sensor --------------------------------------------------------

    function sensorView() as Number {
        return SensorFlow.resolve(sensorAllowed, reader.state(System.getTimer()), reader.listenerAvailable());
    }

    function hasSensor() as Boolean {
        return SensorFlow.hasSensor(sensorAllowed, reader.state(System.getTimer()));
    }

    function allowSensor() as Void {
        sensorAllowed = true;
        Prefs.write(Prefs.KEY_SENSOR_ALLOWED, true);
        reader.start();
    }

    function retrySensor() as Void {
        reader.start();
    }

    // ---- Saved choices -------------------------------------------------

    function setLanguage(value as Number) as Void {
        language = value;
        Tr.setLanguage(value);
        Prefs.write(Prefs.KEY_LANGUAGE, value);
    }

    function setDemoRoutine(value as Boolean) as Void {
        demoRoutine = value;
        Prefs.write(Prefs.KEY_DEMO_ROUTINE, value);
    }

    function saveWizard() as Void {
        Prefs.write(Prefs.KEY_WIZARD, wizard.serialize() as Array<Application.Storage.ValueType>);
    }

    // The first-run steps are over: the next openings go straight to the face.
    function finishOnboarding() as Void {
        onboarded = true;
        Prefs.write(Prefs.KEY_ONBOARDED, true);
        resetTo(FlowModel.SCREEN_FACE);
    }

    // ---- Navigation ----------------------------------------------------

    function go(screen as Number) as Void {
        _stack.push(screen);
        show(screen);
    }

    function replaceWith(screen as Number) as Void {
        _stack.replace(screen);
        show(screen);
    }

    function resetTo(screen as Number) as Void {
        _stack.reset(screen);
        show(screen);
    }

    // Back one screen; false at the root, where the app should exit.
    function back() as Boolean {
        var previous = _stack.pop();
        if (previous == null) {
            return false;
        }
        show(previous);
        return true;
    }

    // Opens a menu item: the phase 01 prototype views for measuring, the
    // wizard and settings for what exists, a placeholder for the rest.
    function openMenuItem(item as Number) as Void {
        var target = MenuModel.target(item);
        if (target == FlowModel.SCREEN_SOON) {
            soonItem = item;
        }
        openScreen(target);
    }

    function openScreen(screen as Number) as Void {
        if (screen == FlowModel.SCREEN_MEASURE) {
            openPhase01(MainView.PAGE_LIVE);
        } else if (screen == FlowModel.SCREEN_DIAGNOSTICS) {
            openPhase01(MainView.PAGE_DIAGNOSTICS);
        } else {
            go(screen);
        }
    }

    // The phase 01 views (live angle with calibration, diagnostics, tone and
    // vibration) stay reachable; BACK on their first page returns here.
    private function openPhase01(page as Number) as Void {
        var view = new MainView(reader, tracker);
        view.showPage(page);
        WatchUi.pushView(view, new MainDelegate(view, reader, tracker), WatchUi.SLIDE_LEFT);
    }

    private function show(screen as Number) as Void {
        _screen = makeScreen(screen);
        WatchUi.requestUpdate();
    }

    private function makeScreen(screen as Number) as Screen {
        if (screen == FlowModel.SCREEN_LOADING) {
            return new LoadingScreen(self);
        } else if (screen == FlowModel.SCREEN_WELCOME) {
            return new WelcomeScreen(self);
        } else if (screen == FlowModel.SCREEN_LANGUAGE) {
            return new LanguageScreen(self);
        } else if (screen == FlowModel.SCREEN_SENSOR) {
            return new SensorScreen(self);
        } else if (screen == FlowModel.SCREEN_MENU) {
            return new MenuScreen(self);
        } else if (screen == FlowModel.SCREEN_EXERCISE) {
            return new ExerciseScreen(self);
        } else if (screen == FlowModel.SCREEN_WIZARD) {
            return new WizardScreen(self);
        } else if (screen == FlowModel.SCREEN_SESSION) {
            return new SessionScreen(self);
        } else if (screen == FlowModel.SCREEN_SOON) {
            return new SoonScreen(self);
        } else if (screen == FlowModel.SCREEN_SETTINGS) {
            return new SettingsScreen(self);
        }
        return new FaceScreen(self);
    }
}

// The one view of the app: it shows whichever screen AppState holds.
class NavView extends WatchUi.View {

    private var _app as AppState;

    function initialize(app as AppState) {
        View.initialize();
        _app = app;
    }

    function onUpdate(dc as Dc) as Void {
        _app.current().draw(dc);
    }
}

// Touch and buttons for every screen. A tap goes to the touch targets of the
// screen; START, UP, DOWN and BACK act on the focus, and vertical swipes act
// like DOWN and UP. It is an InputDelegate (not a BehaviorDelegate) because
// the screens need the tap coordinates.
class NavDelegate extends WatchUi.InputDelegate {

    private var _app as AppState;

    function initialize(app as AppState) {
        InputDelegate.initialize();
        _app = app;
    }

    function onTap(event as WatchUi.ClickEvent) as Boolean {
        var xy = event.getCoordinates();
        _app.keyMode = false;
        _app.current().tap(xy[0], xy[1]);
        WatchUi.requestUpdate();
        return true;
    }

    function onKey(event as WatchUi.KeyEvent) as Boolean {
        var key = event.getKey();
        _app.keyMode = true;
        var handled = true;
        if (key == WatchUi.KEY_ENTER) {
            _app.current().select();
        } else if (key == WatchUi.KEY_DOWN) {
            _app.current().next();
        } else if (key == WatchUi.KEY_UP) {
            _app.current().previous();
        } else if (key == WatchUi.KEY_ESC) {
            handled = _app.current().back();
        } else {
            handled = false;
        }
        WatchUi.requestUpdate();
        return handled;
    }

    function onSwipe(event as WatchUi.SwipeEvent) as Boolean {
        var direction = event.getDirection();
        _app.keyMode = false;
        var handled = true;
        if (direction == WatchUi.SWIPE_UP) {
            _app.current().next();
        } else if (direction == WatchUi.SWIPE_DOWN) {
            _app.current().previous();
        } else if (direction == WatchUi.SWIPE_RIGHT) {
            handled = _app.current().back();
        } else {
            handled = false;
        }
        WatchUi.requestUpdate();
        return handled;
    }
}
