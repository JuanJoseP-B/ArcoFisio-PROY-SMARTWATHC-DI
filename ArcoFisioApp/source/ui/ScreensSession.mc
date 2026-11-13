import Toybox.Graphics;
import Toybox.Lang;

// Canvas 06: choose the exercise. Two cards; the chosen one has a border,
// a soft fill and a check.
class ExerciseScreen extends Screen {

    function initialize(app as AppState) {
        Screen.initialize(app);
        focus = app.wizard.exercise();
    }

    function act(action as Symbol) as Void {
        if (action == :abduction) {
            _app.wizard.setExercise(WizardModel.EXERCISE_ABDUCTION);
            _app.saveWizard();
            focus = 2;
        } else if (action == :flexion) {
            _app.wizard.setExercise(WizardModel.EXERCISE_FLEXION);
            _app.saveWizard();
            focus = 2;
        } else if (action == :next) {
            _app.wizard.beginFlow();
            _app.go(FlowModel.SCREEN_WIZARD);
        }
    }

    function draw(dc as Dc) as Void {
        begin(dc);
        var cx = dc.getWidth() / 2;
        W.text(dc, cx, W.u(dc, 48), Graphics.FONT_XTINY, Tr.t(:ExerciseTitle), Palette.INK2);
        var chosen = _app.wizard.exercise();
        card(dc, 112, Tr.t(:Abduction), Tr.t(:AbductionDesc), true, chosen == WizardModel.EXERCISE_ABDUCTION, :abduction);
        card(dc, 196, Tr.t(:Flexion), Tr.t(:FlexionDesc), false, chosen == WizardModel.EXERCISE_FLEXION, :flexion);
        button(dc, 192, 296, 170, 52, Tr.t(:Next), W.BUTTON_PRIMARY, :next);
    }

    private function card(dc as Dc, cy as Number, name as String, description as String, front as Boolean, selected as Boolean, action as Symbol) as Void {
        var w = W.u(dc, 262);
        var h = W.u(dc, 74);
        var x = dc.getWidth() / 2 - w / 2;
        var y = W.u(dc, cy) - h / 2;
        dc.setColor(selected ? Palette.TINT : Palette.CARD, Graphics.COLOR_TRANSPARENT);
        dc.fillRoundedRectangle(x, y, w, h, W.u(dc, 30));
        dc.setColor(selected ? Palette.ACC : Palette.LINE, Graphics.COLOR_TRANSPARENT);
        dc.setPenWidth(selected ? W.u(dc, 3) : W.u(dc, 2));
        dc.drawRoundedRectangle(x, y, w, h, W.u(dc, 30));
        if (_app.keyMode && focus == _targets.size()) {
            var gap = W.u(dc, 4);
            dc.setColor(Palette.INK, Graphics.COLOR_TRANSPARENT);
            dc.setPenWidth(W.u(dc, 3));
            dc.drawRoundedRectangle(x - gap, y - gap, w + 2 * gap, h + 2 * gap, W.u(dc, 30) + gap);
        }
        dc.setPenWidth(1);
        W.drawFigure(dc, x + W.u(dc, 40), y + h / 2, W.u(dc, 44), front, selected ? Palette.ACC2 : Palette.INK2);
        var left = x + W.u(dc, 72);
        dc.setColor(Palette.INK, Graphics.COLOR_TRANSPARENT);
        dc.drawText(left, y + h / 2 - W.u(dc, 12), Graphics.FONT_SMALL, name, Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
        dc.setColor(Palette.INK2, Graphics.COLOR_TRANSPARENT);
        dc.drawText(left, y + h / 2 + W.u(dc, 14), Graphics.FONT_XTINY, description, Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
        if (selected) {
            W.drawIcon(dc, :check, x + w - W.u(dc, 26), y + h / 2 - W.u(dc, 18), W.u(dc, 22), Palette.ACC2);
        }
        addTarget(x, y, w, h, action);
    }
}

// Canvas 07: four steps, one value each, with a - value + stepper. UP and
// DOWN change the value, START moves on, BACK goes back a step.
class WizardScreen extends Screen {

    function initialize(app as AppState) {
        Screen.initialize(app);
    }

    // The stepper is the main control: DOWN lowers and UP raises the value.
    function next() as Void {
        change(-1);
    }

    function previous() as Void {
        change(1);
    }

    // START always means "Siguiente" / "Empezar".
    function select() as Void {
        act(:next);
    }

    function back() as Boolean {
        if (_app.wizard.retreat()) {
            return true;
        }
        return _app.back();
    }

    function act(action as Symbol) as Void {
        if (action == :minus) {
            change(-1);
        } else if (action == :plus) {
            change(1);
        } else if (action == :next) {
            if (_app.wizard.advance()) {
                _app.saveWizard();
                _app.startSession();
            }
        }
    }

    private function change(direction as Number) as Void {
        _app.wizard.adjust(direction);
        _app.saveWizard();
    }

    function draw(dc as Dc) as Void {
        begin(dc);
        var wizard = _app.wizard;
        var step = wizard.step();
        var cx = dc.getWidth() / 2;

        // Water and the notch of the dial show the target on step 1.
        var angle = wizard.value(WizardRules.STEP_ANGLE);
        W.water(dc, step == WizardRules.STEP_ANGLE ? angle / 180.0f : 0.14f);
        W.dial(dc, null, step == WizardRules.STEP_ANGLE ? angle : null, Palette.ACC);

        W.text(dc, cx, W.u(dc, 84), Graphics.FONT_XTINY, Tr.f(:WizStep, [step + 1, WizardRules.STEP_COUNT]), Palette.INK2);
        W.text(dc, cx, W.u(dc, 116), Graphics.FONT_SMALL, Tr.t(title(step)), Palette.INK);

        var cy = W.u(dc, 184);
        W.roundButton(dc, W.u(dc, 108), cy, 56, :minus, wizard.canDecrease());
        addTarget(W.u(dc, 108) - W.u(dc, 28), cy - W.u(dc, 28), W.u(dc, 56), W.u(dc, 56), :minus);
        W.roundButton(dc, W.u(dc, 276), cy, 56, :plus, wizard.canIncrease());
        addTarget(W.u(dc, 276) - W.u(dc, 28), cy - W.u(dc, 28), W.u(dc, 56), W.u(dc, 56), :plus);
        drawValue(dc, cx, cy, step, wizard.current());

        if (step == WizardRules.STEP_REST) {
            W.text(dc, cx, W.u(dc, 240), Graphics.FONT_XTINY, summary(), Palette.INK);
        } else {
            W.text(dc, cx, W.u(dc, 240), Graphics.FONT_XTINY, Tr.t(hint(step)), Palette.INK2);
        }
        focus = 2;
        button(dc, 192, 298, 170, 52, Tr.t(wizard.isLastStep() ? :StartSession : :Next), W.BUTTON_PRIMARY, :next);
    }

    private function drawValue(dc as Dc, cx as Number, cy as Number, step as Number, value as Number) as Void {
        var font = Graphics.FONT_NUMBER_MILD;
        if (step == WizardRules.STEP_ANGLE) {
            W.valueWithUnit(dc, cx, cy, value.toString(), font, Tr.t(:DegreeSign), Graphics.FONT_SMALL, Palette.INK);
        } else if (step == WizardRules.STEP_REST) {
            W.valueWithUnit(dc, cx, cy, value.toString(), font, "s", Graphics.FONT_SMALL, Palette.INK);
        } else {
            W.text(dc, cx, cy, font, value.toString(), Palette.INK);
        }
    }

    private function title(step as Number) as Symbol {
        if (step == WizardRules.STEP_ANGLE) {
            return :WizAngle;
        } else if (step == WizardRules.STEP_REPS) {
            return :WizReps;
        } else if (step == WizardRules.STEP_SETS) {
            return :WizSets;
        }
        return :WizRest;
    }

    private function hint(step as Number) as Symbol {
        if (step == WizardRules.STEP_ANGLE) {
            return :WizAngleHint;
        } else if (step == WizardRules.STEP_REPS) {
            return :WizRepsHint;
        }
        return :WizSetsHint;
    }

    // Line of canvas 07, step 4: "Abducción · 90° · 10 × 3".
    private function summary() as String {
        return summaryOf(_app);
    }
}

// "Abducción · 90° · 10 × 3": exercise, angle, repetitions x series.
function summaryOf(app as AppState) as String {
    var wizard = app.wizard;
    return Tr.f(:WizSummary, [
        Tr.t(wizard.exercise() == WizardModel.EXERCISE_FLEXION ? :Flexion : :Abduction),
        wizard.value(WizardRules.STEP_ANGLE),
        wizard.value(WizardRules.STEP_REPS),
        wizard.value(WizardRules.STEP_SETS)
    ]);
}

