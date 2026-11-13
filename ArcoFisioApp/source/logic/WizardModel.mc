import Toybox.Lang;

// State of the quick-session flow: the chosen exercise and the four values
// of the wizard, plus the step being edited. Pure (storage is handled by
// Prefs, which calls restore() and serialize()).
class WizardModel {

    enum {
        EXERCISE_ABDUCTION,
        EXERCISE_FLEXION
    }

    private var _exercise as Number = EXERCISE_ABDUCTION;
    private var _values as Array<Number> = [90, 10, 3, 30] as Array<Number>;
    private var _step as Number = 0;

    function initialize() {
    }

    // Rebuilds the model from a stored array [exercise, angle, reps, sets,
    // rest]. Anything unusable falls back to the default of that field.
    static function restore(stored as Object?) as WizardModel {
        var model = new WizardModel();
        if (!(stored instanceof Lang.Array)) {
            return model;
        }
        var list = stored as Array;
        model.loadList(list);
        return model;
    }

    function loadList(list as Array) as Void {
        if (list.size() >= 1 && list[0] instanceof Lang.Number) {
            var kind = list[0] as Number;
            _exercise = kind == EXERCISE_FLEXION ? EXERCISE_FLEXION : EXERCISE_ABDUCTION;
        }
        for (var i = 0; i < WizardRules.STEP_COUNT; i++) {
            if (list.size() > i + 1 && list[i + 1] instanceof Lang.Number) {
                _values[i] = WizardRules.normalize(i, list[i + 1] as Number);
            }
        }
    }

    function serialize() as Array<Number> {
        return [_exercise, _values[0], _values[1], _values[2], _values[3]] as Array<Number>;
    }

    function exercise() as Number {
        return _exercise;
    }

    function setExercise(value as Number) as Void {
        _exercise = value == EXERCISE_FLEXION ? EXERCISE_FLEXION : EXERCISE_ABDUCTION;
    }

    function step() as Number {
        return _step;
    }

    function beginFlow() as Void {
        _step = 0;
    }

    function value(step as Number) as Number {
        return _values[step];
    }

    function current() as Number {
        return _values[_step];
    }

    function adjust(direction as Number) as Void {
        _values[_step] = WizardRules.change(_step, _values[_step], direction);
    }

    function canDecrease() as Boolean {
        return WizardRules.canDecrease(_step, _values[_step]);
    }

    function canIncrease() as Boolean {
        return WizardRules.canIncrease(_step, _values[_step]);
    }

    function isLastStep() as Boolean {
        return _step == WizardRules.STEP_COUNT - 1;
    }

    // "Siguiente": moves on and returns false, or returns true on the last
    // step, where the button is "Empezar".
    function advance() as Boolean {
        if (isLastStep()) {
            return true;
        }
        _step += 1;
        return false;
    }

    // BACK: returns true when it went back a step, false when the flow is
    // at its first step and the caller should leave the wizard.
    function retreat() as Boolean {
        if (_step == 0) {
            return false;
        }
        _step -= 1;
        return true;
    }
}
