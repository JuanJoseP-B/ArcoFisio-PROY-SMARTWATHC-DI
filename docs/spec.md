# Arco Fisio — spec.md

Simulador web de un smartwatch de telerrehabilitación del hombro. Proyecto académico (Diseño de Interfaces).
Reinicio limpio: el prototipo anterior (React + Tailwind, "60 %") se descarta como código. Solo se conservan sus ideas (zonas hápticas, síntesis de audio con Web Audio, objetivo angular).

---

## 0. Requisitos obligatorios (no negociables)

| # | Requisito | Cómo se verifica |
|---|---|---|
| R1 | Interfaz en **español e inglés**, cambiable en Ajustes y persistida | Toda cadena visible pasa por i18n; test que compara las claves de `es` y `en` |
| R2 | Existe la rama **`develop`** | `git branch -a` |
| R3 | El trabajo está dividido en **etapas**; cada etapa tiene su **rama** `feature/NN-nombre` y se mezcla a `develop` **solo si el usuario la aprueba** | Historial con `merge --no-ff` por etapa |
| R4 | El repositorio termina con **más de 100 commits** (meta de este spec: unos 150, atómicos) | `git rev-list --count develop` |
| R5 | Cuando el repo esté 100 % completo, **el usuario despliega en Vercel**. La app debe ser estática y compilar con `npm run build` | No hay servidor propio; HTTPS lo da Vercel |
| R6 | Vista final: **solo un círculo centrado simulando un reloj**, con toda la app dentro. Nada más en pantalla | Ver §3.4 |
| R7 | **La inclinación del brazo calcula el ángulo** con los sensores del teléfono, y el reloj guía al usuario para llegar al ángulo exacto o no pasarse | Ver §5 |
| R8 | Persistencia solo en **`localStorage`** (sin servidor, sin cuentas) | Ver §4 |
| R9 | Los mensajes de commit **NO incluyen** `Co-Authored-By`, ni `Claude-Session`, ni "Generated with Claude Code" | Ver §2.3 |

---

## 1. Qué es y qué problema resuelve

El paciente se recupera de una lesión de hombro. Muchos ejercicios exigen **ángulos específicos**. El reloj lo acompaña para que:

1. **Llegue** al ángulo prescrito (por defecto 90° de abducción, configurable de 0° a 180°).
2. **No se pase** de ese ángulo.
3. **Evite el arco doloroso** que él mismo marcó (por ejemplo 70°–110°).
4. No necesite mirar la pantalla todo el tiempo: el feedback también es sonoro y por vibración.

En la demostración el **teléfono hace de sensor y de pantalla del reloj**. El teléfono se sostiene o se sujeta al brazo; al inclinar el brazo, el ángulo cambia en vivo.

---

## 2. Reglas de trabajo para Claude Code

### 2.1 Fuentes de verdad

1. Este `spec.md`.
2. `docs/design-reference/` (copia exacta de lo diseñado en los chats «Arco Fisio» y «animaciones reloj web»). Ver §3.
3. Si algo se contradice: **manda `design-reference/` para lo visual y el movimiento; manda este spec para el comportamiento.**

### 2.2 Flujo Git (GitFlow)

- Ramas permanentes: `main` y `develop`. `main` solo recibe `develop` al final, y lo hace el usuario.
- Una rama por etapa: `feature/NN-nombre`, creada desde `develop` actualizada.
- Al terminar una etapa: **detenerse**, resumir qué se hizo y cómo probarlo, y **esperar la palabra "aprobado" del usuario**. Solo entonces:
  `git checkout develop && git merge --no-ff feature/NN-nombre -m "merge: feature/NN-nombre into develop"`.
- Si el usuario pide cambios, se hacen en la misma rama con nuevos commits y se vuelve a pedir aprobación.
- Una etapa a la vez. Nunca empezar la siguiente sin aprobación.
- Tras cada merge: `git tag v0.N.0` (N = número de etapa).

### 2.3 Commits

- Conventional Commits en inglés: `feat(scope)`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `merge`.
- **Atómicos**: un cambio lógico por commit (un componente, una función con su test, un fix). Se prefieren muchos commits pequeños. Cada etapa indica un mínimo.
- **Prohibido** añadir al mensaje: `Co-Authored-By`, `Claude-Session`, "Generated with Claude Code" o líneas de atribución similares.
- Para garantizarlo, en la etapa 0:
  - crear `.claude/settings.json` con la atribución de commits y PR vacía (`"attribution": { "commit": "", "pr": "" }`; si la versión instalada usa `"includeCoAuthoredBy": false`, usar esa clave);
  - crear `CLAUDE.md` con esta regla escrita.
- Antes de cada merge, comprobar: `git log --format=%B | grep -ci "co-authored-by"` debe dar `0`.

### 2.4 Calidad mínima por commit

`npm run typecheck` y `npm run test` en verde. `npm run build` en verde al cerrar cada etapa.

---

## 3. Diseño: cómo se traduce a código

### 3.1 Qué contiene `docs/design-reference/`

| Archivo | Para qué |
|---|---|
| `canvas/Main.dc.html` … `Resumen.dc.html` (11 archivos) | **Fuente exacta de las animaciones.** Cada archivo es una pantalla del reloj con su CSS, SVG y la matemática de la animación (`renderVals()`) |
| `canvas/canvas.json` | Orden de las 11 láminas y sus títulos |
| `design-system/README.md`, `motion.md`, `tokens.json` | Principios, tokens y reglas de movimiento del sistema de diseño |
| `captures/` (si el usuario las agrega) | GIF o video de cada lámina: **referencia visual definitiva** |

Los `.dc.html` **no se ejecutan fuera del editor de Claude Design** (dependen de su `support.js`). Se leen como código fuente y se **portan a React 1:1**: mismos tamaños, colores, duraciones, curvas y keyframes.

### 3.2 Discrepancia de paleta (importante)

Las láminas de animación **escriben sus colores directamente** y no coinciden con `tokens.json` del sistema de diseño:

| Rol | Valor en las láminas (manda) | Valor en `tokens.json` |
|---|---|---|
| Tinta y arco activo | `#1F3A2B` (verde profundo) | `#1C393F` (gunmetal) |
| Fondo de pantalla | degradado radial `#F8EEDD` → `#EBD6B0` (centro 50 % / 38 %) | `#FBF4E6` plano |
| Pista del anillo | `#E3CA9C` | `#EEDCB4` |
| Chip / superficie | `#EDD9B4` | `#F7E5C1` |
| Texto secundario | `#5C5140` | `#4D6266` |
| Acento | `#C8902E` (oro) y `#7A4E14` (bronce) | `#B8A85D` / `#6F6528` |
| Zona óptima | texto `#2F6B3F` sobre `#DDE7CF` | `#2F6B4F` / `#DCE8D6` |
| Zona dolor | `#A3392D` sobre `#F4D3C8` | igual |
| Descanso | anillo `#3E5F6A`, halo `#DCE4E3` | `#3E6170` / `#DCE4E3` |

**Decisión de este spec:** se sigue **tal cual lo animado en las láminas**. `tokens.json` se usa para escalas de tipografía, espaciado, radios y duraciones. Los valores van en `src/design/tokens.ts` y en variables CSS; **ningún color suelto** dentro de los componentes.

Además de la paleta, las láminas añaden: intro con escena de arquero (fuente Cinzel solo en la intro), patrón de "cuentas" triangular `#B5532F` / `#EDD9B4` / `#2F7F86` en bordes con baja opacidad, y destello de cristal radial en `circle at 28% 18%`.

### 3.3 Geometría y tipografía

- Pantalla 384 × 384 px. Marco negro `#000` de 12 px de relleno, anillo metálico `0 0 0 3px #9A9C9A`, sombra `0 18px 40px rgba(31,58,43,.25)`.
- Zona segura: ningún texto ni control fuera del círculo de 328 px. Arcos y anillos sí pueden tocar el borde.
- Roboto Flex. Escala: `hero` 72/72 peso 600 con cifras tabulares · `display` 44/48 · `title` 20/24 · `body` 16/20 · `button` 15/20 peso 600 · `label` 13/16 · `caption` 11/14 (mínimo absoluto).
- Anillo: radio 164, trazo 14, circunferencia 1030.44. **El ángulo ocupa la fracción `ángulo/360` de la circunferencia, empezando arriba y en sentido horario.** El marcador del objetivo se rota `ángulo` grados sobre el mismo círculo.
- Objetivo táctil mínimo 48 px.

### 3.4 Vista final (R6)

- Un único círculo centrado en la ventana (horizontal y vertical), sobre un fondo liso. **Sin** títulos, botones externos ni paneles.
- **Escala para encajar**: el reloj (384 + marco) se reduce con `transform: scale()` para caber en cualquier teléfono, sin barras de desplazamiento.
- Simulador de ángulo para computador: oculto por defecto. Solo aparece con `?sim=1` en la URL (control fuera del círculo). Sirve para ensayar sin teléfono.
- Bloquear selección de texto y gestos de zoom dentro del reloj.

### 3.5 Movimiento (catálogo extraído de las láminas)

Todas las animaciones se implementan con **CSS keyframes o `requestAnimationFrame`**, no con `setInterval`. Con `prefers-reduced-motion` todo se reduce a fundidos. Las transiciones entre pantallas son **radiales**: escala 0.92 → 1 más fundido desde el centro; nada entra por los lados rectos.

Duraciones: `instant` 90 ms · `quick` 180 ms · `standard` 300 ms · `emphasis` 500 ms · `ambient` 1600 ms.
Curvas: `standard` `cubic-bezier(.2,0,0,1)` · `enter` `(.05,.7,.1,1)` · `exit` `(.3,0,.8,.15)`.
Resortes usados en CSS: rueda `cubic-bezier(.34,1.56,.64,1)`, panal `cubic-bezier(.34,1.35,.64,1)`.

| # | Lámina (archivo) | Qué hace | Parámetros clave |
|---|---|---|---|
| 01 | Intro (`Main`) | Escena animada del arquero que dispara una flecha, iris que se abre, anillo de marca que se dibuja y aparece ARCO / FISIO / «Cada grado cuenta» | Ciclo 9000 ms. Hombre entra 5–18 %; arco se tensa 22–42 %; suelta 46–54 % con vibración; flecha sale 46–52 %; iris 56–66 %; anillo se traza 63–80 %; texto aparece 66–76 %; fundido final 94–100 %. Usar fracciones exactas del archivo |
| 02 | Goniómetro | Arco que sube hasta el objetivo, se mantiene y baja | Ciclo 5000 ms; sube 0–32 % con ease cúbico in-out, sostiene 32–52 %, baja 52–84 %. Al llegar: marcador del objetivo pasa de r 9 a r 14 (300 ms) y chip cambia a «Objetivo alcanzado» (`#DDE7CF` / `#2F6B3F`) |
| 03 | Rueda de ángulo | Rueda que gira con detenciones cada 5° | Paso cada 650 ms; rotación `-valor°` con transición 180 ms; muesca de flecha (`nock`) 650 ms; 72 marcas de 5°, mayores cada 30° con etiqueta |
| 04 | Arco doloroso | Banda de dolor sobre el anillo | Ciclo 7000 ms, ascenso 0–45 %, pausa 45–55 %, descenso 55–95 % con curva smoothstep. Banda `#F4D3C8` pulsa opacidad .55↔1 a 1600 ms. Dentro del rango, el marcador tiembla `sin(t/28)·1.6°` y el chip dice «Dolor · 70–110°» |
| 05 | Chips de zona | Cuatro chips con entrada escalonada y un micro-gesto cada uno | Entrada 500 ms `enter`, desfase 90 ms. Gestos: flecha vuela 1200 ms, zumbido 130 ms, sacudida 900 ms, caída 900 ms, respiración 1600 ms (escala .86↔1.04) |
| 06 | Progreso por pasos | 10 segmentos de 36° con flecha que cae en cada uno | Paso 700 ms; segmento activo en oro `#C8902E`, completos en `#1F3A2B`, pendientes `#E3CA9C`; ciclo de 13 pasos |
| 07 | Temporizador de descanso | Cuenta regresiva con arco que se tensa y suelta | Halo de 1600 ms; anillo `#3E5F6A`; al terminar anillo `#2F6B3F`, texto «¡Listo!» y la flecha sale en 600 ms |
| 08 | Launcher hexagonal | 7 celdas en panal con foco que se desplaza | Celda 84×96 con `clip-path` hexagonal; posiciones (0,0), (±96,0), (±48,±83); enfocada escala 1.2, vecinas .94, lejanas .82; transición 300 ms; enfocada fondo `#1F3A2B` texto `#EDD9B4` |
| 09 | Botón píldora | Pulsación con onda y flecha que sale | Primario 232×52, secundario 200×48 con borde 2 px `#7A4E14`; ciclo 2600 ms; onda de 20 px a escala 14 |
| 10 | Tarjetas y lista | Tarjetas que entran con golpe de flecha | Tarjeta 264×64, radio 24, desfase 120 ms; curva `enter` 5000 ms; trazo de progreso dasharray 63 |
| 11 | Resumen | Diana que recibe la flecha, ondas y datos que suben | Ciclo 5000 ms; flecha llega al 18 %; diana rebota .92 → 1.05 → 1; dos ondas escala 2.4 con 150 ms de desfase; texto sube 16 px con 120 ms de desfase |

---

## 4. Arquitectura por capas ("backend" en el navegador)

No hay servidor. Las capas "backend" son módulos de TypeScript puro, sin React, con tests. El frontend solo las consume.

```
src/
  domain/        BACKEND  lógica pura: ángulo, zonas, repeticiones, sesión, reglas de guía
  data/          BACKEND  repositorios sobre localStorage, esquema versionado, migraciones, semillas
  sensors/       BACKEND  adaptadores de sensor: DeviceMotion real y simulador; filtro y calibración
  feedback/      BACKEND  motor de audio (Web Audio), vibración, wake lock
  i18n/          BACKEND  diccionarios es/en y hook de traducción
  design/        FRONT    tokens, variables CSS, animaciones
  ui/            FRONT    componentes del reloj (anillo, rueda, chips, celdas, botones)
  screens/       FRONT    pantallas y máquina de navegación
  app/           FRONT    montaje, escala del reloj, modo simulador
```

Stack: Vite + React 18 + TypeScript estricto + Vitest. Estilos con CSS (variables y CSS Modules) para portar los keyframes sin traducirlos. Tailwind es opcional y no recomendado. **Mínimo de dependencias**: sin librería de rutas (el reloj navega con una máquina de estados) ni librería i18n (diccionario propio).

### 4.1 Modelo de datos en `localStorage`

Todas las claves con prefijo `arcofisio:v1:`. Cada valor es JSON `{ "schema": 1, "data": … }`.

| Clave | Contenido |
|---|---|
| `settings` | `{ lang: "es"\|"en", sound: boolean, vibration: boolean, targetDefault: number, tolerance: number, firstRunDone: boolean }` |
| `calibration` | `{ gravityRef: [x,y,z], calibratedAt: ISO, sensorMode: "device"\|"sim" }` |
| `painArc` | `{ from: number, to: number } \| null` |
| `routines` | `Routine[]`: `{ id, name:{es,en}, exercise: "abduction"\|"flexion", targetAngle, tolerance, reps, sets, restSec, builtin: boolean }` |
| `sessions` | `Session[]`: `{ id, routineId, startedAt, endedAt, maxAngle, hits, overshoots, painEntries, reps: {peak:number, held:boolean}[] }` |

Reglas:
- Acceso solo a través de `data/` (repositorios). Ninguna pantalla toca `localStorage` directo.
- Toda lectura/escritura dentro de `try/catch`. Si el almacenamiento está bloqueado o lleno, se usa un **almacén en memoria** y se avisa en Ajustes.
- Datos corruptos: se descartan con `console.warn` y se restauran los valores por defecto. Nunca se rompe la app.
- Migraciones: función `migrate(from, to)` con test aunque hoy solo exista v1.
- Semillas: 4 rutinas incluidas (abducción 90°, abducción 120°, flexión 150°, elevación asistida 60°), cada una con nombre en español e inglés.
- Límite de 200 sesiones; al superarlo se descartan las más antiguas.

---

## 5. Medición del ángulo con la inclinación (R7)

### 5.1 Cómo se calcula

Convención clínica: **0° = brazo colgando, 90° = brazo horizontal, 180° = brazo arriba.**

1. Lectura de `devicemotion.accelerationIncludingGravity` (vector gravedad en el sistema del teléfono) a la frecuencia del navegador.
2. **Calibración** («Medir rango» → «Brazo abajo»): con el brazo colgando, se guarda la gravedad normalizada `ĝ₀`.
3. En cada muestra: `ángulo = acos( clamp( ĝ · ĝ₀ , -1, 1 ) )` en grados. Es el ángulo entre la gravedad actual y la de referencia.
   - No depende de cómo esté girada la pantalla ni de en qué eje se rote, siempre que el movimiento sea una rotación respecto a la vertical (como la abducción y la flexión).
4. Filtro: media exponencial `α ≈ 0.25`, zona muerta de 0.5° y limitación de 0° a 180°. Constantes en un único archivo, con tests.
5. Estabilidad: el cálculo es una función pura `computeAngle(sample, calibration)` con tests (0°, 45°, 90°, 135°, 180°, vectores sin normalizar, ruido).

### 5.2 Adaptadores

Interfaz `AngleSource { start(); stop(); onSample(cb); requestPermission(): Promise<"granted"|"denied"|"unsupported"> }`.

- `DeviceMotionSource`: real. En iOS llama a `DeviceMotionEvent.requestPermission()` **dentro de un toque del usuario** (se hace en la pantalla de calibración).
- `SimulatedSource`: deslizador o animación para computador, solo con `?sim=1`.
- Si el permiso se niega o no hay sensor, mostrar un mensaje claro dentro del reloj, en ambos idiomas, y ofrecer el modo simulado.

### 5.3 Requisitos técnicos

- Los sensores exigen **HTTPS** (Vercel lo da). En desarrollo se prueba con `localhost` o con un túnel HTTPS.
- Mantener la pantalla encendida durante una sesión con `navigator.wakeLock` (si existe).
- La vibración usa `navigator.vibrate` (disponible en Android; en iOS no existe, por lo que el feedback visual y sonoro siempre debe bastar).
- El audio se desbloquea con el primer toque (política de autoplay).

### 5.4 Cómo se sujeta el teléfono (para la demostración)

Teléfono sujeto al brazo con una banda, o sostenido en la mano con el brazo extendido, **con la pantalla visible**. Limitación declarada: la gravedad no detecta giros alrededor del eje vertical (por ejemplo, rotación del hombro con el brazo en el plano horizontal).

---

## 6. Zonas y feedback

El ángulo es el estado central: `ángulo → zona → (visual + audio + vibración)`. Las zonas se calculan **relativas al objetivo `T` y a la tolerancia `tol`** (por defecto 2°), no con números fijos.

| Zona | Condición | Anillo y chip | Audio | Vibración |
|---|---|---|---|---|
| `far` | `ángulo < T − 30` | tinta `#1F3A2B`, chip «En camino» | clic suave cada 15° | ninguna |
| `approach` | `T−30 ≤ ángulo < T−8` | oro `#C8902E`, chip «Casi» | pulso lento, ~700 ms | pulso corto cada 700 ms |
| `near` | `T−8 ≤ ángulo < T−tol` | oro intenso, marcador crece | pulso rápido, ~300 ms | pulso cada 300 ms |
| `target` | `|ángulo − T| ≤ tol` | `#2F6B3F`, chip «Objetivo alcanzado», marcador r 9→14 | acorde de éxito | patrón doble |
| `overshoot` | `ángulo > T + tol` | `#A3392D` con parpadeo, chip «Te pasaste» | zumbido descendente | vibración continua corta |
| `pain` | `painFrom ≤ ángulo ≤ painTo` | banda `#F4D3C8` pulsante, temblor del marcador, chip «Dolor» | tono de aviso | patrón de aviso |
| `rest` | entre series | anillo `#3E5F6A`, temporizador | ninguno | ninguna |

- `pain` tiene prioridad sobre las zonas de aproximación, pero no sobre `target` si el objetivo cae dentro del arco (en ese caso se avisa en Detalle de rutina).
- Estados y frecuencias se definen **una sola vez** en `domain/zones.ts` y `feedback/`, con tests de fronteras (T−8, T−tol, T+tol).
- Las frecuencias del prototipo (350, 440, 580, 880, 1760 Hz; sierra 220→140 Hz) son un punto de partida: reescribirlas en un motor de audio limpio.
- La palabra siempre acompaña al color. Nunca solo color.
- Repetición válida: llegar a `target` y sostener ≥ 1 s. Contar picos y sobrepasos por repetición.

---

## 7. Pantallas y navegación

Máquina de estados (sin URL). Estado inicial: Intro → Cara del reloj. Atrás = gesto o botón dentro del círculo.

| Pantalla | Contenido | Datos |
|---|---|---|
| Intro | Lámina 01 | — |
| Cara del reloj | Hora grande (`display`), acceso al launcher | `settings` |
| Launcher hexagonal | 7 celdas: **Medir, Sesión, Rutinas, Resumen, Dolor, Guía IA, Ajustes** | — |
| Selector de modo | Elegir ejercicio (abducción / flexión) | `routines` |
| Configuración | **Rueda de ángulo** (0–180°, detenciones de 5°) para el objetivo; repeticiones y series | `routines`, `settings` |
| Medir rango | Calibración «Brazo abajo» y medición del rango máximo | `calibration` |
| Sesión | **Goniómetro en vivo** con zonas, repeticiones y chip de zona | `sessions` |
| Reproductor | Pausa, siguiente, terminar | — |
| Temporizador | Descanso entre series | `routines.restSec` |
| Resumen | Rango máximo, comparación con la sesión anterior, repeticiones | `sessions` |
| Biblioteca | Lista de rutinas (lista con scroll) | `routines` |
| Detalle de rutina | Datos de la rutina y botón iniciar | `routines` |
| Constructor | Crear y editar rutinas propias | `routines` |
| Arco doloroso | Marcar el rango que duele moviendo el brazo | `painArc` |
| Guía IA | Consejos. **Sin servicio externo:** motor de reglas local sobre las últimas sesiones; mensajes en es/en. Rotularlo «Guía IA» como en el diseño | `sessions`, `painArc` |
| Ajustes | Idioma, sonido, vibración, tolerancia, borrar datos | `settings` |

Primera ejecución: Intro → idioma → permiso de sensor + calibración → launcher.

---

## 8. Internacionalización (R1)

- Diccionarios `src/i18n/es.ts` y `en.ts` con tipo compartido: **si falta una clave en un idioma, no compila**.
- Idioma inicial: el del navegador (`es*` → español; cualquier otro → inglés). Se guarda en `settings.lang`.
- Cambio de idioma inmediato, sin recargar.
- Unidades y formatos: grados con `°`; fechas con `Intl.DateTimeFormat`; plurales con `Intl.PluralRules`.
- Los textos de la banda de chips y botones deben **caber en una línea** en los dos idiomas (el inglés suele ser más corto, pero el español no puede desbordar la zona segura). Test visual manual en ambos.
- Cadenas dentro de SVG (etiquetas de la rueda, etc.) también pasan por i18n.

---

## 9. Etapas

Cada etapa = una rama = un bloque de commits atómicos = una aprobación del usuario. Capas alternadas: **B** = backend (dominio, datos, sensores), **F** = frontend.
La suma de los mínimos por etapa es **152 commits** (R4 exige más de 100; el margen cubre fixes y ajustes tras la revisión del usuario).

### Etapa 0 — `feature/00-bootstrap` · Repo y reglas · (≥ 8 commits)
- `git init`, ramas `main` y `develop`, `.gitignore`, licencia.
- Vite + React + TS estricto, ESLint, Prettier, Vitest.
- Scripts: `dev`, `build`, `preview`, `typecheck`, `test`.
- `docs/design-reference/` con los archivos entregados, `docs/spec.md`.
- `CLAUDE.md` y `.claude/settings.json` (regla R9).
- README con cómo ejecutar y cómo probar en el teléfono.
- **Aceptación:** `npm run build` pasa; existe `develop`; ningún commit contiene `Co-Authored-By`.

### Etapa 1 — `feature/01-design-foundations` · F · Tokens, marco y escala · (≥ 10)
- `design/tokens.ts` y variables CSS desde la tabla de §3.2 y §3.3.
- Roboto Flex y Cinzel (solo intro) con `font-display: swap`.
- Componente `WatchBezel` (marco, anillo metálico, cristal) y `WatchScreen` con fondo degradado.
- Zona segura de 328 px, patrón de cuentas como componente SVG.
- Escala para encajar en cualquier teléfono y centrado.
- **Aceptación:** el círculo se ve idéntico al de las láminas; en un viewport de 360 px no hay desplazamiento; no quedan colores sueltos en componentes.

### Etapa 2 — `feature/02-domain-core` · B · Dominio puro · (≥ 12)
- `computeAngle`, filtro exponencial con zona muerta, límites.
- `classifyZone(angle, T, tol, painArc)` con todos los bordes.
- Máquina de repeticiones (llegar, sostener ≥ 1 s, contar picos y sobrepasos).
- Tests de cada función. Cobertura de `domain/` ≥ 90 %.
- **Aceptación:** `npm run test` verde; ningún import de React dentro de `domain/`.

### Etapa 3 — `feature/03-data-layer` · B · localStorage · (≥ 10)
- Cliente de almacenamiento con prefijo, versión, `try/catch` y respaldo en memoria.
- Repositorios `settings`, `calibration`, `painArc`, `routines`, `sessions`.
- Validación de forma de los datos y descarte de corruptos.
- `migrate()` con test; semillas de 4 rutinas bilingües; límite de 200 sesiones.
- **Aceptación:** tests con `localStorage` simulado, bloqueado y lleno; borrar datos devuelve a los valores por defecto.

### Etapa 4 — `feature/04-sensors` · B · Sensor de inclinación · (≥ 12)
- Interfaz `AngleSource`; `DeviceMotionSource` y `SimulatedSource`.
- Permiso en iOS desde un toque del usuario; detección de soporte y de HTTPS.
- Flujo de calibración «brazo abajo» que guarda `ĝ₀`.
- Wake lock; pausa del sensor cuando la pestaña se oculta.
- Hook `useAngle()` que expone `{ angle, status }`.
- **Aceptación:** en un teléfono real, con una pantalla de prueba temporal, el número cambia de 0° a ~90° al subir el brazo hasta horizontal y de vuelta a 0° al bajarlo; error comprobable de ±3° contra un transportador o un inclinómetro.

### Etapa 5 — `feature/05-motion-and-intro` · F · Movimiento e intro · (≥ 10)
- Utilidades de movimiento (curvas, duraciones, `prefers-reduced-motion`).
- Transición radial entre pantallas (escala .92→1 + fundido).
- Port de la lámina 01 (intro) con las fracciones exactas, usando `requestAnimationFrame`.
- **Aceptación:** la intro dura 9 s en bucle y coincide con la captura/lámina; con movimiento reducido se muestra un fundido simple.

### Etapa 6 — `feature/06-goniometer-session` · F+B · Goniómetro en vivo · (≥ 12)
- Componente `GoniometerRing` (lámina 02): arco, marcador, objetivo, línea punteada de referencia.
- `ZoneChip` (lámina 05) y lectura `hero` con cifras tabulares.
- Pantalla Sesión conectada a `useAngle()` + `classifyZone()` + máquina de repeticiones.
- **Aceptación:** al inclinar el brazo el anillo sigue el ángulo sin retrasos visibles; al llegar a T aparece «Objetivo alcanzado»; al pasarse, «Te pasaste».

### Etapa 7 — `feature/07-feedback-engine` · B · Audio y vibración · (≥ 10)
- Motor de audio con osciladores y envolventes: clic, pulsos de aproximación, acorde de éxito, zumbido de sobrepaso, aviso de dolor.
- Desbloqueo con el primer toque; volumen y mute desde Ajustes.
- Vibración por patrón de zona, con detección de soporte.
- Pulso visual `halo` y parpadeo rojo continuo del sobrepaso.
- **Aceptación:** cada zona suena y vibra distinto; con sonido apagado no suena nada; sin soporte de vibración no hay errores.

### Etapa 8 — `feature/08-navigation-launcher` · F · Navegación y launcher · (≥ 10)
- Máquina de navegación con pila y gesto atrás.
- Cara del reloj y Launcher hexagonal (lámina 08) con las 7 celdas.
- Selector de modo y botón píldora (lámina 09).
- Accesibilidad: foco visible, `aria-label`, orden de tabulación.
- **Aceptación:** se llega a todas las pantallas desde el launcher y se regresa sin pantallas atrapadas.

### Etapa 9 — `feature/09-config-and-measure` · F+B · Configuración y calibración · (≥ 10)
- Rueda de ángulo (lámina 03), 0–180° en pasos de 5° con detenciones.
- Pantalla Configuración: objetivo, repeticiones, series, descanso.
- Pantalla Medir rango y primera ejecución (idioma → permiso → calibración).
- Persistencia del objetivo y la calibración.
- **Aceptación:** al cerrar y reabrir el navegador se conservan objetivo y calibración.

### Etapa 10 — `feature/10-routines` · F+B · Rutinas y descanso · (≥ 14)
- Biblioteca (lista con scroll, lámina 10), Detalle de rutina, Constructor.
- Reproductor y Temporizador de descanso (lámina 07).
- Progreso por pasos (lámina 06) para series y repeticiones.
- CRUD de rutinas propias sobre `routines`.
- **Aceptación:** crear una rutina propia, ejecutarla completa con descansos y verla en la Biblioteca tras recargar.

### Etapa 11 — `feature/11-pain-arc-and-guide` · F+B · Arco doloroso y guía · (≥ 8)
- Pantalla Arco doloroso (lámina 04): marcar el rango moviendo el brazo.
- La zona `pain` activa en Sesión (banda, temblor, aviso).
- Motor de reglas de «Guía IA»: mensajes según el rango, los sobrepasos y los avisos de dolor; textos en es/en.
- **Aceptación:** definido 70°–110°, la sesión avisa al entrar en ese rango; la guía cambia el mensaje según los datos guardados.

### Etapa 12 — `feature/12-summary-history` · F+B · Resumen e historial · (≥ 8)
- Pantalla Resumen (lámina 11) con rango máximo y comparación con la sesión anterior.
- Guardado de la sesión al terminar; cálculo de estadísticas en `domain/`.
- Vista de historial sencilla dentro del reloj (últimas sesiones).
- **Aceptación:** tras 3 sesiones se ve la mejora o el retroceso con signo (+/−) correcto.

### Etapa 13 — `feature/13-i18n` · B+F · Español e inglés completos · (≥ 8)
- Todas las cadenas migradas a diccionarios; tipo que obliga a tener ambas.
- Selector de idioma en Ajustes y en la primera ejecución.
- Test que falla si una clave existe en un idioma y no en el otro.
- Revisión de longitud: ningún texto desborda la zona segura en ninguno de los dos idiomas.
- **Aceptación:** recorrer todas las pantallas en cada idioma sin textos sin traducir ni desbordes.

### Etapa 14 — `feature/14-qa-release` · F+B · Calidad y lanzamiento · (≥ 10)
- Accesibilidad: contraste ≥ 4.5:1, foco, `prefers-reduced-motion`, lectores de pantalla en controles.
- Rendimiento: 60 fps en el goniómetro en un teléfono de gama media; sin fugas de temporizadores.
- Pruebas manuales en Android/Chrome y iPhone/Safari (permiso de sensor, audio, vibración).
- `vercel.json` si hace falta, `README` final con guion de la demostración.
- Versión `v1.0.0` en `develop`; **el usuario** hace el merge a `main` y despliega.
- **Aceptación:** `npm run build` limpio; lista de verificación de la demo completada; `git rev-list --count develop` > 100.

---

## 10. Guion de la demostración

1. Abrir la URL de Vercel en el teléfono. Aparece la intro y luego la cara del reloj.
2. Ajustes → idioma: mostrar español e inglés.
3. Medir rango → permitir sensores → **brazo abajo** → calibrar (0°).
4. Configuración → rueda de ángulo → objetivo 90°.
5. Sesión → subir el brazo despacio: el número y el anillo siguen el ángulo en vivo.
6. Aproximación → pulsos cada vez más rápidos → **90°: verde y acorde** → pasarse: **rojo y zumbido**.
7. Arco doloroso 70°–110°: mostrar el aviso al entrar.
8. Terminar → Resumen con el rango máximo y la comparación.
9. Recargar la página: los datos siguen ahí (localStorage).

---

## 11. Decisiones abiertas (confirmar con el usuario antes de la etapa 1)

1. **Paleta:** seguir las láminas (decisión actual de §3.2) o corregir antes el sistema de diseño.
2. **Zona `overshoot`:** el diseño no tiene un color propio; se usa la paleta de dolor `#A3392D`. Confirmar o proponer otra.
3. **Objetivo por defecto:** 90° de abducción (el diseño de goniómetro muestra 150° de flexión como ejemplo).
4. **«Guía IA» sin IA real:** reglas locales. Si se quiere un modelo real hará falta un servidor, fuera del alcance.
