import Toybox.Attention;
import Toybox.Lang;
import Toybox.System;

// Tone and vibration test for the diagnostics. Reports what the Attention
// module offers on this device and whether a request was accepted; it cannot
// know if the watch actually sounded or vibrated, that is observed by hand.
module FeedbackProbe {

    const TEST_VIBE_DUTY_CYCLE = 75;   // percent
    const TEST_VIBE_LENGTH_MS = 400;

    function toneSupported() as Boolean {
        return Attention has :playTone;
    }

    function vibrationSupported() as Boolean {
        return Attention has :vibrate;
    }

    // System-wide switches: a supported tone stays silent when tones are off.
    function tonesEnabled() as Boolean {
        return System.getDeviceSettings().tonesOn;
    }

    function vibrationEnabled() as Boolean {
        return System.getDeviceSettings().vibrateOn;
    }

    // Asks for a tone. True when the watch accepted the request.
    function playTone() as Boolean {
        if (!(Attention has :playTone)) {
            return false;
        }
        try {
            Attention.playTone(Attention.TONE_LOUD_BEEP);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Asks for a vibration. True when the watch accepted the request.
    function vibrate() as Boolean {
        if (!(Attention has :vibrate)) {
            return false;
        }
        try {
            Attention.vibrate([new Attention.VibeProfile(TEST_VIBE_DUTY_CYCLE, TEST_VIBE_LENGTH_MS)]);
            return true;
        } catch (e) {
            return false;
        }
    }
}
