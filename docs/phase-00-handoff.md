# Continuidad — Arco Fisio v2

> Registro histórico de fase 00. Desde el 2026-11-13 el alcance es exclusivamente Garmin: la demo web fue cancelada. Las comprobaciones web de este registro describen trabajo pasado, no requisitos futuros. Ver [SPEC vigente](spec-v2.md).

Fuente vigente: `docs/spec-v2.md`. `docs/spec.md` describe la versión web histórica. Este archivo debe actualizarse al terminar cada fase con lo realizado, las comprobaciones, las decisiones y lo pendiente.

## Fase 00 · Base reproducible — terminada e integrada en `develop`

Integración registrada en `28ac8d3`.

Criterio del spec (§4): la plantilla compila y abre en el simulador del Forerunner 165, la web v1 abre con `?sim=1` y quedan documentados los comandos y el estado inicial.

### Estado inicial

- `ArcoFisioApp/` es la plantilla Connect IQ sin cambios funcionales: manifiesto `watch-app`, producto `fr165`, API mínima 5.2.0, sin permisos, idiomas ni barrels declarados. Fuentes: `ArcoFisioAppApp.mc`, `ArcoFisioAppView.mc`, `ArcoFisioAppDelegate.mc`, `ArcoFisioAppMenuDelegate.mc`.
- SDK activo: Connect IQ 9.3.0 (`%APPDATA%\Garmin\ConnectIQ\Sdks\connectiq-sdk-win-9.3.0-2026-10-20-95888f262`), con el perfil de dispositivo `fr165` instalado. Java: OpenJDK 21.
- La web v1 (`v1.0.0`) sigue en la raíz, sin cambios de código en esta fase.
- `.gitignore` excluye `/developer_key`, `*.prg`, `*.iq`, `*.debug.xml` y las carpetas generadas `ArcoFisioApp/gen/`, `mir/` e `internal-mir/`. La clave de firma no está rastreada.

### Comandos

Desde la raíz del repositorio, con `SDK` apuntando a la carpeta del SDK activo (la ruta está en `%APPDATA%\Garmin\ConnectIQ\current-sdk.cfg`):

| Paso | Comando |
| --- | --- |
| Compilar para Forerunner 165 | `"$SDK/bin/monkeyc.bat" -f ArcoFisioApp/monkey.jungle -d fr165 -o ArcoFisioApp/arco-fisio.prg -y developer_key` |
| Abrir el simulador | `"$SDK/bin/simulator.exe"` (hay que iniciarlo con `bin` como directorio de trabajo y dejarlo abierto) |
| Lanzar la app en el simulador | `"$SDK/bin/monkeydo.bat" ArcoFisioApp/arco-fisio.prg fr165` (queda en primer plano mientras la app corre) |
| Web v1 con ángulo simulado | `npm run dev` y abrir `http://localhost:5173/?sim=1` |
| Build de la web | `npm run build` |

### Comprobaciones (2026-11-12)

- **Compilación Garmin:** `BUILD SUCCESSFUL` para `fr165`.
- **Simulador:** `simulator.exe` abrió la ventana «CIQ Simulator». Tras `monkeydo`, el título pasó a «CIQ Simulator - Forerunner® 165 (5.2.0)» y la pantalla del reloj mostró la plantilla (texto de ayuda del menú y el icono del mono). La app quedó conectada por `shell.exe` en `127.0.0.1:1234`.
- **Causa del fallo anterior:** el intento previo ejecutó `monkeydo` sin que el simulador estuviera abierto y respondiendo, por eso devolvió `-1`. El orden correcto es simulador primero, esperar a que cargue y luego `monkeydo`.
- **Web v1:** `npm run build` pasó (196 módulos). Con el servidor de desarrollo y `?sim=1` se vieron la intro dentro del círculo y el deslizador de ángulo en 0° fuera del círculo, sin errores en la consola.
- **Pruebas web:** ver el resultado de `npm run test` en el resumen de cierre de la fase.

### Notas

- `.claude/launch.json` define el servidor `web-dev` (puerto 5180) para previsualizar la web desde Claude Code.
- `.prettierignore` tiene un cambio local sin confirmar (`node_modules` → `MOnode_modules`) que parece accidental. No forma parte de esta fase y queda a decisión del usuario.

## Siguiente: fase 01 · Sensor en el reloj

El estado del prototipo y el protocolo de medición se registran en [la continuidad de fase 01](phase-01-handoff.md).
