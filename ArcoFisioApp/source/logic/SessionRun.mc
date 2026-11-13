import Toybox.Lang;

// One set of a live session: classifies each sample, advances the repetition
// machine and counts each time the arm enters the pain arc. Port of
// stepSessionRun in src/domain/sessionRun.ts. Pure.
class SessionRun {

    // Flag added to the RepEngine events when a sample enters the pain arc.
    static const EVENT_ENTERED_PAIN = 128;

    private var _config as RunConfig;
    private var _engine as RepEngine;
    private var _zone as Number?;
    private var _painEntries as Number = 0;
    private var _painReps as Array<Number> = [] as Array<Number>;

    function initialize(config as RunConfig) {
        _config = config;
        _engine = new RepEngine(config);
    }

    function step(angle as Float, tMs as Number) as Number {
        var repsBefore = _engine.repsCompleted();
        var events = _engine.step(angle, tMs);
        if (!_engine.accepted()) {
            return 0;
        }
        var zone = Zones.classify(angle, _config);
        if (zone == Zones.ZONE_PAIN && _zone != Zones.ZONE_PAIN) {
            _painEntries += 1;
            _painReps.add(repsBefore + 1);
            events |= EVENT_ENTERED_PAIN;
        }
        _zone = zone;
        return events;
    }

    function pause() as Void {
        _engine.pause();
    }

    // Zone of the last accepted sample, or null before the first one.
    function zone() as Number? {
        return _zone;
    }

    function engine() as RepEngine {
        return _engine;
    }

    function stats() as RunStats {
        var out = new RunStats();
        out.maxAngle = _engine.maxAngle();
        out.hits = _engine.hits();
        out.overshoots = _engine.overshoots();
        out.painEntries = _painEntries;
        out.repPeaks = _engine.repPeaks().slice(null, null) as Array<Float>;
        out.repHeld = _engine.repHeld().slice(null, null) as Array<Boolean>;
        out.painReps = _painReps.slice(null, null) as Array<Number>;
        return out;
    }
}
