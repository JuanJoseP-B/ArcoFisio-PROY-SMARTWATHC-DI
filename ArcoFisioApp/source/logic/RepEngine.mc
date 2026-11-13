import Toybox.Lang;

// Repetition machine, port of src/domain/repetitions.ts.
//
// It consumes angle samples with their capture time (ms, degrees) and never
// reads a clock or a sensor: tests and the watch feed it the same way.
//  - Holding the target for HOLD_MS marks the hold ("sostén logrado").
//  - A repetition is registered when the arm returns to the return angle, and
//    may be registered without the hold.
//  - A sample that is not newer than the previous accepted one is ignored
//    (stale or repeated), so an old reading can never advance the hold.
//  - A gap between accepted samples longer than MAX_SAMPLE_GAP_MS, or a pause,
//    restarts the hold: time nobody measured does not count.
class RepEngine {

    // Bit flags returned by step().
    enum {
        EVENT_REP_STARTED = 1,
        EVENT_TARGET_REACHED = 2,
        EVENT_OVERSHOOT = 4,
        EVENT_HELD = 8,
        EVENT_REP_COMPLETED = 16
    }

    private var _config as RunConfig;
    private var _returnAngle as Float;
    private var _startAngle as Float;

    private var _active as Boolean = false;
    private var _peak as Float = 0.0f;
    private var _reachedTarget as Boolean = false;
    private var _overshot as Boolean = false;
    private var _held as Boolean = false;
    private var _targetSince as Number?;
    private var _lastMs as Number?;
    private var _accepted as Boolean = false;

    private var _repPeaks as Array<Float> = [] as Array<Float>;
    private var _repHeld as Array<Boolean> = [] as Array<Boolean>;
    private var _hits as Number = 0;
    private var _overshoots as Number = 0;
    private var _maxAngle as Float = 0.0f;

    function initialize(config as RunConfig) {
        _config = config;
        var target = config.target;
        var returnAngle = target >= 2 * EngineConfig.REP_RETURN_FLOOR_DEG
            ? maxOf(target - EngineConfig.REP_RETURN_MARGIN_DEG, EngineConfig.REP_RETURN_FLOOR_DEG)
            : target / 2;
        _returnAngle = returnAngle;
        _startAngle = maxOf(
            minOf(returnAngle + EngineConfig.REP_START_HYSTERESIS_DEG, target - config.tolerance),
            returnAngle + 0.5f
        );
    }

    // Return and start angles of the repetition window.
    function returnAngle() as Float {
        return _returnAngle;
    }

    function startAngle() as Float {
        return _startAngle;
    }

    // Feeds one sample and returns the EVENT_* flags it raised. Zero, with
    // accepted() false, when the sample was stale or repeated.
    function step(angle as Float, tMs as Number) as Number {
        var last = _lastMs;
        if (last != null && tMs <= last) {
            _accepted = false;
            return 0;
        }
        _accepted = true;
        if (last != null && tMs - last > EngineConfig.MAX_SAMPLE_GAP_MS) {
            _targetSince = null;
        }
        _lastMs = tMs;

        var events = 0;
        if (angle > _maxAngle) {
            _maxAngle = angle;
        }
        if (!_active) {
            if (angle < _startAngle) {
                return events;
            }
            _active = true;
            _peak = angle;
            events |= EVENT_REP_STARTED;
        }
        if (angle > _peak) {
            _peak = angle;
        }

        var inArc = Zones.isInPainArc(angle, _config.painFrom, _config.painTo);
        var arcWins = inArc && _config.painRule == EngineConfig.PAIN_RULE_PAIN_FIRST;

        if (!arcWins && Zones.isOnTarget(angle, _config.target, _config.tolerance)) {
            if (!_reachedTarget) {
                _reachedTarget = true;
                _hits += 1;
                events |= EVENT_TARGET_REACHED;
            }
            var since = _targetSince;
            if (since == null) {
                since = tMs;
                _targetSince = since;
            }
            if (!_held && tMs - since >= EngineConfig.HOLD_MS) {
                _held = true;
                events |= EVENT_HELD;
            }
        } else {
            _targetSince = null;
        }

        if (!arcWins && !_overshot && Zones.isOvershoot(angle, _config.target, _config.tolerance)) {
            _overshot = true;
            _overshoots += 1;
            events |= EVENT_OVERSHOOT;
        }

        if (angle <= _returnAngle) {
            _repPeaks.add(_peak);
            _repHeld.add(_held);
            _active = false;
            _peak = 0.0f;
            _reachedTarget = false;
            _overshot = false;
            _held = false;
            _targetSince = null;
            events |= EVENT_REP_COMPLETED;
        }
        return events;
    }

    // Readings stopped (sensor lost): a hold in progress cannot count time
    // nobody was measuring, so it restarts when readings come back.
    function pause() as Void {
        _targetSince = null;
    }

    // Whether the last sample moved the engine (false when ignored).
    function accepted() as Boolean {
        return _accepted;
    }

    function lastSampleMs() as Number? {
        return _lastMs;
    }

    function isActive() as Boolean {
        return _active;
    }

    // The hold of the repetition in progress has been reached.
    function isHeld() as Boolean {
        return _held;
    }

    // Share of the 1 s hold completed, 0.0 to 1.0, measured on sample times.
    function holdProgress() as Float {
        var since = _targetSince;
        var last = _lastMs;
        if (since == null || last == null) {
            return 0.0f;
        }
        var share = (last - since).toFloat() / EngineConfig.HOLD_MS;
        return share > 1.0f ? 1.0f : (share < 0.0f ? 0.0f : share);
    }

    function repsCompleted() as Number {
        return _repPeaks.size();
    }

    function hits() as Number {
        return _hits;
    }

    function overshoots() as Number {
        return _overshoots;
    }

    function maxAngle() as Float {
        return _maxAngle;
    }

    function repPeaks() as Array<Float> {
        return _repPeaks;
    }

    function repHeld() as Array<Boolean> {
        return _repHeld;
    }

    private function maxOf(a as Float, b as Float) as Float {
        return a > b ? a : b;
    }

    private function minOf(a as Float, b as Float) as Float {
        return a < b ? a : b;
    }
}
