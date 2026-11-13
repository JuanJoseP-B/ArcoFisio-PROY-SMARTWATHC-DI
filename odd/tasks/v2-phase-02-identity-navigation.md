# v2 phase 02 · Identidad y navegación — solo Garmin

Fuente de verdad: `docs/spec-v2.md`. Estado vigente: `PROJECT.md`. La demo web fue cancelada por el usuario el 2026-11-13; no está aplazada.

## Objetivo

Navegar desde inicio hasta preparar una sesión en Garmin Forerunner 165, con identidad Marea, es/en, toque y botones, sin texto fuera del círculo ni superpuesto.

## Estado

- [x] Modelos, recursos y pantallas Garmin 01–07 implementados.
- [x] Integración en `develop` mediante `47b11ac`.
- [x] Compilación normal/tests para `fr165 -l 3 -w`; 59 pruebas pasan en simulador.
- [ ] Corregir superposición de texto/valor en Ajustes y explicaciones truncadas del menú.
- [ ] Revisar recorrido completo, ambos idiomas, toque/botones y límites del asistente.
- [ ] Resolver discrepancia de objetivo mínimo: 10° implementado, 0° en SPEC.

Tareas históricas T2–T5 web: **canceladas**, sin aceptación npm, navegador ni `?sim=1`. No retomarlas.

## Seguimiento

Ver `docs/phase-02-03-review.md`. Fase 03 está en otro worktree. No confundir integración de fase 02 con aceptación física o cierre de pendientes visuales.
