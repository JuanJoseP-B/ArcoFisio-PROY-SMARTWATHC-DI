# Continuidad — Arco Fisio v2

Fuente vigente: `docs/spec-v2.md`. `docs/spec.md` describe la versión web histórica. Este archivo debe actualizarse al terminar cada fase con lo realizado, las comprobaciones, las decisiones y lo pendiente.

## Fase 00 · Base reproducible — en curso

- El manifiesto Connect IQ declara `fr165` y API mínima 5.2.0. La app es todavía la plantilla inicial.
- SDK activo: Connect IQ 9.3.0. Compilación comprobada: `monkeyc -f ArcoFisioApp/monkey.jungle -d fr165 -o ArcoFisioApp/arco-fisio.prg -y developer_key`, resultado `BUILD SUCCESSFUL`. En Windows se ejecutó `monkeyc.bat` desde `bin` del SDK. El compilador necesitó permisos fuera del sandbox para generar archivos temporales.
- `npm run build` pasó. `npm run dev -- --host 127.0.0.1` abrió la web con `?sim=1`: se observaron la intro y el deslizador de ángulo. El puerto asignado fue 5174 porque 5173 estaba ocupado.
- `.gitignore` excluye `/developer_key`, `*.prg`, `*.iq` y `*.debug.xml`. `git check-ignore` confirmó la clave y el PRG; la clave no está rastreada.
- Se intentó iniciar `simulator.exe` y ejecutar `monkeydo.bat ArcoFisioApp/arco-fisio.prg fr165`, pero no se observó una ventana del simulador ni se confirmó el arranque de la app. Una ejecución directa devolvió código `-1`. Se solicitó abrirlo desde VS Code para investigar. Este criterio sigue pendiente.
- Rama `feature/00-v2-bootstrap` creada desde `develop`. Commits: `7e4146a` (exclusiones), `b39458d` (plantilla Garmin), `e4c5660` (spec v2 y referencias). Los cambios preexistentes en `.prettierignore` se conservan sin confirmar.

## Pendiente para cerrar 00

1. Abrir el simulador Connect IQ de manera visible y comprobar que la plantilla aparece en Forerunner 165. Investigar el arranque de `simulator.exe` y `monkeydo` si sigue sin responder.
2. Solicitar la revisión del usuario antes de mezclar a `develop`, como indica `spec-v2.md` §5.
3. Actualizar este documento con la evidencia final y los commits. Fase 01: sensor en reloj y comprobaciones físicas descritas en `spec-v2.md`.
