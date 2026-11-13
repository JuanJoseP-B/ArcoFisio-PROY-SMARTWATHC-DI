import Toybox.Application;
import Toybox.Lang;
import Toybox.System;
import Toybox.Timer;
import Toybox.WatchUi;

// Phase 01 prototype: reads the accelerometer, calibrates "arm down = 0
// degrees" and shows live degrees plus the diagnostics needed to measure the
// sensor on the real Forerunner 165.
//
// Wiring: SensorReader -> ArmTracker (samples in, angle out); the views only
// read from both. One timer drives polling, signal-loss checks and redraws.
class ArcoFisioAppApp extends Application.AppBase {

    private var _tracker as ArmTracker;
    private var _reader as SensorReader;
    private var _timer as Timer.Timer;
    private var _ticks as Number = 0;

    function initialize() {
        AppBase.initialize();
        _tracker = new ArmTracker();
        _reader = new SensorReader(_tracker);
        _timer = new Timer.Timer();
    }

    function onStart(state as Dictionary?) as Void {
        _reader.start();
        _timer.start(method(:onTick), SensorConfig.TICK_MS, true);
    }

    function onStop(state as Dictionary?) as Void {
        _timer.stop();
        _reader.stop();
    }

    function getInitialView() as [Views] or [Views, InputDelegates] {
        var view = new MainView(_reader, _tracker);
        return [view, new MainDelegate(view, _reader, _tracker)];
    }

    function onTick() as Void {
        _reader.tick(System.getTimer());
        _ticks += 1;
        if (_ticks % SensorConfig.TICKS_PER_REDRAW == 0) {
            WatchUi.requestUpdate();
        }
    }
}

function getApp() as ArcoFisioAppApp {
    return Application.getApp() as ArcoFisioAppApp;
}
