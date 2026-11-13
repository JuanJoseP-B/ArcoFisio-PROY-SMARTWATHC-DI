import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;
import Toybox.System;
import Toybox.Time;
import Toybox.Time.Gregorian;

// Canvas 04: date and time over the week's water, in three variants (rest,
// pending routine, sensor disconnected). A tap on empty space opens the menu.
class FaceScreen extends Screen {

    function initialize(app as AppState) {
        Screen.initialize(app);
    }

    function isAnimated() as Boolean {
        return true;
    }

    function act(action as Symbol) as Void {
        if (action == :menu) {
            _app.go(FlowModel.SCREEN_MENU);
        } else if (action == :connect) {
            _app.go(FlowModel.SCREEN_SENSOR);
        } else if (action == :start) {
            _app.openMenuItem(MenuModel.ROUTINES);
        }
    }

    function tap(x as Number, y as Number) as Boolean {
        if (!Screen.tap(x, y)) {
            act(:menu);
        }
        return true;
    }

    function draw(dc as Dc) as Void {
        begin(dc);
        var cx = dc.getWidth() / 2;
        var kind = FaceModel.variant(_app.hasSensor(), _app.demoRoutine);
        W.water(dc, FaceModel.waterLevel(kind, _app.weekSessions));

        var clock = System.getClockTime();
        var time = FaceModel.clock(clock.hour, clock.min, System.getDeviceSettings().is24Hour);

        if (kind == FaceModel.VARIANT_REST) {
            W.text(dc, cx, W.u(dc, 92), Graphics.FONT_XTINY, dateText(), Palette.INK2);
            W.text(dc, cx, W.u(dc, 150), Graphics.FONT_NUMBER_HOT, time, Palette.INK);
            W.pill(dc, cx, W.u(dc, 214), Tr.f(:WeekPill, [_app.weekSessions, FaceModel.WEEK_GOAL]), Palette.TINT, Palette.ACC2, null);
            button(dc, 192, 280, 150, 52, Tr.t(:Menu), W.BUTTON_PRIMARY, :menu);
        } else if (kind == FaceModel.VARIANT_ROUTINE) {
            W.text(dc, cx, W.u(dc, 76), Graphics.FONT_NUMBER_MILD, time, Palette.INK);
            W.text(dc, cx, W.u(dc, 134), Graphics.FONT_SMALL, Tr.t(:RoutineToday), Palette.INK);
            var summary = Tr.f(:RoutineSummary, [Tr.t(_app.wizard.exercise() == WizardModel.EXERCISE_FLEXION ? :Flexion : :Abduction),
                _app.wizard.value(WizardRules.STEP_ANGLE), _app.wizard.value(WizardRules.STEP_REPS), _app.wizard.value(WizardRules.STEP_SETS)]);
            W.text(dc, cx, W.u(dc, 168), Graphics.FONT_XTINY, summary, Palette.INK2);
            button(dc, 192, 226, 180, 52, Tr.t(:Begin), W.BUTTON_PRIMARY, :start);
            button(dc, 192, 296, 130, 44, Tr.t(:Menu), W.BUTTON_LINK, :menu);
        } else {
            W.text(dc, cx, W.u(dc, 76), Graphics.FONT_NUMBER_MILD, time, Palette.INK);
            W.pill(dc, cx, W.u(dc, 128), Tr.t(:SensorOff), Palette.AMBERT, Palette.AMBERD, :alert);
            W.paragraph(dc, Tr.t(:SensorOffBody), [Graphics.FONT_XTINY], cx, 146, 250, 62, Palette.INK2);
            button(dc, 192, 232, 180, 50, Tr.t(:Connect), W.BUTTON_OUTLINE, :connect);
            button(dc, 192, 296, 130, 44, Tr.t(:Menu), W.BUTTON_LINK, :menu);
        }
    }

    private function dateText() as String {
        var info = Gregorian.info(Time.now(), Time.FORMAT_SHORT);
        return Tr.f(:DateFormat, [
            FaceModel.word(Tr.t(:DaysShort), info.day_of_week as Number),
            info.day as Number,
            FaceModel.word(Tr.t(:MonthsShort), info.month as Number)
        ]);
    }
}

// Canvas 05: seven functions around the crown. The focused one shows its name
// and an Open button in the centre; without a sensor the measuring ones are
// dimmed and the centre offers Connect instead.
class MenuScreen extends Screen {


    private var _screenWidth as Number = 384;

    function initialize(app as AppState) {
        Screen.initialize(app);
    }

    function isAnimated() as Boolean {
        return true;
    }

    // UP and DOWN (and vertical swipes) turn the crown.
    function next() as Void {
        _app.menuFocus = MenuModel.step(_app.menuFocus, 1);
    }

    function previous() as Void {
        _app.menuFocus = MenuModel.step(_app.menuFocus, -1);
    }

    function act(action as Symbol) as Void {
        if (action == :open) {
            _app.openMenuItem(_app.menuFocus);
        } else if (action == :connect) {
            _app.go(FlowModel.SCREEN_SENSOR);
        }
    }

    // A tap on an item focuses it; a second tap on the focused one opens it.
    function tap(x as Number, y as Number) as Boolean {
        if (Screen.tap(x, y)) {
            return true;
        }
        var reach = W.u2(_screenWidth, 27 + 8);
        for (var i = 0; i < MenuModel.COUNT; i++) {
            var p = itemCenter(i);
            if ((x - p[0]).abs() <= reach && (y - p[1]).abs() <= reach) {
                if (i == _app.menuFocus) {
                    select();
                } else {
                    _app.menuFocus = i;
                }
                return true;
            }
        }
        return true;
    }

    function draw(dc as Dc) as Void {
        begin(dc);
        _screenWidth = dc.getWidth();
        var hasSensor = _app.hasSensor();
        W.water(dc, hasSensor ? 0.22f : 0.10f);
        drawGuideRing(dc);
        for (var i = 0; i < MenuModel.COUNT; i++) {
            drawItem(dc, i, hasSensor);
        }
        var item = _app.menuFocus;
        var cx = dc.getWidth() / 2;
        if (MenuModel.isEnabled(item, hasSensor)) {
            W.text(dc, cx, W.u(dc, 148), Graphics.FONT_SMALL, Tr.t(MenuText.NAMES[item]), Palette.INK);
            W.paragraph(dc, Tr.t(MenuText.DESCRIPTIONS[item]), [Graphics.FONT_XTINY], cx, 164, 196, 60, Palette.INK2);
            button(dc, 192, 246, 130, 46, Tr.t(:Open), W.BUTTON_PRIMARY, :open);
        } else {
            W.pill(dc, cx, W.u(dc, 134), Tr.t(:NoSensor), Palette.AMBERT, Palette.AMBERD, :alert);
            W.paragraph(dc, Tr.t(:NoSensorBody), [Graphics.FONT_XTINY], cx, 150, 200, 86, Palette.INK2);
            button(dc, 192, 258, 140, 44, Tr.t(:Connect), W.BUTTON_OUTLINE, :connect);
        }
    }

    // Item centre in screen pixels.
    private function itemCenter(item as Number) as Array<Number> {
        var radians = Math.toRadians(MenuModel.angleOf(item));
        var c = _screenWidth / 2;
        var r = W.u2(_screenWidth, 132);
        return [(c + r * Math.cos(radians)).toNumber(), (c - r * Math.sin(radians)).toNumber()] as Array<Number>;
    }

    private function drawGuideRing(dc as Dc) as Void {
        var c = dc.getWidth() / 2;
        var r = W.u(dc, 132);
        dc.setColor(Palette.LINE, Graphics.COLOR_TRANSPARENT);
        for (var a = 0; a < 360; a += 6) {
            var radians = Math.toRadians(a);
            dc.fillCircle(c + r * Math.cos(radians), c - r * Math.sin(radians), 1);
        }
    }

    private function drawItem(dc as Dc, item as Number, hasSensor as Boolean) as Void {
        var p = itemCenter(item);
        var radius = W.u(dc, 27);
        var enabled = MenuModel.isEnabled(item, hasSensor);
        var focused = item == _app.menuFocus;
        var iconColor = Palette.ACC2;
        if (focused) {
            dc.setColor(Palette.TINT, Graphics.COLOR_TRANSPARENT);
            dc.fillCircle(p[0], p[1], radius + W.u(dc, 4));
            dc.setColor(enabled ? Palette.ACC : Palette.INK2, Graphics.COLOR_TRANSPARENT);
            dc.fillCircle(p[0], p[1], radius);
            iconColor = Palette.ONACC;
        } else if (enabled) {
            dc.setColor(Palette.CARD, Graphics.COLOR_TRANSPARENT);
            dc.fillCircle(p[0], p[1], radius);
            dc.setColor(Palette.LINE, Graphics.COLOR_TRANSPARENT);
            dc.setPenWidth(W.u(dc, 2));
            dc.drawCircle(p[0], p[1], radius);
            dc.setPenWidth(1);
        } else {
            dc.setColor(Palette.BG, Graphics.COLOR_TRANSPARENT);
            dc.fillCircle(p[0], p[1], radius);
            dc.setColor(Palette.LINE, Graphics.COLOR_TRANSPARENT);
            dc.setPenWidth(W.u(dc, 2));
            dc.drawCircle(p[0], p[1], radius);
            dc.setPenWidth(1);
            iconColor = Palette.DISABLED;
        }
        W.drawIcon(dc, MenuText.ICONS[item], p[0], p[1], W.u(dc, 26), iconColor);
    }
}

// Placeholder for the menu items whose phase has not arrived.
class SoonScreen extends Screen {

    function initialize(app as AppState) {
        Screen.initialize(app);
    }

    function act(action as Symbol) as Void {
        if (action == :back) {
            _app.back();
        }
    }

    function draw(dc as Dc) as Void {
        begin(dc);
        var cx = dc.getWidth() / 2;
        W.water(dc, 0.10f);
        W.text(dc, cx, W.u(dc, 112), Graphics.FONT_MEDIUM, Tr.t(MenuText.NAMES[_app.soonItem]), Palette.INK);
        W.pill(dc, cx, W.u(dc, 164), Tr.t(:SoonTitle), Palette.TINT, Palette.ACC2, null);
        W.paragraph(dc, Tr.t(:SoonBody), [Graphics.FONT_XTINY], cx, 190, 240, 50, Palette.INK2);
        button(dc, 192, 290, 160, 52, Tr.t(:Back), W.BUTTON_PRIMARY, :back);
    }
}

// Settings: language, the phase 01 diagnostic views and a switch that shows
// the pending-routine face until routines exist.
class SettingsScreen extends Screen {

    function initialize(app as AppState) {
        Screen.initialize(app);
    }

    function act(action as Symbol) as Void {
        if (action == :language) {
            _app.go(FlowModel.SCREEN_LANGUAGE);
        } else if (action == :diagnostics) {
            _app.openScreen(FlowModel.SCREEN_DIAGNOSTICS);
        } else if (action == :demo) {
            _app.setDemoRoutine(!_app.demoRoutine);
        } else if (action == :back) {
            _app.back();
        }
    }

    function draw(dc as Dc) as Void {
        begin(dc);
        var cx = dc.getWidth() / 2;
        W.text(dc, cx, W.u(dc, 52), Graphics.FONT_XTINY, Tr.t(:SettingsTitle), Palette.INK2);
        row(dc, 104, Tr.t(:SettingsLang), Tr.t(_app.language == LanguageModel.SPANISH ? :LangSpanish : :LangEnglish), :language);
        row(dc, 166, Tr.t(:SettingsDiag), "", :diagnostics);
        row(dc, 228, Tr.t(:SettingsDemo), Tr.t(_app.demoRoutine ? :Yes : :No), :demo);
        button(dc, 192, 316, 150, 46, Tr.t(:Back), W.BUTTON_LINK, :back);
    }

    private function row(dc as Dc, cy as Number, label as String, value as String, action as Symbol) as Void {
        var w = W.u(dc, 250);
        var h = W.u(dc, 52);
        var x = dc.getWidth() / 2 - w / 2;
        var y = W.u(dc, cy) - h / 2;
        dc.setColor(Palette.CARD, Graphics.COLOR_TRANSPARENT);
        dc.fillRoundedRectangle(x, y, w, h, W.u(dc, 26));
        dc.setColor(Palette.LINE, Graphics.COLOR_TRANSPARENT);
        dc.setPenWidth(W.u(dc, 2));
        dc.drawRoundedRectangle(x, y, w, h, W.u(dc, 26));
        if (_app.keyMode && focus == _targets.size()) {
            var gap = W.u(dc, 4);
            dc.setColor(Palette.INK, Graphics.COLOR_TRANSPARENT);
            dc.setPenWidth(W.u(dc, 3));
            dc.drawRoundedRectangle(x - gap, y - gap, w + 2 * gap, h + 2 * gap, W.u(dc, 26) + gap);
        }
        dc.setPenWidth(1);
        dc.setColor(Palette.INK, Graphics.COLOR_TRANSPARENT);
        dc.drawText(x + W.u(dc, 20), y + h / 2, Graphics.FONT_XTINY, label, Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
        if (value.length() > 0) {
            dc.setColor(Palette.ACC2, Graphics.COLOR_TRANSPARENT);
            dc.drawText(x + w - W.u(dc, 20), y + h / 2, Graphics.FONT_XTINY, value, Graphics.TEXT_JUSTIFY_RIGHT | Graphics.TEXT_JUSTIFY_VCENTER);
        }
        addTarget(x, y, w, h, action);
    }
}

// Text keys and icons of the seven menu items, in MenuModel order.
module MenuText {
    const NAMES = [:MenuMeasure, :MenuQuick, :MenuRoutines, :MenuPain, :MenuHistory, :MenuGuide, :MenuSettings] as Array<Symbol>;
    const DESCRIPTIONS = [:MenuMeasureDesc, :MenuQuickDesc, :MenuRoutinesDesc, :MenuPainDesc, :MenuHistoryDesc, :MenuGuideDesc, :MenuSettingsDesc] as Array<Symbol>;
    const ICONS = [:measure, :play, :list, :arc, :bars, :spark, :sliders] as Array<Symbol>;
}
