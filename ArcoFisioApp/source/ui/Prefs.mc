import Toybox.Application;
import Toybox.Lang;

// Everything the app remembers between openings, through
// Application.Storage. Reads never throw: a missing or unreadable value is
// reported as null so the caller falls back to its default.
module Prefs {

    const KEY_LANGUAGE = "language";
    const KEY_ONBOARDED = "onboarded";
    const KEY_SENSOR_ALLOWED = "sensorAllowed";
    const KEY_WIZARD = "wizard";
    const KEY_WEEK_SESSIONS = "weekSessions";
    const KEY_DEMO_ROUTINE = "demoRoutine";
    const KEY_SESSIONS = "sessions";
    const KEY_PAIN_ARC = "painArc";
    const KEY_RANGE_MAX = "rangeMax";
    const KEY_TOLERANCE = "tolerance";
    const KEY_SOUND = "sound";
    const KEY_VIBRATION = "vibration";

    // Simulation and unit-test fixtures never overwrite patient measurements.
    var testNamespace as Boolean = false;
    var failWrites as Boolean = false;

    function storageKey(key as String) as String {
        return testNamespace ? "test:" + key : (BuildMode.SIMULATED ? "sim:" + key : key);
    }

    function read(key as String) as Object? {
        try {
            return Application.Storage.getValue(storageKey(key));
        } catch (e) {
            return null;
        }
    }

    // False when the watch could not store the value.
    function write(key as String, value as Application.Storage.ValueType) as Boolean {
        if (failWrites) { return false; }
        try {
            Application.Storage.setValue(storageKey(key), value);
            return true;
        } catch (e) {
            return false;
        }
    }

    function readFlag(key as String) as Boolean {
        var value = read(key);
        return value instanceof Lang.Boolean ? value as Boolean : false;
    }

    // A flag that is on until the person turns it off.
    function readBool(key as String, fallback as Boolean) as Boolean {
        var value = read(key);
        return value instanceof Lang.Boolean ? value as Boolean : fallback;
    }

    function readNumber(key as String, fallback as Number) as Number {
        var value = read(key);
        return value instanceof Lang.Number ? value as Number : fallback;
    }
}
