import Toybox.Graphics;
import Toybox.Lang;
import Toybox.System;
import Toybox.Time;

module PhaseUi {
    function line(dc as Dc, content as String, y as Number, color as Number) as Void {
        W.paragraph(dc, content, [Graphics.FONT_TINY, Graphics.FONT_XTINY],
            dc.getWidth()/2, y - 18, 280, 36, color);
    }
    function body(dc as Dc, content as String, top as Number, height as Number) as Void {
        W.paragraph(dc, content, [Graphics.FONT_XTINY], dc.getWidth()/2, top, 270, height, Palette.INK2);
    }
    function degrees(dc as Dc, value as Float?, y as Number) as Void {
        W.valueWithUnit(dc, dc.getWidth()/2, W.u(dc,y),
            value == null ? "--" : (value + 0.5f).toNumber().toString(),
            Graphics.FONT_NUMBER_MILD, Tr.t(:DegreeSign), Graphics.FONT_SMALL, Palette.INK);
    }
}

class SessionScreen extends Screen {
    function initialize(app as AppState) { Screen.initialize(app); }
    function isAnimated() as Boolean { return true; }
    function back() as Boolean { _app.session.askEnd(_app.tracker); focus = 0; return true; }
    function act(action as Symbol) as Void {
        var s = _app.session;
        var now = System.getTimer();
        if (action == :pause) { s.pause(_app.tracker); }
        else if (action == :end) { s.askEnd(_app.tracker); }
        else if (action == :confirmEnd) { s.stop(Time.now().value(), _app.tracker); _app.replaceWith(FlowModel.SCREEN_SUMMARY); }
        else if (action == :cancelEnd) { s.cancelEnd(_app.hasSensor(), now, _app.tracker); }
        else if (action == :resume) { s.resume(_app.hasSensor(), now, _app.tracker); }
        else if (action == :retry) {
            if (_app.hasSensor()) { s.resume(true, now, _app.tracker); }
            else { _app.retrySensor(); }
        }
        else if (action == :nextSet) { s.nextSet(_app.hasSensor(), now, _app.tracker); }
        focus = 0;
    }
    function draw(dc as Dc) as Void {
        begin(dc);
        var s = _app.session;
        var live = s.live;
        var w = live.workout();
        if (s.dialog != SessionCoordinator.DIALOG_NONE) { drawDialog(dc); return; }
        if (w.phase() == Workout.PHASE_REST) { drawRest(dc); return; }
        var angle = _app.tracker.angle();
        var zone = live.run().zone();
        var config = live.config();
        var color = zone == Zones.ZONE_PAIN ? Palette.ROSED :
            (zone == Zones.ZONE_OVERSHOOT ? Palette.AMBERD : (zone == Zones.ZONE_TARGET ? Palette.MINTD : Palette.ACC2));
        var split = zone == Zones.ZONE_PAIN ? config.painFrom : config.target;
        W.water(dc, angle == null ? 0.0f : LiveModel.waterLevel(angle));
        Dial.draw(dc, angle, split, config.target, config.painFrom, config.painTo, color);
        PhaseUi.line(dc, Tr.f(:SetCount,[w.set(), w.setsPlanned()]), 70, Palette.INK2);
        PhaseUi.line(dc, Tr.f(:RepCount,[live.run().engine().repsCompleted(), w.repsPerSet()]), 107, Palette.INK);
        PhaseUi.degrees(dc, angle, 167);
        var title = zone == Zones.ZONE_PAIN ? :LivePain : (zone == Zones.ZONE_OVERSHOOT ? :LiveOver
            : (zone == Zones.ZONE_TARGET ? (live.run().engine().isHeld() ? :HoldDone : :LiveTarget) : :LiveApproach));
        PhaseUi.line(dc, Tr.t(title), 224, color);
        PhaseUi.line(dc, Tr.f(:TargetValue,[config.target.toNumber()]), 264, Palette.INK2);
        button(dc, 123, 316, 120, 46, Tr.t(:Pause), W.BUTTON_OUTLINE, :pause);
        button(dc, 260, 316, 120, 46, Tr.t(:Finish), W.BUTTON_OUTLINE, :end);
    }
    private function drawDialog(dc as Dc) as Void {
        var s = _app.session;
        var ending = s.dialog == SessionCoordinator.DIALOG_END;
        var lost = s.dialog == SessionCoordinator.DIALOG_LOST;
        PhaseUi.line(dc, Tr.t(ending ? :ConfirmTitle : (lost ? :LostTitle : :Paused)), 100, Palette.INK);
        PhaseUi.body(dc, ending ? Tr.f(:ConfirmBody,[s.live.repsDone(),s.live.repsGoal()])
            : Tr.t(lost ? :LostBody : :PausedBody), 133, 90);
        button(dc,192,266,220,50,Tr.t(ending ? :KeepGoing : (lost ? :Reconnect : :Resume)),
            W.BUTTON_PRIMARY, ending ? :cancelEnd : (lost ? :retry : :resume));
        button(dc,192,326,180,44,Tr.t(:EndNow),W.BUTTON_LINK,ending ? :confirmEnd : :end);
    }
    private function drawRest(dc as Dc) as Void {
        var w = _app.session.live.workout();
        Dial.ring(dc,w.restFraction(),Palette.ACC);
        PhaseUi.line(dc,Tr.t(w.restIsOver() ? :RestOver : :WizRest),95,Palette.INK);
        var seconds = w.restSecondsLeft();
        W.text(dc,dc.getWidth()/2,W.u(dc,163),Graphics.FONT_NUMBER_MILD,
            (seconds/60).format("%d") + ":" + (seconds%60).format("%02d"),Palette.INK);
        PhaseUi.line(dc,Tr.f(:SetCount,[w.set()+1,w.setsPlanned()]),222,Palette.INK2);
        if (!_app.hasSensor()) { PhaseUi.line(dc,Tr.t(:CalNoSignal),257,Palette.AMBERD); }
        button(dc,192,298,200,48,Tr.t(w.restIsOver() ? :StartNow : :Skip),W.BUTTON_PRIMARY,:nextSet);
        button(dc,192,348,130,40,Tr.t(:Finish),W.BUTTON_LINK,:end);
    }
}

class SummaryScreen extends Screen {
    private var _detail as Boolean = false;
    private var _discard as Boolean = false;
    function initialize(app as AppState) { Screen.initialize(app); }
    function back() as Boolean {
        if (!_app.session.saved) { _discard = true; focus=0; return true; }
        _app.resetTo(FlowModel.SCREEN_MENU); return true;
    }
    function act(action as Symbol) as Void {
        if (action == :retry) { _app.session.retrySave(); }
        else if (action == :details) { _detail = !_detail; }
        else if (action == :exit) { back(); }
        else if (action == :keep) { _discard = false; }
        else if (action == :discard) { _app.session.saved = true; _app.resetTo(FlowModel.SCREEN_MENU); }
        focus=0;
    }
    function draw(dc as Dc) as Void {
        begin(dc);
        var s = _app.session;
        var r = s.record;
        if (r == null) {
            PhaseUi.line(dc,Tr.t(:NoSessions),154,Palette.INK);
            button(dc,192,290,180,50,Tr.t(:Back),W.BUTTON_PRIMARY,:exit); return;
        }
        if (!s.saved) {
            PhaseUi.line(dc,Tr.t(_discard ? :DiscardTitle : :SaveFailTitle),100,Palette.ROSED);
            PhaseUi.body(dc,Tr.t(_discard ? :DiscardBody : :SaveFailBody),130,100);
            button(dc,192,265,200,50,Tr.t(_discard ? :KeepGoing : :Retry),W.BUTTON_PRIMARY,_discard ? :keep : :retry);
            button(dc,192,325,180,44,Tr.t(_discard ? :Discard : :Exit),W.BUTTON_LINK,_discard ? :discard : :exit);
            return;
        }
        W.water(dc,0.12f);
        PhaseUi.line(dc,Tr.t(r.stopped ? :SumEarly : :SumDone),78,Palette.INK);
        if (!_detail) {
            PhaseUi.degrees(dc,r.maxAngle.toFloat(),143);
            PhaseUi.line(dc,Tr.t(:Maximum),190,Palette.INK2);
            PhaseUi.line(dc,Tr.f(:SumHeld,[r.repsHeld,r.repsDone]),229,Palette.MINTD);
            PhaseUi.line(dc,Tr.f(:SumReps,[r.repsDone,r.repsGoal,r.setsDone,r.setsGoal]),265,Palette.INK2);
        } else {
            var change = SessionLog.rangeChange(s.previous,r);
            var comparison = change == null ? Tr.t(:SumFirst) : (change == 0 ? Tr.t(:SumSame)
                : Tr.f(change > 0 ? :SumUp : :SumDown,[change.abs()]));
            PhaseUi.body(dc,comparison,113,65);
            PhaseUi.line(dc,Tr.f(:SumPainMany,[r.painEntries]),207,Palette.ROSED);
            PhaseUi.body(dc,r.hasArc() ? Tr.f(:PainArcIs,[r.painFrom,r.painTo]) : Tr.t(:NoPainArc),229,52);
        }
        button(dc,123,318,120,46,Tr.t(:Details),W.BUTTON_OUTLINE,:details);
        button(dc,260,318,120,46,Tr.t(:Exit),W.BUTTON_PRIMARY,:exit);
    }
}

