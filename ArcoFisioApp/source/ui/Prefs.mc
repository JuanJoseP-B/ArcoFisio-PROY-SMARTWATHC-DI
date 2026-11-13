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

    function read(key as String) as Object? {
        try {
            return Application.Storage.getValue(key);
        } catch (e) {
            return null;
        }
    }

    // False when the watch could not store the value.
    function write(key as String, value as Application.Storage.ValueType) as Boolean {
        try {
            Application.Storage.setValue(key, value);
            return true;
        } catch (e) {
            return false;
        }
    }

    function readFlag(key as String) as Boolean {
        var value = read(key);
        return value instanceof Lang.Boolean ? value as Boolean : false;
    }

    function readNumber(key as String, fallback as Number) as Number {
        var value = read(key);
        return value instanceof Lang.Number ? value as Number : fallback;
    }
}
