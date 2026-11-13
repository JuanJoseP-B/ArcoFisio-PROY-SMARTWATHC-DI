import Toybox.Graphics;
import Toybox.Lang;

// A touch target recorded while a screen draws: where it is and what it does.
class Target {
    var x as Number;
    var y as Number;
    var w as Number;
    var h as Number;
    var action as Symbol;

    function initialize(x as Number, y as Number, w as Number, h as Number, action as Symbol) {
        self.x = x;
        self.y = y;
        self.w = w;
        self.h = h;
        self.action = action;
    }
}

// Base of every screen. A screen draws itself and records its buttons as
// targets, so touch (tap on a target) and buttons (UP/DOWN move the focus
// among the targets, START presses the focused one) share one list.
class Screen {

    protected var _app as AppState;
    protected var _targets as Array<Target> = [] as Array<Target>;
    protected var _minTouch as Number = 44;
    var focus as Number = 0;

    function initialize(app as AppState) {
        _app = app;
    }

    // Draws the screen. Subclasses call begin() first.
    function draw(dc as Dc) as Void {
    }

    // True while the screen animates and wants frequent redraws.
    function isAnimated() as Boolean {
        return false;
    }

    // Called by the app timer; screens with timed steps override it.
    function tick(nowMs as Number) as Void {
    }

    // Does what a pressed target (or key) asks.
    function act(action as Symbol) as Void {
    }

    protected function begin(dc as Dc) as Void {
        _targets = [] as Array<Target>;
        _minTouch = W.u(dc, W.TOUCH_MIN);
        W.clear(dc);
    }

    protected function addTarget(x as Number, y as Number, w as Number, h as Number, action as Symbol) as Void {
        _targets.add(new Target(x, y, w, h, action));
    }

    // Draws a button and registers it as a target (centre and size in
    // design pixels).
    protected function button(dc as Dc, cx as Number, cy as Number, width as Number, height as Number, label as String, style as Number, action as Symbol) as Void {
        var index = _targets.size();
        var focused = _app.keyMode && focus == index;
        W.button(dc, W.u(dc, cx), W.u(dc, cy), width, height, label, style, focused);
        var w = W.u(dc, width);
        var h = W.u(dc, height);
        addTarget(W.u(dc, cx) - w / 2, W.u(dc, cy) - h / 2, w, h, action);
    }

    // Taps: returns true when a target took it.
    function tap(x as Number, y as Number) as Boolean {
        for (var i = 0; i < _targets.size(); i++) {
            var t = _targets[i];
            var padX = t.w < _minTouch ? (_minTouch - t.w) / 2 : 0;
            var padY = t.h < _minTouch ? (_minTouch - t.h) / 2 : 0;
            if (x >= t.x - padX && x <= t.x + t.w + padX && y >= t.y - padY && y <= t.y + t.h + padY) {
                focus = i;
                act(t.action);
                return true;
            }
        }
        return false;
    }

    // START: presses the focused target.
    function select() as Void {
        if (focus >= 0 && focus < _targets.size()) {
            act(_targets[focus].action);
        }
    }

    // DOWN and UP.
    function next() as Void {
        moveFocus(1);
    }

    function previous() as Void {
        moveFocus(-1);
    }

    protected function moveFocus(delta as Number) as Void {
        var n = _targets.size();
        if (n > 0) {
            focus = ((focus + delta) % n + n) % n;
        }
    }

    // BACK: true when the screen handled it, false to let the app exit.
    function back() as Boolean {
        return _app.back();
    }
}
