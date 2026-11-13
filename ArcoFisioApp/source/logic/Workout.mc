import Toybox.Lang;

// Sets and rests of a workout, port of src/domain/workout.ts. Pure.
//
// PHASE_SET: the arm is working. PHASE_REST: between sets, with the set that
// just ended. PHASE_DONE: nothing left, with the outcome.
class Workout {

    enum {
        PHASE_SET,
        PHASE_REST,
        PHASE_DONE
    }

    enum {
        OUTCOME_NONE,
        OUTCOME_COMPLETED,   // every set done
        OUTCOME_STOPPED      // ended early by the person
    }

    private var _sets as Number;
    private var _reps as Number;
    private var _restSec as Number;

    private var _phase as Number = PHASE_SET;
    private var _set as Number = 1;
    private var _restLeftMs as Number = 0;
    private var _outcome as Number = OUTCOME_NONE;
    private var _totals as RunStats = new RunStats();

    function initialize(sets as Number, reps as Number, restSec as Number) {
        _sets = sets;
        _reps = reps;
        _restSec = restSec;
    }

    function phase() as Number {
        return _phase;
    }

    // 1-based. During a rest it is the set that just ended.
    function set() as Number {
        return _set;
    }

    function setsPlanned() as Number {
        return _sets;
    }

    function repsPerSet() as Number {
        return _reps;
    }

    function restSec() as Number {
        return _restSec;
    }

    function outcome() as Number {
        return _outcome;
    }

    // Everything counted in the sets that already ended.
    function totals() as RunStats {
        return _totals;
    }

    // Sets whose repetitions were all counted or that the person left.
    function setsEnded() as Number {
        if (_phase == PHASE_SET) {
            return _set - 1;
        }
        return _set;
    }

    // The set has all its repetitions.
    function setIsComplete(repsDone as Number) as Boolean {
        return repsDone >= _reps;
    }

    // Ends the current set with what it counted (all the repetitions, or
    // fewer when the person skips ahead). The next set follows after the
    // rest; the last set finishes the workout. Ignored unless a set is on.
    function completeSet(counted as RunStats) as Void {
        if (_phase != PHASE_SET) {
            return;
        }
        _totals.merge(counted);
        if (_set >= _sets) {
            _phase = PHASE_DONE;
            _restLeftMs = 0;
            _outcome = OUTCOME_COMPLETED;
            return;
        }
        if (_restSec <= 0) {
            _set += 1;
            return;
        }
        _phase = PHASE_REST;
        _restLeftMs = _restSec * 1000;
    }

    // Runs the rest clock down by `dtMs`. Does nothing outside a rest.
    function tickRest(dtMs as Number) as Void {
        if (_phase != PHASE_REST || _restLeftMs <= 0) {
            return;
        }
        var step = dtMs < 0 ? 0 : dtMs;
        _restLeftMs = _restLeftMs - step < 0 ? 0 : _restLeftMs - step;
    }

    function restIsOver() as Boolean {
        return _phase == PHASE_REST && _restLeftMs <= 0;
    }

    // Leaves the rest, whether it ran out or was skipped, and starts the
    // next set.
    function endRest() as Void {
        if (_phase != PHASE_REST) {
            return;
        }
        _phase = PHASE_SET;
        _set += 1;
        _restLeftMs = 0;
    }

    // The person ends the workout early. What the set in progress counted so
    // far is kept; during a rest there is nothing in progress.
    function stop(counted as RunStats) as Void {
        if (_phase == PHASE_DONE) {
            return;
        }
        if (_phase == PHASE_SET) {
            _totals.merge(counted);
        }
        _phase = PHASE_DONE;
        _restLeftMs = 0;
        _outcome = OUTCOME_STOPPED;
    }

    // Seconds for the clock: the rest left, rounded up so it reads 0:00 only
    // at the end.
    function restSecondsLeft() as Number {
        return (_restLeftMs + 999) / 1000;
    }

    // Share of the rest still to go, 1.0 at the start and 0.0 at the end.
    function restFraction() as Float {
        if (_restSec <= 0) {
            return 0.0f;
        }
        return _restLeftMs.toFloat() / (_restSec * 1000);
    }

    // Repetitions counted so far across the sets that ended.
    function repsCounted() as Number {
        return _totals.repsCounted();
    }
}
