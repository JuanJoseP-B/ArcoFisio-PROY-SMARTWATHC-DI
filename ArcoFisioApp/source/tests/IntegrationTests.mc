import Toybox.Application;
import Toybox.Lang;
import Toybox.Test;

// Phase 03 integration: SYNTHETIC gravity vectors go through the same
// SensorReader -> ArmTracker queue -> SessionCoordinator -> LiveSession ->
// SessionArchive path as the real accelerometer. They are test fixtures, not
// measurements. Everything is stored under the "test:" namespace.

module IntegrationTests {

    const STEP_MS = 100;

    class Rig {
        var tracker as ArmTracker;
        var reader as SensorReader;
        var coordinator as SessionCoordinator;
        var now as Number = 1000;

        function initialize() {
            tracker = new ArmTracker();
            reader = new SensorReader(tracker);
            coordinator = new SessionCoordinator();
        }

        // One accelerometer sample at `degrees` of elevation, then one app tick.
        function sample(degrees as Float, fresh as Boolean) as Number {
            reader.injectSimulation(SimulatedSensor.vector(degrees), now);
            var events = coordinator.tick(now, 1700000000, fresh, tracker);
            now += STEP_MS;
            return events;
        }

        function hold(degrees as Float, count as Number) as Void {
            for (var i = 0; i < count; i++) { sample(degrees, true); }
        }

        // Up to the target, hold it past one second, back down.
        function repetition() as Void {
            hold(0.0f, 3);
            hold(90.0f, 28);
            hold(0.0f, 30);
        }

        function calibrate() as Void {
            tracker.startCalibration();
            hold(0.0f, 45);
            tracker.cancelCalibration();
        }

        // 1 repetition per set, 2 sets, 10 s of rest.
        function begin() as Void {
            var wizard = WizardModel.restore([WizardModel.EXERCISE_ABDUCTION, 90, 1, 2, 10] as Array);
            coordinator.start(wizard, now, tracker);
        }

        function restOut() as Void {
            while (coordinator.live.workout().phase() == Workout.PHASE_REST && !coordinator.live.workout().restIsOver()) {
                coordinator.tick(now, 1700000000, true, tracker);
                now += 1000;
            }
        }
    }

    function open() as Rig {
        Prefs.testNamespace = true;
        Prefs.failWrites = false;
        var keys = [Prefs.KEY_SESSIONS, Prefs.KEY_PAIN_ARC, Prefs.KEY_TOLERANCE, CalibrationStore.KEY_GRAVITY_REF];
        for (var i = 0; i < keys.size(); i++) {
            Application.Storage.deleteValue(Prefs.storageKey(keys[i]));
        }
        var rig = new Rig();
        rig.calibrate();
        return rig;
    }

    function close() as Void {
        Prefs.failWrites = false;
        Prefs.testNamespace = false;
    }

    (:test)
    function theWaterFollowsTheMarkerAtTheLimits(logger as Logger) as Boolean {
        var bottom = LiveModel.waterLevel(0.0f);
        var middle = LiveModel.waterLevel(90.0f);
        var top = LiveModel.waterLevel(180.0f);
        return (bottom - 0.0573f).abs() < 0.002f && (middle - 0.5f).abs() < 0.002f
            && (top - 0.9427f).abs() < 0.002f
            && LiveModel.waterLevel(-20.0f) == bottom && LiveModel.waterLevel(250.0f) == top;
    }

    (:test)
    function aCalibratedTrackerReadsTheSyntheticAngle(logger as Logger) as Boolean {
        var rig = open();
        rig.hold(60.0f, 30);
        var angle = rig.tracker.angle();
        var ok = rig.tracker.isCalibrated() && angle != null && ((angle as Float) - 60.0f).abs() < 3.0f;
        close();
        return ok;
    }

    (:test)
    function twoSetsRunFromTheReaderToTheSavedRecord(logger as Logger) as Boolean {
        var rig = open();
        rig.begin();
        rig.repetition();
        var resting = rig.coordinator.live.workout().phase() == Workout.PHASE_REST
            && rig.coordinator.active;
        rig.restOut();
        var started = rig.coordinator.nextSet(true, rig.now, rig.tracker);
        rig.repetition();
        var c = rig.coordinator;
        var r = c.record;
        var ok = resting && started && !c.active && c.saved && r != null
            && (r as SessionRecord).repsDone == 2 && (r as SessionRecord).setsDone == 2
            && (r as SessionRecord).repsHeld == 2 && !(r as SessionRecord).stopped
            && (r as SessionRecord).maxAngle >= 88 && (r as SessionRecord).maxAngle <= 92
            && c.archive.log().size() == 1;
        close();
        return ok;
    }

    (:test)
    function samplesCapturedInTheRestDoNotCountForTheNextSet(logger as Logger) as Boolean {
        var rig = open();
        rig.begin();
        rig.repetition();
        // The arm goes up during the rest: it must not pre-load the next set.
        rig.hold(90.0f, 20);
        rig.restOut();
        rig.coordinator.nextSet(true, rig.now, rig.tracker);
        var before = rig.coordinator.live.run().engine().repsCompleted();
        close();
        return before == 0 && rig.coordinator.live.workout().set() == 2;
    }

    (:test)
    function aLostSignalPausesAndOldSamplesAreNotReplayed(logger as Logger) as Boolean {
        var rig = open();
        rig.begin();
        rig.hold(0.0f, 3);
        rig.hold(90.0f, 6);
        rig.sample(90.0f, false);
        var c = rig.coordinator;
        var paused = c.dialog == SessionCoordinator.DIALOG_LOST && c.live.isPaused() && c.live.wasInterrupted();
        // Samples taken while the dialog is open are thrown away.
        for (var i = 0; i < 20; i++) { rig.sample(90.0f, true); }
        var refused = !c.resume(false, rig.now, rig.tracker) && c.dialog == SessionCoordinator.DIALOG_LOST;
        var resumed = c.resume(true, rig.now, rig.tracker);
        var untouched = c.live.repsDone() == 0 && !c.live.isPaused() && c.active;
        // The hold in progress started over: a full repetition is needed again.
        rig.hold(90.0f, 5);
        rig.hold(0.0f, 30);
        var notHeld = c.live.allStats().repsCounted() == 1 && c.live.allStats().repsHeld() == 0;
        close();
        return paused && refused && resumed && untouched && notHeld;
    }

    (:test)
    function stoppingEarlyKeepsPartialResultsAsStopped(logger as Logger) as Boolean {
        var rig = open();
        rig.begin();
        rig.repetition();
        rig.restOut();
        rig.coordinator.nextSet(true, rig.now, rig.tracker);
        rig.hold(90.0f, 10);
        rig.coordinator.stop(1700000000, rig.tracker);
        var c = rig.coordinator;
        var r = c.record;
        var ok = !c.active && c.saved && r != null && (r as SessionRecord).stopped
            && (r as SessionRecord).repsDone == 1 && (r as SessionRecord).setsDone == 1
            && c.archive.log().size() == 1;
        close();
        return ok;
    }

    (:test)
    function aFailedWriteIsReportedAndRetryDoesNotDuplicate(logger as Logger) as Boolean {
        var rig = open();
        rig.begin();
        Prefs.failWrites = true;
        rig.coordinator.stop(1700000000, rig.tracker);
        var c = rig.coordinator;
        var failed = !c.saved && c.record != null && c.archive.log().size() == 0
            && !c.retrySave();
        Prefs.failWrites = false;
        var recovered = c.retrySave() && c.saved && c.archive.log().size() == 1;
        var again = c.retrySave() && c.archive.log().size() == 1;
        // A new coordinator (the app restarted) reads what was stored.
        var reopened = new SessionCoordinator();
        var restored = reopened.record != null && reopened.archive.log().size() == 1;
        close();
        return failed && recovered && again && restored;
    }

    (:test)
    function pausedAndEndDialogsLeaveTheProgressAlone(logger as Logger) as Boolean {
        var rig = open();
        rig.begin();
        rig.hold(0.0f, 3);
        var c = rig.coordinator;
        c.pause(rig.tracker);
        var paused = c.dialog == SessionCoordinator.DIALOG_PAUSED && c.live.isPaused();
        c.askEnd(rig.tracker);
        var asking = c.dialog == SessionCoordinator.DIALOG_END;
        c.cancelEnd(true, rig.now, rig.tracker);
        var backToPause = c.dialog == SessionCoordinator.DIALOG_PAUSED;
        var resumed = c.resume(true, rig.now, rig.tracker) && c.dialog == SessionCoordinator.DIALOG_NONE;
        close();
        return paused && asking && backToPause && resumed && c.active;
    }
}
