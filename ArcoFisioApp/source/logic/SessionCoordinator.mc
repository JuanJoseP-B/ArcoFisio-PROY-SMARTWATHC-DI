import Toybox.Lang;

class SessionCoordinator {
    var live as LiveSession;
    var archive as SessionArchive;
    var record as SessionRecord?;
    var previous as SessionRecord?;
    var saved as Boolean = true;
    var active as Boolean = false;
    var dialog as Number = 0;
    static const DIALOG_NONE = 0;
    static const DIALOG_PAUSED = 1;
    static const DIALOG_END = 2;
    static const DIALOG_LOST = 3;
    private var _returnDialog as Number = 0;
    private var _lastTick as Number?;
    private var _exercise as Number = 0;

    function initialize() {
        archive = new SessionArchive();
        record = archive.log().last();
        previous = archive.log().beforeLast();
        live = new LiveSession(new RunConfig(90, 2, null, null, EngineConfig.PAIN_RULE), 1, 1, 0);
    }

    function start(wizard as WizardModel, now as Number, tracker as ArmTracker) as Void {
        var arc = SavedArc.load();
        var tolerance = Prefs.readNumber(Prefs.KEY_TOLERANCE, 2);
        if (tolerance < 1 || tolerance > 10) { tolerance = 2; }
        var config = new RunConfig(wizard.value(WizardRules.STEP_ANGLE), tolerance,
            arc == null ? null : arc[0], arc == null ? null : arc[1], EngineConfig.PAIN_RULE);
        live = new LiveSession(config, wizard.value(WizardRules.STEP_SETS),
            wizard.value(WizardRules.STEP_REPS), wizard.value(WizardRules.STEP_REST));
        _exercise = wizard.exercise();
        active = true;
        saved = false;
        record = null;
        previous = archive.log().last();
        dialog = DIALOG_NONE;
        _lastTick = now;
        tracker.setRecording(true);
    }

    // Called after sensor ingestion. Every sample keeps its capture timestamp.
    function tick(now as Number, seconds as Number, fresh as Boolean, tracker as ArmTracker) as Number {
        var dt = _lastTick == null ? 0 : now - (_lastTick as Number);
        _lastTick = now;
        if (!active) { return 0; }
        if (dialog != DIALOG_NONE) { tracker.clearQueue(); return 0; }
        if (live.workout().phase() == Workout.PHASE_SET && !fresh) {
            live.checkSignal(true);
            dialog = DIALOG_LOST;
            tracker.setRecording(false);
            return 0;
        }
        var events = 0;
        if (live.workout().phase() == Workout.PHASE_SET) {
            events = tracker.drainInto(live);
        } else if (live.workout().phase() == Workout.PHASE_REST) {
            tracker.clearQueue();
            if (live.tickRest(dt)) { events = 512; }
        }
        if (live.workout().phase() == Workout.PHASE_DONE) { finish(seconds, tracker); }
        return events;
    }

    function pause(tracker as ArmTracker) as Void {
        if (!active) { return; }
        live.pause();
        tracker.setRecording(false);
        dialog = DIALOG_PAUSED;
    }
    function askEnd(tracker as ArmTracker) as Void {
        if (!active) { return; }
        _returnDialog = dialog;
        live.pause();
        tracker.setRecording(false);
        dialog = DIALOG_END;
    }
    function cancelEnd(fresh as Boolean, now as Number, tracker as ArmTracker) as Void {
        if (_returnDialog != DIALOG_NONE) { dialog = _returnDialog; return; }
        resume(fresh, now, tracker);
    }
    function resume(fresh as Boolean, now as Number, tracker as ArmTracker) as Boolean {
        if (!fresh && live.workout().phase() == Workout.PHASE_SET) {
            dialog = DIALOG_LOST;
            return false;
        }
        // Discard even fresh samples captured while a dialog was open.
        tracker.setRecording(true);
        live.resume();
        _lastTick = now;
        dialog = DIALOG_NONE;
        return true;
    }
    function nextSet(fresh as Boolean, now as Number, tracker as ArmTracker) as Boolean {
        if (!fresh) { return false; }
        live.endRest();
        tracker.setRecording(true);
        _lastTick = now;
        return true;
    }
    function stop(seconds as Number, tracker as ArmTracker) as Void {
        live.stop();
        finish(seconds, tracker);
    }
    private function finish(seconds as Number, tracker as ArmTracker) as Void {
        if (!active) { return; }
        active = false;
        dialog = DIALOG_NONE;
        tracker.setRecording(false);
        record = RecordBuilder.fromSession(live, _exercise, seconds);
        retrySave();
    }
    function retrySave() as Boolean {
        var result = record;
        if (result == null) { return false; }
        saved = archive.save(result);
        return saved;
    }
}

module SavedArc {
    function load() as Array<Number>? {
        var raw = Prefs.read(Prefs.KEY_PAIN_ARC);
        if (!(raw instanceof Lang.Array)) { return null; }
        var a = raw as Array;
        if (a.size() != 2 || !(a[0] instanceof Lang.Number) || !(a[1] instanceof Lang.Number)) { return null; }
        var lo = a[0] as Number;
        var hi = a[1] as Number;
        return lo >= 0 && hi <= 180 && hi - lo >= EngineConfig.MIN_PAIN_ARC_DEG
            ? [lo, hi] as Array<Number> : null;
    }
    function save(lo as Number, hi as Number) as Boolean {
        return Prefs.write(Prefs.KEY_PAIN_ARC, [lo, hi]);
    }
}

