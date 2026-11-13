import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;
import Toybox.WatchUi;

// Drawing helpers shared by the prototype screens: plain colours, string
// resources and text boxes that stay inside the round screen.
//
// The Marea visual identity arrives in a later phase; nothing here is final.
module Ui {

    const COLOR_BACKGROUND = Graphics.COLOR_BLACK;
    const COLOR_TEXT = Graphics.COLOR_WHITE;
    const COLOR_MUTED = Graphics.COLOR_LT_GRAY;
    const COLOR_TRACK = Graphics.COLOR_DK_GRAY;
    const COLOR_OK = Graphics.COLOR_GREEN;
    const COLOR_WARNING = Graphics.COLOR_ORANGE;

    // Vertical bands, as fractions of the screen height.
    const DOTS_Y = 0.07f;
    const TITLE_TOP = 0.11f;
    const TITLE_HEIGHT = 0.10f;
    const HINT_TOP = 0.76f;
    const HINT_HEIGHT = 0.15f;

    // Gap kept between text and the edge of the circle, in pixels.
    const EDGE_MARGIN = 10;

    const RING_INSET = 7;
    const RING_WIDTH = 8;

    var stringCache as Dictionary<ResourceId, String> = {};

    // Visible text always comes from string resources (Spanish and English).
    function text(id as ResourceId) as String {
        var cached = stringCache[id];
        if (cached != null) {
            return cached;
        }
        var loaded = WatchUi.loadResource(id) as String;
        stringCache[id] = loaded;
        return loaded;
    }

    // Resource string with $1$, $2$... replaced by `params`.
    function format(id as ResourceId, params as Array) as String {
        return Lang.format(text(id), params);
    }

    // Whole degrees with the degree sign, e.g. "128°".
    function degrees(value as Float) as String {
        return format(Rez.Strings.DegreesFormat, [Math.round(value).toNumber()]);
    }

    function clear(dc as Dc) as Void {
        dc.setColor(COLOR_TEXT, COLOR_BACKGROUND);
        dc.clear();
        if (dc has :setAntiAlias) {
            dc.setAntiAlias(true);
        }
    }

    function px(dc as Dc, fraction as Float) as Number {
        return (dc.getHeight() * fraction).toNumber();
    }

    // Widest horizontal span that fits inside the circle between two rows.
    function safeWidth(dc as Dc, yTop as Number, yBottom as Number) as Number {
        var radius = dc.getWidth() / 2;
        var fromTop = (yTop - radius).abs();
        var fromBottom = (yBottom - radius).abs();
        var distance = fromTop > fromBottom ? fromTop : fromBottom;
        if (distance >= radius) {
            return 0;
        }
        var chord = 2 * Math.sqrt(radius * radius - distance * distance);
        var width = chord.toNumber() - 2 * EDGE_MARGIN;
        return width < 0 ? 0 : width;
    }

    // Centred, wrapped text in a band of the screen. The box is as wide as
    // the circle allows at that height, and the first font that fits is used.
    function drawBox(dc as Dc, content as String, fonts as Array<FontType>, yTop as Number, height as Number, color as ColorType) as Void {
        var width = safeWidth(dc, yTop, yTop + height);
        if (width <= 0) {
            return;
        }
        var area = new WatchUi.TextArea({
            :text => content,
            :color => color,
            :font => fonts,
            :justification => Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER,
            :locX => (dc.getWidth() - width) / 2,
            :locY => yTop,
            :width => width,
            :height => height
        });
        area.draw(dc);
    }

    // Box placed by fractions of the screen height.
    function drawBand(dc as Dc, content as String, fonts as Array<FontType>, top as Float, height as Float, color as ColorType) as Void {
        drawBox(dc, content, fonts, px(dc, top), px(dc, height), color);
    }

    function drawTitle(dc as Dc, content as String) as Void {
        drawBand(dc, content, [Graphics.FONT_TINY, Graphics.FONT_XTINY], TITLE_TOP, TITLE_HEIGHT, COLOR_MUTED);
    }

    // What START (or a tap) does on this screen.
    function drawHint(dc as Dc, content as String) as Void {
        drawBand(dc, content, [Graphics.FONT_XTINY], HINT_TOP, HINT_HEIGHT, COLOR_MUTED);
    }

    // One dot per page, the current one highlighted.
    function drawPageDots(dc as Dc, count as Number, active as Number) as Void {
        var gap = 16;
        var x = dc.getWidth() / 2 - gap * (count - 1) / 2;
        var y = px(dc, DOTS_Y);
        for (var i = 0; i < count; i++) {
            dc.setColor(i == active ? COLOR_TEXT : COLOR_TRACK, Graphics.COLOR_TRANSPARENT);
            dc.fillCircle(x + i * gap, y, i == active ? 4 : 3);
        }
    }

    // Ring along the edge filled clockwise from `startDegrees` (0 = 3
    // o'clock, counter-clockwise positive) by `sweepDegrees`.
    function drawRing(dc as Dc, startDegrees as Number, sweepDegrees as Numeric, color as ColorType) as Void {
        var center = dc.getWidth() / 2;
        var radius = center - RING_INSET;
        dc.setPenWidth(RING_WIDTH);
        dc.setColor(COLOR_TRACK, Graphics.COLOR_TRANSPARENT);
        dc.drawCircle(center, center, radius);
        var sweep = sweepDegrees.toNumber();
        if (sweep >= 360) {
            dc.setColor(color, Graphics.COLOR_TRANSPARENT);
            dc.drawCircle(center, center, radius);
        } else if (sweep > 0) {
            dc.setColor(color, Graphics.COLOR_TRANSPARENT);
            dc.drawArc(center, center, radius, Graphics.ARC_CLOCKWISE, startDegrees, startDegrees - sweep);
        }
        dc.setPenWidth(1);
    }
}
