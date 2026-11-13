# v2 phase 03 · Sesión completa en Garmin

Actualizado: 2026-11-13. Rama `feature/03-v2-sesion-garmin`, worktree `phase03`. Rigen `docs/spec-v2.md`, `PROJECT.md` y `docs/phase-02-03-review.md`.

**Solo Garmin. La demo web y fase 04 están canceladas por el usuario, no aplazadas.** Después de completar/aprobar esta fase sigue 05.

## Objetivo y alcance

Sesión de dos series en Forerunner 165: muestras con tiempo de captura, calibración/rango (08), arco (12), sesión Marea (13), descanso (15), resumen (16), diálogos (20), avisos y guardado. Terminación anticipada y recuperación de lecturas.

## Estado comprobado

- [x] T1 Zonas, repeticiones, sesión, estadísticas y regla configurable de dolor (`bc07757`).
- [x] T2 Series, descanso y terminación anticipada (`ad29998`).
- [x] T3 Modelos de arco y registro, serialización y pruebas (`fb9bcf6`).
- [x] T4 Modelo puro `LiveSession`, pruebas de dos series y pérdida de señal.
- [x] Integración T4 (local, sin commit): cola de `ArmTracker` → `SessionCoordinator` → `LiveSession`, con pruebas en `tests/IntegrationTests.mc`.
- [x] T5 (local, sin commit): textos, `LiveModel`, `Dial`, `Cues`, `Prefs`, vistas de sesión y descanso; el error de `LiveModel.mc:46` ya no existe. Avisos `Cues` no observados.
- [~] T6 Resumen, diálogos de pausa/pérdida/terminar, guardado y fallo observados en simulador. Pendiente observar: rango, arco doloroso, pausa, terminar anticipado desde la sesión, Ajustes, es/en completo.
- [ ] T7 Recompilar tras las últimas ediciones visuales, revisión visual es/en, reapertura de la app, decisiones de producto, documentación final y commits.

Snapshot confirmado `fb9bcf6`: 108/108. Estado local medido en 2026-11-13: compila normal/tests/simulación y **116/116 pasan** (corregida `menuItemsOpenTheirScreens`, añadidas 8 pruebas de integración). Después se editaron `Widgets.mc` (fuente de botones), `ScreensHome.mc` (descripción del menú) y cadenas es/en **sin recompilar**. Ver [handoff](../../docs/phase-03-handoff.md).

No hay commits nuevos desde `fb9bcf6`: todo el trabajo anterior está sin confirmar en Git.

## Decisiones pendientes

Prioridad y conteo del dolor; mínimo del asistente (10° implementado, 0° especificado). No sustituir decisiones por supuestos. La regla histórica sigue predeterminada.

## Aceptación

Compilación para `fr165 -l 3 -w` normal/tests; modelos correctos; dos series, descanso, final anticipado y recuperación observados en UI con muestras sintéticas identificadas. Guardado/reapertura y errores comprobados. Validación real del sensor pendiente hasta contar con reloj.

No iniciar una fase nueva ni hacer merge sin aprobación. No subagentes para este trabajo, conforme a la indicación previamente registrada en esta tarea.
