# Arco Fisio · Garmin Forerunner 165

Aplicación nativa de telerrehabilitación del hombro para un **Garmin Forerunner 165 estándar**, desarrollada en Monkey C con Connect IQ. Proyecto académico de Diseño de Interfaces. Interfaz Marea en español e inglés.

**Alcance vigente: solo reloj. La web y la demo se cancelaron el 2026-11-13.** No se desarrollan ni se publican; los archivos web existentes se conservan como antecedentes.

## Para continuar el proyecto

1. Leer [AGENTS.md](AGENTS.md) y [PROJECT.md](PROJECT.md).
2. Usar el [SPEC Garmin vigente](docs/spec-v2.md).
3. Consultar la [revisión de fases 02 y 03](docs/phase-02-03-review.md).
4. Comprobar `git worktree list`: fase 03 está en un worktree separado.

Fase 03 en curso; fase 04 cancelada. Después siguen **05: rutinas**, **06: historial, guía y ajustes**, **07: entrega Garmin**.

## Ejecutar sin reloj

Se necesita Connect IQ SDK, perfil `fr165`, Java y clave local `developer_key` no rastreada. Código activo: `ArcoFisioApp/`.

Compilar normal y pruebas con `monkeyc -d fr165 -l 3 -w`; abrir simulador Connect IQ y ejecutar `monkeydo ... fr165 /t`. Ver [comandos completos](docs/phase-01-handoff.md).

Los modelos se prueban con muestras sintéticas de ángulo/tiempo. El simulador sirve para revisar pantallas y navegación; no valida precisión del sensor, vibración percibida ni legibilidad en movimiento. Cuando haya reloj, seguir el [plan físico](docs/sensor-test-plan.md).

## Diseño y antecedentes

El [handoff Marea](arco-fisio-handoff/README.md) sirve como referencia visual para la app nativa. Sus HTML no implican construir una web.

[Spec web archivado](docs/spec-web-v1-archive.md) y [contexto anterior](docs/project-before-watch-only.md): consulta histórica, sin fases futuras autorizadas. La entrega vigente es un `.prg` instalable con instrucciones y evidencia de pruebas.

## Flujo de trabajo

Una rama por fase; preservar trabajo local; actualizar `PROJECT.md` con cambios relevantes. Merge a `develop` tras aprobación del usuario; `main` lo integra el usuario. Detalles en [AGENTS.md](AGENTS.md).

Licencia MIT, ver [LICENSE](LICENSE).
