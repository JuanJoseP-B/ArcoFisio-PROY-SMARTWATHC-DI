# v2 phase 03 · Sesión completa en Garmin

Branch: `feature/03-v2-sesion-garmin` (worktree `phase03`). Spec: `docs/spec-v2.md` §4 fase 03. Reference: `arco-fisio-handoff/docs/05-pantallas.md` (canvas 08, 12, 13, 15, 16, 20), `03-geometria-del-reloj.md`, `06-comportamiento-y-datos.md`.

## Objective
Completar en el Forerunner 165 una sesión de dos series: sesión en vivo con el dial Marea, avisos, descanso, resumen y guardado; terminar antes y recuperar una interrupción de lecturas.

## Scope
Garmin only (`ArcoFisioApp/`). Screens 08 (rango y calibración), 12 (arco doloroso), 13 (sesión en vivo), 15 (descanso), 16 (resumen), 20 (diálogos). Port of the v1 engine to Monkey C. Web adaptation stays deferred (spec v2 phase 04).

## Constraints
No loose colours (`Palette`). Texts es/en in `phase03.xml` (both languages in each resources folder). No `setInterval` equivalents beyond the single app timer. Pain-arc priority is a pending product decision: `EngineConfig.PAIN_RULE` is the single switch, default v1; tests cover both. Commits atomic, no attribution (R9). No merge: wait for «aprobado».

## Tasks
- [x] T1 Zones, RepEngine, SessionRun, RunStats, pain-rule switch + tests (bc07757)
- [ ] T2 Workout (series, descanso, parar antes) + tests
- [ ] T3 Pain arc marking model, session log, settings store + tests
- [ ] T4 LiveSession (feeds the engine from tracker samples, sensor-loss pause) + tracker sample queue + tests
- [ ] T5 Strings (es/en), dial, cues, live screen 13, rest 15
- [ ] T6 Summary 16, dialogs 20, pain arc screen 12, range screen 08, navigation
- [ ] T7 Build + unit tests + simulator check; PROJECT.md and handoff

## Acceptance
Compiles for `fr165` (normal and test); unit tests green; two-set session, early stop and sensor-loss recovery observed in the simulator (sensor injected) or documented as unverified.

## Route log
T1 by a previous session. T2–T7: inline in the main chat (no subagents, by user request). Single writer.
