import Toybox.Application;
import Toybox.Lang;

// Commit the new log only after Storage accepted it. A failed retry cannot
// duplicate a result or discard the last successful log.
class SessionArchive {
    private var _log as SessionLog;
    private var _lastSaved as SessionRecord?;

    function initialize() {
        _log = SessionLog.restore(Prefs.read(Prefs.KEY_SESSIONS));
    }
    function log() as SessionLog { return _log; }
    function save(record as SessionRecord) as Boolean {
        if (_lastSaved == record) { return true; }
        var next = SessionLog.restore(_log.serialize());
        next.add(record);
        if (!Prefs.write(Prefs.KEY_SESSIONS, next.serialize() as Application.Storage.ValueType)) {
            return false;
        }
        _log = next;
        _lastSaved = record;
        return true;
    }
}

module RecordBuilder {
    function fromSession(live as LiveSession, exercise as Number, seconds as Number) as SessionRecord {
        var r = new SessionRecord();
        var stats = live.allStats();
        var w = live.workout();
        var c = live.config();
        r.time = seconds;
        r.exercise = exercise;
        r.target = c.target.toNumber();
        r.tolerance = c.tolerance.toNumber();
        r.repsDone = stats.repsCounted();
        r.repsHeld = stats.repsHeld();
        r.repsGoal = live.repsGoal();
        r.setsDone = w.setsEnded();
        r.setsGoal = w.setsPlanned();
        r.maxAngle = (stats.maxAngle + 0.5f).toNumber();
        r.stopped = w.outcome() != Workout.OUTCOME_COMPLETED;
        r.painEntries = stats.painEntries;
        r.painFrom = c.painFrom == null ? -1 : (c.painFrom as Float).toNumber();
        r.painTo = c.painTo == null ? -1 : (c.painTo as Float).toNumber();
        r.painReps = stats.painReps;
        return r;
    }
}
