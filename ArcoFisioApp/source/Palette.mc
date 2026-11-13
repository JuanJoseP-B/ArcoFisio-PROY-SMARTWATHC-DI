// Marea light palette (arco-fisio-handoff/tokens/tokens.json, "light"): the
// only place with colour values. Screens read these names and never write a
// hex of their own.
module Palette {

    const BG = 0xEAF0F9;
    const PAPER = 0xF7F9FD;
    const CARD = 0xFFFFFF;
    const INK = 0x0F1B3D;
    const INK2 = 0x4B5878;
    const LINE = 0xD3DCEF;
    const ACC = 0x4263EB;
    const ACC2 = 0x2B45B8;
    const TINT = 0xDCE4FF;
    const ONACC = 0xFFFFFF;

    const MINT = 0x4FD1B5;
    const MINTD = 0x0B6B58;
    const MINTT = 0xD6F5EE;
    const ONM = 0x06332B;

    const AMBER = 0xFFB26B;
    const AMBERD = 0x8F4504;
    const AMBERT = 0xFFE9D2;
    const ONA = 0x3A1C00;

    const ROSE = 0xF2668B;
    const ROSED = 0xA3234B;
    const ROSET = 0xFDE0E8;
    const ONR = 0x3A0618;

    // The web paints the water with `water` at 16 % and 30 % opacity over
    // `paper`. Dc has no opacity, so the two blends are precomputed.
    const WATER_BACK = 0xDAE1FA;
    const WATER_FRONT = 0xC1CCF8;

    // `ink` at 60 % over `paper`: the veil behind a dialog (canvas 20).
    const VEIL = 0x6C748A;

    // `ink2` at 65 % over `bg`: the dimmed icon of a disabled menu item.
    const DISABLED = 0x838DA5;
}
