import Toybox.Graphics;
import Toybox.Lang;

class CalibrateScreen extends Screen {
    private var _started as Boolean = false;
    function initialize(app as AppState) { Screen.initialize(app); }
    function isAnimated() as Boolean { return true; }
    function back() as Boolean { _app.tracker.cancelCalibration(); return _app.back(); }
    function act(action as Symbol) as Void {
        if (action == :start) { _app.tracker.startCalibration(); _started = true; }
        else if (action == :done) { _app.finishCalibration(); }
        else if (action == :retry) { _app.retrySensor(); }
        else if (action == :back) { back(); }
    }
    function draw(dc as Dc) as Void {
        begin(dc);
        var hold = _app.tracker.calibrationHold();
        if (!_started || hold == null) {
            PhaseUi.line(dc,Tr.t(:Calibrate),91,Palette.INK);
            PhaseUi.body(dc,Tr.t(:RangeReady) + "\n" + Tr.t(:RangeZero),127,100);
            button(dc,192,277,200,50,Tr.t(:ImReady),W.BUTTON_PRIMARY,:start);
        } else if (hold.isDone()) {
            Dial.ring(dc,1.0f,Palette.MINTD);
            PhaseUi.line(dc,Tr.t(:CalDoneTitle),103,Palette.MINTD);
            PhaseUi.body(dc,Tr.t(_app.tracker.isCalibrationStored() ? :CalStable : :CalNotSaved),143,96);
            button(dc,192,277,200,50,Tr.t(:Continue),W.BUTTON_PRIMARY,:done);
        } else {
            Dial.ring(dc,hold.progress(),Palette.ACC);
            PhaseUi.line(dc,Tr.t(:CalStill),103,Palette.INK);
            W.text(dc,dc.getWidth()/2,W.u(dc,162),Graphics.FONT_NUMBER_MILD,
                ((hold.remainingMs()+999)/1000).toString(),Palette.ACC2);
            var hint = !_app.hasSensor() ? :CalNoSignal : (hold.restartCount() > 0 ? :CalMoved : :RangeZero);
            PhaseUi.body(dc,Tr.t(hint),211,62);
            if (!_app.hasSensor()) { button(dc,192,282,180,46,Tr.t(:Retry),W.BUTTON_OUTLINE,:retry); }
        }
        button(dc,192,337,150,42,Tr.t(:Back),W.BUTTON_LINK,:back);
    }
}

// The same gate for measuring and marking: no stale numbers or fictitious 0°.
class ReadingScreen extends Screen {
    protected var _destination as Number;
    function initialize(app as AppState, destination as Number) {
        Screen.initialize(app); _destination = destination;
    }
    function isAnimated() as Boolean { return true; }
    function gateAction(action as Symbol) as Boolean {
        if (action == :calibrate) { _app.calibrateFor(_destination); return true; }
        if (action == :connect) { _app.allowSensor(); return true; }
        if (action == :back) { _app.back(); return true; }
        return false;
    }
    function drawGate(dc as Dc) as Boolean {
        if (_app.hasSensor() && _app.tracker.isCalibrated() && _app.tracker.angle() != null) { return false; }
        var ready = _app.hasSensor();
        PhaseUi.line(dc,Tr.t(ready ? :Calibrate : :CalNoSignal),111,Palette.INK);
        PhaseUi.body(dc,Tr.t(ready ? :NeedCal : :SensorOffBody),152,80);
        button(dc,192,277,200,50,Tr.t(ready ? :Calibrate : :Connect),W.BUTTON_PRIMARY,ready ? :calibrate : :connect);
        button(dc,192,335,150,42,Tr.t(:Back),W.BUTTON_LINK,:back);
        return true;
    }
}

class RangeScreen extends ReadingScreen {
    private var _finished as Boolean = false;
    private var _failed as Boolean = false;
    function initialize(app as AppState) {
        ReadingScreen.initialize(app,FlowModel.SCREEN_MEASURE);
        app.tracker.resetMax();
    }
    function act(action as Symbol) as Void {
        if (gateAction(action)) { return; }
        if (action == :finish) {
            var max = _app.tracker.maxAngle();
            if (max == null) { return; }
            _failed = !Prefs.write(Prefs.KEY_RANGE_MAX,(max+0.5f).toNumber());
            _finished = !_failed;
        }
    }
    function draw(dc as Dc) as Void {
        begin(dc);
        if (_finished) {
            PhaseUi.line(dc,Tr.t(:RangeSaved),111,Palette.MINTD);
            PhaseUi.degrees(dc,_app.tracker.maxAngle(),182);
            button(dc,192,290,180,50,Tr.t(:Back),W.BUTTON_PRIMARY,:back); return;
        }
        if (drawGate(dc)) { return; }
        var angle = _app.tracker.angle();
        W.water(dc,LiveModel.waterLevel(angle as Float));
        Dial.draw(dc,angle,null,null,null,null,Palette.ACC);
        PhaseUi.line(dc,Tr.t(:MeasureRange),82,Palette.INK2);
        PhaseUi.degrees(dc,angle,156);
        var max = _app.tracker.maxAngle();
        PhaseUi.line(dc,Tr.f(:RangeMax,[max == null ? 0 : (max+0.5f).toNumber()]),221,Palette.INK);
        PhaseUi.line(dc,Tr.t(_failed ? :SaveFailTitle : :RangeRise),260,Palette.INK2);
        button(dc,123,316,120,46,Tr.t(:Calibrate),W.BUTTON_OUTLINE,:calibrate);
        button(dc,260,316,120,46,Tr.t(_failed ? :Retry : :Finish),W.BUTTON_PRIMARY,:finish);
    }
}

class PainScreen extends ReadingScreen {
    private var _model as PainArcModel = new PainArcModel();
    private var _saved as Boolean = false;
    private var _failed as Boolean = false;
    function initialize(app as AppState) { ReadingScreen.initialize(app,FlowModel.SCREEN_PAIN); }
    function act(action as Symbol) as Void {
        if (gateAction(action)) { return; }
        var angle = _app.tracker.angle();
        if (action == :mark && angle != null && _app.hasSensor()) {
            if (_model.step() == PainArcModel.STEP_INTRO) { _model.markStart(angle); }
            else { _model.markEnd(angle); }
        } else if (action == :save) {
            _saved = SavedArc.save(_model.from(),_model.to()); _failed = !_saved;
        } else if (action == :repeat) { _model.retry(); _failed = false; _saved = false; }
        focus=0;
    }
    function draw(dc as Dc) as Void {
        begin(dc);
        if (_saved || _model.step() == PainArcModel.STEP_CONFIRM) {
            Dial.draw(dc,null,null,null,_model.from(),_model.to(),Palette.ROSED);
            PhaseUi.line(dc,Tr.t(_saved ? :PainSaved : :PainTitle),91,Palette.ROSED);
            PhaseUi.body(dc,Tr.f(:PainArcIs,[_model.from(),_model.to()]),132,68);
            PhaseUi.body(dc,Tr.t(_failed ? :PainNotSaved : :PainAvoid),205,63);
            button(dc,192,292,200,48,Tr.t(_saved ? :Back : :Save),W.BUTTON_PRIMARY,_saved ? :back : :save);
            if (!_saved) { button(dc,192,344,150,40,Tr.t(:Repeat),W.BUTTON_LINK,:repeat); }
            return;
        }
        if (drawGate(dc)) { return; }
        var angle = _app.tracker.angle() as Float;
        var marking = _model.step() == PainArcModel.STEP_MARKING;
        Dial.draw(dc,angle,null,null,marking ? _model.from() : null,
            marking ? _model.liveTo(angle) : null,Palette.ROSED);
        PhaseUi.line(dc,Tr.t(:PainTitle),82,Palette.INK2);
        PhaseUi.degrees(dc,angle,155);
        PhaseUi.body(dc,Tr.t(_model.wasTooShort() ? :PainTooShort : (marking ? :PainWhereEnds : :PainTapStart)),206,65);
        button(dc,192,300,220,50,Tr.t(marking ? :MarkEnd : :MarkStart),W.BUTTON_PRIMARY,:mark);
        button(dc,192,348,140,40,Tr.t(:Back),W.BUTTON_LINK,:back);
    }
}

class SimulationScreen extends Screen {
    function initialize(app as AppState) { Screen.initialize(app); }
    function isAnimated() as Boolean { return true; }
    function back() as Boolean { _app.closeSimulation(); return true; }
    function act(action as Symbol) as Void {
        var sim = _app.simulation;
        if (action == :minus) { sim.adjust(-5); }
        else if (action == :plus) { sim.adjust(5); }
        else if (action == :pattern) { sim.pattern = (sim.pattern+1)%4; sim.restart(); }
        else if (action == :signal) { sim.connected = !sim.connected; }
        else if (action == :failure) { Prefs.failWrites = !Prefs.failWrites; }
        else if (action == :back) { back(); }
    }
    function draw(dc as Dc) as Void {
        begin(dc);
        PhaseUi.line(dc,Tr.f(:SimulationAngle,[_app.simulation.angle.toNumber()]),79,Palette.INK);
        button(dc,123,124,90,44,Tr.t(:Minus),W.BUTTON_OUTLINE,:minus);
        button(dc,260,124,90,44,Tr.t(:Plus),W.BUTTON_OUTLINE,:plus);
        var names = [:Manual,:Automatic,:OvershootTest,:PainTest] as Array<Symbol>;
        button(dc,192,181,250,44,Tr.t(names[_app.simulation.pattern]),W.BUTTON_OUTLINE,:pattern);
        button(dc,192,231,250,44,Tr.t(_app.simulation.connected ? :CutSignal : :RestoreSignal),W.BUTTON_OUTLINE,:signal);
        button(dc,192,281,250,44,Tr.t(Prefs.failWrites ? :RestoreStorage : :FailStorage),W.BUTTON_OUTLINE,:failure);
        button(dc,192,334,150,42,Tr.t(:Back),W.BUTTON_PRIMARY,:back);
    }
}

