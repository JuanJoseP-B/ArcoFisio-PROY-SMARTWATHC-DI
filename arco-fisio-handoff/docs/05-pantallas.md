# 05 · Pantallas, estados y navegación

Cada pantalla es un círculo de 384 px. Los **textos y medidas exactos** están en `reference/NN-Nombre.dc.html` (copia navegable en `preview/NN-Nombre.html`). Aquí se resume propósito, estados, contenido y navegación.

Convenciones: [→ NN] = navega a la pantalla NN. "Marea n/5" = fase del hilo (ver `04-animaciones.md`).

## 01 · Intro y carga (marea 1/5)
- **Carga** (cada apertura, 3,8 s): gota → ola sube → Hipo emerge → "Arco Fisio" + "tu hombro, a su ritmo".
- **Bienvenida** (solo primera vez): Hipo pequeño, "Hola, soy Hipo.", "Te acompaño a mover tu hombro con calma.", botón **Comenzar** [→ 02].
- Apertura posterior a la primera: carga → [→ 04].

## 02 · Idioma (2/5)
- **Elegir**: lista Español (seleccionado, con marca) / English / Português + **Continuar**.
- **Confirmado**: marca menta, "Listo", "Idioma: Español. Puedes cambiarlo en Ajustes.", **Siguiente** [→ 03].
- La lista de idiomas es ilustrativa; la app debe soportar traducción de todos los textos.

## 03 · Sensor y permisos (2/5)
- **Solicitar**: "Necesito tu sensor" / "Mide la inclinación de tu brazo. Los datos se quedan en este dispositivo." **Permitir**, "Ahora no".
- **Permiso denegado** (error recuperable, durazno): "Permiso denegado" / "Sin el sensor no puedo medir tu ángulo." **Abrir ajustes**, **Reintentar**.
- **Sensor no disponible** (gris): "Sensor no disponible" / "Este dispositivo no tiene sensor de movimiento. Prueba en otro teléfono." **Reintentar**, "Entendido". La app **no inventa lecturas**.
- **Sensor listo**: anillo con lectura en vivo "0°", pill "Sensor listo", **Continuar** [→ 04].

## 04 · Cara principal (3/5)
- **Reposo**: fecha ("jue 12 nov"), hora grande ("18:04"), pill "Semana 3 de 5 sesiones", botón **Menú** [→ 05]. La altura del agua del fondo crece con las sesiones de la semana.
- **Con rutina pendiente**: hora pequeña, "Toca tu rutina de hoy", "Abducción · 90° · 3 × 10", **Comenzar** [→ 10], enlace **Menú**.
- **Sensor desconectado**: pill durazno "Sensor desconectado", "Conéctalo para medir tu ángulo.", **Conectar** [→ 03], enlace **Menú**.

## 05 · Menú principal (3/5)
- **Menú radial** de 7 funciones en la corona: Medir rango [→ 08], Sesión rápida [→ 06], Rutinas [→ 09], Arco doloroso [→ 12], Historial [→ 17], Guía IA [→ 18], Ajustes [→ 19]. Cada botón 54 px con icono y `aria-label`; el enfocado (relleno `acc`) muestra su nombre y descripción en el centro con botón **Abrir**.
- **Sin sensor**: Medir, Sesión rápida y Arco doloroso atenuados y no accionables; el centro dice pill "Sin sensor" + "Medir, sesión y arco necesitan sensor" + **Conectar** [→ 03]. Rutinas, historial, guía y ajustes siguen activos.

## 06 · Selector de ejercicio (3/5)
- Dos tarjetas: **Abducción** ("Brazo hacia el costado", vista frontal) y **Flexión** ("Brazo hacia el frente", vista lateral). La elegida: borde, fondo bruma y marca. **Siguiente** [→ 07].

## 07 · Sesión rápida (3/5)
Cuatro pasos, un dato por pantalla, con selector `−  valor  +` (botones 56 px):
1. **Ángulo objetivo**: 90°, pasos de 5° (el agua y la muesca del borde muestran la meta).
2. **Repeticiones**: 10, de 1 en 1. Texto: "Cuenta al sostener el objetivo 1 s".
3. **Series**: 3.
4. **Descanso**: 30 s, pasos de 5 s. Línea de resumen "Abducción · 90° · 10 × 3" y botón **Empezar** [→ 13].
(Rangos sugeridos, no definidos en el diseño: ángulo 10°–180°, reps 1–50, series 1–10, descanso 5–180 s.)

## 08 · Rango y calibración (3/5)
1. **Instrucción**: "Deja el brazo abajo, relajado" / "Esa posición será 0°." **Estoy listo**.
2. **Calibrando**: anillo completo que se llena en 3 s, "2 s", "Quédate quieto", "Lectura estable · 0°". Si hay movimiento, se reinicia y el texto lo dice.
3. **Calibrado**: anillo menta, "Calibrado" / "Brazo abajo = 0°. Ahora levanta el brazo para medir tu rango." **Medir rango**.
4. **Medir rango**: dial en vivo, "128°", "Sube hasta donde llegues", pill "Máximo 128°", **Terminar** (guarda el rango).

## 09 · Biblioteca de rutinas (3/5)
- **Lista**: filas con nombre y "ángulo · series × reps · duración" (ej. "Abducción suave · 90° · 3 × 10 · 6 min") [→ 10]; chip **Filtrar**.
- **Filtros**: chips Ejercicio (Abducción/Flexión) y Duración (Hasta 5 min / 5 a 10 min); botón "Ver N rutinas".
- **Sin rutinas**: Hipo, "Aún no hay rutinas", "Crea la tuya o empieza con una sesión rápida." **Crear rutina** [→ 11], "Sesión rápida" [→ 06].

## 10 · Detalle de rutina (3/5)
- **Detalle**: ejercicio, nombre, 4 datos (objetivo, series × reps, descanso, duración), pill menta "Fuera de tu arco doloroso", **Iniciar** [→ 14].
- **Con aviso**: si el objetivo cae en el arco doloroso: pill durazno "Cruza tu arco doloroso", "120° queda dentro de 100° a 125°.", **Ajustar objetivo** (principal) y "Iniciar igual".

## 11 · Constructor de rutina (3/5)
- **Lista de bloques**: "Mi rutina", bloques (ej. "1 · Abducción · 90° · 10 reps"), **Añadir bloque**, **Guardar**.
- **Editar bloque**: chips de ejercicio + selectores de Ángulo y Reps (46 px) + **Listo**.
- **Guardada**: marca menta, "Rutina guardada", "Mi rutina · 2 bloques · 5 min", **Ver en rutinas** [→ 09].

## 12 · Arco doloroso (3/5)
1. **Instrucción**: etiqueta "Marcar arco doloroso", ángulo en vivo, "Sube despacio", "Toca Marcar donde empiece el dolor." Botón coral **Marcar inicio**.
2. **Marcando**: pill "Dolor desde 100°", ángulo en vivo, "Marca dónde termina", botón coral **Marcar fin**. El tramo marcado se rellena con el rayado coral en el anillo.
3. **Confirmación**: "Arco doloroso 100°–125°", "Lo evitaremos en tus sesiones.", **Guardar** [→ 04], "Repetir marcación".

## 13 · Sesión en vivo (4/5) — la pantalla clave
Dial completo (ver `03-geometria-del-reloj.md`) + texto central: etiqueta "Rep 3/10 · Serie 1/3", ángulo `big`, mensaje en cursiva, línea de detalle y pill de estado. Cuatro estados (ver tabla de semántica en `02-identidad-y-tokens.md`):

| Estado | Ejemplo | Mensaje | Detalle | Pill |
|---|---|---|---|---|
| Aproximándose | 64° | Sigue subiendo | Faltan 26° para el objetivo | Aproximándote |
| En objetivo | 90° | Sostén un segundo (+ barra de 1 s) | — | En objetivo (✓) |
| Te pasaste | 96° | Baja un poco | Pasaste el objetivo por 6° | Te pasaste +6° (!) |
| Arco doloroso | 106° | Baja, zona dolorosa | Tu arco: 100° a 125° | Arco doloroso (!) |

## 14 · Reproductor de rutina (4/5)
- **Reproduciendo**: anillo exterior = avance de toda la rutina; "Bloque 2 de 4", "Abducción · 90°", "Rep 4/10", pill "En curso", botones **Pausar** y **Siguiente bloque**.
- **Pausa**: anillo gris, pill "En pausa", "Tómate un respiro", **Continuar**, **Terminar** [→ confirmación 20].
- **Avance**: marca menta, "Bloque 2 listo", "Sigue: Flexión · 90° · 8 reps", **Siguiente bloque**, "Repetir este bloque".

## 15 · Descanso (4/5)
- **Descansando**: etiqueta "Descanso · serie 1 de 3", tiempo `big` ("0:24"), "Suelta el hombro", "Sigue la serie 2 · 90°", **Saltar**. Anillo y agua bajan con el tiempo.
- **Últimos segundos**: anillo menta, pill "Descanso terminado", "0:03", "Prepárate para la serie 2", **Empezar ya**. Sonido: tres tonos cortos; vibración: 1 pulso largo al llegar a cero.

## 16 · Resumen de sesión (5/5)
- **Resumen**: "Sesión completa", "Rango máximo 94°", "30/30 reps · 3/3 series", pill menta "+6° vs la anterior", **Listo** [→ 04].
- **Comparación**: dos niveles de agua en el mismo reloj (línea punteada = anterior 88°; ola = hoy 94°), "+6° más alto", **Ver historial**.
- **Con avisos**: pill coral "Arco doloroso: 2 veces", "Reps 4 y 7, a partir de 100°.", **Revisar mi arco** [→ 12].

## 17 · Historial (5/5)
- **Lista**: fecha · ejercicio, "30 reps · 3 series", rango máximo a la derecha (94°, 88°, 86°).
- **Detalle**: rango máximo, reps, series, pill "Sin arco doloroso", **Volver**.
- **Sin datos**: "Aún no hay sesiones" / "Tu primera sesión aparecerá aquí." **Sesión rápida**.

## 18 · Guía IA (5/5)
Reglas locales sobre sesiones previas. No es un servicio externo ni un diagnóstico.
- **Mensaje**: "Tu rango subió 6° en tres sesiones. Sube con calma." + "Según tus últimas 3 sesiones". **Ver más**.
- **Detalle "Para hoy"**: objetivo sugerido (95°), "No pases de 100° (tu arco)", "Descansa 40 s entre series" + aviso permanente "Guía calculada en tu dispositivo. No es un diagnóstico médico."
- **Sin datos**: "Aún no tengo datos" / "Con dos sesiones puedo darte una guía."

## 19 · Ajustes (5/5)
- **Lista 1**: Idioma (Español) [→ 02], Sonido (interruptor + "Sí/No"), Vibración (interruptor + "Sí/No"), **Más ajustes**.
- **Lista 2**: Tolerancia (± 5°), Borrar datos (borde coral, "No se puede deshacer"), Atrás.
- **Tolerancia**: selector `± 5°`, ejemplo "Con objetivo 90°, se da por alcanzado entre 85° y 95°."
- **Borrar datos**: "Borrar mis datos" / "Se eliminan sesiones, rutinas y arco doloroso de este dispositivo." **Borrar todo…** [→ confirmación], "Cancelar".

## 20 · Estados y diálogos (5/5)
- **Confirmar al terminar**: diálogo sobre velo oscuro: "¿Terminar la sesión?" / "Llevas 14 de 30 repeticiones." **Seguir** (principal) y **Terminar** (coral, secundaria).
- **Sensor desconectado en sesión**: pill durazno, "Perdí tu sensor" / "Pausé la sesión. Tu progreso está guardado." **Reconectar**, "Terminar sesión".
- **Sin datos para comparar**: resumen de primera sesión, pill "Primera sesión", "Aún no hay con qué comparar."
- **Error recuperable**: "No pude guardar" / "Tu sesión sigue aquí. Inténtalo de nuevo." **Reintentar**, "Más tarde".
- **Confirmar borrado**: "¿Borrar todo?" / "Esto no se puede deshacer." **Cancelar** (principal), **Sí, borrar** (coral).
- **Confirmación**: marca menta, "Datos borrados" / "Empezamos desde cero, con el mar en calma." **Aceptar**.

## Mapa de navegación

```
Carga → (1.ª vez) Bienvenida → Idioma → Sensor → Cara
Carga → (siguientes veces) Cara
Cara → Menú → { Medir/Calibrar · Sesión rápida · Rutinas · Arco doloroso · Historial · Guía IA · Ajustes }
Sesión rápida: Ejercicio → Ángulo → Reps → Series → Descanso → Sesión en vivo ⇄ Descanso → Resumen → Cara
Rutinas: Lista → Detalle → Reproductor (⇄ Descanso) → Resumen
Rutinas vacías → Constructor → Guardada → Lista
Resumen (con avisos) → Arco doloroso
Ajustes → Idioma · Tolerancia · Borrar datos → Confirmar → Éxito
```
