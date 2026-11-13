import Toybox.Lang;

// Turns accelerometer samples into the live arm angle.
//
// Holds the calibration reference ("arm down = 0 degrees"), the filtered
// angle, the maximum reached and, while a calibration is running, its
// stability hold. It consumes samples from SensorReader and knows nothing
// about the screen.
class ArmTracker {

    private var _gravityRef as Array<Double>?;
    private var _angle as Float?;
    private var _maxAngle as Float?;
    private var _hold as CalibrationHold?;
    private var _stored as Boolean = false;

    function initialize() {
        _gravityRef = CalibrationStore.load();
        _stored = _gravityRef != null;
    }

    // SampleSink: one accelerometer sample in milli-g with its capture time.
    function onAccelSample(vec as Array<Number>, captureMs as Number) as Void {
        var hold = _hold;
        if (hold != null && !hold.isDone()) {
            hold.addSample(vec, captureMs);
            var reference = hold.gravityRef();
            if (reference != null) {
                _gravityRef = reference;
                _stored = CalibrationStore.save(reference);
                _angle = null;
                _maxAngle = null;
            }
            return;
        }
        var gravityRef = _gravityRef;
        if (gravityRef == null) {
            return;
        }
        var raw = AngleMath.computeAngle(vec, gravityRef);
        if (raw == null) {
            return;
        }
        var angle = AngleMath.filterAngle(_angle, raw);
        _angle = angle;
        var max = _maxAngle;
        if (max == null || angle > max) {
            _maxAngle = angle;
        }
    }

    // SampleSink: the reader stopped receiving samples. The filtered angle is
    // dropped so an old value is never shown as live; the maximum stays.
    function onSignalLost() as Void {
        _angle = null;
    }

    function isCalibrated() as Boolean {
        return _gravityRef != null;
    }

    // False when the last calibration could not be written to storage.
    function isCalibrationStored() as Boolean {
        return _stored;
    }

    // Filtered angle in degrees, or null without calibration or fresh data.
    function angle() as Float? {
        return _angle;
    }

    function maxAngle() as Float? {
        return _maxAngle;
    }

    function resetMax() as Void {
        _maxAngle = _angle;
    }

    // Starts a new stability hold. The previous reference stays in use until
    // the new one completes.
    function startCalibration() as Void {
        _hold = new CalibrationHold(
            SensorConfig.CALIBRATION_HOLD_MS,
            SensorConfig.CALIBRATION_MIN_SAMPLES,
            SensorConfig.CALIBRATION_MAX_SPREAD_DEG,
            SensorConfig.SIGNAL_LOSS_TIMEOUT_MS
        );
    }

    function cancelCalibration() as Void {
        _hold = null;
    }

    // The running or just completed hold, or null when none was started.
    function calibrationHold() as CalibrationHold? {
        return _hold;
    }
}
