import Toybox.Lang;

// Observed sample cadence in Hz, averaged over a time window.
//
// Samples can arrive one by one (polling) or in bursts (the high-rate
// listener delivers a whole batch at once), so the meter counts samples
// between two arrival times instead of timing single samples. Pure: the
// caller passes the clock.
class CadenceMeter {

    private var _windowMs as Number;
    private var _windowStartMs as Number?;
    private var _count as Number = 0;
    private var _hz as Float?;

    function initialize(windowMs as Number) {
        _windowMs = windowMs;
    }

    // Registers `count` samples that arrived at `nowMs`.
    function addSamples(count as Number, nowMs as Number) as Void {
        var start = _windowStartMs;
        if (start == null) {
            // The first arrival only opens the window: its samples were
            // captured before it.
            _windowStartMs = nowMs;
            _count = 0;
            return;
        }
        _count += count;
        var elapsed = nowMs - start;
        if (elapsed >= _windowMs) {
            _hz = _count * 1000.0f / elapsed;
            _windowStartMs = nowMs;
            _count = 0;
        }
    }

    // Cadence of the last complete window, or null while there is none.
    function hz() as Float? {
        return _hz;
    }

    // Forgets everything, e.g. after the signal is lost or the source changes.
    function reset() as Void {
        _windowStartMs = null;
        _count = 0;
        _hz = null;
    }
}
