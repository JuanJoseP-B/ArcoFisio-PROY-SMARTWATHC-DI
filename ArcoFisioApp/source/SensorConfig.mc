import Toybox.Lang;

// Tunable numbers of the sensor prototype, in one place so the values
// measured on the real watch can be adjusted without hunting through code.
module SensorConfig {

    // High-rate listener: samples per second requested from the accelerometer
    // and length of each delivered batch. The API only accepts whole seconds
    // (1 to 4), so 1 s is the lowest latency the listener can give.
    const SAMPLE_RATE_HZ = 25;
    const BATCH_PERIOD_S = 1;

    // Period of the single app timer. It drives polling (when that source is
    // selected), signal-loss detection and screen refresh.
    const TICK_MS = 100;

    // The screen is redrawn every this many ticks.
    const TICKS_PER_REDRAW = 2;

    // Without a fresh sample for this long the signal counts as lost. It must
    // stay above the batch period plus jitter; to be tuned with the cadence
    // measured on the watch (spec v2, section 3, "Pérdida de lecturas").
    const SIGNAL_LOSS_TIMEOUT_MS = 2500;

    // Window used to average the observed sample cadence.
    const CADENCE_WINDOW_MS = 2000;

    // Calibration "arm down = 0 degrees": how long the arm must stay still,
    // the fewest samples that make a valid reference, and how far (degrees) a
    // sample may stray before the countdown restarts. The sample count and the
    // spread are the web v1 values (src/sensors/constants.ts).
    const CALIBRATION_HOLD_MS = 3000;
    const CALIBRATION_MIN_SAMPLES = 20;
    const CALIBRATION_MAX_SPREAD_DEG = 4.0f;

    // How long the calibration screen keeps saying that movement restarted
    // the countdown.
    const CALIBRATION_MOVED_NOTICE_MS = 2500;
}
