# Fase 03 · Handoff para continuar (Codex)

Fecha: 2026-11-13. Rama `feature/03-v2-sesion-garmin`, worktree `phase03`, último commit `fb9bcf6`. **Todo lo descrito aquí está sin confirmar en Git** (cambios locales). Alcance: solo app nativa Garmin Forerunner 165; web y demo canceladas, fase 04 cancelada. Leer antes `AGENTS.md`, `PROJECT.md` y `docs/spec-v2.md`.

## 1. Qué se comprobó en esta sesión

Se separa lo medido de lo supuesto. «Simulador» siempre significa Connect IQ Simulator `fr165` con **muestras sintéticas**, no un reloj real.

| Comprobación | Resultado |
|---|---|
| Compilación normal `monkey.jungle`, `-d fr165 -l 3 -w` | Correcta. Solo la advertencia conocida del icono 24×24. El error de `LiveModel.mc:46` descrito en la revisión **ya no ocurre** (el borrador de Codex lo corrigió). |
| Compilación de pruebas (`-t`) y de simulación (`simulator.jungle`) | Correctas. |
| Pruebas en simulador, estado local **antes** de mis cambios | 107/108: fallaba `Phase02Tests.menuItemsOpenTheirScreens` porque exigía que `MenuModel.PAIN` abriese a la vez `SCREEN_PAIN` y `SCREEN_SOON`. Prueba desactualizada, no fallo del código. |
| Corregida esa prueba (el último término pasa a `ROUTINES == SCREEN_SOON`), añadido `tests/IntegrationTests.mc` (8 pruebas) | **116/116 pasan** (108 + 8 nuevas), 0 fallos, 0 errores. Ese fue el último resultado medido. |
| Recorrido integrado en simulador con muestras sintéticas | Observado: bienvenida → idioma (es) → sensor listo → cara → menú radial → Sesión rápida → ejercicio → asistente (4 pasos) → calibración (cuenta 3 s, «Calibrado») → sesión en vivo con dial/agua → serie 1 con repeticiones y «Sostén logrado» → descanso (cuenta atrás, «Descanso terminado», «Empezar ya») → serie 2 → resumen. |
| Pérdida de señal en simulador («Cortar lecturas») | Observado: aparece «Perdí tu sensor», pausa la sesión, «Reconectar» sin señal no avanza, con señal vuelve y conserva repeticiones. |
| Fallo de guardado en simulador («Fallar guardado») | Observado: «No pude guardar. Tu sesión sigue aquí», «Reintentar» sigue fallando mientras falla, «Salir» pide confirmar («¿Salir sin guardar?» con «Seguir»/«Descartar»); al restaurar el almacenamiento «Reintentar» muestra el resumen guardado. |
| Resumen | Observado: máximo, «Sostenidas: 3 de 4», «4/4 reps · 2/2 series», y «Detalles» con «Primera sesión». |

Pruebas nuevas (`source/tests/IntegrationTests.mc`): usan `Prefs.testNamespace = true` y vectores de gravedad sintéticos que pasan por `SensorReader.injectSimulation` → `ArmTracker` (cola) → `SessionCoordinator` → `LiveSession` → `SessionArchive`. Cubren: nivel del agua en 0°/90°/180° y recortes; ángulo calibrado sintético; dos series con descanso hasta el registro guardado; muestras tomadas durante el descanso no cuentan en la serie siguiente; pérdida de señal pausa y no reproduce muestras viejas (el sostén en curso se reinicia); final anticipado con resultados parciales marcado como detenido; fallo de escritura, reintento sin duplicar y lectura tras «reiniciar» (nuevo `SessionCoordinator`); diálogos de pausa/terminar que no pierden avance.

## 2. Cambios hechos por mí que NO se compilaron ni probaron

Tras el último 116/116 hice estas ediciones y **no se recompiló** (el usuario interrumpió la ejecución). Compilar y volver a ejecutar las pruebas antes de confiar en ellas:

1. `source/ui/Widgets.mc`, `W.button`: la fuente de la etiqueta se elige entre `FONT_SMALL`, `FONT_TINY`, `FONT_XTINY` como la mayor que cabe con 28 px de holgura (antes dependía solo de si el ancho era < 150). Motivo: en simulador «Terminar», «Empezar ya» y «Pausa» tocaban el borde del botón.
2. `source/ui/ScreensHome.mc`, `MenuScreen.draw`: la descripción del menú pasa de `y=164, 196×60` a `y=160, 230×66` (con 60 de alto solo cabía una línea y salía «Calibra y mide t…»). **Comprobar que no choca con el botón «Abrir» (y=246).**
3. Cadenas acortadas en `resources/strings/phase02.xml`, `phase03.xml` y sus copias en `resources-spa/` (los dos directorios son idénticos salvo `strings.xml` y `drawables`; editar ambos): `AbductionDesc`, `FlexionDesc`, `WizAngleHint`, `WizRepsHint`, `WizSetsHint`, `LostBody`, `NoPainArc` (es y en). Motivo: se cortaban fuera del círculo o terminaban en «…».

Ningún commit se creó.

## 3. Lo que falta para cerrar la fase 03

### Verificación pendiente de lo ya escrito
- Recompilar normal, pruebas y simulación; ejecutar las pruebas (`/t`); confirmar 116/116 y que las ediciones de la sección 2 no rompen nada.
- Revisión visual es **y en** (solo se miró es, y no todas las pantallas). Pantallas **no observadas** todavía: Medir rango (`RangeScreen`), Arco doloroso (`PainScreen`: marcar inicio/fin, «muy corto», confirmar, guardar), diálogo de pausa («Pausa»), diálogo de terminar anticipado desde la sesión («Terminar» → «Seguir»/«Terminar ahora» → resumen «Sesión detenida»), resumen con arco/dolor, bienvenida/idioma en inglés, Ajustes, estado «sin sensor» del menú.
- Reapertura real: cerrar y abrir la app en el simulador y comprobar que el resumen/ajustes/arco guardados sobreviven (las pruebas lo cubren con un `SessionCoordinator` nuevo, no con un reinicio de la app).
- Avisos (`Cues.mc`: vibración/sonido en sostén, sobrepaso, dolor, fin de descanso): **no se observó ni se probó nada**; en simulador no se percibe vibración. Solo revisar que no lance excepciones y que el estado siga comunicándose por texto además de color/sonido.

### Defectos visuales conocidos (aún sin corregir o sin verificar tras mi ajuste)
- Píldora «SIMULADO» solapa títulos en la parte alta (solo build de simulación; aceptable, pero evitarlo si es fácil).
- Panel de simulación: etiquetas anchas («Ángulo manual», «Fallar guardado») tocan los bordes; herramienta de desarrollo, prioridad baja.
- Revisar de nuevo textos del menú sin sensor y del asistente en inglés (más largos).
- Tarjetas de «Ejercicio»: el nombre en `FONT_SMALL` puede rozar la marca de selección.
- Las advertencias de la revisión de fase 02 (superposición en Ajustes, explicaciones truncadas) deben revisarse tras la compilación: la fila «Demo: rutina pendiente» ya no existe; el menú se ajustó en esta sesión sin verificar.

### Decisiones de producto pendientes (no inventar aprobación)
1. **Prioridad y conteo del arco doloroso.** `EngineConfig.PAIN_RULE = PAIN_RULE_V1` (objetivo/sobrepaso antes que dolor) sigue por defecto; `PAIN_RULE_PAIN_FIRST` impide sostén dentro del arco pero igual registra la repetición al retornar. Hay que acordar aviso y conteo definitivos con el usuario y probar objetivo 90° con arco 70°–110° a 90° y arco 100°–125° a 106°.
2. **Objetivo mínimo del asistente.** El SPEC dice 0°–180° en pasos de 5°; `WizardRules.MINIMUMS` es 10°. Si el usuario confirma 0°, cambiar el mínimo, el test `angleStepsByFiveAndStopsAtTheRange` (hoy espera 10) y probar el límite 0°.
3. Reglas de rango y marcado: `PainArcModel` exige arco ≥ `MIN_PAIN_ARC_DEG` = 5°.

### Cierre de la fase
- Actualizar `PROJECT.md`, este handoff y `odd/tasks/v2-phase-03-session-garmin.md` con lo realmente observado.
- Commits atómicos en inglés, **sin** `Co-Authored-By`, `Claude-Session` ni «Generated with Claude Code»; rama `feature/03-v2-sesion-garmin`. No hay que hacer merge a `develop` sin «aprobado» del usuario. No empezar la fase 05 sin aprobación.
- No declarar validación física: precisión, repetibilidad, latencia, percepción de avisos y legibilidad en movimiento siguen pendientes hasta contar con reloj (`docs/sensor-test-plan.md`).

## 4. Qué debe intentar Codex, en orden

1. `git worktree list`; trabajar en `phase03`. No cambiar de rama ni descartar cambios locales.
2. Compilar las tres variantes y ejecutar pruebas (comandos en `docs/phase-01-handoff.md`; `simulator.jungle` para el paquete de simulación). Corregir lo que rompan mis ediciones de la sección 2.
3. Recorrer en simulador las pantallas no observadas (sección 3), en es y en en, con una captura por pantalla; corregir desbordes sin esconder información esencial.
4. Pedir al usuario las dos decisiones de producto antes de tocar `PAIN_RULE` o `MINIMUMS`.
5. Reabrir la app en simulador y comprobar persistencia.
6. Actualizar documentación con resultados medidos y proponer el cierre de la fase al usuario.

## 5. Mapa rápido del código de fase 03

- `logic/SessionCoordinator.mc`: dueño de la sesión en vivo, diálogos (`DIALOG_PAUSED/END/LOST`), cola, guardado (`SessionArchive`), `SavedArc`.
- `logic/SessionArchive.mc`: guarda con commit solo si `Application.Storage` acepta; `RecordBuilder` arma el registro.
- `logic/LiveModel.mc`, `ui/Dial.mc`, `Cues.mc`: estado del agua, dial y avisos.
- `ui/ScreensSession.mc` (`SessionScreen`, `SummaryScreen`), `ui/ScreensMeasure.mc` (calibración, rango, arco, panel de simulación), `ui/ScreensLive.mc`.
- `SimulatedSensor.mc` + `build-mode/simulation|production` (`BuildMode.SIMULATED`): vectores sintéticos solo en el paquete de simulación; el normal no inventa lecturas. En simulación el almacenamiento usa el prefijo `sim:`; en pruebas, `test:`.
- Panel de simulación: tocar la zona alta de la pantalla (y < 55) abre ángulo manual/automático, cortar lecturas y fallar guardado; el modo automático repite un ciclo de 7 s.
