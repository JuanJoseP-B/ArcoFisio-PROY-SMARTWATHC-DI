import Toybox.Lang;

// Language choice of canvas 02. Pure: the stored value is validated here and
// the watch language only decides the first default.
module LanguageModel {

    const ENGLISH = 0;
    const SPANISH = 1;
    const COUNT = 2;

    // A stored value is only trusted when it is one of the known languages.
    function normalize(value as Object?, fallback as Number) as Number {
        if (value instanceof Lang.Number) {
            var number = value as Number;
            if (number >= 0 && number < COUNT) {
                return number;
            }
        }
        return fallback;
    }

    function defaultFor(deviceIsSpanish as Boolean) as Number {
        return deviceIsSpanish ? SPANISH : ENGLISH;
    }

    // Moves the highlighted row, wrapping at the ends.
    function move(current as Number, delta as Number) as Number {
        return ((current + delta) % COUNT + COUNT) % COUNT;
    }
}
