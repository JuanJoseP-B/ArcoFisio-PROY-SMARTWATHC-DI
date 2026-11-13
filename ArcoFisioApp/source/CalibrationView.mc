import Toybox.Graphics;
import Toybox.Lang;
import Toybox.System;
import Toybox.WatchUi;

// Calibration steps of canvas 08: instruction -> calibrating (3 s countdown
// tied to the stability hold) -> calibrated. The countdown only advances
// while ArmTracker's CalibrationHold keeps receiving still samples; movement
// restarts it and the screen says so.
class CalibrationView extends WatchUi.View {

    private var _reader as SensorReader;
    private var _tracker as ArmTracker;
    private var _started as Boolean = false;

    function initialize(reader as SensorReader, tracker as ArmTracker) {
        View.initialize();
        _reader = reader;
        _tracker = tracker;
    }

    function onUpdate(dc as Dc) as Void {
        Ui.clear(dc);
        Ui.drawTitle(dc, Ui.text(Rez.Strings.CalTitle));
        var hold = _tracker.calibrationHold();
        if (!_started || hold == null) {
            drawInstruction(dc);
        } else if (hold.isDone()) {
            drawDone(dc);
        } else {
            drawRunning(dc, hold);
        }
    }

    // START / tap: begin the countdown, or leave once calibrated.
    function onSelect() as Void {
        var hold = _tracker.calibrationHold();
        if (!_started || hold == null) {
            _tracker.startCalibration();
            _started = true;
        } else if (hold.isDone()) {
            close();
        }
        WatchUi.requestUpdate();
    }

    // BACK: abandon a running countdown (the previous reference stays).
    function close() as Void {
        _tracker.cancelCalibration();
        WatchUi.popView(WatchUi.SLIDE_RIGHT);
    }

    private function drawInstruction(dc as Dc) as Void {
        var fonts = [Graphics.FONT_SMALL, Graphics.FONT_TINY, Graphics.FONT_XTINY];
        Ui.drawBand(dc, Ui.text(Rez.Strings.CalInstruction), fonts, 0.23f, 0.28f, Ui.COLOR_TEXT);
        Ui.drawBand(dc, Ui.text(Rez.Strings.CalInstructionDetail), fonts, 0.52f, 0.20f, Ui.COLOR_MUTED);
        Ui.drawHint(dc, Ui.text(Rez.Strings.HintReady));
    }

    private function drawRunning(dc as Dc, hold as CalibrationHold) as Void {
        var nowMs = System.getTimer();
        Ui.drawRing(dc, 90, 360 * hold.progress(), Ui.COLOR_TEXT);

        var seconds = (hold.remainingMs() + 999) / 1000;
        Ui.drawBand(dc, Ui.format(Rez.Strings.CalSeconds, [seconds]), [Graphics.FONT_LARGE], 0.24f, 0.18f, Ui.COLOR_TEXT);

        var status = Rez.Strings.CalHoldStill;
        var color = Ui.COLOR_TEXT;
        var restartedMs = hold.lastRestartMs();
        if (_reader.state(nowMs) != SensorReader.STATE_READY || !hold.hasSamples()) {
            status = Rez.Strings.CalNoSignal;
            color = Ui.COLOR_WARNING;
        } else if (restartedMs != null && nowMs - restartedMs < SensorConfig.CALIBRATION_MOVED_NOTICE_MS) {
            status = Rez.Strings.CalMoved;
            color = Ui.COLOR_WARNING;
        }
        Ui.drawBand(dc, Ui.text(status), [Graphics.FONT_SMALL, Graphics.FONT_TINY, Graphics.FONT_XTINY], 0.43f, 0.30f, color);
        Ui.drawHint(dc, Ui.text(Rez.Strings.HintCancel));
    }

    private function drawDone(dc as Dc) as Void {
        Ui.drawRing(dc, 90, 360, Ui.COLOR_OK);
        Ui.drawBand(dc, Ui.text(Rez.Strings.CalDone), [Graphics.FONT_MEDIUM, Graphics.FONT_SMALL], 0.22f, 0.14f, Ui.COLOR_OK);
        var detail = Ui.text(Rez.Strings.CalDoneDetail);
        if (!_tracker.isCalibrationStored()) {
            detail = Ui.text(Rez.Strings.CalNotStored);
        }
        Ui.drawBand(dc, detail, [Graphics.FONT_TINY, Graphics.FONT_XTINY], 0.37f, 0.37f, Ui.COLOR_TEXT);
        Ui.drawHint(dc, Ui.text(Rez.Strings.HintMeasureRange));
    }
}

// START or tap continues; BACK or swipe right cancels.
class CalibrationDelegate extends WatchUi.BehaviorDelegate {

    private var _view as CalibrationView;

    function initialize(view as CalibrationView) {
        BehaviorDelegate.initialize();
        _view = view;
    }

    function onSelect() as Boolean {
        _view.onSelect();
        return true;
    }

    function onBack() as Boolean {
        _view.close();
        return true;
    }
}
