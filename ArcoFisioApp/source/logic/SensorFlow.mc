import Toybox.Lang;

// Maps what SensorReader reports to the states of canvas 03. Pure: it never
// produces a reading, only decides which message to show.
module SensorFlow {

    enum {
        VIEW_ASK,          // the person has not allowed the sensor yet
        VIEW_CHECKING,     // allowed, waiting for the first reading
        VIEW_READY,        // fresh readings arrive
        VIEW_DENIED,       // the watch refused to register the sensor
        VIEW_UNAVAILABLE,  // registered, but no reading ever arrived
        VIEW_LOST          // readings arrived and stopped
    }

    // `readerState` is a SensorReader.STATE_* value; `listenerRegistered`
    // says whether the watch accepted the sensor listener. Without it the
    // app cannot read anything, which is the closest Connect IQ comes to
    // "permission denied" (the permission itself is granted at install time).
    function resolve(allowed as Boolean, readerState as Number, listenerRegistered as Boolean) as Number {
        if (!allowed) {
            return VIEW_ASK;
        }
        if (readerState == SensorReader.STATE_READY) {
            return VIEW_READY;
        }
        if (readerState == SensorReader.STATE_LOST) {
            return VIEW_LOST;
        }
        if (readerState == SensorReader.STATE_STARTING) {
            return VIEW_CHECKING;
        }
        return listenerRegistered ? VIEW_UNAVAILABLE : VIEW_DENIED;
    }

    // Whether the sensor features (measure, session, arc) can be used.
    function hasSensor(allowed as Boolean, readerState as Number) as Boolean {
        return allowed && readerState == SensorReader.STATE_READY;
    }
}
