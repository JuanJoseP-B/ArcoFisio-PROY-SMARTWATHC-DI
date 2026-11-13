import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;
import Toybox.System;

// Canvas 01: loading on every opening (3.8 s), tap or START to skip.
class LoadingScreen extends Screen {

    const DURATION_MS = 3800;

    private var _startMs as Number;
    private var _finished as Boolean = false;

    function initialize(app as AppState) {
        Screen.initialize(app);
        _startMs = System.getTimer();
    }

    function isAnimated() as Boolean {
        return true;
    }

    function tick(nowMs as Number) as Void {
        if (nowMs - _startMs >= DURATION_MS) {
            finish();
        }
    }

    function tap(x as Number, y as Number) as Boolean {
        finish();
        return true;
    }

    function select() as Void {
        finish();
    }

    function back() as Boolean {
        finish();
        return true;
    }

    private function finish() as Void {
        if (!_finished) {
            _finished = true;
            _app.replaceWith(FlowModel.afterLoading(_app.onboarded));
        }
    }

    function draw(dc as Dc) as Void {
        begin(dc);
        var t = (System.getTimer() - _startMs) / DURATION_MS.toFloat();
        if (t > 1) {
            t = 1.0f;
        }
        var w = dc.getWidth();

        // Phase 1: a drop falls and the water rises.
        var drop = t / 0.22f;
        if (drop < 1) {
            dc.setColor(Palette.ACC, Graphics.COLOR_TRANSPARENT);
            dc.fillCircle(w / 2, W.u(dc, 30 + 150 * drop * drop), W.u(dc, 7));
        }
        var rise = (t - 0.18f) / 0.35f;
        rise = rise < 0 ? 0.0f : (rise > 1 ? 1.0f : rise);
        W.water(dc, 0.10f + 0.40f * ease(rise));

        // Phase 2: Hipo emerges.
        var emerge = (t - 0.35f) / 0.30f;
        if (emerge > 0) {
            emerge = emerge > 1 ? 1.0f : emerge;
            HipoArt.draw(dc, w / 2, W.u(dc, 64 + 40 * (1 - ease(emerge))), W.u(dc, 150));
        }

        // Phase 3: name and tagline.
        if (t > 0.65f) {
            var nameFont = Graphics.FONT_MEDIUM;
            var arco = "Arco ";
            var fisio = "Fisio";
            var a = dc.getTextDimensions(arco, nameFont);
            var f = dc.getTextDimensions(fisio, nameFont);
            var left = (w - a[0] - f[0]) / 2;
            var y = W.u(dc, 262);
            dc.setColor(Palette.ACC2, Graphics.COLOR_TRANSPARENT);
            dc.drawText(left, y, nameFont, arco, Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
            dc.setColor(Palette.INK, Graphics.COLOR_TRANSPARENT);
            dc.drawText(left + a[0], y, nameFont, fisio, Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
            W.text(dc, w / 2, W.u(dc, 300), Graphics.FONT_XTINY, Tr.t(:Tagline), Palette.INK);
        }
    }

    private function ease(x as Float) as Float {
        var inv = 1 - x;
        return 1 - inv * inv * inv;
    }
}

// Canvas 01, first time only: a greeting and one action.
class WelcomeScreen extends Screen {

    function initialize(app as AppState) {
        Screen.initialize(app);
    }

    function act(action as Symbol) as Void {
        if (action == :begin) {
            _app.go(FlowModel.SCREEN_LANGUAGE);
        }
    }

    function draw(dc as Dc) as Void {
        begin(dc);
        W.water(dc, 0.08f);
        var cx = dc.getWidth() / 2;
        HipoArt.draw(dc, cx, W.u(dc, 40), W.u(dc, 100));
        W.text(dc, cx, W.u(dc, 168), Graphics.FONT_MEDIUM, Tr.t(:WelcomeTitle), Palette.INK);
        W.paragraph(dc, Tr.t(:WelcomeBody), [Graphics.FONT_XTINY], cx, 190, 250, 64, Palette.INK2);
        button(dc, 192, 296, 200, 54, Tr.t(:Begin), W.BUTTON_PRIMARY, :begin);
    }
}

// Canvas 02: language list, then the confirmed state.
class LanguageScreen extends Screen {

    private var _confirmed as Boolean = false;

    function initialize(app as AppState) {
        Screen.initialize(app);
        focus = rowOf(app.language);
    }

    // Rows are listed Spanish first, then English.
    private function rowOf(language as Number) as Number {
        return language == LanguageModel.SPANISH ? 0 : 1;
    }

    function act(action as Symbol) as Void {
        if (!_confirmed) {
            if (action == :english) {
                _app.setLanguage(LanguageModel.ENGLISH);
                focus = 2;
            } else if (action == :spanish) {
                _app.setLanguage(LanguageModel.SPANISH);
                focus = 2;
            } else if (action == :continue) {
                _confirmed = true;
                focus = 0;
            }
        } else if (action == :next) {
            if (FlowModel.languageLeadsToSensor(_app.onboarded)) {
                _app.go(FlowModel.SCREEN_SENSOR);
            } else {
                _app.back();
            }
        }
    }

    function back() as Boolean {
        if (_confirmed) {
            _confirmed = false;
            focus = rowOf(_app.language);
            return true;
        }
        return _app.back();
    }

    function draw(dc as Dc) as Void {
        begin(dc);
        var cx = dc.getWidth() / 2;
        if (_confirmed) {
            drawConfirmed(dc, cx);
            return;
        }
        W.text(dc, cx, W.u(dc, 58), Graphics.FONT_XTINY, Tr.t(:LangTitle), Palette.INK2);
        row(dc, 122, Tr.t(:LangSpanish), _app.language == LanguageModel.SPANISH, :spanish);
        row(dc, 188, Tr.t(:LangEnglish), _app.language == LanguageModel.ENGLISH, :english);
        button(dc, 192, 282, 190, 54, Tr.t(:Continue), W.BUTTON_PRIMARY, :continue);
    }

    private function row(dc as Dc, cy as Number, label as String, selected as Boolean, action as Symbol) as Void {
        var w = W.u(dc, 236);
        var h = W.u(dc, 56);
        var x = dc.getWidth() / 2 - w / 2;
        var y = W.u(dc, cy) - h / 2;
        dc.setColor(selected ? Palette.TINT : Palette.CARD, Graphics.COLOR_TRANSPARENT);
        dc.fillRoundedRectangle(x, y, w, h, W.u(dc, 26));
        dc.setColor(selected ? Palette.ACC : Palette.LINE, Graphics.COLOR_TRANSPARENT);
        dc.setPenWidth(selected ? W.u(dc, 3) : W.u(dc, 2));
        dc.drawRoundedRectangle(x, y, w, h, W.u(dc, 26));
        if (_app.keyMode && focus == _targets.size()) {
            dc.setColor(Palette.INK, Graphics.COLOR_TRANSPARENT);
            var gap = W.u(dc, 4);
            dc.drawRoundedRectangle(x - gap, y - gap, w + 2 * gap, h + 2 * gap, W.u(dc, 26) + gap);
        }
        dc.setPenWidth(1);
        dc.setColor(Palette.INK, Graphics.COLOR_TRANSPARENT);
        dc.drawText(x + W.u(dc, 24), y + h / 2, Graphics.FONT_SMALL, label, Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
        if (selected) {
            W.drawIcon(dc, :check, x + w - W.u(dc, 34), y + h / 2, W.u(dc, 26), Palette.ACC2);
        }
        addTarget(x, y, w, h, action);
    }

    private function drawConfirmed(dc as Dc, cx as Number) as Void {
        W.water(dc, 0.12f);
        dc.setColor(Palette.MINTT, Graphics.COLOR_TRANSPARENT);
        dc.fillCircle(cx, W.u(dc, 84), W.u(dc, 36));
        W.drawIcon(dc, :check, cx, W.u(dc, 84), W.u(dc, 40), Palette.MINTD);
        W.text(dc, cx, W.u(dc, 146), Graphics.FONT_MEDIUM, Tr.t(:Done), Palette.INK);
        var name = Tr.t(_app.language == LanguageModel.SPANISH ? :LangSpanish : :LangEnglish);
        W.paragraph(dc, Tr.f(:LangChosen, [name]) + "\n" + Tr.t(:LangChangeLater), [Graphics.FONT_XTINY], cx, 166, 300, 96, Palette.INK2);
        button(dc, 192, 308, 200, 52, Tr.t(:Next), W.BUTTON_PRIMARY, :next);
    }
}

// Canvas 03: ask, denied, unavailable and ready with the live angle. It
// never shows a number the sensor did not give.
class SensorScreen extends Screen {

    function initialize(app as AppState) {
        Screen.initialize(app);
    }

    function isAnimated() as Boolean {
        return true;
    }

    function act(action as Symbol) as Void {
        if (action == :allow) {
            _app.allowSensor();
        } else if (action == :retry) {
            _app.retrySensor();
        } else if (action == :notNow || action == :understood || action == :continue) {
            _app.finishOnboarding();
        }
    }

    function draw(dc as Dc) as Void {
        begin(dc);
        var cx = dc.getWidth() / 2;
        var view = _app.sensorView();
        if (view == SensorFlow.VIEW_ASK) {
            badge(dc, :sensor, Palette.TINT, Palette.ACC2, 62);
            W.text(dc, cx, W.u(dc, 114), Graphics.FONT_SMALL, Tr.t(:SensorAskTitle), Palette.INK);
            W.paragraph(dc, Tr.t(:SensorAskBody), [Graphics.FONT_XTINY], cx, 132, 290, 96, Palette.INK2);
            button(dc, 192, 262, 200, 50, Tr.t(:Allow), W.BUTTON_PRIMARY, :allow);
            button(dc, 192, 322, 160, 44, Tr.t(:NotNow), W.BUTTON_LINK, :notNow);
        } else if (view == SensorFlow.VIEW_CHECKING) {
            badge(dc, :sensor, Palette.TINT, Palette.ACC2, 120);
            W.text(dc, cx, W.u(dc, 190), Graphics.FONT_SMALL, Tr.t(:SensorChecking), Palette.INK);
        } else if (view == SensorFlow.VIEW_READY) {
            drawReady(dc, cx);
        } else if (view == SensorFlow.VIEW_DENIED) {
            badge(dc, :alert, Palette.AMBERT, Palette.AMBERD, 58);
            W.text(dc, cx, W.u(dc, 106), Graphics.FONT_SMALL, Tr.t(:SensorDeniedTitle), Palette.AMBERD);
            W.paragraph(dc, Tr.t(:SensorDeniedBody), [Graphics.FONT_XTINY], cx, 122, 296, 118, Palette.INK2);
            button(dc, 192, 268, 190, 50, Tr.t(:Retry), W.BUTTON_PRIMARY, :retry);
            button(dc, 192, 326, 140, 44, Tr.t(:Understood), W.BUTTON_LINK, :understood);
        } else {
            var lost = view == SensorFlow.VIEW_LOST;
            badge(dc, :sensorOff, Palette.LINE, Palette.INK2, 62);
            W.text(dc, cx, W.u(dc, 114), Graphics.FONT_SMALL, Tr.t(lost ? :SensorLostTitle : :SensorUnavailTitle), Palette.INK);
            W.paragraph(dc, Tr.t(lost ? :SensorLostBody : :SensorUnavailBody), [Graphics.FONT_XTINY], cx, 132, 296, 96, Palette.INK2);
            button(dc, 192, 258, 190, 50, Tr.t(:Retry), W.BUTTON_PRIMARY, :retry);
            button(dc, 192, 318, 150, 44, Tr.t(:Understood), W.BUTTON_LINK, :understood);
        }
    }

    private function badge(dc as Dc, icon as Symbol, background as Number, foreground as Number, cy as Number) as Void {
        var cx = dc.getWidth() / 2;
        dc.setColor(background, Graphics.COLOR_TRANSPARENT);
        dc.fillCircle(cx, W.u(dc, cy), W.u(dc, 36));
        W.drawIcon(dc, icon, cx, W.u(dc, cy), W.u(dc, 38), foreground);
    }

    private function drawReady(dc as Dc, cx as Number) as Void {
        var angle = _app.tracker.isCalibrated() ? _app.tracker.angle() : null;
        W.dial(dc, angle, null, Palette.ACC);
        if (angle != null) {
            W.valueWithUnit(dc, cx, W.u(dc, 135), Math.round(angle).toNumber().toString(), Graphics.FONT_NUMBER_HOT,
                Tr.t(:DegreeSign), Graphics.FONT_MEDIUM, Palette.INK);
        } else {
            W.text(dc, cx, W.u(dc, 135), Graphics.FONT_NUMBER_HOT, Ui.text(Rez.Strings.NoValue), Palette.INK2);
        }
        W.pill(dc, cx, W.u(dc, 212), Tr.t(:SensorReady), Palette.MINTT, Palette.MINTD, :check);
        if (angle == null) {
            W.text(dc, cx, W.u(dc, 246), Graphics.FONT_XTINY, Tr.t(:SensorNotCalibrated), Palette.INK2);
        }
        button(dc, 192, 302, 180, 52, Tr.t(:Continue), W.BUTTON_PRIMARY, :continue);
    }
}
