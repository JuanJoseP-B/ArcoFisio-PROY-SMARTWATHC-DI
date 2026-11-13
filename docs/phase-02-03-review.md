# Revisión de fases 02 y 03 — Garmin

Fecha: 2026-11-13. Alcance final confirmado por el usuario: **solo reloj Garmin Forerunner 165**. Demo y web canceladas; no forman parte de esta aceptación.

## Resultado

La base lógica es utilizable, pero **las fases no están completamente verificadas y la fase 03 aún no está terminada**. No se probó ningún sensor físico. Esta revisión no modificó código Monkey C ni aprobó/mezcló fases.

| Comprobación | Resultado |
|---|---|
| Fase 02, rama principal `4416df2`: compilación normal y tests, `fr165 -l 3 -w` | Correcta. Advertencia conocida: icono 24×24 escalado a 54×54. |
| Fase 02, `monkeydo ... fr165 /t` | **59 pruebas; 59 pasan, 0 fallos, 0 errores.** |
| Fase 02, observación parcial en simulador | Cara sin sensor, menú radial, Ajustes y selector de idioma observados. Se detectaron truncamientos/superposición. No se completó el recorrido de todas las pantallas por toque y botones. |
| Fase 03, copia del estado local del worktree | **No compila** con chequeo estricto: `source/logic/LiveModel.mc:46`, retorno `Double or Float` donde se declara `Float`. |
| Fase 03, snapshot del commit `fb9bcf6` | Paquete de pruebas compila. **108 pruebas; 108 pasan, 0 fallos, 0 errores.** No incluye los borradores locales posteriores. |
| Sesión integrada de dos series en UI Garmin | Pendiente: el motor existe, pero las pantallas todavía no lo invocan. La prueba de modelos no acredita un recorrido visual completo. |
| Reloj real, precisión, respuesta física de avisos | No comprobado: no hay smartwatch disponible. |

Para separar ambos estados de fase 03 se copiaron fuentes/recursos locales a una carpeta temporal y se exportó por separado el commit con `git archive`. Las compilaciones de revisión usaron esas copias, sin escribir sobre el worktree de implementación. Se generaron paquetes de revisión ignorados por Git en `ArcoFisioApp/`.

## Hallazgos que impiden cerrar las fases

### 1. El borrador de fase 03 falla compilación

`LiveModel.waterLevel`, línea 46, devuelve una expresión con `Math.cos(Math.toRadians(...))` cuyo tipo inferido es `Double or Float`, aunque la firma exige `Float`.

Error reproducido:
```text
Object of type 'PolyType<$.Toybox.Lang.Double or $.Toybox.Lang.Float>'
does not match return type '$.Toybox.Lang.Float'.
```

Siguiente corrección: normalizar explícitamente el tipo del resultado y comprobar niveles en 0°, 90° y 180°; recompilar el estado local completo. No se aplicó esa corrección durante la revisión.

### 2. El motor no está integrado en el recorrido

En el worktree de fase 03 existen `LiveSession`, `RepEngine`, `Workout`, `PainArcModel`, `SessionLog`, borradores `Dial`, `Cues`, `LiveModel` y cola en `ArmTracker`. Sin embargo, `AppState` y `ScreensSession` mantienen la navegación de fase 02 y la pantalla «La sesión en vivo llega en la fase 03».

Faltan los consumidores de `setRecording`/`drainInto`, integración de pausa y recuperación, vistas de sesión/descanso/resumen/arco, diálogos y escritura de resultados mediante `Prefs`. La serialización pura probada no demuestra persistencia integrada al reiniciar la app.

### 3. Diseño de fase 02 aún necesita ajustes

En el simulador `fr165`:
- Ajustes en inglés: «Demo: pending routine» y el valor «No» se superponen y el texto rebasa la fila. `SettingsScreen.row` dibuja etiqueta y valor en la misma línea sin reservar anchos independientes.
- Menú sin sensor: «Measure, session and arc need a...» corta la explicación; Ajustes muestra «Language and...». `MenuScreen.draw` usa cajas estrechas con `FONT_XTINY`; el contenido no cabe completo.
- La cara sin sensor y el selector es/en resultaron legibles en los estados observados.

Reservar espacio para etiqueta/valor, abreviar textos o redistribuir líneas y verificar ambos idiomas con las fuentes reales del dispositivo. No se puede afirmar que todo el diseño esté en orden a partir de los tests.

### 4. Límites y reglas pendientes

- `WizardRules.MINIMUMS` fija 10°; el SPEC exige 0°. Los tests actuales aceptan 10°, por lo que pasar no resuelve la contradicción.
- Prioridad del dolor sigue pendiente. La alternativa «pain first» impide sostén en el arco, pero registra la repetición al retornar. Resolver qué aviso y conteo se desean antes de cerrar 03.
- La cara incluye una rutina de demostración y un contador semanal provisional; no confundirlos con rutinas reales o estadísticas ya integradas.

## Qué cubren las 108 pruebas

Incluyen las 59 anteriores y 49 adicionales: bandas y límites, sostén de 999/1000 ms, muestras repetidas/antiguas, huecos y pausa, reglas alternativas de dolor, marcación del arco, serialización/restauración del registro, comparación con signo, dos series, descanso, salto, terminación anticipada y progreso ante pérdida de señal.

No cubren aceptación física, todo el diseño, la cola nueva integrada, los borradores locales que no compilan ni el guardado desde pantallas aún inexistentes.

## Cómo avanzar sin smartwatch

1. Terminar y compilar fase 03 en su worktree; conservar las correcciones visuales pendientes de 02.
2. Conectar pantallas al motor y al almacenamiento; añadir fuente sintética identificada y limitada a desarrollo/pruebas.
3. Reproducir elevación→sostén→retorno, dos series, descanso, sobrepaso, dolor, interrupción/reanudación y final anticipado en el simulador. Mantener los tiempos de captura.
4. Comprobar textos es/en, controles y persistencia integrada, incluidos fallos.
5. Al disponer del reloj, ejecutar `sensor-test-plan.md` y rellenar `phase-01-device-record.md`.

**La siguiente fase nueva es 05, rutinas y reproductor Garmin, después de terminar y revisar 03. Fase 04 cancelada.** El [SPEC vigente](spec-v2.md) incluye este orden y las condiciones de trabajo sin hardware.
