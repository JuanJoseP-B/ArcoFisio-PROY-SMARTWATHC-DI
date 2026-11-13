import Toybox.Graphics;
import Toybox.Lang;
import Toybox.WatchUi;

// Main screen: four pages (sensor status, live angle, diagnostics, tone and
// vibration) that UP / DOWN or a vertical swipe step through.
class MainView extends WatchUi.View {

    enum {
        PAGE_STATUS,
        PAGE_LIVE,
        PAGE_DIAGNOSTICS,
        PAGE_FEEDBACK
    }

    private var _pages as Array<Page>;
    private var _feedbackPage as FeedbackPage;
    private var _index as Number = PAGE_STATUS;

    function initialize(reader as SensorReader, tracker as ArmTracker) {
        View.initialize();
        _feedbackPage = new FeedbackPage();
        _pages = [
            new StatusPage(reader, tracker),
            new LivePage(reader, tracker),
            new DiagnosticsPage(reader),
            _feedbackPage
        ] as Array<Page>;
    }

    function onUpdate(dc as Dc) as Void {
        Ui.clear(dc);
        Ui.drawPageDots(dc, _pages.size(), _index);
        _pages[_index].draw(dc);
    }

    function pageIndex() as Number {
        return _index;
    }

    function showPage(index as Number) as Void {
        _index = index;
        WatchUi.requestUpdate();
    }

    function nextPage() as Void {
        showPage((_index + 1) % _pages.size());
    }

    function previousPage() as Void {
        showPage((_index + _pages.size() - 1) % _pages.size());
    }

    // What START / tap should do on the current page.
    function selectAction() as Symbol? {
        return _pages[_index].selectAction();
    }

    function feedbackPage() as FeedbackPage {
        return _feedbackPage;
    }
}
