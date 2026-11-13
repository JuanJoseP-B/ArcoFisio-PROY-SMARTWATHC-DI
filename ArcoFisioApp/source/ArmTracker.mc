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
    private var _lastCaptureMs as Number?;

    // Filtered samples waiting for the live session, with their capture
    // times. Only filled while recording.
    private var _recording as Boolean = false;
    private var _queueAngles as Array<Float> = [] as Array<Float>;
    private var _queueTimes as Array<Number> = [] as Array<Number>;
    private static const QUEUE_LIMIT = 200;

    function initialize() {
        _gravityRef = CalibrationStore.load();
        _stored = _gravityRef != null;
    }

    // SampleSink: one accelerometer sample in milli-g with its capture time.
    function onAccelSample(vec as Array<Number>, captureMs as Number) as Void {
        if (_lastCaptureMs != null && captureMs <= (_lastCaptureMs as Number)) { return; }
        _lastCaptureMs = captureMs;
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
        if (_recording) {
            if (_queueAngles.size() >= QUEUE_LIMIT) {
                _queueAngles = _queueAngles.slice(1, null) as Array<Float>;
                _queueTimes = _queueTimes.slice(1, null) as Array<Number>;
            }
            _queueAngles.add(angle);
            _queueTimes.add(captureMs);
        }
    }

    // The live session starts or stops receiving samples. Starting drops
    // whatever was queued before.
    function clearQueue() as Void {
        _queueAngles = [] as Array<Float>;
        _queueTimes = [] as Array<Number>;
    }

    function setRecording(on as Boolean) as Void {
        _recording = on;
        _queueAngles = [] as Array<Float>;
        _queueTimes = [] as Array<Number>;
    }

    // Hands the queued samples to the session in order and empties the
    // queue. Returns the OR of the engine events they raised.
    function drainInto(live as LiveSession) as Number {
        var events = 0;
        var angles = _queueAngles;
        var times = _queueTimes;
        _queueAngles = [] as Array<Float>;
        _queueTimes = [] as Array<Number>;
        for (var i = 0; i < angles.size(); i++) {
            events |= live.feed(angles[i], times[i]);
        }
        return events;
    }

    // SampleSink: the reader stopped receiving samples. The filtered angle is
    // dropped so an old value is never shown as live; the maximum stays.
    function onSignalLost() as Void {
        _angle = null;
        clearQueue();
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
