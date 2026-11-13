import Toybox.Lang;

// Canvas 12: marking the painful arc with two taps. Pure: the screen feeds it
// the live angle when a button is pressed.
//
//  STEP_INTRO    waiting to mark where the pain starts (Marcar inicio)
//  STEP_MARKING  start marked, waiting for the end (Marcar fin)
//  STEP_CONFIRM  both limits marked, ready to keep or repeat
class PainArcModel {

    enum {
        STEP_INTRO,
        STEP_MARKING,
        STEP_CONFIRM
    }

    private var _step as Number = STEP_INTRO;
    private var _from as Number = 0;
    private var _to as Number = 0;
    private var _tooShort as Boolean = false;

    function initialize() {
    }

    function step() as Number {
        return _step;
    }

    function from() as Number {
        return _from;
    }

    function to() as Number {
        return _to;
    }

    // The last "Marcar fin" was refused for being narrower than the minimum.
    function wasTooShort() as Boolean {
        return _tooShort;
    }

    function markStart(angle as Float) as Void {
        _from = whole(angle);
        _to = _from;
        _tooShort = false;
        _step = STEP_MARKING;
    }

    // Limits are kept in order. True when the arc was accepted; an arc
    // narrower than EngineConfig.MIN_PAIN_ARC_DEG stays in the marking step.
    function markEnd(angle as Float) as Boolean {
        if (_step != STEP_MARKING) {
            return false;
        }
        var end = whole(angle);
        var low = end < _from ? end : _from;
        var high = end < _from ? _from : end;
        if (high - low < EngineConfig.MIN_PAIN_ARC_DEG) {
            _tooShort = true;
            return false;
        }
        _from = low;
        _to = high;
        _tooShort = false;
        _step = STEP_CONFIRM;
        return true;
    }

    // Upper end of the arc drawn while marking: the live angle, never below
    // the start mark.
    function liveTo(angle as Float) as Number {
        var live = whole(angle);
        return live < _from ? _from : live;
    }

    function retry() as Void {
        _step = STEP_INTRO;
        _tooShort = false;
    }

    private function whole(angle as Float) as Number {
        var clamped = angle < 0.0f ? 0.0f : (angle > 180.0f ? 180.0f : angle);
        return (clamped + 0.5f).toNumber();
    }
}
