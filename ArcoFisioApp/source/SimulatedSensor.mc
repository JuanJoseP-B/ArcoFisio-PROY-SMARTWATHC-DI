import Toybox.Lang;
import Toybox.Math;

// Only the simulator.jungle build drives this source. These are generated
// gravity vectors, delivered through the SAME reader, tracker and queue.
class SimulatedSensor {
    var angle as Float = 0.0f;
    var pattern as Number = 0; // manual, objective, overshoot, painful arc
    var connected as Boolean = true;
    private var _epoch as Number?;
    function initialize() {}
    function restart() as Void { _epoch = null; }
    function adjust(delta as Number) as Void {
        pattern = 0;
        angle = angle + delta;
        angle = angle < 0 ? 0.0f : (angle > 180 ? 180.0f : angle);
    }
    function tick(now as Number, reader as SensorReader, target as Number, calibrating as Boolean) as Void {
        if (!BuildMode.SIMULATED || !connected) { return; }
        if (_epoch == null) { _epoch = now; }
        var value = angle;
        if (calibrating) {
            value = 0.0f;
            _epoch = now;
        } else if (pattern != 0) {
            var peak = pattern == 1 ? target.toFloat() : (pattern == 2 ? target + 20.0f : 120.0f);
            if (peak > 180) { peak = 180.0f; }
            var t = (now - (_epoch as Number)) % 7000;
            value = t < 1500 ? peak * t / 1500.0f
                : (t < 4500 ? peak : (t < 6000 ? peak * (6000 - t) / 1500.0f : 0.0f));
            angle = value;
        }
        reader.injectSimulation(vector(value), now);
    }
    static function vector(degrees as Float) as Array<Number> {
        var rad = Math.toRadians(degrees);
        return [(1000 * Math.sin(rad)).toNumber(), 0, (1000 * Math.cos(rad)).toNumber()] as Array<Number>;
    }
}
