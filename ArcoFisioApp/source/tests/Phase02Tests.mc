import Toybox.Lang;
import Toybox.Test;

// Unit tests of the phase 02 logic: wizard steppers, menu state with and
// without sensor, language choice, first-run routing, sensor states and the
// face variants.

module Phase02Tests {

    // ---- Wizard rules and model --------------------------------------

    (:test)
    function wizardDefaultsMatchTheSpec(logger as Logger) as Boolean {
        var model = new WizardModel();
        return model.value(WizardRules.STEP_ANGLE) == 90
            && model.value(WizardRules.STEP_REPS) == 10
            && model.value(WizardRules.STEP_SETS) == 3
            && model.value(WizardRules.STEP_REST) == 30;
    }

    (:test)
    function angleStepsByFiveAndStopsAtTheRange(logger as Logger) as Boolean {
        var v = 90;
        v = WizardRules.change(WizardRules.STEP_ANGLE, v, 1);
        var up = v == 95;
        for (var i = 0; i < 40; i++) {
            v = WizardRules.change(WizardRules.STEP_ANGLE, v, 1);
        }
        var top = v == 180;
        for (var i = 0; i < 60; i++) {
            v = WizardRules.change(WizardRules.STEP_ANGLE, v, -1);
        }
        return up && top && v == 10;
    }

    (:test)
    function repsSetsAndRestRespectTheirLimits(logger as Logger) as Boolean {
        var reps = WizardRules.change(WizardRules.STEP_REPS, 50, 1) == 50
            && WizardRules.change(WizardRules.STEP_REPS, 1, -1) == 1
            && WizardRules.change(WizardRules.STEP_REPS, 10, 1) == 11;
        var sets = WizardRules.change(WizardRules.STEP_SETS, 10, 1) == 10
            && WizardRules.change(WizardRules.STEP_SETS, 1, -1) == 1;
        var rest = WizardRules.change(WizardRules.STEP_REST, 180, 1) == 180
            && WizardRules.change(WizardRules.STEP_REST, 5, -1) == 5
            && WizardRules.change(WizardRules.STEP_REST, 30, 1) == 35;
        return reps && sets && rest;
    }

    (:test)
    function normalizeSnapsStrayValuesToTheGrid(logger as Logger) as Boolean {
        return WizardRules.normalize(WizardRules.STEP_ANGLE, 92) == 90
            && WizardRules.normalize(WizardRules.STEP_ANGLE, 93) == 95
            && WizardRules.normalize(WizardRules.STEP_ANGLE, 400) == 180
            && WizardRules.normalize(WizardRules.STEP_ANGLE, -5) == 10
            && WizardRules.normalize(WizardRules.STEP_REST, 7) == 5;
    }

    (:test)
    function modelAdjustsOnlyTheCurrentStep(logger as Logger) as Boolean {
        var model = new WizardModel();
        model.adjust(1);                       // angle 95
        model.advance();                       // reps
        model.adjust(-1);                      // reps 9
        return model.value(WizardRules.STEP_ANGLE) == 95
            && model.value(WizardRules.STEP_REPS) == 9
            && model.value(WizardRules.STEP_SETS) == 3;
    }

    (:test)
    function modelReportsWhenAButtonCannotMove(logger as Logger) as Boolean {
        var model = new WizardModel();
        for (var i = 0; i < 30; i++) {
            model.adjust(1);
        }
        var atTop = !model.canIncrease() && model.canDecrease();
        for (var i = 0; i < 40; i++) {
            model.adjust(-1);
        }
        return atTop && model.canIncrease() && !model.canDecrease();
    }

    (:test)
    function modelWalksFourStepsThenFinishes(logger as Logger) as Boolean {
        var model = new WizardModel();
        var first = model.advance();           // 0 -> 1
        var second = model.advance();          // 1 -> 2
        var third = model.advance();           // 2 -> 3
        var onLast = model.isLastStep();
        var finished = model.advance();        // last step: Empezar
        return !first && !second && !third && onLast && finished && model.step() == 3;
    }

    (:test)
    function retreatGoesBackAndReportsTheFirstStep(logger as Logger) as Boolean {
        var model = new WizardModel();
        model.advance();
        var back = model.retreat();
        var atStart = !model.retreat();
        return back && atStart && model.step() == 0;
    }

    (:test)
    function modelRoundTripsThroughStorage(logger as Logger) as Boolean {
        var model = new WizardModel();
        model.setExercise(WizardModel.EXERCISE_FLEXION);
        model.adjust(-1);
        var copy = WizardModel.restore(model.serialize());
        return copy.exercise() == WizardModel.EXERCISE_FLEXION
            && copy.value(WizardRules.STEP_ANGLE) == 85
            && copy.value(WizardRules.STEP_REPS) == 10
            && copy.value(WizardRules.STEP_SETS) == 3
            && copy.value(WizardRules.STEP_REST) == 30;
    }

    (:test)
    function restoreIgnoresDamagedStorage(logger as Logger) as Boolean {
        var fromNothing = WizardModel.restore(null);
        var fromText = WizardModel.restore("junk");
        var damaged = WizardModel.restore([7, "x", 999, null, -4] as Array);
        return fromNothing.value(WizardRules.STEP_ANGLE) == 90
            && fromText.value(WizardRules.STEP_REPS) == 10
            && damaged.exercise() == WizardModel.EXERCISE_ABDUCTION
            && damaged.value(WizardRules.STEP_ANGLE) == 90
            && damaged.value(WizardRules.STEP_REPS) == 50
            && damaged.value(WizardRules.STEP_SETS) == 3
            && damaged.value(WizardRules.STEP_REST) == 5;
    }

    // ---- Menu ----------------------------------------------------------

    (:test)
    function withASensorEveryItemIsEnabled(logger as Logger) as Boolean {
        for (var i = 0; i < MenuModel.COUNT; i++) {
            if (!MenuModel.isEnabled(i, true)) {
                return false;
            }
        }
        return true;
    }

    (:test)
    function withoutASensorOnlyMeasuringItemsAreDimmed(logger as Logger) as Boolean {
        return !MenuModel.isEnabled(MenuModel.MEASURE, false)
            && !MenuModel.isEnabled(MenuModel.QUICK, false)
            && !MenuModel.isEnabled(MenuModel.PAIN, false)
            && MenuModel.isEnabled(MenuModel.ROUTINES, false)
            && MenuModel.isEnabled(MenuModel.HISTORY, false)
            && MenuModel.isEnabled(MenuModel.GUIDE, false)
            && MenuModel.isEnabled(MenuModel.SETTINGS, false);
    }

    (:test)
    function menuFocusWrapsInBothDirections(logger as Logger) as Boolean {
        return MenuModel.step(6, 1) == 0
            && MenuModel.step(0, -1) == 6
            && MenuModel.step(3, 1) == 4;
    }

    (:test)
    function menuItemsOpenTheirScreens(logger as Logger) as Boolean {
        return MenuModel.target(MenuModel.QUICK) == FlowModel.SCREEN_EXERCISE
            && MenuModel.target(MenuModel.MEASURE) == FlowModel.SCREEN_MEASURE
            && MenuModel.target(MenuModel.SETTINGS) == FlowModel.SCREEN_SETTINGS
            && MenuModel.target(MenuModel.PAIN) == FlowModel.SCREEN_PAIN
            && MenuModel.target(MenuModel.HISTORY) == FlowModel.SCREEN_SOON
            && MenuModel.target(MenuModel.ROUTINES) == FlowModel.SCREEN_SOON;
    }

    (:test)
    function menuCrownStartsAtTheTopAndGoesClockwise(logger as Logger) as Boolean {
        return MenuModel.angleOf(0) == 90.0f && MenuModel.angleOf(1) < 90.0f;
    }

    // ---- Language ------------------------------------------------------

    (:test)
    function languageDefaultFollowsTheWatch(logger as Logger) as Boolean {
        return LanguageModel.defaultFor(true) == LanguageModel.SPANISH
            && LanguageModel.defaultFor(false) == LanguageModel.ENGLISH;
    }

    (:test)
    function storedLanguageIsValidated(logger as Logger) as Boolean {
        return LanguageModel.normalize(1, 0) == LanguageModel.SPANISH
            && LanguageModel.normalize(0, 1) == LanguageModel.ENGLISH
            && LanguageModel.normalize(5, 1) == 1
            && LanguageModel.normalize("es", 0) == 0
            && LanguageModel.normalize(null, 1) == 1;
    }

    (:test)
    function languageRowsWrap(logger as Logger) as Boolean {
        return LanguageModel.move(0, -1) == 1 && LanguageModel.move(1, 1) == 0;
    }

    // ---- Flow routing --------------------------------------------------

    (:test)
    function firstOpeningShowsTheWelcome(logger as Logger) as Boolean {
        return FlowModel.afterLoading(false) == FlowModel.SCREEN_WELCOME
            && FlowModel.afterLoading(true) == FlowModel.SCREEN_FACE;
    }

    (:test)
    function languageContinuesToTheSensorOnlyTheFirstTime(logger as Logger) as Boolean {
        return FlowModel.languageLeadsToSensor(false) && !FlowModel.languageLeadsToSensor(true);
    }

    (:test)
    function backStackPopsAndNeverRemovesTheRoot(logger as Logger) as Boolean {
        var stack = new NavStack();
        stack.reset(FlowModel.SCREEN_FACE);
        stack.push(FlowModel.SCREEN_MENU);
        stack.push(FlowModel.SCREEN_EXERCISE);
        var one = stack.pop() == FlowModel.SCREEN_MENU;
        var two = stack.pop() == FlowModel.SCREEN_FACE;
        var root = stack.pop() == null;
        return one && two && root && stack.top() == FlowModel.SCREEN_FACE && stack.depth() == 1;
    }

    (:test)
    function replaceAndResetShapeTheHistory(logger as Logger) as Boolean {
        var stack = new NavStack();
        stack.reset(FlowModel.SCREEN_LOADING);
        stack.replace(FlowModel.SCREEN_WELCOME);
        stack.push(FlowModel.SCREEN_LANGUAGE);
        stack.push(FlowModel.SCREEN_SENSOR);
        var deep = stack.depth() == 3;
        stack.reset(FlowModel.SCREEN_FACE);
        return deep && stack.depth() == 1 && stack.top() == FlowModel.SCREEN_FACE;
    }

    // ---- Sensor states -------------------------------------------------

    (:test)
    function sensorAsksBeforeAnythingElse(logger as Logger) as Boolean {
        return SensorFlow.resolve(false, SensorReader.STATE_READY, true) == SensorFlow.VIEW_ASK
            && SensorFlow.resolve(false, SensorReader.STATE_UNAVAILABLE, false) == SensorFlow.VIEW_ASK;
    }

    (:test)
    function sensorStatesFollowTheReader(logger as Logger) as Boolean {
        return SensorFlow.resolve(true, SensorReader.STATE_STARTING, true) == SensorFlow.VIEW_CHECKING
            && SensorFlow.resolve(true, SensorReader.STATE_READY, true) == SensorFlow.VIEW_READY
            && SensorFlow.resolve(true, SensorReader.STATE_LOST, true) == SensorFlow.VIEW_LOST
            && SensorFlow.resolve(true, SensorReader.STATE_UNAVAILABLE, true) == SensorFlow.VIEW_UNAVAILABLE
            && SensorFlow.resolve(true, SensorReader.STATE_UNAVAILABLE, false) == SensorFlow.VIEW_DENIED;
    }

    (:test)
    function onlyFreshReadingsCountAsASensor(logger as Logger) as Boolean {
        return SensorFlow.hasSensor(true, SensorReader.STATE_READY)
            && !SensorFlow.hasSensor(true, SensorReader.STATE_LOST)
            && !SensorFlow.hasSensor(true, SensorReader.STATE_STARTING)
            && !SensorFlow.hasSensor(false, SensorReader.STATE_READY);
    }

    // ---- Face ----------------------------------------------------------

    (:test)
    function faceVariantPrefersTheSensorWarning(logger as Logger) as Boolean {
        return FaceModel.variant(false, true) == FaceModel.VARIANT_NO_SENSOR
            && FaceModel.variant(false, false) == FaceModel.VARIANT_NO_SENSOR
            && FaceModel.variant(true, true) == FaceModel.VARIANT_ROUTINE
            && FaceModel.variant(true, false) == FaceModel.VARIANT_REST;
    }

    (:test)
    function waterRisesWithTheWeekAndDropsWithoutSensor(logger as Logger) as Boolean {
        var none = FaceModel.waterLevel(FaceModel.VARIANT_REST, 0);
        var some = FaceModel.waterLevel(FaceModel.VARIANT_REST, 3);
        var all = FaceModel.waterLevel(FaceModel.VARIANT_REST, 9);
        var capped = FaceModel.waterLevel(FaceModel.VARIANT_REST, 5);
        return none < some && some < all && all == capped
            && FaceModel.waterLevel(FaceModel.VARIANT_NO_SENSOR, 5) < none;
    }

    (:test)
    function wordPicksNamesFromAList(logger as Logger) as Boolean {
        var days = "dom lun mar mié jue vie sáb";
        return FaceModel.word(days, 5).equals("jue")
            && FaceModel.word(days, 1).equals("dom")
            && FaceModel.word(days, 7).equals("sáb");
    }

    (:test)
    function clockFormatsBothHourStyles(logger as Logger) as Boolean {
        return FaceModel.clock(18, 4, true).equals("18:04")
            && FaceModel.clock(18, 4, false).equals("6:04")
            && FaceModel.clock(0, 5, false).equals("12:05")
            && FaceModel.clock(12, 30, false).equals("12:30");
    }
}
