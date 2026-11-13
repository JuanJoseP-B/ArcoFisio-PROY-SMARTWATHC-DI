import Toybox.Application;
import Toybox.Lang;

// One finished session as the watch keeps it. Mirrors the `Sesion` model of
// the handoff (docs/06) and the web `Session`: exercise, target, repetitions,
// sets, maximum range and where the arm entered the painful arc.
class SessionRecord {

    // Index of each value in the stored array.
    enum {
        F_TIME,
        F_EXERCISE,
        F_TARGET,
        F_TOLERANCE,
        F_REPS_DONE,
        F_REPS_GOAL,
        F_REPS_HELD,
        F_SETS_DONE,
        F_SETS_GOAL,
        F_MAX,
        F_STOPPED,
        F_PAIN_ENTRIES,
        F_PAIN_FROM,
        F_PAIN_TO,
        F_PAIN_REPS,
        F_COUNT
    }

    // Longest list of repetition numbers kept for the pain notice.
    static const MAX_PAIN_REPS = 6;

    var time as Number = 0;          // seconds since 1970
    var exercise as Number = 0;
    var target as Number = 0;
    var tolerance as Number = 2;
    var repsDone as Number = 0;
    var repsGoal as Number = 0;
    var repsHeld as Number = 0;
    var setsDone as Number = 0;
    var setsGoal as Number = 0;
    var maxAngle as Number = 0;
    var stopped as Boolean = false;
    var painEntries as Number = 0;
    var painFrom as Number = -1;     // -1: no arc was saved
    var painTo as Number = -1;
    var painReps as Array<Number> = [] as Array<Number>;

    function initialize() {
    }

    function hasArc() as Boolean {
        return painFrom >= 0 && painTo >= 0;
    }

    function toArray() as Array<Object> {
        var reps = painReps.size() > MAX_PAIN_REPS ? painReps.slice(0, MAX_PAIN_REPS) : painReps;
        return [
            time, exercise, target, tolerance, repsDone, repsGoal, repsHeld,
            setsDone, setsGoal, maxAngle, stopped ? 1 : 0, painEntries,
            painFrom, painTo, reps
        ] as Array<Object>;
    }

    // Null when the stored value is not a record.
    static function fromArray(raw as Object?) as SessionRecord? {
        if (!(raw instanceof Lang.Array)) {
            return null;
        }
        var a = raw as Array;
        if (a.size() != F_COUNT) {
            return null;
        }
        for (var i = 0; i < F_PAIN_REPS; i++) {
            if (!(a[i] instanceof Lang.Number)) {
                return null;
            }
        }
        if (!(a[F_PAIN_REPS] instanceof Lang.Array)) {
            return null;
        }
        var r = new SessionRecord();
        r.time = a[F_TIME] as Number;
        r.exercise = a[F_EXERCISE] as Number;
        r.target = a[F_TARGET] as Number;
        r.tolerance = a[F_TOLERANCE] as Number;
        r.repsDone = a[F_REPS_DONE] as Number;
        r.repsGoal = a[F_REPS_GOAL] as Number;
        r.repsHeld = a[F_REPS_HELD] as Number;
        r.setsDone = a[F_SETS_DONE] as Number;
        r.setsGoal = a[F_SETS_GOAL] as Number;
        r.maxAngle = a[F_MAX] as Number;
        r.stopped = (a[F_STOPPED] as Number) != 0;
        r.painEntries = a[F_PAIN_ENTRIES] as Number;
        r.painFrom = a[F_PAIN_FROM] as Number;
        r.painTo = a[F_PAIN_TO] as Number;
        var reps = a[F_PAIN_REPS] as Array;
        for (var i = 0; i < reps.size(); i++) {
            if (reps[i] instanceof Lang.Number) {
                r.painReps.add(reps[i] as Number);
            }
        }
        return r;
    }
}

// The newest sessions, oldest first. Pure: storage is done by the caller.
class SessionLog {

    static const CAPACITY = 30;

    private var _items as Array<SessionRecord> = [] as Array<SessionRecord>;

    function initialize() {
    }

    function size() as Number {
        return _items.size();
    }

    function at(index as Number) as SessionRecord {
        return _items[index];
    }

    function last() as SessionRecord? {
        return _items.size() == 0 ? null : _items[_items.size() - 1];
    }

    // The session before the last one, for the comparison of canvas 16.
    function beforeLast() as SessionRecord? {
        return _items.size() < 2 ? null : _items[_items.size() - 2];
    }

    function add(record as SessionRecord) as Void {
        _items.add(record);
        while (_items.size() > CAPACITY) {
            _items = _items.slice(1, null) as Array<SessionRecord>;
        }
    }

    function serialize() as Array<Object> {
        var out = [] as Array<Object>;
        for (var i = 0; i < _items.size(); i++) {
            out.add(_items[i].toArray() as Object);
        }
        return out;
    }

    // Unreadable entries are dropped.
    static function restore(raw as Object?) as SessionLog {
        var log = new SessionLog();
        if (raw instanceof Lang.Array) {
            var list = raw as Array;
            for (var i = 0; i < list.size(); i++) {
                var record = SessionRecord.fromArray(list[i] as Object?);
                if (record != null) {
                    log.add(record);
                }
            }
        }
        return log;
    }

    // Change of the maximum against the previous session, in whole degrees
    // (positive: higher). Null when there is nothing to compare with.
    // Maximums are already whole, so the number matches what is shown.
    static function rangeChange(previous as SessionRecord?, current as SessionRecord) as Number? {
        if (previous == null) {
            return null;
        }
        return current.maxAngle - previous.maxAngle;
    }
}
