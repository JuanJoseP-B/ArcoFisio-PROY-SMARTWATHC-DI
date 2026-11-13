import Toybox.Lang;
import Toybox.Sensor;
import Toybox.System;

// Receives every accelerometer sample with its capture time (ms on the
// System.getTimer() clock).
typedef SampleSink as interface {
    function onAccelSample(vec as Array<Number>, captureMs as Number) as Void;
    function onSignalLost() as Void;
};

// Reads the watch accelerometer (milli-g) and reports samples with capture
// times, the observed cadence and signal loss. It never produces a reading
// the sensor did not give.
//
// Two sources, switchable from the diagnostics page so both can be measured
// on the real watch:
//  - SOURCE_LISTENER (default): Sensor.registerSensorDataListener, 25 Hz in
//    1 s batches. Every sample is real and carries a sensor timestamp, so a
//    stalled sensor is detected. Cost: the screen learns about a movement up
//    to one batch period late.
//  - SOURCE_POLLING: Sensor.getInfo().accel read on the app timer. Low
//    latency, but the API gives neither a capture time nor a way to tell a
//    fresh value from a repeated one; the read time is used as capture time.
// The listener stays registered in both cases because some devices only
// power the accelerometer while a data listener exists (Sensor.Info.accel
// documentation).
class SensorReader {

    enum {
        SOURCE_LISTENER,
        SOURCE_POLLING
    }

    enum {
        STATE_STARTING,     // no sample yet, still within the loss timeout
        STATE_READY,        // fresh samples are arriving
        STATE_LOST,         // samples arrived before, none recently
        STATE_UNAVAILABLE   // no sample ever arrived within the timeout
    }

    enum {
        TIME_UNKNOWN,       // no sample yet
        TIME_SENSOR,        // per-sample timestamps given by the sensor
        TIME_ESTIMATED,     // batch without timestamps: spaced by the sample rate
        TIME_READ           // polling: time of the read, not of the capture
    }

    private var _sink as SampleSink;
    private var _source as Number = SOURCE_LISTENER;
    private var _listenerRegistered as Boolean = false;
    private var _running as Boolean = false;

    private var _startedMs as Number = 0;
    private var _lastSampleMs as Number?;
    private var _lastRaw as Array<Number>?;
    private var _lost as Boolean = false;
    private var _lossCount as Number = 0;
    private var _timeSource as Number = TIME_UNKNOWN;
    private var _cadence as CadenceMeter;

    function initialize(sink as SampleSink) {
        _sink = sink;
        _cadence = new CadenceMeter(SensorConfig.CADENCE_WINDOW_MS);
    }

    // Starts (or restarts) reading. Safe to call again to retry.
    function start() as Void {
        stop();
        _running = true;
        _startedMs = System.getTimer();
        _lastSampleMs = null;
        _lastRaw = null;
        _lost = false;
        _timeSource = TIME_UNKNOWN;
        _cadence.reset();
        _listenerRegistered = registerListener();
        if (!_listenerRegistered) {
            // Without the listener only polling can deliver anything.
            _source = SOURCE_POLLING;
        }
    }

    function stop() as Void {
        _running = false;
        if (_listenerRegistered) {
            try {
                Sensor.unregisterSensorDataListener();
            } catch (e) {
                // Nothing to release.
            }
            _listenerRegistered = false;
        }
    }

    // Called on every app timer tick: polls when that source is selected and
    // watches for signal loss.
    function tick(nowMs as Number) as Void {
        if (!_running) {
            return;
        }
        if (_source == SOURCE_POLLING) {
            poll(nowMs);
        }
        var last = _lastSampleMs;
        if (last != null && !_lost && nowMs - last > SensorConfig.SIGNAL_LOSS_TIMEOUT_MS) {
            _lost = true;
            _lossCount += 1;
            _cadence.reset();
            _sink.onSignalLost();
        }
    }

    function state(nowMs as Number) as Number {
        if (_lastSampleMs != null) {
            return _lost ? STATE_LOST : STATE_READY;
        }
        if (!_running || nowMs - _startedMs > SensorConfig.SIGNAL_LOSS_TIMEOUT_MS) {
            return STATE_UNAVAILABLE;
        }
        return STATE_STARTING;
    }

    function source() as Number {
        return _source;
    }

    // False when the high-rate listener could not be registered.
    function listenerAvailable() as Boolean {
        return _listenerRegistered;
    }

    // Switches between the listener and polling. Returns the source in use,
    // which stays on polling when the listener is not available.
    function toggleSource() as Number {
        if (_source == SOURCE_LISTENER || !_listenerRegistered) {
            _source = SOURCE_POLLING;
        } else {
            _source = SOURCE_LISTENER;
        }
        _cadence.reset();
        return _source;
    }

    // Observed cadence in Hz, or null until a full window has been measured.
    function cadenceHz() as Float? {
        return _cadence.hz();
    }

    // Age of the newest sample in ms, or null when there is none.
    function sampleAgeMs(nowMs as Number) as Number? {
        var last = _lastSampleMs;
        if (last == null) {
            return null;
        }
        var age = nowMs - last;
        return age < 0 ? 0 : age;
    }

    function lossCount() as Number {
        return _lossCount;
    }

    // Newest raw reading [x, y, z] in milli-g, or null when there is none.
    function lastRaw() as Array<Number>? {
        return _lastRaw;
    }

    function timeSource() as Number {
        return _timeSource;
    }

    // Callback of the high-rate listener: one batch of samples.
    function onSensorData(data as Sensor.SensorData) as Void {
        var accel = data.accelerometerData;
        if (accel == null || _source != SOURCE_LISTENER || !_running) {
            return;
        }
        var xs = accel.x;
        var ys = accel.y;
        var zs = accel.z;
        var count = xs.size();
        if (ys.size() < count) {
            count = ys.size();
        }
        if (zs.size() < count) {
            count = zs.size();
        }
        if (count == 0) {
            return;
        }
        var nowMs = System.getTimer();
        var stamps = usableTimestamps(accel, count);
        var stepMs = 1000 / SensorConfig.SAMPLE_RATE_HZ;
        for (var i = 0; i < count; i++) {
            // The newest sample is taken as captured on arrival; older ones
            // are placed before it by their distance to the newest.
            var behindMs = stamps != null ? stamps[count - 1] - stamps[i] : (count - 1 - i) * stepMs;
            emit([xs[i], ys[i], zs[i]], nowMs - behindMs);
        }
        _timeSource = stamps != null ? TIME_SENSOR : TIME_ESTIMATED;
        _cadence.addSamples(count, nowMs);
    }

    // Sensor timestamps of the batch when they are present and plausible
    // (non-decreasing and spanning no more than the longest batch).
    private function usableTimestamps(accel as Sensor.AccelerometerData, count as Number) as Array<Number>? {
        if (!(accel has :timestamp)) {
            return null;
        }
        var stamps = accel.timestamp;
        if (stamps == null || stamps.size() < count) {
            return null;
        }
        var span = stamps[count - 1] - stamps[0];
        if (span < 0 || span > 5000) {
            return null;
        }
        for (var i = 1; i < count; i++) {
            if (stamps[i] < stamps[i - 1]) {
                return null;
            }
        }
        return stamps;
    }

    private function poll(nowMs as Number) as Void {
        var info = Sensor.getInfo();
        if (!(info has :accel)) {
            return;
        }
        var accel = info.accel;
        if (accel == null || accel.size() < 3) {
            return;
        }
        emit([accel[0], accel[1], accel[2]], nowMs);
        _timeSource = TIME_READ;
        _cadence.addSamples(1, nowMs);
    }

    private function emit(vec as Array<Number>, captureMs as Number) as Void {
        _lastRaw = vec;
        _lastSampleMs = captureMs;
        _lost = false;
        _sink.onAccelSample(vec, captureMs);
    }

    // Registers the high-rate listener. Timestamps are requested first; if
    // the device rejects that option the request is repeated without it.
    private function registerListener() as Boolean {
        if (!(Sensor has :registerSensorDataListener)) {
            return false;
        }
        try {
            Sensor.registerSensorDataListener(method(:onSensorData), {
                :period => SensorConfig.BATCH_PERIOD_S,
                :accelerometer => {
                    :enabled => true,
                    :sampleRate => SensorConfig.SAMPLE_RATE_HZ,
                    :includeTimestamps => true
                }
            });
            return true;
        } catch (e) {
            System.println("Sensor listener with timestamps rejected: " + e.getErrorMessage());
        }
        try {
            Sensor.registerSensorDataListener(method(:onSensorData), {
                :period => SensorConfig.BATCH_PERIOD_S,
                :accelerometer => {
                    :enabled => true,
                    :sampleRate => SensorConfig.SAMPLE_RATE_HZ
                }
            });
            return true;
        } catch (e) {
            System.println("Sensor listener rejected: " + e.getErrorMessage());
        }
        return false;
    }
}
