import Toybox.Attention;
import Toybox.Lang;
import Toybox.System;

// Tones and vibration of the live session. The text on screen is always the
// main signal; these only reinforce it, and each one can be turned off in the
// app settings or in the watch. A request the watch refuses is ignored.
module Cues {

    enum {
        CUE_TARGET,      // reached the target
        CUE_HELD,        // the second of hold completed
        CUE_OVERSHOOT,
        CUE_PAIN,
        CUE_REP,         // repetition registered
        CUE_REST_TICK,   // one of the last seconds of the rest
        CUE_REST_END     // the rest reached zero
    }

    var soundOn as Boolean = true;
    var vibrationOn as Boolean = true;

    function configure(sound as Boolean, vibration as Boolean) as Void {
        soundOn = sound;
        vibrationOn = vibration;
    }

    function play(cue as Number) as Void {
        if (soundOn && FeedbackProbe.toneSupported() && FeedbackProbe.tonesEnabled()) {
            try {
                Attention.playTone(toneOf(cue));
            } catch (e) {
                // Not sounding is not an error.
            }
        }
        if (vibrationOn && FeedbackProbe.vibrationSupported() && FeedbackProbe.vibrationEnabled()) {
            var length = vibeMs(cue);
            if (length > 0) {
                try {
                    Attention.vibrate([new Attention.VibeProfile(vibeDuty(cue), length)]);
                } catch (e) {
                    // Same.
                }
            }
        }
    }

    function toneOf(cue as Number) as Attention.Tone {
        if (cue == CUE_TARGET || cue == CUE_HELD) {
            return Attention.TONE_SUCCESS;
        } else if (cue == CUE_OVERSHOOT) {
            return Attention.TONE_ALERT_LO;
        } else if (cue == CUE_PAIN) {
            return Attention.TONE_FAILURE;
        } else if (cue == CUE_REST_END) {
            return Attention.TONE_LOUD_BEEP;
        }
        return Attention.TONE_KEY;
    }

    // Length in ms (0: none). Rest ticks and repetitions stay silent to the
    // hand; reaching zero is one long pulse.
    function vibeMs(cue as Number) as Number {
        if (cue == CUE_HELD) {
            return 250;
        } else if (cue == CUE_OVERSHOOT) {
            return 200;
        } else if (cue == CUE_PAIN) {
            return 500;
        } else if (cue == CUE_REST_END) {
            return 900;
        }
        return 0;
    }

    function vibeDuty(cue as Number) as Number {
        return cue == CUE_PAIN || cue == CUE_REST_END ? 100 : 70;
    }

    // Picks what the events of a batch of samples deserve, most important
    // first, so one batch makes at most one sound.
    function forEvents(events as Number) as Number? {
        if ((events & SessionRun.EVENT_ENTERED_PAIN) != 0) {
            return CUE_PAIN;
        }
        if ((events & RepEngine.EVENT_OVERSHOOT) != 0) {
            return CUE_OVERSHOOT;
        }
        if ((events & RepEngine.EVENT_HELD) != 0) {
            return CUE_HELD;
        }
        if ((events & RepEngine.EVENT_TARGET_REACHED) != 0) {
            return CUE_TARGET;
        }
        if ((events & RepEngine.EVENT_REP_COMPLETED) != 0) {
            return CUE_REP;
        }
        return null;
    }
}
