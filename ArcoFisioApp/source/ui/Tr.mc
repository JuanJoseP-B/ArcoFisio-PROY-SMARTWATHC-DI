import Toybox.Lang;
import Toybox.WatchUi;

// Phase 02 texts in both languages, picked by the language chosen in the app
// (canvas 02). The table pairs the En* and Es* resources of
// resources/strings/phase02.xml, so a missing translation does not compile.
module Tr {

    // Active language (LanguageModel.ENGLISH or LanguageModel.SPANISH).
    var language as Number = 0;

    const TABLE = {
        :Tagline => [Rez.Strings.EnTagline, Rez.Strings.EsTagline],
        :WelcomeTitle => [Rez.Strings.EnWelcomeTitle, Rez.Strings.EsWelcomeTitle],
        :WelcomeBody => [Rez.Strings.EnWelcomeBody, Rez.Strings.EsWelcomeBody],
        :Begin => [Rez.Strings.EnBegin, Rez.Strings.EsBegin],
        :LangTitle => [Rez.Strings.EnLangTitle, Rez.Strings.EsLangTitle],
        :LangEnglish => [Rez.Strings.EnLangEnglish, Rez.Strings.EsLangEnglish],
        :LangSpanish => [Rez.Strings.EnLangSpanish, Rez.Strings.EsLangSpanish],
        :Continue => [Rez.Strings.EnContinue, Rez.Strings.EsContinue],
        :Done => [Rez.Strings.EnDone, Rez.Strings.EsDone],
        :LangChosen => [Rez.Strings.EnLangChosen, Rez.Strings.EsLangChosen],
        :LangChangeLater => [Rez.Strings.EnLangChangeLater, Rez.Strings.EsLangChangeLater],
        :Next => [Rez.Strings.EnNext, Rez.Strings.EsNext],
        :Back => [Rez.Strings.EnBack, Rez.Strings.EsBack],
        :SensorAskTitle => [Rez.Strings.EnSensorAskTitle, Rez.Strings.EsSensorAskTitle],
        :SensorAskBody => [Rez.Strings.EnSensorAskBody, Rez.Strings.EsSensorAskBody],
        :Allow => [Rez.Strings.EnAllow, Rez.Strings.EsAllow],
        :NotNow => [Rez.Strings.EnNotNow, Rez.Strings.EsNotNow],
        :SensorChecking => [Rez.Strings.EnSensorChecking, Rez.Strings.EsSensorChecking],
        :SensorDeniedTitle => [Rez.Strings.EnSensorDeniedTitle, Rez.Strings.EsSensorDeniedTitle],
        :SensorDeniedBody => [Rez.Strings.EnSensorDeniedBody, Rez.Strings.EsSensorDeniedBody],
        :Retry => [Rez.Strings.EnRetry, Rez.Strings.EsRetry],
        :SensorUnavailTitle => [Rez.Strings.EnSensorUnavailTitle, Rez.Strings.EsSensorUnavailTitle],
        :SensorUnavailBody => [Rez.Strings.EnSensorUnavailBody, Rez.Strings.EsSensorUnavailBody],
        :SensorLostTitle => [Rez.Strings.EnSensorLostTitle, Rez.Strings.EsSensorLostTitle],
        :SensorLostBody => [Rez.Strings.EnSensorLostBody, Rez.Strings.EsSensorLostBody],
        :Understood => [Rez.Strings.EnUnderstood, Rez.Strings.EsUnderstood],
        :SensorReady => [Rez.Strings.EnSensorReady, Rez.Strings.EsSensorReady],
        :SensorNotCalibrated => [Rez.Strings.EnSensorNotCalibrated, Rez.Strings.EsSensorNotCalibrated],
        :DaysShort => [Rez.Strings.EnDaysShort, Rez.Strings.EsDaysShort],
        :MonthsShort => [Rez.Strings.EnMonthsShort, Rez.Strings.EsMonthsShort],
        :DateFormat => [Rez.Strings.EnDateFormat, Rez.Strings.EsDateFormat],
        :WeekPill => [Rez.Strings.EnWeekPill, Rez.Strings.EsWeekPill],
        :Menu => [Rez.Strings.EnMenu, Rez.Strings.EsMenu],
        :RoutineToday => [Rez.Strings.EnRoutineToday, Rez.Strings.EsRoutineToday],
        :RoutineSummary => [Rez.Strings.EnRoutineSummary, Rez.Strings.EsRoutineSummary],
        :SensorOff => [Rez.Strings.EnSensorOff, Rez.Strings.EsSensorOff],
        :SensorOffBody => [Rez.Strings.EnSensorOffBody, Rez.Strings.EsSensorOffBody],
        :Connect => [Rez.Strings.EnConnect, Rez.Strings.EsConnect],
        :Open => [Rez.Strings.EnOpen, Rez.Strings.EsOpen],
        :NoSensor => [Rez.Strings.EnNoSensor, Rez.Strings.EsNoSensor],
        :NoSensorBody => [Rez.Strings.EnNoSensorBody, Rez.Strings.EsNoSensorBody],
        :MenuMeasure => [Rez.Strings.EnMenuMeasure, Rez.Strings.EsMenuMeasure],
        :MenuMeasureDesc => [Rez.Strings.EnMenuMeasureDesc, Rez.Strings.EsMenuMeasureDesc],
        :MenuQuick => [Rez.Strings.EnMenuQuick, Rez.Strings.EsMenuQuick],
        :MenuQuickDesc => [Rez.Strings.EnMenuQuickDesc, Rez.Strings.EsMenuQuickDesc],
        :MenuRoutines => [Rez.Strings.EnMenuRoutines, Rez.Strings.EsMenuRoutines],
        :MenuRoutinesDesc => [Rez.Strings.EnMenuRoutinesDesc, Rez.Strings.EsMenuRoutinesDesc],
        :MenuPain => [Rez.Strings.EnMenuPain, Rez.Strings.EsMenuPain],
        :MenuPainDesc => [Rez.Strings.EnMenuPainDesc, Rez.Strings.EsMenuPainDesc],
        :MenuHistory => [Rez.Strings.EnMenuHistory, Rez.Strings.EsMenuHistory],
        :MenuHistoryDesc => [Rez.Strings.EnMenuHistoryDesc, Rez.Strings.EsMenuHistoryDesc],
        :MenuGuide => [Rez.Strings.EnMenuGuide, Rez.Strings.EsMenuGuide],
        :MenuGuideDesc => [Rez.Strings.EnMenuGuideDesc, Rez.Strings.EsMenuGuideDesc],
        :MenuSettings => [Rez.Strings.EnMenuSettings, Rez.Strings.EsMenuSettings],
        :MenuSettingsDesc => [Rez.Strings.EnMenuSettingsDesc, Rez.Strings.EsMenuSettingsDesc],
        :SoonTitle => [Rez.Strings.EnSoonTitle, Rez.Strings.EsSoonTitle],
        :SoonBody => [Rez.Strings.EnSoonBody, Rez.Strings.EsSoonBody],
        :ExerciseTitle => [Rez.Strings.EnExerciseTitle, Rez.Strings.EsExerciseTitle],
        :Abduction => [Rez.Strings.EnAbduction, Rez.Strings.EsAbduction],
        :AbductionDesc => [Rez.Strings.EnAbductionDesc, Rez.Strings.EsAbductionDesc],
        :Flexion => [Rez.Strings.EnFlexion, Rez.Strings.EsFlexion],
        :FlexionDesc => [Rez.Strings.EnFlexionDesc, Rez.Strings.EsFlexionDesc],
        :WizStep => [Rez.Strings.EnWizStep, Rez.Strings.EsWizStep],
        :WizAngle => [Rez.Strings.EnWizAngle, Rez.Strings.EsWizAngle],
        :WizAngleHint => [Rez.Strings.EnWizAngleHint, Rez.Strings.EsWizAngleHint],
        :WizReps => [Rez.Strings.EnWizReps, Rez.Strings.EsWizReps],
        :WizRepsHint => [Rez.Strings.EnWizRepsHint, Rez.Strings.EsWizRepsHint],
        :WizSets => [Rez.Strings.EnWizSets, Rez.Strings.EsWizSets],
        :WizSetsHint => [Rez.Strings.EnWizSetsHint, Rez.Strings.EsWizSetsHint],
        :WizRest => [Rez.Strings.EnWizRest, Rez.Strings.EsWizRest],
        :WizRestValue => [Rez.Strings.EnWizRestValue, Rez.Strings.EsWizRestValue],
        :WizSummary => [Rez.Strings.EnWizSummary, Rez.Strings.EsWizSummary],
        :StartSession => [Rez.Strings.EnStartSession, Rez.Strings.EsStartSession],
        :SessionTitle => [Rez.Strings.EnSessionTitle, Rez.Strings.EsSessionTitle],
        :SessionBody => [Rez.Strings.EnSessionBody, Rez.Strings.EsSessionBody],
        :SettingsTitle => [Rez.Strings.EnSettingsTitle, Rez.Strings.EsSettingsTitle],
        :SettingsLang => [Rez.Strings.EnSettingsLang, Rez.Strings.EsSettingsLang],
        :SettingsDiag => [Rez.Strings.EnSettingsDiag, Rez.Strings.EsSettingsDiag],
        :SettingsDemo => [Rez.Strings.EnSettingsDemo, Rez.Strings.EsSettingsDemo],
        :Yes => [Rez.Strings.EnYes, Rez.Strings.EsYes],
        :No => [Rez.Strings.EnNo, Rez.Strings.EsNo]
    } as Dictionary<Symbol, Array<ResourceId> >;

    function setLanguage(value as Number) as Void {
        language = value;
    }

    function t(key as Symbol) as String {
        var pair = TABLE[key] as Array<ResourceId>;
        return WatchUi.loadResource(pair[language]) as String;
    }

    // Text with $1$, $2$... replaced by params.
    function f(key as Symbol, params as Array) as String {
        return Lang.format(t(key), params);
    }
}
