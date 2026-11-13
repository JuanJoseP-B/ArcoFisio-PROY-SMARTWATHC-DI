import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;
import Toybox.System;

// The four pages of the main screen. A page only draws and says what START
// (or a tap) should do; MainDelegate carries the action out.

typedef Page as interface {
    function draw(dc as Dc) as Void;
    // Action for START / tap: one of the ACTION_* symbols below, or null.
    function selectAction() as Symbol?;
};

// Page 1 (canvas 03): is the sensor delivering readings?
class StatusPage {

    private var _reader as SensorReader;
    private var _tracker as ArmTracker;

    function initialize(reader as SensorReader, tracker as ArmTracker) {
        _reader = reader;
        _tracker = tracker;
    }

    function draw(dc as Dc) as Void {
        var state = _reader.state(System.getTimer());
        Ui.drawTitle(dc, Ui.text(Rez.Strings.StatusTitle));

        var label = Rez.Strings.StatusStarting;
        var color = Ui.COLOR_MUTED;
        var body = Ui.text(Rez.Strings.StatusBodyStarting);
        var hint = null;
        if (state == SensorReader.STATE_READY) {
            label = Rez.Strings.StatusReady;
            color = Ui.COLOR_OK;
            var angle = _tracker.angle();
            if (!_tracker.isCalibrated()) {
                body = Ui.text(Rez.Strings.StatusBodyNotCalibrated);
                hint = Rez.Strings.HintCalibrate;
            } else {
                body = angle != null
                    ? Ui.format(Rez.Strings.StatusBodyLive, [Ui.degrees(angle)])
                    : Ui.text(Rez.Strings.StatusBodyCalibrated);
                hint = Rez.Strings.HintMeasure;
            }
        } else if (state == SensorReader.STATE_LOST) {
            label = Rez.Strings.StatusLost;
            color = Ui.COLOR_WARNING;
            body = Ui.text(Rez.Strings.StatusBodyLost);
            hint = Rez.Strings.HintRetry;
        } else if (state == SensorReader.STATE_UNAVAILABLE) {
            label = Rez.Strings.StatusUnavailable;
            body = Ui.text(Rez.Strings.StatusBodyUnavailable);
            hint = Rez.Strings.HintRetry;
        }

        Ui.drawBand(dc, Ui.text(label), [Graphics.FONT_MEDIUM, Graphics.FONT_SMALL, Graphics.FONT_TINY], 0.24f, 0.16f, color);
        Ui.drawBand(dc, body, [Graphics.FONT_SMALL, Graphics.FONT_TINY, Graphics.FONT_XTINY], 0.41f, 0.32f, Ui.COLOR_TEXT);
        if (hint != null) {
            Ui.drawHint(dc, Ui.text(hint));
        }
    }

    function selectAction() as Symbol? {
        var state = _reader.state(System.getTimer());
        if (state == SensorReader.STATE_READY) {
            return _tracker.isCalibrated() ? :goLive : :calibrate;
        }
        if (state == SensorReader.STATE_STARTING) {
            return null;
        }
        return :retrySensor;
    }
}

// Page 2 (canvas 08, step 4): live degrees and the maximum reached.
class LivePage {

    private var _reader as SensorReader;
    private var _tracker as ArmTracker;

    function initialize(reader as SensorReader, tracker as ArmTracker) {
        _reader = reader;
        _tracker = tracker;
    }

    function draw(dc as Dc) as Void {
        Ui.drawTitle(dc, Ui.text(Rez.Strings.LiveTitle));
        if (!_tracker.isCalibrated()) {
            Ui.drawBand(dc, Ui.text(Rez.Strings.LiveNotCalibrated), [Graphics.FONT_SMALL, Graphics.FONT_TINY, Graphics.FONT_XTINY], 0.26f, 0.44f, Ui.COLOR_TEXT);
            Ui.drawHint(dc, Ui.text(Rez.Strings.HintCalibrate));
            return;
        }

        // A stale angle is never drawn as if it were live.
        var live = _reader.state(System.getTimer()) == SensorReader.STATE_READY;
        var angle = live ? _tracker.angle() : null;
        if (angle != null) {
            // Half a turn of the ring for 0 to 180 degrees, from 6 o'clock.
            Ui.drawRing(dc, 270, angle, Ui.COLOR_TEXT);
            drawBigNumber(dc, angle);
        } else {
            Ui.drawRing(dc, 270, 0, Ui.COLOR_TEXT);
            Ui.drawBand(dc, Ui.text(Rez.Strings.NoValue), [Graphics.FONT_LARGE], 0.26f, 0.20f, Ui.COLOR_MUTED);
            Ui.drawBand(dc, Ui.text(Rez.Strings.LiveNoSignal), [Graphics.FONT_SMALL, Graphics.FONT_TINY], 0.46f, 0.12f, Ui.COLOR_WARNING);
        }

        var max = _tracker.maxAngle();
        var maxText = max != null ? Ui.degrees(max) : Ui.text(Rez.Strings.NoValue);
        Ui.drawBand(dc, Ui.format(Rez.Strings.LiveMax, [maxText]), [Graphics.FONT_SMALL, Graphics.FONT_TINY], 0.62f, 0.12f, Ui.COLOR_MUTED);
        Ui.drawHint(dc, Ui.text(Rez.Strings.HintOptions));
    }

    // Number fonts only carry digits, so the degree sign is drawn beside the
    // number with a text font.
    private function drawBigNumber(dc as Dc, angle as Float) as Void {
        var digits = Math.round(angle).toNumber().toString();
        var font = Graphics.FONT_NUMBER_THAI_HOT;
        var centerX = dc.getWidth() / 2;
        var centerY = Ui.px(dc, 0.42f);
        var size = dc.getTextDimensions(digits, font);
        dc.setColor(Ui.COLOR_TEXT, Graphics.COLOR_TRANSPARENT);
        dc.drawText(centerX, centerY, font, digits, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
        dc.drawText(centerX + size[0] / 2 + 4, centerY - size[1] / 4, Graphics.FONT_LARGE,
            Ui.text(Rez.Strings.DegreeSign), Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
    }

    function selectAction() as Symbol? {
        return _tracker.isCalibrated() ? :liveMenu : :calibrate;
    }
}

// Page 3: the numbers needed to measure the sensor on the real watch.
class DiagnosticsPage {

    private var _reader as SensorReader;

    function initialize(reader as SensorReader) {
        _reader = reader;
    }

    function draw(dc as Dc) as Void {
        var nowMs = System.getTimer();
        Ui.drawTitle(dc, Ui.text(Rez.Strings.DiagTitle));

        var none = Ui.text(Rez.Strings.NoValue);
        var hz = _reader.cadenceHz();
        var age = _reader.sampleAgeMs(nowMs);
        var raw = _reader.lastRaw();
        var lines = [
            _reader.source() == SensorReader.SOURCE_LISTENER
                ? Ui.format(Rez.Strings.DiagSourceListener, [SensorConfig.SAMPLE_RATE_HZ])
                : Ui.format(Rez.Strings.DiagSourcePolling, [SensorConfig.TICK_MS]),
            Ui.format(Rez.Strings.DiagCadence, [hz != null ? hz.format("%.1f") : none]),
            Ui.format(Rez.Strings.DiagAge, [age != null ? age : none]),
            Ui.format(Rez.Strings.DiagLosses, [_reader.lossCount()]),
            raw != null
                ? Ui.format(Rez.Strings.DiagRaw, [raw[0], raw[1], raw[2]])
                : Ui.format(Rez.Strings.DiagRaw, [none, none, none]),
            Ui.text(timeSourceString())
        ] as Array<String>;

        var font = Graphics.FONT_XTINY;
        var step = dc.getFontHeight(font);
        var y = Ui.px(dc, 0.23f);
        var centerX = dc.getWidth() / 2;
        dc.setColor(Ui.COLOR_TEXT, Graphics.COLOR_TRANSPARENT);
        for (var i = 0; i < lines.size(); i++) {
            dc.drawText(centerX, y + i * step, font, lines[i], Graphics.TEXT_JUSTIFY_CENTER);
        }
        Ui.drawHint(dc, Ui.text(Rez.Strings.HintSwitchSource));
    }

    private function timeSourceString() as ResourceId {
        var timeSource = _reader.timeSource();
        if (timeSource == SensorReader.TIME_SENSOR) {
            return Rez.Strings.DiagTimeSensor;
        }
        if (timeSource == SensorReader.TIME_ESTIMATED) {
            return Rez.Strings.DiagTimeEstimated;
        }
        if (timeSource == SensorReader.TIME_READ) {
            return Rez.Strings.DiagTimeRead;
        }
        return Rez.Strings.DiagTimeUnknown;
    }

    function selectAction() as Symbol? {
        return :toggleSource;
    }
}

// Page 4: does this watch offer tones and vibration to the app?
class FeedbackPage {

    enum {
        RESULT_NONE,
        RESULT_TONE_SENT,
        RESULT_VIBRATION_SENT,
        RESULT_REJECTED
    }

    private var _lastResult as Number = RESULT_NONE;

    function initialize() {
    }

    function setLastResult(result as Number) as Void {
        _lastResult = result;
    }

    function draw(dc as Dc) as Void {
        Ui.drawTitle(dc, Ui.text(Rez.Strings.FeedbackTitle));
        var fonts = [Graphics.FONT_TINY, Graphics.FONT_XTINY];

        var tone = FeedbackProbe.toneSupported();
        var toneText = Ui.text(tone ? Rez.Strings.FeedbackToneSupported : Rez.Strings.FeedbackToneUnsupported);
        if (tone && !FeedbackProbe.tonesEnabled()) {
            toneText = toneText + "\n" + Ui.text(Rez.Strings.FeedbackToneMuted);
        }
        Ui.drawBand(dc, toneText, fonts, 0.22f, 0.18f, tone ? Ui.COLOR_OK : Ui.COLOR_WARNING);

        var vibration = FeedbackProbe.vibrationSupported();
        var vibrationText = Ui.text(vibration ? Rez.Strings.FeedbackVibrationSupported : Rez.Strings.FeedbackVibrationUnsupported);
        if (vibration && !FeedbackProbe.vibrationEnabled()) {
            vibrationText = vibrationText + "\n" + Ui.text(Rez.Strings.FeedbackVibrationMuted);
        }
        Ui.drawBand(dc, vibrationText, fonts, 0.40f, 0.18f, vibration ? Ui.COLOR_OK : Ui.COLOR_WARNING);

        Ui.drawBand(dc, Ui.text(lastResultString()), [Graphics.FONT_XTINY], 0.59f, 0.15f, Ui.COLOR_MUTED);
        Ui.drawHint(dc, Ui.text(Rez.Strings.HintTest));
    }

    private function lastResultString() as ResourceId {
        if (_lastResult == RESULT_TONE_SENT) {
            return Rez.Strings.FeedbackLastTone;
        }
        if (_lastResult == RESULT_VIBRATION_SENT) {
            return Rez.Strings.FeedbackLastVibration;
        }
        if (_lastResult == RESULT_REJECTED) {
            return Rez.Strings.FeedbackLastRejected;
        }
        return Rez.Strings.FeedbackLastNone;
    }

    function selectAction() as Symbol? {
        return :feedbackMenu;
    }
}
