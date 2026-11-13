import Toybox.Lang;

// A whole live workout: the sets and rests of Workout plus the SessionRun of
// the set in progress, fed with (angle, capture time) samples. Pure: the
// screen drains the tracker and calls feed(); nothing here reads a sensor or
// a clock, so a late redraw never decides when a repetition counts.
class LiveSession {

    // Flag added to the events returned by feed() when the sample finished
    // the set (the workout moved to rest or to done).
    static const EVENT_SET_DONE = 256;

    private var _config as RunConfig;
    private var _workout as Workout;
    private var _run as SessionRun;
    private var _paused as Boolean = false;
    private var _interrupted as Boolean = false;

    function initialize(config as RunConfig, sets as Number, reps as Number, restSec as Number) {
        _config = config;
        _workout = new Workout(sets, reps, restSec);
        _run = new SessionRun(config);
    }

    function config() as RunConfig {
        return _config;
    }

    function workout() as Workout {
        return _workout;
    }

    function run() as SessionRun {
        return _run;
    }

    // Feeds one sample. Ignored while the session is paused or when no set
    // is on. Returns the RepEngine / SessionRun event flags.
    function feed(angle as Float, tMs as Number) as Number {
        if (_paused || _workout.phase() != Workout.PHASE_SET) {
            return 0;
        }
        var events = _run.step(angle, tMs);
        if ((events & RepEngine.EVENT_REP_COMPLETED) != 0
                && _workout.setIsComplete(_run.engine().repsCompleted())) {
            _workout.completeSet(_run.stats());
            events |= EVENT_SET_DONE;
            if (_workout.phase() == Workout.PHASE_SET) {
                _run = new SessionRun(_config);
            }
        }
        return events;
    }

    // The person skips ahead: the set counts what it has and the workout
    // moves on to the rest (or the end), as "Siguiente" of the web.
    function finishSetNow() as Void {
        if (_workout.phase() != Workout.PHASE_SET) {
            return;
        }
        _workout.completeSet(_run.stats());
        if (_workout.phase() == Workout.PHASE_SET) {
            _run = new SessionRun(_config);
        }
    }

    // Ticks the rest clock. True when it just ran out.
    function tickRest(dtMs as Number) as Boolean {
        if (_workout.phase() != Workout.PHASE_REST) {
            return false;
        }
        var wasOver = _workout.restIsOver();
        _workout.tickRest(dtMs);
        return !wasOver && _workout.restIsOver();
    }

    // Leaves the rest (it ended or was skipped) and starts the next set.
    function endRest() as Void {
        if (_workout.phase() != Workout.PHASE_REST) {
            return;
        }
        _workout.endRest();
        _run = new SessionRun(_config);
    }

    // The person ends the workout early.
    function stop() as Void {
        _workout.stop(_run.stats());
    }

    // ---- Sensor loss -----------------------------------------------------

    // Called with whether the readings stopped. The first time they do, the
    // session pauses and the hold in progress is dropped; the progress made
    // stays. It only comes back with resume().
    function checkSignal(lost as Boolean) as Void {
        if (lost && !_paused && _workout.phase() == Workout.PHASE_SET) {
            _paused = true;
            _interrupted = true;
            _run.pause();
        }
    }

    function isPaused() as Boolean {
        return _paused;
    }

    // True once the readings were lost at some point of this session.
    function wasInterrupted() as Boolean {
        return _interrupted;
    }

    function pause() as Void {
        _paused = true;
        _run.pause();
    }

    function resume() as Void {
        _paused = false;
    }

    // ---- What the screens show --------------------------------------------

    // 1-based repetition in progress of the current set, capped at the goal.
    function repNumber() as Number {
        var next = _run.engine().repsCompleted() + 1;
        return next > _workout.repsPerSet() ? _workout.repsPerSet() : next;
    }

    // Repetitions counted in the whole workout so far.
    function repsDone() as Number {
        return _workout.repsCounted() + (_workout.phase() == Workout.PHASE_SET ? _run.engine().repsCompleted() : 0);
    }

    function repsGoal() as Number {
        return _workout.setsPlanned() * _workout.repsPerSet();
    }

    // Everything counted so far, the set in progress included.
    function allStats() as RunStats {
        var out = new RunStats();
        out.merge(_workout.totals());
        if (_workout.phase() == Workout.PHASE_SET) {
            out.merge(_run.stats());
        }
        return out;
    }
}
