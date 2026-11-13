# Plan de pruebas del sensor en el Forerunner 165

Para ejecutar cuando haya un reloj físico disponible. Cubre el criterio de la fase 01 (`spec-v2.md` §4) y las verificaciones del reloj de §5. Los resultados se anotan en [phase-01-device-record.md](phase-01-device-record.md). Ninguna lectura de este plan es una medición clínica validada.

Hasta que se complete, **la fase 01 queda abierta** y las fases 03 en adelante (sesión guiada) se construyen con las reglas del motor y valores configurables en `SensorConfig.mc`, que se ajustan con lo medido aquí.

## 0. Qué se necesita

| Elemento | Detalle |
|---|---|
| Reloj | Forerunner 165 estándar, con el firmware actualizado. Anotar versión. |
| Cable | USB de datos del reloj. |
| Archivo | `ArcoFisioApp/arco-fisio.prg` compilado desde el commit que se va a probar. |
| Referencia de ángulo | Transportador o goniómetro de bolsillo; alternativa: aplicación de inclinómetro en un teléfono fijado a una regla. Una persona ayudante que lea el ángulo es lo ideal. |
| Apoyos | Cinta métrica, cronómetro (o vídeo a 60 fps para medir demoras), pared lisa con marcas a 0°, 45°, 90° y 135°. |
| Registro | Una copia de `phase-01-device-record.md` por sesión de prueba. |

## 1. Instalar en el reloj

1. Compilar: ver los comandos de `phase-01-handoff.md`. Anotar `git rev-parse --short HEAD`.
2. Conectar el reloj por USB. Aparece como unidad.
3. Copiar `arco-fisio.prg` a `GARMIN\Apps` del reloj. Expulsar con seguridad y desconectar.
4. En el reloj abrir la lista de aplicaciones y entrar en Arco Fisio.
5. Si no aparece: confirmar que el archivo se compiló para `fr165` y que el reloj tiene espacio.

Criterio: la app abre y muestra el estado del sensor en menos de 5 s.

## 2. Preparación fija para todas las pruebas

- Reloj en la **misma muñeca** y con el **mismo ajuste** en toda la sesión (anotar cuál). Pantalla hacia arriba cuando el brazo cuelga.
- Una sola persona probadora por sesión. Anotar estatura y brazo dominante.
- Ajustes del reloj: sonido y vibración activados (se prueban en el paso 7).
- Batería superior al 30 %. Modo «No molestar» desactivado.
- Repetir toda la serie en dos sesiones distintas (otro día) si es posible, para separar la repetibilidad de un mal día.

## 3. Calibración (canvas 08)

1. Brazo extendido hacia abajo, relajado, junto al cuerpo. Entrar en calibración.
2. Quedarse quieto 3 s. Debe contar y terminar con «Calibrado».
3. Repetir mal a propósito: mover el brazo a mitad de cuenta. Debe reiniciar la cuenta y decirlo.
4. Cerrar y abrir la app: la calibración debe restaurarse sin repetirla.

Registrar: tiempo real de la cuenta, cuántas veces reinició con quietud razonable (si reinicia sin motivo, el umbral `CALIBRATION_MAX_SPREAD_DEG` es demasiado estricto), y si la calibración se restauró.

## 4. Lecturas de referencia (criterio principal)

Con el brazo **extendido** y el codo recto, en el plano que usará la persona (abducción lateral). Por cada postura:

1. Colocar el brazo a la referencia con ayuda del ayudante. Esperar que la lectura se estabilice.
2. Anotar: ángulo de referencia, lectura estable del reloj, variación visible (mín–máx durante 5 s) y demora desde que el brazo llega hasta que la lectura se estabiliza.
3. Volver el brazo abajo y repetir **3 veces** la misma postura sin recalibrar.

Posturas: **0°, 45°, 90° y por encima de 90° (por ejemplo 135°)**. Después, una serie extra a 90° con **recalibración entre repeticiones** para medir cuánto depende del momento de calibrar.

Cálculos al terminar (en la hoja o a mano):

- Error medio y máximo = |lectura − referencia| por postura.
- Dispersión entre las 3 repeticiones de una misma postura (máx − mín).
- Variación visible en reposo (ruido).

## 5. Qué cambia al alterar la postura

Con una postura de referencia conocida (se sugiere 90°), cambiar **una sola** cosa cada vez y anotar la lectura:

| Prueba | Cómo |
|---|---|
| Codo flexionado | Mismo ángulo de hombro, codo a unos 90°. |
| Muñeca girada | Palma arriba y palma abajo, hombro igual. |
| Plano del movimiento | Abducción lateral frente a elevación frontal. |
| Reloj en la otra muñeca | Solo si se quiere saber si importa el lado. |

El objetivo es documentar la limitación, no corregirla. La aplicación mide la inclinación de la muñeca, no la del húmero.

## 6. Cadencia, latencia y pérdidas (pantalla Diagnóstico)

1. Abrir Diagnóstico. Con el brazo quieto 30 s anotar: cadencia (Hz), edad de muestra (ms), origen del tiempo y pérdidas.
2. Repetir con la fuente de lectura por **lotes** y por **consulta** (se cambia en `SensorConfig.mc` y se recompila; anotar cuál se usó).
3. Latencia visible: mover el brazo de 0° a 90° de golpe y medir con vídeo el tiempo hasta que el número cambia. Promediar 5 movimientos.
4. Interrupción: provocar una pérdida de lecturas (salir y volver a entrar, apagar la pantalla, bajar la batería si es posible). Anotar qué muestra la app, cuánto tarda en declarar pérdida y si la lectura vuelve sola.
5. Con la pantalla en reposo 5 min, anotar si la cadencia se mantiene.

Decisión derivada: ajustar `SIGNAL_LOSS_TIMEOUT_MS` (hoy 2500 ms) a la cadencia medida, siempre por encima de periodo de lote más variación.

## 7. Tono y vibración

1. Usar la prueba de la app. Anotar qué soporta el reloj (la app lo informa).
2. Con el reloj en la muñeca y en movimiento, comprobar si se **percibe** cada señal, y si se distinguen **pulso lento, pulso rápido y doble pulso** (las zonas de aproximación, objetivo y sobrepaso).
3. Probar con el volumen del reloj bajo y alto. Anotar duraciones mínimas que se sienten.

## 8. Botones y toque

Comprobar START/STOP, UP, DOWN, BACK y toque en cada pantalla. Anotar cualquier acción que solo funcione con una de las dos vías.

## 9. Legibilidad en movimiento

Con el brazo en movimiento y a 45° y 90°, leer el número de grados a distancia normal. Anotar si se puede leer sin detenerse y qué tamaño de texto haría falta.

## 10. Criterios para decidir

| Resultado | Decisión |
|---|---|
| Error máximo ≤ 5° y dispersión ≤ 3° en las 4 posturas | La lectura desde la muñeca sirve para guiar. Conservar el motor y la tolerancia por defecto de ±2° con aviso de que la medida es de muñeca. |
| Error entre 5° y 10°, o dispersión entre 3° y 5° | Sirve con tolerancia ampliada y calibración repetida por sesión. Documentar la limitación en la app y en el portafolio. |
| Error > 10° o no repetible | No guiar con grados exactos. Reducir el alcance a zonas (lejos, cerca, objetivo) y registrar la limitación antes de la fase 03 completa. |
| Cadencia < 10 Hz o pérdidas frecuentes | Revisar la fuente de lectura y ajustar la detección de pérdida. |
| Vibración o tono no distinguibles | Resolver las zonas por patrón y duración, y apoyar el estado con texto y color. |

Los umbrales de la tabla son una propuesta de trabajo para decidir con datos; se confirman con quien dirige el producto antes de usarlos como criterio de aceptación.

## 11. Entrega de resultados

1. Completar `phase-01-device-record.md`.
2. Guardar las fotos o el vídeo en una carpeta fuera de Git y citar solo el nombre en el registro.
3. Actualizar `SensorConfig.mc` con los valores medidos y registrar el commit.
4. Cambiar el estado de la fase 01 a «cerrada» en `phase-01-handoff.md` y `PROJECT.md`.

## 12. Hasta entonces: lo que sí se puede comprobar sin reloj

- Las 30 pruebas unitarias de ángulo, cadencia y calibración (`monkeydo ... /t`).
- Compilación para `fr165` con `-l 3`.
- Estados de la interfaz en el simulador (sin sensor, error, textos largos en español e inglés).
- Simulación de lecturas: el menú *Simulation* del simulador permite enviar datos de sensor; sirve para ver el flujo, **no** para validar la precisión.
