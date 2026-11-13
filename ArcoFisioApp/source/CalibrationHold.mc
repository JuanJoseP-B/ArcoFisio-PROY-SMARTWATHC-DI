import Toybox.Lang;

// Stability check behind the "arm down = 0 degrees" countdown.
//
// The countdown only completes when every sample of the last `holdMs`
// stayed within `maxSpreadDeg` of both the first sample of the hold and the
// running mean direction. A sample that strays, or a gap without samples,
// restarts the hold from that sample. Pure: samples carry their capture time.
class CalibrationHold {

    private var _holdMs as Number;
    private var _minSamples as Number;
    private var _maxSpreadDeg as Float;
    private var _maxGapMs as Number;

    private var _anchor as Array<Double>?;
    private var _sum as Array<Double> = [0.0d, 0.0d, 0.0d];
    private var _count as Number = 0;
    private var _startMs as Number = 0;
    private var _lastMs as Number = 0;

    private var _restarts as Number = 0;
    private var _lastRestartMs as Number?;
    private var _reference as Array<Double>?;

    function initialize(holdMs as Number, minSamples as Number, maxSpreadDeg as Float, maxGapMs as Number) {
        _holdMs = holdMs;
        _minSamples = minSamples;
        _maxSpreadDeg = maxSpreadDeg;
        _maxGapMs = maxGapMs;
    }

    // Feeds one gravity sample captured at `timeMs`. Ignored once done, and
    // when the vector has no usable direction.
    function addSample(vec as AngleMath.Vec3, timeMs as Number) as Void {
        if (_reference != null) {
            return;
        }
        var unit = AngleMath.normalize(vec);
        if (unit == null) {
            return;
        }
        var anchor = _anchor;
        if (anchor == null) {
            begin(unit, timeMs);
            return;
        }
        if (timeMs - _lastMs > _maxGapMs || strays(unit, anchor)) {
            _restarts += 1;
            _lastRestartMs = timeMs;
            begin(unit, timeMs);
            return;
        }
        accumulate(unit, timeMs);
        if (timeMs - _startMs >= _holdMs && _count >= _minSamples) {
            _reference = AngleMath.normalize(_sum);
        }
    }

    function isDone() as Boolean {
        return _reference != null;
    }

    // Mean gravity direction of the completed hold, or null before that.
    function gravityRef() as Array<Double>? {
        return _reference;
    }

    // Time still to hold, measured on sample capture times.
    function remainingMs() as Number {
        if (_reference != null) {
            return 0;
        }
        if (_anchor == null) {
            return _holdMs;
        }
        var left = _holdMs - (_lastMs - _startMs);
        return left < 0 ? 0 : left;
    }

    // Completed share of the hold, 0.0 to 1.0.
    function progress() as Float {
        return 1.0f - remainingMs().toFloat() / _holdMs;
    }

    // True once at least one usable sample has arrived.
    function hasSamples() as Boolean {
        return _anchor != null;
    }

    function restartCount() as Number {
        return _restarts;
    }

    // Capture time of the sample that last restarted the hold, if any.
    function lastRestartMs() as Number? {
        return _lastRestartMs;
    }

    private function begin(unit as Array<Double>, timeMs as Number) as Void {
        _anchor = unit;
        _sum = [unit[0], unit[1], unit[2]];
        _count = 1;
        _startMs = timeMs;
        _lastMs = timeMs;
    }

    private function accumulate(unit as Array<Double>, timeMs as Number) as Void {
        _sum = [_sum[0] + unit[0], _sum[1] + unit[1], _sum[2] + unit[2]];
        _count += 1;
        _lastMs = timeMs;
    }

    private function strays(unit as Array<Double>, anchor as Array<Double>) as Boolean {
        if (AngleMath.angleBetweenUnits(unit, anchor) > _maxSpreadDeg) {
            return true;
        }
        var mean = AngleMath.normalize(_sum);
        return mean == null || AngleMath.angleBetweenUnits(unit, mean) > _maxSpreadDeg;
    }
}
