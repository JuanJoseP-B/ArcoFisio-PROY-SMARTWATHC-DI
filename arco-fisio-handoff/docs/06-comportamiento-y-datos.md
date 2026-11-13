# 06 · Comportamiento, datos y accesibilidad

## Lógica de medición

- **Calibración:** con el brazo abajo, quieto durante 3 s, se guarda el desfase del sensor; esa lectura pasa a ser 0°. Si durante esos 3 s la lectura varía más de un umbral (p. ej. ±3°), se reinicia.
- **Ángulo actual:** inclinación del brazo respecto a la vertical (0° colgando, 90° horizontal, 180° arriba), con el desfase de calibración aplicado y la lectura suavizada.
- **Estados** (objetivo `T`, tolerancia `tol`, arco doloroso `[P1, P2]`), en este orden de prioridad:
  1. `P1 ≤ ángulo ≤ P2` → **Arco doloroso**.
  2. `ángulo > T + tol` → **Te pasaste** (diferencia = ángulo − T).
  3. `T − tol ≤ ángulo ≤ T + tol` → **En objetivo**.
  4. en otro caso → **Aproximándose** (faltan T − ángulo).
- **Repetición:** cuenta cuando se está **En objetivo durante ≥ 1 s continuo**. Si en ese tiempo se entra en Te pasaste o Arco doloroso, el sostén se reinicia. Tras contar, hay que **bajar por debajo de T − tol** antes de que pueda contar la siguiente.
- **Series:** al completar las repeticiones de una serie → descanso (si quedan series) → siguiente serie. Al completar la última → resumen.
- **Rango máximo de la sesión:** el mayor ángulo alcanzado.
- **Entradas al arco doloroso:** cuántas veces el ángulo entra en `[P1, P2]` (y en qué repeticiones).
- **Tolerancia:** por defecto ±5°. Configurable en Ajustes.
- **Sensor perdido:** si dejan de llegar lecturas durante unos 2 s en sesión → pausa automática, mensaje "Perdí tu sensor", el progreso queda guardado.

## Retroalimentación (visual + sonido + vibración)

Ver la tabla de semántica de estados en `02-identidad-y-tokens.md`. Reglas:

- El mensaje en texto es **siempre** la señal principal; color, sonido y vibración la refuerzan.
- Sonido y vibración se pueden desactivar por separado en Ajustes. Sin ellos, el texto y el color deben bastar.
- En el prototipo web, el sonido/vibración pueden simularse o implementarse con las APIs disponibles; en el producto real se esperan ambos.
- Descanso: tres tonos cortos al final del conteo; un pulso largo de vibración al llegar a cero.

## Datos (guardados localmente, sin cuentas ni servidor)

Modelo sugerido, independiente de la tecnología:

```
Settings   { idioma, sonido: bool, vibracion: bool, tolerancia: grados, primeraVez: bool }
Calibracion{ offset: grados, fecha }
ArcoDoloroso { inferior: grados, superior: grados, fecha }           // opcional
Rutina     { id, nombre, bloques: [Bloque], descansoSeg }
Bloque     { ejercicio: "abduccion"|"flexion", anguloObjetivo, repeticiones, series }
Sesion     { id, fecha, ejercicio, rutinaId?, objetivo, repsHechas, repsObjetivo,
             seriesHechas, seriesObjetivo, rangoMax, entradasArco: [{rep, angulo}], tolerancia }
```

- Las rutinas de ejemplo (Abducción suave, Flexión progresiva, Movilidad matinal) son datos semilla editables.
- **Borrar datos** elimina sesiones, rutinas y arco doloroso del dispositivo (con confirmación). Conserva idioma y permisos.
- Rango máximo y comparación con la sesión anterior se calculan a partir de `Sesion`.

## Guía IA (reglas locales)

No usa servicios externos. Ejemplos de reglas sobre las últimas N sesiones (el diseño muestra N = 3):

- Si el rango máximo sube en sesiones consecutivas → mensaje de progreso ("Tu rango subió 6° en tres sesiones. Sube con calma.").
- Objetivo sugerido: ligeramente por encima del rango máximo reciente, **sin entrar en el arco doloroso**.
- Si hubo entradas al arco doloroso → sugerir no pasar del límite inferior y revisar la marcación.
- Si el descanso fue omitido repetidamente → sugerir descansar más.
- Menos de 2 sesiones → "Aún no tengo datos".
- Siempre mostrar: "Guía calculada en tu dispositivo. No es un diagnóstico médico."

## Accesibilidad (requisitos)

- Texto ≥ 4,5:1 de contraste (≥ 3:1 desde 24 px); mínimo 13 px.
- Significado **nunca solo por color**: texto + icono/patrón (el arco doloroso lleva rayado).
- Objetivos táctiles ≥ 44 px (los botones del diseño son de 48–56 px).
- Controles reales (`button`, `a`, `input`), con `aria-label` en los que solo tienen icono. Elementos decorativos `aria-hidden`.
- Estado de sesión anunciable por lector de pantalla (región `aria-live="polite"` con el mensaje de estado; solo cambios de estado, no cada lectura).
- Respetar "reducir movimiento" (ver `04-animaciones.md`).
- Navegación completa por teclado/foco visible (anillo de 3 px `acc2`) en la versión web.

## Consideraciones técnicas de sensor (si es web)

- Se usa el sensor de orientación/movimiento del teléfono; en algunos navegadores (p. ej. iOS) requiere un permiso explícito disparado por un gesto del usuario, y solo funciona en contexto seguro (HTTPS).
- Si no hay sensor, mostrar el estado "Sensor no disponible"; no simular datos salvo en un modo de demostración claramente rotulado.
