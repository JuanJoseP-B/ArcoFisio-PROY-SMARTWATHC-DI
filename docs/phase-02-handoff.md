# Fase 02 · Identidad y navegación (reloj)

**Estado:** pantallas 01 a 07 implementadas en `ArcoFisioApp/` para Forerunner 165, con toque y botones, sin necesitar el sensor. Rama `feature/02-v2-identidad-navegacion`.

## Qué hay

- Carga y bienvenida de primer uso (Hipo, Comenzar), idioma es/en guardado en `Application.Storage`, estados del sensor (pedir, denegado, no disponible, listo) decididos por `SensorFlow` a partir de un estado inyectado, cara (fecha, hora, píldora semanal, Menú; reposo, rutina pendiente, sensor desconectado), menú radial de 7 elementos (sin sensor se atenúan Medir, Sesión rápida y Arco doloroso y se ofrece Conectar), selector de ejercicio y asistente rápido (ángulo 10-180 paso 5 def. 90; repeticiones 1-50 def. 10; series 1-10 def. 3; descanso 5-180 paso 5 def. 30), resumen y Empezar hacia una pantalla «sesión» de relleno.
- Las vistas de diagnóstico de la fase 01 siguen accesibles desde el menú (Medir) y desde Ajustes.
- Lógica pura en `source/logic/`, pantallas en `source/ui/`, textos en `resources*/strings/phase02.xml` (162 cadenas por idioma).

## Comprobaciones

- Compilación normal y de pruebas para `fr165` con `-l 3 -w`: `BUILD SUCCESSFUL` (solo el aviso conocido del icono 24×24).
- Pruebas unitarias en simulador (`monkeydo ... /t`, con tiempo límite): `PASSED (passed=59, failed=0, errors=0)` (30 de fase 01 y 29 de fase 02).
- Ambos idiomas compilan (mismas 162 cadenas).

## Sin verificar (requiere sensor o reloj real)

- Cualquier lectura real del acelerómetro y las transiciones reales entre los estados del sensor.
- Aspecto y tamaño de toque en el reloj físico; revisión visual en el simulador no hecha en esta pasada.
- Que Medir, Sesión rápida y Arco doloroso respondan con lecturas vivas.
