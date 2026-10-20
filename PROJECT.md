# PROJECT.md — Contexto mínimo de Arco Fisio

> Archivo vivo. Se actualiza en **cada commit que cambie el estado del repo** (etapa, estructura, comandos, decisiones). Ver la regla en [`CLAUDE.md`](CLAUDE.md). Detalle completo del comportamiento: [`docs/spec.md`](docs/spec.md). Detalle visual y de movimiento: [`docs/design-reference/`](docs/design-reference/).

_Última actualización: 2026-10-20 · rama `feature/04-sensors` · etapa 4 terminada, pendiente de aprobación._

## Qué es

Simulador web de un smartwatch de telerrehabilitación del hombro (materia Diseño de Interfaces). El teléfono hace de sensor (inclinación del brazo → ángulo) y de pantalla del reloj. El reloj guía al paciente a **llegar** al ángulo prescrito y **no pasarse**, evitando su arco doloroso, con feedback visual, sonoro y por vibración.

- App **estática**, sin servidor ni cuentas. Persistencia solo en `localStorage` (prefijo `arcofisio:v1:`).
- Idiomas: español e inglés (R1).
- Vista final: **solo un círculo centrado** que simula el reloj (R6).
- Reinicio limpio: no se reutiliza código del prototipo anterior.

## Stack

Vite 8 · React 18.3 · TypeScript estricto · Vitest 5 · ESLint · Prettier. CSS con variables y CSS Modules (sin Tailwind, sin librería de rutas ni de i18n).

## Comandos

| Comando                                    | Qué hace                                                               |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `npm run dev`                              | Servidor de desarrollo (`http://localhost:5173`)                       |
| `npm run build`                            | `tsc --noEmit` + build de producción (debe pasar al cerrar cada etapa) |
| `npm run preview`                          | Sirve el build                                                         |
| `npm run typecheck`                        | `tsc --noEmit`                                                         |
| `npm run test`                             | Vitest, una pasada (también `test:watch`, `test:coverage`)             |
| `npm run lint` · `format` · `format:check` | ESLint · Prettier                                                      |

Parámetros de URL: `?sim=1` activa el simulador de ángulo (sin teléfono) · `?probe=1` muestra la pantalla temporal de prueba del sensor (se retira al avanzar de etapa).

## Arquitectura (`src/`)

| Carpeta     | Capa                                 | Contenido hoy                                                                                                                                                                                   |
| ----------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain/`   | Backend, lógica pura sin React       | `angle`, `filter`, `zones`, `repetitions`, `vector`, `constants`                                                                                                                                |
| `data/`     | Backend, repositorios `localStorage` | `storage` (con respaldo en memoria), repos de `settings`, `calibration`, `painArc`, `routines`, `sessions`, `validators`, `migrations`, `seeds` (4 rutinas bilingües), `index` (`getDataLayer`) |
| `sensors/`  | Backend, adaptadores de ángulo       | `AngleSource`, `DeviceMotionSource`, `SimulatedSource`, `permission`, `support`, `calibration`, `calibrationFlow`, `tracker`, `visibility`, `kit` (`getSensorKit`)                              |
| `feedback/` | Backend                              | Solo `wakeLock` (audio y vibración llegan en la etapa 7)                                                                                                                                        |
| `i18n/`     | Backend                              | **Aún no existe** (etapa 13; se usará desde que haya texto visible)                                                                                                                             |
| `design/`   | Frontend                             | `tokens`, `cssVars`, `fonts`, `global.css`                                                                                                                                                      |
| `ui/`       | Frontend                             | `WatchBezel`, `WatchScreen` (con `SafeZone`)                                                                                                                                                    |
| `screens/`  | Frontend                             | **Aún no existe** (etapa 8 en adelante)                                                                                                                                                         |
| `app/`      | Frontend                             | `WatchStage` (centrado y escala), `fitScale`, `useViewportSize`, `useAngle`, `SensorProbe` (temporal)                                                                                           |

Reglas duras: sin colores sueltos en componentes (todo desde `design/tokens.ts`); `localStorage` solo vía `data/`; animaciones con CSS keyframes o `requestAnimationFrame`, nunca `setInterval`; `domain/` no importa React (hay test).

## Estado de las etapas

Cada etapa = rama `feature/NN-nombre` → `develop` con `merge --no-ff` **solo con "aprobado" del usuario** → tag `v0.N.0`. `main` solo lo toca el usuario al final.

| #   | Rama                             | Tema                                                                                   | Estado                                                                                                                                              |
| --- | -------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | `feature/00-bootstrap`           | Repo, reglas, scripts                                                                  | Mezclada · `v0.0.0`                                                                                                                                 |
| 1   | `feature/01-design-foundations`  | Tokens, marco, escala                                                                  | Mezclada · `v0.1.0`                                                                                                                                 |
| 2   | `feature/02-domain-core`         | Dominio puro                                                                           | Mezclada · `v0.2.0`                                                                                                                                 |
| 3   | `feature/03-data-layer`          | Capa de datos                                                                          | Mezclada · `v0.3.0`                                                                                                                                 |
| 4   | `feature/04-sensors`             | Sensor de inclinación                                                                  | **Terminada (27 commits, 291 tests verdes); esperando "aprobado"**. Pendiente de validar en teléfono real con `?probe=1` (±3° contra transportador) |
| 5   | `feature/05-motion-and-intro`    | Utilidades de movimiento, transición radial, intro (lámina 01)                         | Siguiente                                                                                                                                           |
| 6   | `feature/06-goniometer-session`  | Goniómetro en vivo y pantalla Sesión                                                   | Pendiente                                                                                                                                           |
| 7   | `feature/07-feedback-engine`     | Audio y vibración                                                                      | Pendiente                                                                                                                                           |
| 8   | `feature/08-navigation-launcher` | Navegación, cara del reloj, launcher                                                   | Pendiente                                                                                                                                           |
| 9   | `feature/09-config-and-measure`  | Rueda de ángulo, configuración, calibración, primera ejecución                         | Pendiente                                                                                                                                           |
| 10  | `feature/10-routines`            | Biblioteca, detalle, constructor, reproductor, descanso                                | Pendiente                                                                                                                                           |
| 11  | `feature/11-pain-arc-and-guide`  | Arco doloroso y Guía IA (reglas locales)                                               | Pendiente                                                                                                                                           |
| 12  | `feature/12-summary-history`     | Resumen e historial                                                                    | Pendiente                                                                                                                                           |
| 13  | `feature/13-i18n`                | Español e inglés completos                                                             | Pendiente                                                                                                                                           |
| 14  | `feature/14-qa-release`          | Calidad y lanzamiento (`v1.0.0`; el usuario hace merge a `main` y despliega en Vercel) | Pendiente                                                                                                                                           |

Commits en `develop` al cierre de la etapa 3: 92 (meta R4: más de 100; el spec apunta a ~150).

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

## Registro de cambios de este archivo

- 2026-10-20: creación. Refleja etapas 0–4.
