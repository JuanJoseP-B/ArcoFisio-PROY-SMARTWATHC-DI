import Toybox.Lang;
import Toybox.Test;

// Unit tests of the sets-and-rests machine (port of src/domain/workout.ts).

module WorkoutTests {

    // Stats of a set with `reps` repetitions, the first `held` of them held.
    function stats(reps as Number, held as Number, maxAngle as Float) as RunStats {
        var out = new RunStats();
        out.maxAngle = maxAngle;
        for (var i = 0; i < reps; i++) {
            out.repPeaks.add(maxAngle);
            out.repHeld.add(i < held);
        }
        return out;
    }

    (:test)
    function twoSetsRunSetRestSetDone(logger as Logger) as Boolean {
        var w = new Workout(2, 3, 30);
        var ok = w.phase() == Workout.PHASE_SET && w.set() == 1;
        w.completeSet(stats(3, 3, 91.0f));
        ok = ok && w.phase() == Workout.PHASE_REST && w.set() == 1 && w.restSecondsLeft() == 30;
        w.endRest();
        ok = ok && w.phase() == Workout.PHASE_SET && w.set() == 2;
        w.completeSet(stats(3, 2, 94.0f));
        return ok && w.phase() == Workout.PHASE_DONE
            && w.outcome() == Workout.OUTCOME_COMPLETED
            && w.totals().repsCounted() == 6
            && w.totals().repsHeld() == 5
            && w.totals().maxAngle == 94.0f
            && w.setsEnded() == 2;
    }

    (:test)
    function restClockRunsDownAndRoundsUp(logger as Logger) as Boolean {
        var w = new Workout(2, 1, 5);
        w.completeSet(stats(1, 1, 90.0f));
        w.tickRest(1);
        var first = w.restSecondsLeft();
        w.tickRest(3999);
        var second = w.restSecondsLeft();
        var notOver = !w.restIsOver();
        w.tickRest(5000);
        return first == 5 && second == 1 && notOver
            && w.restIsOver() && w.restSecondsLeft() == 0 && w.restFraction() == 0.0f;
    }

    (:test)
    function restFractionGoesFromOneToZero(logger as Logger) as Boolean {
        var w = new Workout(2, 1, 10);
        w.completeSet(stats(1, 1, 90.0f));
        var start = w.restFraction();
        w.tickRest(5000);
        var half = w.restFraction();
        return start == 1.0f && half > 0.49f && half < 0.51f;
    }

    (:test)
    function skippingTheRestStartsTheNextSet(logger as Logger) as Boolean {
        var w = new Workout(3, 2, 30);
        w.completeSet(stats(2, 2, 90.0f));
        w.endRest();
        return w.phase() == Workout.PHASE_SET && w.set() == 2 && !w.restIsOver();
    }

    (:test)
    function zeroRestGoesStraightToTheNextSet(logger as Logger) as Boolean {
        var w = new Workout(2, 2, 0);
        w.completeSet(stats(2, 2, 90.0f));
        return w.phase() == Workout.PHASE_SET && w.set() == 2;
    }

    (:test)
    function stoppingKeepsWhatTheSetCounted(logger as Logger) as Boolean {
        var w = new Workout(3, 10, 30);
        w.completeSet(stats(10, 10, 90.0f));
        w.endRest();
        w.stop(stats(4, 3, 96.0f));
        return w.phase() == Workout.PHASE_DONE
            && w.outcome() == Workout.OUTCOME_STOPPED
            && w.totals().repsCounted() == 14
            && w.totals().maxAngle == 96.0f;
    }

    (:test)
    function stoppingDuringARestAddsNothing(logger as Logger) as Boolean {
        var w = new Workout(3, 10, 30);
        w.completeSet(stats(10, 10, 90.0f));
        w.stop(stats(99, 99, 170.0f));
        return w.outcome() == Workout.OUTCOME_STOPPED
            && w.totals().repsCounted() == 10
            && w.totals().maxAngle == 90.0f;
    }

    (:test)
    function aFinishedWorkoutIgnoresFurtherCalls(logger as Logger) as Boolean {
        var w = new Workout(1, 2, 30);
        w.completeSet(stats(2, 2, 90.0f));
        w.stop(stats(5, 5, 120.0f));
        w.completeSet(stats(5, 5, 120.0f));
        w.endRest();
        return w.outcome() == Workout.OUTCOME_COMPLETED && w.totals().repsCounted() == 2;
    }

    (:test)
    function painRepetitionsContinueAcrossSets(logger as Logger) as Boolean {
        var w = new Workout(2, 3, 5);
        var first = stats(3, 3, 90.0f);
        first.painReps.add(2);
        w.completeSet(first);
        w.endRest();
        var second = stats(3, 3, 90.0f);
        second.painReps.add(1);
        w.completeSet(second);
        var reps = w.totals().painReps;
        return reps.size() == 2 && reps[0] == 2 && reps[1] == 4;
    }
}
