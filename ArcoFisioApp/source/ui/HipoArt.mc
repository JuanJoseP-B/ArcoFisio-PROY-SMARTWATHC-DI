import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;

// Hipo, the seahorse (arco-fisio-handoff/assets/hipo.svg), redrawn with Dc
// primitives: a chain of circles along the body curve, the head, the snout
// and the eye. Coordinates come straight from the SVG (viewBox 14 2 84 138).
module HipoArt {

    const VIEW_X = 14.0f;
    const VIEW_Y = 2.0f;
    const VIEW_HEIGHT = 138.0f;

    // Cubic Bezier segments of the body: x0 y0, then (c1, c2, end) pairs.
    const BODY = [
        [62.0f, 42.0f, 46.0f, 56.0f, 42.0f, 80.0f, 56.0f, 98.0f],
        [56.0f, 98.0f, 66.0f, 110.0f, 62.0f, 126.0f, 48.0f, 130.0f],
        [48.0f, 130.0f, 36.0f, 133.0f, 30.0f, 121.0f, 40.0f, 116.0f]
    ] as Array<Array<Float> >;

    // Draws Hipo `height` pixels tall with its top at `top`, centred
    // horizontally on `centerX`. Hipo never appears during an exercise.
    function draw(dc as Dc, centerX as Number, top as Number, height as Number) as Void {
        var s = height / VIEW_HEIGHT;
        // Centre of the viewBox on x is 14 + 42 = 56.
        var ox = centerX - 56 * s;
        var oy = top - VIEW_Y * s;

        // Crest.
        dc.setPenWidth((4 * s).toNumber() < 2 ? 2 : (4 * s).toNumber());
        dc.setColor(Palette.ACC, Graphics.COLOR_TRANSPARENT);
        dc.drawLine(ox + 62 * s, oy + 22 * s, ox + 58 * s, oy + 11 * s);
        dc.drawLine(ox + 70 * s, oy + 20 * s, ox + 72 * s, oy + 8 * s);
        dc.drawLine(ox + 77 * s, oy + 25 * s, ox + 86 * s, oy + 16 * s);
        dc.setPenWidth(1);

        // Fin.
        dc.setColor(Palette.WATER_FRONT, Graphics.COLOR_TRANSPARENT);
        dc.fillPolygon([pt(ox, oy, s, 60, 66), pt(ox, oy, s, 80, 62), pt(ox, oy, s, 91, 70), pt(ox, oy, s, 86, 86),
            pt(ox, oy, s, 76, 94), pt(ox, oy, s, 62, 96)] as Array<[Numeric, Numeric]>);

        // Body: circles along the three curves, with a lighter dot on every
        // other one for the segmented look.
        var radius = 7.5f * s;
        var index = 0;
        for (var seg = 0; seg < BODY.size(); seg++) {
            var b = BODY[seg];
            for (var i = 0; i < 12; i++) {
                var t = i / 12.0f;
                var x = bezier(b[0], b[2], b[4], b[6], t);
                var y = bezier(b[1], b[3], b[5], b[7], t);
                dc.setColor(Palette.ACC, Graphics.COLOR_TRANSPARENT);
                dc.fillCircle(ox + x * s, oy + y * s, radius);
                if (index % 2 == 0) {
                    dc.setColor(Palette.TINT, Graphics.COLOR_TRANSPARENT);
                    dc.fillCircle(ox + x * s, oy + y * s, radius / 5);
                }
                index += 1;
            }
        }
        dc.setColor(Palette.ACC, Graphics.COLOR_TRANSPARENT);
        dc.fillCircle(ox + 40 * s, oy + 116 * s, radius);

        // Head, snout and eye.
        dc.fillEllipse(ox + 66 * s, oy + 34 * s, 16 * s, 14 * s);
        dc.fillPolygon([pt(ox, oy, s, 24, 34), pt(ox, oy, s, 62, 36), pt(ox, oy, s, 62, 44), pt(ox, oy, s, 26, 42)] as Array<[Numeric, Numeric]>);
        dc.setColor(Palette.CARD, Graphics.COLOR_TRANSPARENT);
        dc.fillCircle(ox + 70 * s, oy + 31 * s, 3.6f * s);
        dc.setColor(Palette.INK, Graphics.COLOR_TRANSPARENT);
        dc.fillCircle(ox + 70.8f * s, oy + 31.2f * s, 1.7f * s);
    }

    function bezier(p0 as Float, p1 as Float, p2 as Float, p3 as Float, t as Float) as Float {
        var u = 1 - t;
        return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    }

    function pt(ox as Float, oy as Float, s as Float, x as Numeric, y as Numeric) as [Numeric, Numeric] {
        return [ox + x * s, oy + y * s] as [Numeric, Numeric];
    }
}
