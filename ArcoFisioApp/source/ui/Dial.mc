import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;

// The Marea dial of the live screens (docs/03-geometria-del-reloj.md): the
// right half ring with 0 degrees at 6 o'clock and 180 at 12, the target notch,
// the hatched painful arc and the marker. Lengths are design pixels.
module Dial {

    function radius(dc as Dc) as Number {
        return dc.getWidth() / 2 - W.u(dc, 22);
    }

    // Point of the ring at `angle` degrees, `offset` design px out of it.
    function px(dc as Dc, angle as Numeric, offset as Numeric) as Number {
        var c = dc.getWidth() / 2;
        var r = radius(dc) + W.u(dc, offset);
        return c + (r * Math.sin(Math.toRadians(angle))).toNumber();
    }

    function py(dc as Dc, angle as Numeric, offset as Numeric) as Number {
        var c = dc.getWidth() / 2;
        var r = radius(dc) + W.u(dc, offset);
        return c + (r * Math.cos(Math.toRadians(angle))).toNumber();
    }

    // Dc angle (0 = 3 o'clock, counter-clockwise) of a dial angle.
    function dcAngle(angle as Numeric) as Number {
        return (270 + angle).toNumber() % 360;
    }

    // Draws the dial. `angle` is the live angle (null: no marker), `split`
    // the degree where the colour of `color` takes over from the base blue
    // (the target when overshooting, the arc start in pain), `target` and the
    // arc limits may be null.
    function draw(dc as Dc, angle as Float?, split as Float?, target as Numeric?, painFrom as Numeric?, painTo as Numeric?, color as Number) as Void {
        var c = dc.getWidth() / 2;
        var r = radius(dc);
        dc.setPenWidth(W.u(dc, 8));
        dc.setColor(Palette.LINE, Graphics.COLOR_TRANSPARENT);
        dc.drawArc(c, c, r, Graphics.ARC_COUNTER_CLOCKWISE, 270, 90);

        if (painFrom != null && painTo != null) {
            drawPainArc(dc, painFrom, painTo);
        }

        if (angle != null && angle > 0.5f) {
            var shown = angle > 180.0f ? 180.0f : angle;
            var base = split != null && split < shown ? split : shown;
            dc.setPenWidth(W.u(dc, 8));
            dc.setColor(Palette.ACC, Graphics.COLOR_TRANSPARENT);
            if (base > 0.5f) {
                dc.drawArc(c, c, r, Graphics.ARC_COUNTER_CLOCKWISE, 270, dcAngle(base));
            }
            if (base < shown) {
                dc.setColor(color, Graphics.COLOR_TRANSPARENT);
                dc.drawArc(c, c, r, Graphics.ARC_COUNTER_CLOCKWISE, dcAngle(base), dcAngle(shown));
            }
        }

        if (target != null) {
            dc.setPenWidth(W.u(dc, 4));
            dc.setColor(Palette.INK, Graphics.COLOR_TRANSPARENT);
            dc.drawLine(px(dc, target, -12), py(dc, target, -12), px(dc, target, 10), py(dc, target, 10));
        }

        if (angle != null) {
            var shown = angle > 180.0f ? 180.0f : (angle < 0.0f ? 0.0f : angle);
            var x = px(dc, shown, 0);
            var y = py(dc, shown, 0);
            dc.setColor(Palette.PAPER, Graphics.COLOR_TRANSPARENT);
            dc.fillCircle(x, y, W.u(dc, 14));
            dc.setColor(color, Graphics.COLOR_TRANSPARENT);
            dc.fillCircle(x, y, W.u(dc, 10));
        }
        dc.setPenWidth(1);
    }

    // The painful arc: a coral band crossed by paper-coloured ticks, so the
    // meaning is not only colour (docs/06, accessibility).
    function drawPainArc(dc as Dc, from as Numeric, to as Numeric) as Void {
        var c = dc.getWidth() / 2;
        var r = radius(dc);
        dc.setPenWidth(W.u(dc, 12));
        dc.setColor(Palette.ROSE, Graphics.COLOR_TRANSPARENT);
        dc.drawArc(c, c, r, Graphics.ARC_COUNTER_CLOCKWISE, dcAngle(from), dcAngle(to));
        dc.setPenWidth(W.u(dc, 2));
        dc.setColor(Palette.PAPER, Graphics.COLOR_TRANSPARENT);
        for (var a = from + 2; a < to; a += 4) {
            dc.drawLine(px(dc, a, -5), py(dc, a, -5), px(dc, a, 5), py(dc, a, 5));
        }
        dc.setPenWidth(1);
    }

    // Full ring that fills clockwise from 12 o'clock (calibration, rest).
    function ring(dc as Dc, share as Float, color as Number) as Void {
        var c = dc.getWidth() / 2;
        var r = c - W.u(dc, 8);
        dc.setPenWidth(W.u(dc, 7));
        dc.setColor(Palette.LINE, Graphics.COLOR_TRANSPARENT);
        dc.drawCircle(c, c, r);
        if (share >= 0.999f) {
            dc.setColor(color, Graphics.COLOR_TRANSPARENT);
            dc.drawCircle(c, c, r);
        } else if (share > 0.004f) {
            dc.setColor(color, Graphics.COLOR_TRANSPARENT);
            dc.drawArc(c, c, r, Graphics.ARC_CLOCKWISE, 90, (90 - 360 * share).toNumber() % 360 + (90 - 360 * share < 0 ? 360 : 0));
        }
        dc.setPenWidth(1);
    }
}
