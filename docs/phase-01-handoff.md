# Fase 01 · Sensor en el reloj

**Estado:** en curso en `feature/01-v2-watch-sensor`, desde `develop` (`28ac8d3`). La fase 00 ya quedó integrada. El criterio de aceptación de la fase 01 está en `docs/spec-v2.md` §4 y requiere un Forerunner 165 físico.

## Qué quedó implementado

- `c4bdf7d` incorpora el cálculo de ángulo y sus pruebas. El prototipo recuperado añade el permiso `Sensor`, el lector de acelerómetro, la detección de falta de señal y el diagnóstico de cadencia, antigüedad de muestra y pérdidas.
- Calibración «brazo abajo» con tres segundos de estabilidad y guardado local. Pantallas de estado, ángulo en vivo, diagnóstico y prueba de tonos y vibración. Textos en español e inglés.
- El lector por lotes solicita 25 Hz con entregas de un segundo. También se puede probar la lectura por consulta cada 100 ms, que no distingue una muestra nueva de una repetida. Estas son configuraciones del prototipo. La cadencia real se debe medir en el reloj.

## Comprobaciones

- El paquete normal y el de pruebas compilaron para `fr165` con SDK 9.3.0 y verificación estricta (`-l 3`). El compilador avisa que escala el icono de la plantilla de 24×24 a 54×54.
- El lanzador `connectiq.bat` abrió el simulador. Las 30 pruebas de cálculo, cadencia y calibración pasaron (`passed=30, failed=0, errors=0`).

## Reproducir en Windows

Ejecutar desde la raíz en PowerShell. `developer_key` es la clave local y queda fuera de Git.

```powershell
$sdk = (Get-Content "$env:APPDATA\Garmin\ConnectIQ\current-sdk.cfg").Trim()
$bin = Join-Path $sdk 'bin'
& (Join-Path $bin 'monkeyc.bat') -f ArcoFisioApp/monkey.jungle -d fr165 -l 3 -w -o ArcoFisioApp/arco-fisio.prg -y developer_key
& (Join-Path $bin 'monkeyc.bat') -f ArcoFisioApp/monkey.jungle -d fr165 -l 3 -w -t -o ArcoFisioApp/arco-fisio-test.prg -y developer_key
Push-Location $bin
try { & .\connectiq.bat } finally { Pop-Location }
```

Una vez abierta la ventana, ejecutar primero las pruebas y luego el paquete normal desde la raíz. El flag de pruebas de `monkeydo.bat` en Windows es `/t`.

```powershell
& (Join-Path $bin 'monkeydo.bat') (Resolve-Path ArcoFisioApp/arco-fisio-test.prg).Path fr165 /t
& (Join-Path $bin 'monkeydo.bat') (Resolve-Path ArcoFisioApp/arco-fisio.prg).Path fr165
```

## Pendiente

- Revisar visualmente en el simulador el estado inicial y el paso a la pantalla de grados, incluido el estado sin lecturas o sin calibrar si corresponde.
- Instalar el paquete normal en un Forerunner 165 físico y abrir Arco Fisio. Calibrar con el brazo extendido hacia abajo y mantenerlo quieto durante la cuenta. Usar una referencia externa para repetir al menos tres veces las posturas a 0°, 45°, 90° y por encima de 90° (anotar el ángulo de referencia). Registrar valor estable, dispersión y demora visible. Repetir una postura flexionando el codo y girando la muñeca por separado.
- En Diagnóstico, registrar cadencia, edad de muestra, origen del tiempo y pérdidas. Comparar lotes y consulta. Anotar qué sucede si se interrumpen las lecturas y si se perciben el tono y la vibración con los ajustes del reloj activos. Comprobar botones y toque.
- Conservar las mediciones y decidir si la lectura desde la muñeca es suficientemente repetible para guiar la sesión. La fase queda abierta hasta completar esta prueba.
