# PROJECT.md — Contexto mínimo de Arco Fisio

> Archivo vivo. Se actualiza en **cada commit que cambie el estado del repo** (etapa, estructura, comandos, decisiones). Ver la regla en [`CLAUDE.md`](CLAUDE.md). Detalle completo del comportamiento: [`docs/spec.md`](docs/spec.md). Detalle visual y de movimiento: [`docs/design-reference/`](docs/design-reference/).

_Última actualización: 2026-10-20 · etapas 0–6 mezcladas en `develop` (`v0.6.0`) · etapa 7 terminada en `feature/07-feedback-engine`, pendiente de aprobación._

## Qué es

Simulador web de un smartwatch de telerrehabilitación del hombro (materia Diseño de Interfaces). El teléfono hace de sensor (inclinación del brazo → ángulo) y de pantalla del reloj. El reloj guía al paciente a **llegar** al ángulo prescrito y **no pasarse**, evitando su arco doloroso, con feedback visual, sonoro y por vibración.

- App **estática**, sin servidor ni cuentas. Persistencia solo en `localStorage` (prefijo `arcofisio:v1:`).
- Idiomas: español e inglés (R1).
- Vista final: **solo un círculo centrado** que simula el reloj (R6).
- Reinicio limpio: no se reutiliza código del prototipo anterior.

## Stack

Vite 8 · React 18.3 · TypeScript estricto · Vitest 5 · ESLint · Prettier. CSS con variables y CSS Modules (sin Tailwind, sin librería de rutas ni de i18n: diccionario propio).

## Comandos

| Comando                                    | Qué hace                                                               |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `npm run dev`                              | Servidor de desarrollo (`http://localhost:5173`)                       |
| `npm run build`                            | `tsc --noEmit` + build de producción (debe pasar al cerrar cada etapa) |
| `npm run preview`                          | Sirve el build                                                         |
| `npm run typecheck`                        | `tsc --noEmit`                                                         |
| `npm run test`                             | Vitest, una pasada (también `test:watch`, `test:coverage`)             |
| `npm run lint` · `format` · `format:check` | ESLint · Prettier                                                      |

Parámetros de URL: `?sim=1` activa el simulador de ángulo (sin teléfono) y muestra el deslizador fuera del círculo · `?session=1` abre la pantalla Sesión (con `&routine=<id>`, por ejemplo `builtin-flexion-150`; sin `routine` usa la primera) · sin parámetros se ve la intro en bucle. Ejemplo para ensayar en el computador: `?session=1&sim=1`. Son interinos hasta la máquina de navegación (etapa 8).

## Arquitectura (`src/`)

| Carpeta                                                                                                                                                                                                                                 | Capa                                 | Contenido hoy                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain/`                                                                                                                                                                                                                               | Backend, lógica pura sin React       | `angle`, `filter`, `zones`, `repetitions`, `vector`, `constants`, `sessionRun` (sesión en vivo: zona + repeticiones + entradas al arco doloroso, `pauseSessionRun`, `sessionStats`)                                                                                                         |
| `data/`                                                                                                                                                                                                                                 | Backend, repositorios `localStorage` | `storage` (con respaldo en memoria), repos de `settings`, `calibration`, `painArc`, `routines`, `sessions`, `validators`, `migrations`, `seeds` (4 rutinas bilingües), `index` (`getDataLayer`)                                                                                             |
| `sensors/`                                                                                                                                                                                                                              | Backend, adaptadores de ángulo       | `AngleSource`, `DeviceMotionSource`, `SimulatedSource`, `permission`, `support`, `calibration`, `calibrationFlow`, `tracker`, `visibility`, `kit` (`getSensorKit`)                                                                                                                          |
| `feedback/`                                                                                                                                                                                                                             | Backend                              | `wakeLock`; `cues` (tabla única zona → sonido + vibración + intervalos), `recipes` (notas puras), `audioEngine` (Web Audio inyectable), `audioUnlock` (primer toque), `vibration`, `stepFeedback` (máquina pura de tiempos), `feedback` (fachada `createFeedback`), `index` (`getFeedback`) |
| `i18n/`                                                                                                                                                                                                                                 | Backend                              | `es.ts` (define `MessageKey`), `en.ts` (`Record<MessageKey, string>`: falta una clave = no compila), `translate` (con `{placeholders}`). Sin React; el hook vive en `app/`                                                                                                                  |
| `design/`                                                                                                                                                                                                                               | Frontend                             | `tokens` (incl. `sceneColor`), `cssVars` (incl. `--af-pulse-slow/fast`), `fonts`, `global.css`, `motion`, `reducedMotion`, `useFrameClock` (rAF)                                                                                                                                            |
| `ui/`                                                                                                                                                                                                                                   | Frontend                             | `WatchBezel`, `WatchScreen` (con `SafeZone`), `BeadPattern`, `RadialTransition`, `GoniometerRing` (con halo de aproximación y parpadeo del sobrepaso) + `ringGeometry`, `FeatherFan`, `ZoneChip` + `ZoneIcon` + `zoneGesture`                                                               |
| `screens/`                                                                                                                                                                                                                              | Frontend                             | `intro/` (lámina 01) · `session/` (`Session`, `SensorNotice`, `noticeFor`)                                                                                                                                                                                                                  |
| `app/`                                                                                                                                                                                                                                  | Frontend                             | `WatchStage`, `fitScale`, `useViewportSize`, `useAngle`, `useSessionRun` (tick por frame), `I18nContext`/`I18nProvider`/`useI18n`, `SimulatorPanel` (deslizador con `?sim=1`). `App.tsx` es el anfitrión interino de pantallas                                                              |
| Reglas duras: sin colores sueltos en componentes (todo desde `design/tokens.ts`); `localStorage` solo vía `data/`; animaciones con CSS keyframes o `requestAnimationFrame`, nunca `setInterval`; `domain/` no importa React (hay test). |

## Estado de las etapas

Cada etapa = rama `feature/NN-nombre` → `develop` con `merge --no-ff` **solo con "aprobado" del usuario** → tag `v0.N.0`. `main` solo lo toca el usuario al final.

| #   | Rama                             | Tema                                                                                   | Estado                                                                                                                                                                                 |
| --- | -------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | `feature/00-bootstrap`           | Repo, reglas, scripts                                                                  | Mezclada · `v0.0.0`                                                                                                                                                                    |
| 1   | `feature/01-design-foundations`  | Tokens, marco, escala                                                                  | Mezclada · `v0.1.0`                                                                                                                                                                    |
| 2   | `feature/02-domain-core`         | Dominio puro                                                                           | Mezclada · `v0.2.0`                                                                                                                                                                    |
| 3   | `feature/03-data-layer`          | Capa de datos                                                                          | Mezclada · `v0.3.0`                                                                                                                                                                    |
| 4   | `feature/04-sensors`             | Sensor de inclinación                                                                  | Mezclada · `v0.4.0` (27 commits). La validación en teléfono real (±3° contra transportador) queda a cargo del usuario                                                                  |
| 5   | `feature/05-motion-and-intro`    | Utilidades de movimiento, transición radial, intro (lámina 01)                         | Mezclada · `v0.5.0` (20 commits)                                                                                                                                                       |
| 6   | `feature/06-goniometer-session`  | Goniómetro en vivo y pantalla Sesión                                                   | Mezclada · `v0.6.0` (33 commits, 417 tests)                                                                                                                                            |
| 7   | `feature/07-feedback-engine`     | Audio y vibración                                                                      | **Terminada (25 commits, 489 tests verdes); esperando "aprobado"**. Se prueba con `?session=1` (teléfono) o `?session=1&sim=1` (computador): al mover el brazo suena y vibra cada zona |
| 8   | `feature/08-navigation-launcher` | Navegación, cara del reloj, launcher                                                   | Pendiente                                                                                                                                                                              |
| 9   | `feature/09-config-and-measure`  | Rueda de ángulo, configuración, calibración, primera ejecución                         | Pendiente                                                                                                                                                                              |
| 10  | `feature/10-routines`            | Biblioteca, detalle, constructor, reproductor, descanso                                | Pendiente                                                                                                                                                                              |
| 11  | `feature/11-pain-arc-and-guide`  | Arco doloroso y Guía IA (reglas locales)                                               | Pendiente                                                                                                                                                                              |
| 12  | `feature/12-summary-history`     | Resumen e historial                                                                    | Pendiente                                                                                                                                                                              |
| 13  | `feature/13-i18n`                | Español e inglés completos                                                             | Pendiente                                                                                                                                                                              |
| 14  | `feature/14-qa-release`          | Calidad y lanzamiento (`v1.0.0`; el usuario hace merge a `main` y despliega en Vercel) | Pendiente                                                                                                                                                                              |

Commits en `develop` tras la etapa 6: 179 (la meta R4 de más de 100 ya se cumple; el spec apunta a ~150).

## Cómo trabajar (resumen de las reglas)

- **R9:** los commits y PR no llevan `Co-Authored-By`, `Claude-Session`, "Generated with Claude Code" ni atribución. Comprobar antes de cada merge: `git log --format=%B | grep -ci "co-authored-by"` → `0`.
- Conventional Commits en inglés, atómicos; cada commit deja `typecheck` y `test` en verde.
- Al terminar una etapa: detenerse, resumir, esperar "aprobado". Una etapa a la vez.
- Si el spec es ambiguo: una pregunta corta al usuario.

## Decisiones y notas útiles

- **Paleta:** manda lo animado en las láminas (verde `#1F3A2B`, fondo degradado `#F8EEDD`→`#EBD6B0`, oro `#C8902E`), no `tokens.json` (spec §3.2).
- **Ángulo:** `acos(ĝ · ĝ₀)` entre la gravedad actual y la de calibración «brazo abajo»; filtro exponencial α≈0.25 y zona muerta 0.5° (spec §5.1). 0° = brazo colgando, 90° = horizontal, 180° = arriba.
- **Sensores:** exigen HTTPS (Vercel; en local, túnel HTTPS). En iOS el permiso se pide dentro de un toque.
- **Simulador:** con `?sim=1` el kit de sensores usa `SimulatedSource` y arranca calibrado en 0°.
- **Zonas** (`domain/zones.ts`): `far`, `approach`, `near`, `target`, `overshoot`, `pain`, `rest`, relativas al objetivo `T` y la tolerancia.
- **Pendientes de decisión (spec §11):** color propio de `overshoot` (hoy `#A3392D`), objetivo por defecto 90° de abducción.
- `docs/design-reference/captures/` contiene `BRIEF.md` y `referencias/` como referencia visual.
- Las carpetas `coverage/` y `dist/` están ignoradas por Git.
- **Movimiento:** continuo con `requestAnimationFrame` (`useFrameClock`) y matemática pura testeable; entradas con CSS keyframes. La intro con `prefers-reduced-motion` muestra el lockup final con un solo fundido y no programa frames.
- **i18n:** todo texto visible sale de `useI18n().t(clave)`; el nombre de la rutina sale de `routine.name[lang]`. El selector de idioma y la revisión de desbordes llegan en la etapa 13.
- **Sesión (etapa 6):** `useSessionRun` avanza `stepSessionRun` en cada frame (no solo cuando cambia el ángulo), así sostener el objetivo 1 s cuenta aunque el sensor no emita muestras nuevas. Si el sensor no está `live`, el chip se sustituye por `SensorNotice` (activar sensor / calibrar «brazo abajo»): es interino hasta la pantalla Medir (etapa 9). La sonda `?probe=1` se retiró.
- **Zonas en el anillo:** `approach` oro, `near` bronce (oro intenso) con marcador r 11, `target` verde con marcador r 14, `overshoot`/`pain` rojo. El parpadeo del sobrepaso llega en la etapa 7 y la banda de dolor en la 11. El chip `near` dice «Muy cerca» (el spec no fija su texto).
- **Feedback (etapa 7):** `ZONE_FEEDBACK` en `feedback/cues.ts` es la única fuente de qué suena y vibra en cada zona: `far` clic cada 15° sin vibración; `approach` pulso 440 Hz cada 700 ms; `near` pulso 580 Hz cada 300 ms; `target` acorde do-mi-sol una vez (con enfriamiento de 1,5 s contra el titileo en el borde de la tolerancia) y vibración doble; `overshoot` sierra 220→140 Hz cada 800 ms; `pain` doble pitido de 350 Hz cada 1,5 s. `stepFeedback` es puro y se alimenta con el tick por frame de `useSessionRun` (sin `setInterval`). El halo CSS y el audio comparten los periodos 700/300 ms (`--af-pulse-*`).
- **Audio y vibración:** el audio queda bloqueado hasta el primer toque (`installAudioUnlock` en `App`). Sin Web Audio o sin `navigator.vibrate` (iPhone) no hay errores: se queda lo visual. Sonido y vibración se activan/desactivan con `feedback.applySettings({ sound, vibration })`; la pantalla de Ajustes que lo llame llega después. El volumen vive en el motor (`setVolume`, 0.6 por defecto) pero **no está en el modelo `settings`** del spec §4.1, así que no se guarda.
- **Tests de hooks:** sin testing-library; se monta con `createRoot` + `act` y se simulan `matchMedia` y `requestAnimationFrame` con `vi.stubGlobal`. `useAngle` no admite SSR (`renderToString`).

## Registro de cambios de este archivo

- 2026-10-20: creación. Refleja etapas 0–4.
- 2026-10-20: etapa 4 aprobada, mezclada y etiquetada `v0.4.0`; arranca la etapa 5.
- 2026-10-20: etapa 5 aprobada, mezclada y etiquetada `v0.5.0`; arranca la etapa 6.
- 2026-10-20: etapa 6 aprobada, mezclada y etiquetada `v0.6.0`; arranca la etapa 7.
- 2026-10-20: etapa 7 terminada (audio, vibración, halo y parpadeo). Pendiente de aprobación.
- 2026-10-20: corregidas las filas 4–5 de la tabla de etapas (estaban desactualizadas) y documentados i18n, Sesión y los nuevos parámetros de URL.
