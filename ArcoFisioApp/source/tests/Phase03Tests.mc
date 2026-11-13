import Toybox.Lang;
import Toybox.Test;

// Unit tests of the phase 03 logic: pain-arc marking, the session log and the
// live workout driven by (angle, time) samples. No sensor, no clock.

module Phase03Tests {

    // ---- Pain arc marking -------------------------------------------------

    (:test)
    function markingKeepsTheTwoLimitsInOrder(logger as Logger) as Boolean {
        var m = new PainArcModel();
        m.markStart(100.4f);
        var accepted = m.markEnd(125.0f);
        return accepted && m.step() == PainArcModel.STEP_CONFIRM && m.from() == 100 && m.to() == 125;
    }

    (:test)
    function markingBackwardsSwapsTheLimits(logger as Logger) as Boolean {
        var m = new PainArcModel();
        m.markStart(125.0f);
        m.markEnd(100.0f);
        return m.from() == 100 && m.to() == 125;
    }

    (:test)
    function aTooShortArcIsRefused(logger as Logger) as Boolean {
        var m = new PainArcModel();
        m.markStart(100.0f);
        var accepted = m.markEnd(103.0f);
        var stays = m.step() == PainArcModel.STEP_MARKING && m.wasTooShort();
        var second = m.markEnd(105.0f);
        return !accepted && stays && second && m.to() == 105;
    }

    (:test)
    function liveArcNeverGoesBelowTheStart(logger as Logger) as Boolean {
        var m = new PainArcModel();
        m.markStart(100.0f);
        return m.liveTo(90.0f) == 100 && m.liveTo(112.0f) == 112;
    }

    (:test)
    function repeatingTheMarkStartsOver(logger as Logger) as Boolean {
        var m = new PainArcModel();
        m.markStart(100.0f);
        m.markEnd(125.0f);
        m.retry();
        return m.step() == PainArcModel.STEP_INTRO && !m.markEnd(130.0f);
    }

    // ---- Session log ------------------------------------------------------

    function record(max as Number, reps as Number) as SessionRecord {
        var r = new SessionRecord();
        r.time = 1000 + max;
        r.exercise = 1;
        r.target = 90;
        r.repsDone = reps;
        r.repsGoal = 30;
        r.repsHeld = reps - 1;
        r.setsDone = 3;
        r.setsGoal = 3;
        r.maxAngle = max;
        r.painEntries = 2;
        r.painFrom = 100;
        r.painTo = 125;
        r.painReps = [4, 7] as Array<Number>;
        return r;
    }

    (:test)
    function aRecordSurvivesStorage(logger as Logger) as Boolean {
        var log = new SessionLog();
        log.add(record(94, 30));
        var back = SessionLog.restore(log.serialize());
        var r = back.last();
        return r != null && back.size() == 1
            && r.maxAngle == 94 && r.repsDone == 30 && r.painFrom == 100
            && r.painReps.size() == 2 && r.painReps[1] == 7 && !r.stopped;
    }

    (:test)
    function brokenEntriesAreDropped(logger as Logger) as Boolean {
        var raw = [[1, 2, 3], "x", record(80, 10).toArray()];
        var log = SessionLog.restore(raw);
        return log.size() == 1 && SessionLog.restore(null).size() == 0 && SessionLog.restore("nope").size() == 0;
    }

    (:test)
    function theLogKeepsOnlyTheNewest(logger as Logger) as Boolean {
        var log = new SessionLog();
        for (var i = 0; i < SessionLog.CAPACITY + 5; i++) {
            log.add(record(60 + i, 10));
        }
        var first = log.at(0);
        return log.size() == SessionLog.CAPACITY && first.maxAngle == 65;
    }

    (:test)
    function rangeChangeHasSignAndFirstSessionHasNone(logger as Logger) as Boolean {
        var low = record(88, 30);
        var high = record(94, 30);
        var change = SessionLog.rangeChange(low, high);
        var drop = SessionLog.rangeChange(high, low);
        return change == 6 && drop == -6
            && SessionLog.rangeChange(null, high) == null
            && SessionLog.rangeChange(high, record(94, 30)) == 0;
    }

    // ---- Live workout -----------------------------------------------------

    // Feeds one repetition: up to the target, holds it for `holdMs`, comes
    // back. Samples every 100 ms from `startMs`. Returns the next time.
    function oneRep(live as LiveSession, startMs as Number, holdMs as Number, top as Float) as Number {
        var t = startMs;
        var up = [0.0f, 40.0f, 70.0f, top] as Array<Float>;
        for (var i = 0; i < up.size(); i++) {
            live.feed(up[i], t);
            t += 100;
        }
        var end = t + holdMs;
        while (t <= end) {
            live.feed(top, t);
            t += 100;
        }
        live.feed(50.0f, t);
        return t + 100;
    }

    function newLive(sets as Number, reps as Number, rest as Number) as LiveSession {
        return new LiveSession(new RunConfig(90, 2, null, null, EngineConfig.PAIN_RULE_V1), sets, reps, rest);
    }

    (:test)
    function twoSetsWithARestComplete(logger as Logger) as Boolean {
        var live = newLive(2, 2, 10);
        var t = oneRep(live, 1000, 1100, 90.0f);
        t = oneRep(live, t, 1100, 90.0f);
        var w = live.workout();
        var resting = w.phase() == Workout.PHASE_REST && w.set() == 1;
        var ignoredInRest = live.feed(90.0f, t) == 0;
        live.endRest();
        t = oneRep(live, t + 5000, 1100, 91.0f);
        t = oneRep(live, t, 1100, 91.0f);
        return resting && ignoredInRest
            && w.phase() == Workout.PHASE_DONE
            && w.outcome() == Workout.OUTCOME_COMPLETED
            && w.totals().repsCounted() == 4
            && w.totals().repsHeld() == 4
            && w.totals().maxAngle == 91.0f
            && live.repsDone() == 4 && live.repsGoal() == 4;
    }

    (:test)
    function repsAreCountedEvenWhenNotHeld(logger as Logger) as Boolean {
        var live = newLive(1, 2, 10);
        var t = oneRep(live, 1000, 400, 90.0f);
        t = oneRep(live, t, 1100, 90.0f);
        var stats = live.allStats();
        return stats.repsCounted() == 2 && stats.repsHeld() == 1
            && live.workout().phase() == Workout.PHASE_DONE;
    }

    (:test)
    function aLostSensorPausesAndKeepsTheProgress(logger as Logger) as Boolean {
        var live = newLive(1, 3, 10);
        var t = oneRep(live, 1000, 1100, 90.0f);
        live.feed(70.0f, t);
        live.feed(90.0f, t + 100);
        live.checkSignal(true);
        var paused = live.isPaused();
        var ignored = live.feed(90.0f, t + 200) == 0;
        var kept = live.repsDone() == 1 && live.run().engine().holdProgress() == 0.0f;
        live.resume();
        return paused && ignored && kept && !live.isPaused() && live.wasInterrupted();
    }

    (:test)
    function aStaleSampleCannotCompleteTheHoldAfterAPause(logger as Logger) as Boolean {
        var live = newLive(1, 3, 10);
        live.feed(70.0f, 1000);
        live.feed(90.0f, 1100);
        live.feed(90.0f, 1600);
        live.checkSignal(true);
        live.resume();
        // Readings come back much later: the hold restarts, it does not jump
        // to a second just because the clock moved on.
        var events = live.feed(90.0f, 9000);
        var heldEarly = (events & RepEngine.EVENT_HELD) != 0;
        var later = live.feed(90.0f, 9500);
        return !heldEarly && (later & RepEngine.EVENT_HELD) == 0
            && (live.feed(90.0f, 10100) & RepEngine.EVENT_HELD) != 0;
    }

    (:test)
    function stoppingEarlyKeepsTheSetInProgress(logger as Logger) as Boolean {
        var live = newLive(3, 10, 30);
        var t = oneRep(live, 1000, 1100, 92.0f);
        live.feed(70.0f, t);
        live.stop();
        var w = live.workout();
        return w.outcome() == Workout.OUTCOME_STOPPED
            && w.totals().repsCounted() == 1
            && w.totals().maxAngle == 92.0f
            && live.repsDone() == 1;
    }

    (:test)
    function skippingTheSetMovesToTheRest(logger as Logger) as Boolean {
        var live = newLive(2, 5, 10);
        var t = oneRep(live, 1000, 1100, 90.0f);
        live.finishSetNow();
        return live.workout().phase() == Workout.PHASE_REST
            && live.workout().totals().repsCounted() == 1
            && live.repsDone() == 1 && t > 0;
    }

    (:test)
    function theRestClockEndsOnceAndWaitsForTheStart(logger as Logger) as Boolean {
        var live = newLive(2, 1, 3);
        oneRep(live, 1000, 1100, 90.0f);
        var early = live.tickRest(1000);
        var end = live.tickRest(2500);
        var again = live.tickRest(100);
        return !early && end && !again && live.workout().restIsOver()
            && live.workout().phase() == Workout.PHASE_REST;
    }

    (:test)
    function painEntriesAreCountedPerRepetition(logger as Logger) as Boolean {
        // Pain first: with the v1 rule an angle above the target is an
        // overshoot before it is pain, so the arc above 92 is never reported.
        var config = new RunConfig(90, 2, 100, 125, EngineConfig.PAIN_RULE_PAIN_FIRST);
        var live = new LiveSession(config, 1, 2, 10);
        var t = 1000;
        var path = [0.0f, 70.0f, 90.0f, 106.0f, 90.0f, 50.0f, 70.0f, 90.0f, 110.0f, 50.0f] as Array<Float>;
        for (var i = 0; i < path.size(); i++) {
            live.feed(path[i], t);
            t += 100;
        }
        var stats = live.allStats();
        return stats.painEntries == 2 && stats.painReps.size() == 2
            && stats.painReps[0] == 1 && stats.painReps[1] == 2;
    }
}
