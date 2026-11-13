import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;
import Toybox.System;
import Toybox.WatchUi;

// Drawing pieces of the Marea screens, built from Dc primitives. Every length
// is written in the 384 px design space of arco-fisio-handoff and scaled to
// the real screen with u(), so the same numbers fit any round watch.
module W {

    const BUTTON_PRIMARY = 0;
    const BUTTON_OUTLINE = 1;
    const BUTTON_LINK = 2;

    // Smallest touch target (design px), from the handoff tokens.
    const TOUCH_MIN = 44;

    function k(dc as Dc) as Float {
        return dc.getWidth() / 384.0f;
    }

    // Design pixels to screen pixels.
    function u(dc as Dc, value as Numeric) as Number {
        return Math.round(value * k(dc)).toNumber();
    }

    // Same as u() when only the screen width is at hand.
    function u2(screenWidth as Number, value as Numeric) as Number {
        return Math.round(value * screenWidth / 384.0f).toNumber();
    }

    function clear(dc as Dc) as Void {
        dc.setColor(Palette.INK, Palette.PAPER);
        dc.clear();
        if (dc has :setAntiAlias) {
            dc.setAntiAlias(true);
        }
    }

    // Two drifting water layers whose surface sits at `level` (fraction of
    // the screen height, from the bottom). The drift uses the system clock,
    // never a timer of its own.
    function water(dc as Dc, level as Float) as Void {
        var now = System.getTimer();
        layer(dc, level, -now / 13000.0f * 2 * Math.PI, 5, Palette.WATER_BACK, 0);
        layer(dc, level, now / 8000.0f * 2 * Math.PI, 5, Palette.WATER_FRONT, 8);
    }

    function layer(dc as Dc, level as Float, phase as Float, amplitude as Number, color as Number, drop as Number) as Void {
        var width = dc.getWidth();
        var height = dc.getHeight();
        var top = height - (height * level).toNumber() + u(dc, drop);
        var amp = u(dc, amplitude);
        var points = [] as Array<[Numeric, Numeric]>;
        var steps = 16;
        for (var i = 0; i <= steps; i++) {
            var x = width * i / steps;
            points.add([x, top + amp * Math.sin(phase + i * Math.PI / 2)] as [Numeric, Numeric]);
        }
        points.add([width, height] as [Numeric, Numeric]);
        points.add([0, height] as [Numeric, Numeric]);
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.fillPolygon(points);
    }

    // Single line of centred text.
    function text(dc as Dc, x as Number, y as Number, font as FontType, content as String, color as Number) as Void {
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.drawText(x, y, font, content, Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
    }

    // Wrapped, centred paragraph inside a box given in design pixels; the
    // first font that fits is used and the width never leaves the circle.
    function paragraph(dc as Dc, content as String, fonts as Array<FontType>, centerX as Number, top as Number, width as Number, height as Number, color as Number) as Void {
        var y = u(dc, top);
        var h = u(dc, height);
        var w = u(dc, width);
        var safe = Ui.safeWidth(dc, y, y + h);
        if (safe < w) {
            w = safe;
        }
        if (w <= 0) {
            return;
        }
        var area = new WatchUi.TextArea({
            :text => content,
            :color => color,
            :font => fonts,
            :justification => Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER,
            :locX => centerX - w / 2,
            :locY => y,
            :width => w,
            :height => h
        });
        area.draw(dc);
    }

    // Pill with optional icon. Returns nothing: pills are not touch targets.
    function pill(dc as Dc, centerX as Number, centerY as Number, content as String, background as Number, foreground as Number, icon as Symbol?) as Void {
        var font = Graphics.FONT_XTINY;
        var size = dc.getTextDimensions(content, font);
        var pad = u(dc, 12);
        var iconSize = icon != null ? u(dc, 18) + u(dc, 5) : 0;
        var w = size[0] + 2 * pad + iconSize;
        var h = size[1] + u(dc, 8);
        var x = centerX - w / 2;
        dc.setColor(background, Graphics.COLOR_TRANSPARENT);
        dc.fillRoundedRectangle(x, centerY - h / 2, w, h, h / 2);
        var textLeft = x + pad;
        if (icon != null) {
            drawIcon(dc, icon, textLeft + u(dc, 9), centerY, u(dc, 18), foreground);
            textLeft += iconSize;
        }
        dc.setColor(foreground, Graphics.COLOR_TRANSPARENT);
        dc.drawText(textLeft, centerY, font, content, Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
    }

    // Pill-shaped button. `focused` draws the key-focus outline.
    function button(dc as Dc, centerX as Number, centerY as Number, width as Number, height as Number, label as String, style as Number, focused as Boolean) as Void {
        var w = u(dc, width);
        var h = u(dc, height);
        var x = centerX - w / 2;
        var y = centerY - h / 2;
        var foreground = Palette.ONACC;
        if (style == BUTTON_PRIMARY) {
            dc.setColor(Palette.ACC, Graphics.COLOR_TRANSPARENT);
            dc.fillRoundedRectangle(x, y, w, h, h / 2);
        } else if (style == BUTTON_OUTLINE) {
            foreground = Palette.ACC2;
            dc.setColor(Palette.CARD, Graphics.COLOR_TRANSPARENT);
            dc.fillRoundedRectangle(x, y, w, h, h / 2);
            dc.setColor(Palette.ACC, Graphics.COLOR_TRANSPARENT);
            dc.setPenWidth(u(dc, 3));
            dc.drawRoundedRectangle(x, y, w, h, h / 2);
        } else {
            foreground = Palette.ACC2;
        }
        if (focused) {
            var gap = u(dc, 4);
            dc.setColor(Palette.INK, Graphics.COLOR_TRANSPARENT);
            dc.setPenWidth(u(dc, 3));
            dc.drawRoundedRectangle(x - gap, y - gap, w + 2 * gap, h + 2 * gap, h / 2 + gap);
        }
        dc.setPenWidth(1);
        // Largest label font that fits inside the pill, never touching its edge.
        var fonts = [Graphics.FONT_SMALL, Graphics.FONT_TINY, Graphics.FONT_XTINY] as Array<FontType>;
        var room = w - u(dc, 28);
        var font = fonts[fonts.size() - 1];
        for (var i = 0; i < fonts.size(); i++) {
            if (dc.getTextWidthInPixels(label, fonts[i]) <= room) { font = fonts[i]; break; }
        }
        text(dc, centerX, centerY, font, label, foreground);
    }

    // Round button of the steppers: `-` or `+`.
    function roundButton(dc as Dc, centerX as Number, centerY as Number, diameter as Number, icon as Symbol, enabled as Boolean) as Void {
        var r = u(dc, diameter) / 2;
        dc.setColor(enabled ? Palette.TINT : Palette.BG, Graphics.COLOR_TRANSPARENT);
        dc.fillCircle(centerX, centerY, r);
        dc.setColor(enabled ? Palette.ACC : Palette.LINE, Graphics.COLOR_TRANSPARENT);
        dc.setPenWidth(u(dc, 2));
        dc.drawCircle(centerX, centerY, r);
        dc.setPenWidth(1);
        drawIcon(dc, icon, centerX, centerY, u(dc, 28), enabled ? Palette.ACC2 : Palette.DISABLED);
    }

    // Number followed by a unit, centred as a whole (number fonts carry only
    // digits, so the unit uses a text font).
    function valueWithUnit(dc as Dc, centerX as Number, centerY as Number, digits as String, numberFont as FontType, unit as String, unitFont as FontType, color as Number) as Void {
        var number = dc.getTextDimensions(digits, numberFont);
        var suffix = dc.getTextDimensions(unit, unitFont);
        var gap = u(dc, 3);
        var left = centerX - (number[0] + gap + suffix[0]) / 2;
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.drawText(left, centerY, numberFont, digits, Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
        dc.drawText(left + number[0] + gap, centerY - number[1] / 5, unitFont, unit, Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
    }

    // Right-hand half ring of the dial: 0 degrees at 6 o'clock, 90 at
    // 3 o'clock, 180 at 12 (docs/03-geometria-del-reloj.md). `angle` fills it;
    // `mark` draws the thin target notch. Either may be null.
    function dial(dc as Dc, angle as Float?, mark as Number?, color as Number) as Void {
        var c = dc.getWidth() / 2;
        var r = c - u(dc, 22);
        dc.setPenWidth(u(dc, 8));
        dc.setColor(Palette.LINE, Graphics.COLOR_TRANSPARENT);
        dc.drawArc(c, c, r, Graphics.ARC_COUNTER_CLOCKWISE, 270, 90);
        if (angle != null && angle > 0) {
            var clamped = angle > 180 ? 180.0f : angle;
            dc.setColor(color, Graphics.COLOR_TRANSPARENT);
            dc.drawArc(c, c, r, Graphics.ARC_COUNTER_CLOCKWISE, 270, (270 + clamped).toNumber() % 360);
        }
        if (mark != null) {
            var radians = Math.toRadians(270 + mark);
            var inner = r - u(dc, 12);
            var outer = r + u(dc, 10);
            dc.setPenWidth(u(dc, 4));
            dc.setColor(Palette.INK, Graphics.COLOR_TRANSPARENT);
            dc.drawLine(c + inner * Math.cos(radians), c - inner * Math.sin(radians),
                c + outer * Math.cos(radians), c - outer * Math.sin(radians));
        }
        dc.setPenWidth(1);
    }

    // 24 x 24 line icons of the handoff (docs/02, "Iconografía"), centred on
    // (cx, cy) and drawn `size` pixels wide.
    function drawIcon(dc as Dc, icon as Symbol, cx as Number, cy as Number, size as Number, color as Number) as Void {
        var s = size / 24.0f;
        var pen = (2 * s).toNumber();
        dc.setPenWidth(pen < 2 ? 2 : pen);
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        if (icon == :measure) {
            line(dc, cx, cy, s, 3, 19, 21, 19);
            dc.drawArc(cx, cy + 7 * s, 7 * s, Graphics.ARC_CLOCKWISE, 180, 0);
            line(dc, cx, cy, s, 12, 19, 16, 13);
        } else if (icon == :play) {
            dc.fillPolygon([pt(cx, cy, s, 8, 5), pt(cx, cy, s, 19, 12), pt(cx, cy, s, 8, 19)]);
        } else if (icon == :list) {
            line(dc, cx, cy, s, 9, 6, 20, 6);
            line(dc, cx, cy, s, 9, 12, 20, 12);
            line(dc, cx, cy, s, 9, 18, 20, 18);
            dc.fillCircle(cx + (4 - 12) * s, cy + (6 - 12) * s, pen);
            dc.fillCircle(cx + (4 - 12) * s, cy + (12 - 12) * s, pen);
            dc.fillCircle(cx + (4 - 12) * s, cy + (18 - 12) * s, pen);
        } else if (icon == :arc) {
            dc.drawArc(cx, cy + 7 * s, 9 * s, Graphics.ARC_CLOCKWISE, 180, 0);
            line(dc, cx, cy, s, 12, 8, 12, 12);
            dc.fillCircle(cx, cy + 4 * s, pen);
        } else if (icon == :bars) {
            line(dc, cx, cy, s, 6, 20, 6, 12);
            line(dc, cx, cy, s, 12, 20, 12, 5);
            line(dc, cx, cy, s, 18, 20, 18, 11);
        } else if (icon == :spark) {
            dc.fillPolygon([pt(cx, cy, s, 12, 3), pt(cx, cy, s, 14, 9), pt(cx, cy, s, 20, 12),
                pt(cx, cy, s, 14, 15), pt(cx, cy, s, 12, 21), pt(cx, cy, s, 10, 15),
                pt(cx, cy, s, 4, 12), pt(cx, cy, s, 10, 9)]);
        } else if (icon == :sliders) {
            line(dc, cx, cy, s, 4, 8, 14, 8);
            line(dc, cx, cy, s, 18, 8, 20, 8);
            line(dc, cx, cy, s, 4, 16, 6, 16);
            line(dc, cx, cy, s, 10, 16, 20, 16);
            dc.drawCircle(cx + (16 - 12) * s, cy + (8 - 12) * s, 2 * s);
            dc.drawCircle(cx + (8 - 12) * s, cy + (16 - 12) * s, 2 * s);
        } else if (icon == :check) {
            line(dc, cx, cy, s, 5, 12, 10, 17);
            line(dc, cx, cy, s, 10, 17, 19, 7);
        } else if (icon == :alert) {
            line(dc, cx, cy, s, 12, 4, 21, 20);
            line(dc, cx, cy, s, 21, 20, 3, 20);
            line(dc, cx, cy, s, 3, 20, 12, 4);
            line(dc, cx, cy, s, 12, 10, 12, 14);
            dc.fillCircle(cx, cy + 5 * s, pen / 2 + 1);
        } else if (icon == :minus) {
            line(dc, cx, cy, s, 5, 12, 19, 12);
        } else if (icon == :plus) {
            line(dc, cx, cy, s, 5, 12, 19, 12);
            line(dc, cx, cy, s, 12, 5, 12, 19);
        } else if (icon == :sensor || icon == :sensorOff) {
            dc.drawCircle(cx, cy, 3 * s);
            dc.drawCircle(cx, cy, 8 * s);
            if (icon == :sensorOff) {
                line(dc, cx, cy, s, 4, 4, 20, 20);
            }
        } else if (icon == :globe) {
            dc.drawCircle(cx, cy, 9 * s);
            line(dc, cx, cy, s, 3, 12, 21, 12);
            dc.drawEllipse(cx, cy, 4 * s, 9 * s);
        }
        dc.setPenWidth(1);
    }

    // Exercise pictogram of canvas 06: front view for abduction, side view
    // for flexion. A stick figure with the working arm.
    function drawFigure(dc as Dc, cx as Number, cy as Number, size as Number, frontView as Boolean, color as Number) as Void {
        var s = size / 40.0f;
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.setPenWidth(u(dc, 3));
        dc.drawCircle(cx, cy - 14 * s, 5 * s);
        dc.drawLine(cx, cy - 8 * s, cx, cy + 10 * s);
        dc.drawLine(cx, cy + 10 * s, cx - 6 * s, cy + 20 * s);
        dc.drawLine(cx, cy + 10 * s, cx + 6 * s, cy + 20 * s);
        if (frontView) {
            dc.drawLine(cx, cy - 4 * s, cx - 12 * s, cy + 8 * s);
            dc.drawLine(cx, cy - 4 * s, cx + 14 * s, cy - 8 * s);
        } else {
            dc.drawLine(cx, cy - 4 * s, cx - 3 * s, cy + 8 * s);
            dc.drawLine(cx, cy - 4 * s, cx + 14 * s, cy - 4 * s);
        }
        dc.setPenWidth(1);
    }

    function pt(cx as Number, cy as Number, s as Float, x as Numeric, y as Numeric) as [Numeric, Numeric] {
        return [cx + (x - 12) * s, cy + (y - 12) * s] as [Numeric, Numeric];
    }

    function line(dc as Dc, cx as Number, cy as Number, s as Float, x1 as Numeric, y1 as Numeric, x2 as Numeric, y2 as Numeric) as Void {
        dc.drawLine(cx + (x1 - 12) * s, cy + (y1 - 12) * s, cx + (x2 - 12) * s, cy + (y2 - 12) * s);
    }
}
