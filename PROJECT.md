# Arco Fisio · Estado vigente del proyecto

Actualizado: 2026-11-13. Leer al iniciar o retomar trabajo.

## Alcance

**Solo app nativa Garmin Forerunner 165. Web y demo canceladas por completo.** No desarrollar fases web, desplegar en Vercel ni usar el teléfono como sensor sustituto. El código web permanece como antecedente, sin trabajo futuro autorizado.

Fuentes vigentes: [AGENTS.md](AGENTS.md), [SPEC Garmin](docs/spec-v2.md), [revisión de fases 02–03](docs/phase-02-03-review.md). El [handoff Marea](arco-fisio-handoff/README.md) es referencia visual nativa, no un encargo web.

## Fases

| Fase | Estado |
|---|---|
| 00 | Integrada en `develop`, `28ac8d3`; entorno y plantilla verificados. |
| 01 | Sensor/calibración/diagnóstico implementados. Validación física pendiente: no hay reloj disponible. [Handoff](docs/phase-01-handoff.md), [plan físico](docs/sensor-test-plan.md). |
| 02 | Integrada en `develop` mediante `47b11ac`. Normal y tests compilan; 59 tests pasan. Revisión visual detecta superposición en Ajustes y explicaciones truncadas en menú. Objetivo mínimo difiere del SPEC. |
| 03 | En curso en worktree separado, sin commits nuevos tras `fb9bcf6`. Estado local: compila (normal, tests, simulación) y **116/116 tests pasan** (último resultado medido); sesión de dos series, descanso, pérdida/recuperación, fallo/reintento de guardado y resumen observados en simulador con muestras sintéticas. Ediciones visuales posteriores sin compilar; faltan pantallas por observar, es/en, reapertura, decisiones de producto y cierre. [Handoff](docs/phase-03-handoff.md). |
| 04 | **Cancelada: demo web. No es trabajo pendiente.** |
| 05 | Pendiente: rutinas y reproductor Garmin, después del cierre de 03. |
| 06 | Pendiente: historial, guía local y ajustes Garmin. |
| 07 | Pendiente: entrega `.prg`, instrucciones y validación en reloj físico. Sin web ni portafolio web. |

## Ubicación del trabajo

Comprobar de nuevo con `git worktree list` al retomar:

- Principal `C:/Users/jjper/Documents/3.PROY-SMARTWATCH-DI`: rama `feature/02-v2-identidad-navegacion`, `4416df2`, cambios locales web anteriores a la cancelación. Preservarlos.
- `C:/Users/jjper/Documents/3.PROY-SMARTWATCH-DI-worktrees/phase01`: rama `feature/01-v2-watch-sensor`.
- `C:/Users/jjper/Documents/3.PROY-SMARTWATCH-DI-worktrees/phase03`: rama `feature/03-v2-sesion-garmin`, `fb9bcf6`, más cambios locales sin commit. **Aquí está fase 03**, no en la carpeta principal.

No cambiar ramas ni descartar trabajo para localizar una fase. Las copias antiguas de documentos en otros worktrees pueden preceder a la cancelación; trasladar allí el alcance vigente antes de continuar. Consultar el informe para distinguir qué se compiló y probó.

## Próximo trabajo

1. Recompilar fase 03 (normal, tests, simulación) y ejecutar pruebas: hay ediciones de botones, menú y cadenas sin compilar. Detalle en [handoff de fase 03](docs/phase-03-handoff.md).
2. Observar en simulador, es y en, las pantallas pendientes (rango, arco doloroso, pausa, terminar anticipado, Ajustes, menú sin sensor) y corregir desbordes.
3. Comprobar persistencia al cerrar y reabrir la app, y que los avisos (`Cues`) no fallen.
4. Acordar con el usuario prioridad/conteo del arco y el objetivo mínimo (SPEC 0°; código 10°). No inventar aprobación.
5. Actualizar documentación con lo medido, hacer commits atómicos y proponer el cierre de 03. Medición física pendiente.
6. Tras cierre y aprobación de 03, continuar con **05**, nunca con la demo 04.

## Arquitectura y pruebas

Código activo: `ArcoFisioApp/`, Monkey C/Connect IQ, `fr165`, API mínima 5.2.0; SDK local observado 9.3.0. `source/logic/`: modelos puros; `source/ui/`: vistas; `SensorReader`/`ArmTracker`: muestras; `Application.Storage`: persistencia; `resources*/strings/`: es/en; `Palette.mc`: colores.

Compilar normal/tests con `-d fr165 -l 3 -w`; simulador abierto antes de `monkeydo ... fr165 /t`. [Comandos reproducibles](docs/phase-01-handoff.md). Clave y `.prg` fuera de Git. npm/navegadores no son requisitos de fase Garmin.

## Antecedentes, no instrucciones vigentes

[Spec web archivado](docs/spec-web-v1-archive.md), [contexto anterior](docs/project-before-watch-only.md), `src/`, `docs/design-reference/` y QA web histórica. No son entregables pendientes.

Actualizar este archivo al cambiar estado, rutas, comprobaciones o decisiones. Compilar no equivale a aprobar una fase.
