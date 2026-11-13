import Toybox.Lang;

// Numbers of the session engine in one place, ported from the web v1 domain
// (src/domain/constants.ts). Pure data: nothing here reads a sensor.
module EngineConfig {

    // Holding the target this long marks the hold ("sostén logrado").
    const HOLD_MS = 1000;

    // Zones of approach below the target (v1: near is inside 8 degrees, the
    // approach band inside 30 degrees).
    const NEAR_MARGIN_DEG = 8.0f;
    const APPROACH_MARGIN_DEG = 30.0f;

    // Repetition window: the arm must come back to the return angle for the
    // repetition to be registered, and rise above the start angle to open one.
    const REP_RETURN_MARGIN_DEG = 30.0f;
    const REP_RETURN_FLOOR_DEG = 5.0f;
    const REP_START_HYSTERESIS_DEG = 5.0f;

    const DEFAULT_TOLERANCE_DEG = 2.0f;

    // Narrowest pain arc that can be saved.
    const MIN_PAIN_ARC_DEG = 5;

    // A gap between two accepted samples longer than this breaks the hold:
    // nobody measured the time in between. The sensor delivers batches of 25
    // samples each second, so 1 s plus jitter is normal; to be tuned with the
    // cadence measured on the watch (spec v2, section 3).
    const MAX_SAMPLE_GAP_MS = 1500;

    // Without a fresh sample for this long the session pauses ("Perdí tu
    // sensor"). Same value as the sensor reader's loss timeout.
    const SIGNAL_LOSS_TIMEOUT_MS = 2500;

    // The rest clock tells "last seconds" from this many seconds left, and
    // beeps once for each of them.
    const REST_LAST_SECONDS = 3;

    // ---- Pain-arc priority: PENDING PRODUCT DECISION ------------------------
    //
    // PAIN_RULE_V1 (default, parity with web v1): objective and overshoot are
    // evaluated before the pain arc. A reading on the target is "on target"
    // even inside the arc, and an overshoot inside the arc is "overshoot".
    //
    // PAIN_RULE_PAIN_FIRST (design handoff): the arc wins. A reading inside
    // the arc is "pain" and counts for nothing else: no target hit, no hold
    // progress (the hold restarts) and no overshoot. A repetition is still
    // registered when the arm returns, as not held.
    //
    // Changing this constant is the whole switch; tests cover both rules.
    enum {
        PAIN_RULE_V1,
        PAIN_RULE_PAIN_FIRST
    }

    const PAIN_RULE = PAIN_RULE_V1;
}
