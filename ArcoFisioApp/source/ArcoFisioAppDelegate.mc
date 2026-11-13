import Toybox.Lang;
import Toybox.WatchUi;

class ArcoFisioAppDelegate extends WatchUi.BehaviorDelegate {

    function initialize() {
        BehaviorDelegate.initialize();
    }

    function onMenu() as Boolean {
        WatchUi.pushView(new Rez.Menus.MainMenu(), new ArcoFisioAppMenuDelegate(), WatchUi.SLIDE_UP);
        return true;
    }

}