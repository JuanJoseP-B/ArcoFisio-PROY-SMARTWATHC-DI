import Toybox.Lang;
import Toybox.WatchUi;

// Input for the main screen. BehaviorDelegate maps both the physical buttons
// and touch to the same behaviours on the Forerunner 165:
//   START or tap         -> onSelect        (action of the current page)
//   DOWN or swipe up     -> onNextPage
//   UP or swipe down     -> onPreviousPage
//   BACK or swipe right  -> onBack          (first page, then leave the app)
class MainDelegate extends WatchUi.BehaviorDelegate {

    private var _view as MainView;
    private var _reader as SensorReader;
    private var _tracker as ArmTracker;

    function initialize(view as MainView, reader as SensorReader, tracker as ArmTracker) {
        BehaviorDelegate.initialize();
        _view = view;
        _reader = reader;
        _tracker = tracker;
    }

    function onSelect() as Boolean {
        var action = _view.selectAction();
        if (action == :calibrate) {
            openCalibration(false);
        } else if (action == :goLive) {
            _view.showPage(MainView.PAGE_LIVE);
        } else if (action == :retrySensor) {
            _reader.start();
        } else if (action == :toggleSource) {
            _reader.toggleSource();
        } else if (action == :liveMenu) {
            openMenu(Rez.Strings.MenuTitle, [
                [:resetMax, Rez.Strings.MenuResetMax],
                [:recalibrate, Rez.Strings.MenuRecalibrate]
            ]);
        } else if (action == :feedbackMenu) {
            openMenu(Rez.Strings.FeedbackTitle, [
                [:playTone, Rez.Strings.MenuPlayTone],
                [:vibrate, Rez.Strings.MenuVibrate]
            ]);
        }
        WatchUi.requestUpdate();
        return true;
    }

    function onNextPage() as Boolean {
        _view.nextPage();
        return true;
    }

    function onPreviousPage() as Boolean {
        _view.previousPage();
        return true;
    }

    function onBack() as Boolean {
        if (_view.pageIndex() != MainView.PAGE_STATUS) {
            _view.showPage(MainView.PAGE_STATUS);
            return true;
        }
        return false; // the system closes the app
    }

    // Runs the option picked in a menu.
    function onMenuAction(id as Symbol) as Void {
        if (id == :recalibrate) {
            openCalibration(true);
            return;
        }
        if (id == :resetMax) {
            _tracker.resetMax();
        } else if (id == :playTone) {
            _view.feedbackPage().setLastResult(FeedbackProbe.playTone()
                ? FeedbackPage.RESULT_TONE_SENT : FeedbackPage.RESULT_REJECTED);
        } else if (id == :vibrate) {
            _view.feedbackPage().setLastResult(FeedbackProbe.vibrate()
                ? FeedbackPage.RESULT_VIBRATION_SENT : FeedbackPage.RESULT_REJECTED);
        }
        WatchUi.popView(WatchUi.SLIDE_RIGHT);
    }

    private function openMenu(title as ResourceId, items as Array<[Symbol, ResourceId]>) as Void {
        var menu = new WatchUi.Menu2({ :title => Ui.text(title) });
        for (var i = 0; i < items.size(); i++) {
            menu.addItem(new WatchUi.MenuItem(Ui.text(items[i][1]), null, items[i][0], null));
        }
        WatchUi.pushView(menu, new ActionMenuDelegate(method(:onMenuAction)), WatchUi.SLIDE_LEFT);
    }

    // Opens the calibration steps. From a menu the calibration replaces the
    // menu, so BACK returns to the main screen in both cases.
    private function openCalibration(fromMenu as Boolean) as Void {
        _view.showPage(MainView.PAGE_LIVE);
        var view = new CalibrationView(_reader, _tracker);
        var delegate = new CalibrationDelegate(view);
        if (fromMenu) {
            WatchUi.switchToView(view, delegate, WatchUi.SLIDE_LEFT);
        } else {
            WatchUi.pushView(view, delegate, WatchUi.SLIDE_LEFT);
        }
    }
}

// Menu of actions: reports the picked item's identifier to a handler.
class ActionMenuDelegate extends WatchUi.Menu2InputDelegate {

    private var _handler as Method(id as Symbol) as Void;

    function initialize(handler as Method(id as Symbol) as Void) {
        Menu2InputDelegate.initialize();
        _handler = handler;
    }

    function onSelect(item as WatchUi.MenuItem) as Void {
        var id = item.getId();
        if (id instanceof Lang.Symbol) {
            _handler.invoke(id);
        }
    }

    function onBack() as Void {
        WatchUi.popView(WatchUi.SLIDE_RIGHT);
    }
}
