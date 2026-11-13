import Toybox.Lang;

// What a set (or a whole workout) counted. Port of SessionStats in
// src/domain/sessionRun.ts, plus the repetitions that entered the pain arc.
class RunStats {
    var maxAngle as Float = 0.0f;
    var hits as Number = 0;
    var overshoots as Number = 0;
    var painEntries as Number = 0;
    var repPeaks as Array<Float> = [] as Array<Float>;
    var repHeld as Array<Boolean> = [] as Array<Boolean>;
    // 1-based repetition numbers (across the workout) that entered the arc.
    var painReps as Array<Number> = [] as Array<Number>;

    function initialize() {
    }

    // Adds what a later set counted. Its pain repetition numbers continue
    // the count of the repetitions already here.
    function merge(other as RunStats) as Void {
        var offset = repPeaks.size();
        if (other.maxAngle > maxAngle) {
            maxAngle = other.maxAngle;
        }
        hits += other.hits;
        overshoots += other.overshoots;
        painEntries += other.painEntries;
        repPeaks.addAll(other.repPeaks);
        repHeld.addAll(other.repHeld);
        for (var i = 0; i < other.painReps.size(); i++) {
            painReps.add(other.painReps[i] + offset);
        }
    }

    function repsCounted() as Number {
        return repPeaks.size();
    }

    function repsHeld() as Number {
        var count = 0;
        for (var i = 0; i < repHeld.size(); i++) {
            if (repHeld[i]) {
                count += 1;
            }
        }
        return count;
    }
}
