# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado actual del repositorio

El repositorio contiene solo `SPEC.md` (especificación técnica en español) y un `README.md` casi vacío. **Todavía no existe código fuente, `package.json` ni configuración de build/lint/test.** `SPEC.md` es la fuente de verdad: incluye el código completo previsto de cada archivo (secciones 5.1–5.8), así que la implementación consiste en materializar esos bloques en `src/` y crear el scaffolding.

Proyecto "Arco Fisio": simulador web de un smartwatch de telerrehabilitación del hombro (abducción activa en plano frontal, ángulo diana 90°). Hito 60%: solo capa UI/interacción simulada en navegador.

## Stack previsto

React 18+, TypeScript, Tailwind CSS (directivas `@tailwind` en `src/index.css`, por lo que se espera Tailwind v3 con `tailwind.config.js`), Web Audio API. El spec no fija bundler ni comandos; Vite es la elección natural, pero hay que confirmarlo con el usuario antes de asumirlo. No hay framework de tests definido.

## Arquitectura (resumen de SPEC.md)

Flujo de datos unidireccional: el ángulo (0°–180°) es el único estado de entrada y todo se deriva de él.

- `hooks/useGoniometerState.ts` es el núcleo: guarda `currentAngle`, deriva `zone` (`HapticZone`) y `zoneConfig` (colores, etiquetas, intervalo de pulso) y dispara el audio mediante efectos (clic cada 15° en zona segura; `setInterval` de pulsos según `pulseIntervalMs`; one-shot de éxito/sobrepaso).
- `utils/soundSynthesizer.ts`: singleton `sound` con osciladores procedurales (sin archivos de audio). Crea/reanuda el `AudioContext` de forma perezosa (requiere gesto del usuario por la política de autoplay).
- Componentes de presentación puros que reciben ángulo/zona/color: `WatchBezel` (chasis 384×384 circular), `GoniometerRing` (SVG, mapea 0–180° sobre un arco de 240° que empieza en 150°), `HapticPulseOverlay` (ondas sonar CSS con `@keyframes sonarRipple`), `AngleReadout`.
- `SimulationControls`: banco de pruebas externo (slider 0–180°, presets 0/60/90/110, animación continua 0↔120° con `requestAnimationFrame`).

Zonas (umbrales en grados): `IDLE_GLENOHUMERAL` <60 · `APPROACH_PULSE` 60–<85 (700 ms, 440 Hz) · `NEAR_TARGET` 85–<88.5 (300 ms, 580 Hz) · `TARGET_SUCCESS` |ángulo−90| ≤ 1.5 · `OVERSHOOT_ERROR` resto (>91.5, sierra 220 Hz, 150 ms). Colores en tokens semánticos (sección 3.2); fondo OLED `#000000` estricto.

## Inconsistencias a resolver al implementar el spec

- `SimulationControls` llama `onAngleChange(prev => ...)` con función actualizadora, pero la prop está tipada `(angle: number) => void`; hay que tipar como `Dispatch<SetStateAction<number>>` (el hook expone `setCurrentAngle` de `useState`).
- La sección 4 dice NEAR_TARGET = 85°–89° y la 3.2 `phase-critical` 85°–89°, pero el código usa 85–<88.5 porque desde 88.5 entra la tolerancia de éxito (90 ± 1.5).
- En `useGoniometerState`, el efecto de pulsos depende de `zone`, así que el éxito/sobrepaso suena una sola vez al entrar en la zona (no repite `OVERSHOOT_ERROR` pese a `pulseIntervalMs: 150`); el criterio de aceptación pide parpadeo rojo continuo, lo que requiere implementarlo explícitamente.
- `HapticPulseOverlay` y los criterios de aceptación mencionan destello/parpadeo (verde/rojo) que no están definidos en `index.css`; hay que añadir los keyframes.
- El hook no usa `targetAngle` para el rango `NEAR_TARGET`/`APPROACH_PULSE` (umbrales fijos 60/85/88.5); cambiar el ángulo diana por defecto exigiría parametrizarlos.

## Flujo Git (SPEC.md sección 6)

GitFlow estricto con merges `--no-ff`: `main` ← `release/*`, `develop`, ramas `feature/*` fusionadas a `develop`. Ramas previstas: `feature/watch-scaffold-and-tokens`, `feature/haptic-audio-engine`, `feature/ui-goniometer-and-controls`, luego `release/v0.6.0-visual-simulator` con tag `v0.6.0` en `main`. Mensajes Conventional Commits (`feat(ui):`, `feat(audio):`, `feat(svg):`, `chore:`, `merge:`, `release:`). Nota: el directorio actual ya tiene `.git`, aunque el spec indica `git init`.

## Criterios de aceptación clave

Viewport centrado de 384×384 con fondo `#000000`; clics cada 15° en 0–59°; a 60° cambio a ámbar + ondas sonar + pulsos 440 Hz/700 ms; 85–89° pulsos a 300 ms; 90° ± 1.5° destello verde y acorde de éxito; >91.5° parpadeo rojo y tono disonante.

## Git commit conventions
- Never add `Co-Authored-By: Claude` or any AI assistant trailers to commit messages.
- Commits must only show the user as the sole author.