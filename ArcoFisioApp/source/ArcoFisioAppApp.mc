import Toybox.Application;
import Toybox.Lang;
import Toybox.System;
import Toybox.Timer;
import Toybox.WatchUi;

// Phase 02: identity and navigation (loading, welcome, language, sensor,
// face, radial menu, exercise and quick-session wizard). The phase 01
// prototype (live angle, calibration, diagnostics) stays reachable from the
// menu and from Settings.
//
// Wiring: SensorReader -> ArmTracker (samples in, angle out); AppState holds
// the saved choices and the navigation; one timer drives polling, signal-loss
// checks, timed screens and redraws.
class ArcoFisioAppApp extends Application.AppBase {

    private var _tracker as ArmTracker;
    private var _reader as SensorReader;
    private var _state as AppState;
    private var _timer as Timer.Timer;
    private var _ticks as Number = 0;

    function initialize() {
        AppBase.initialize();
        _tracker = new ArmTracker();
        _reader = new SensorReader(_tracker);
        _state = new AppState(_reader, _tracker);
        _timer = new Timer.Timer();
    }

    function onStart(state as Dictionary?) as Void {
        _state.startSensorIfAllowed();
        _timer.start(method(:onTick), SensorConfig.TICK_MS, true);
    }

    function onStop(state as Dictionary?) as Void {
        _timer.stop();
        _reader.stop();
    }

    function getInitialView() as [Views] or [Views, InputDelegates] {
        return [new NavView(_state), new NavDelegate(_state)];
    }

    function onTick() as Void {
        var now = System.getTimer();
        _reader.tick(now);
        _state.current().tick(now);
        _ticks += 1;
        if (_state.current().isAnimated() || _ticks % SensorConfig.TICKS_PER_REDRAW == 0) {
            WatchUi.requestUpdate();
        }
    }
}

function getApp() as ArcoFisioAppApp {
    return Application.getApp() as ArcoFisioAppApp;
}
