# CLAUDE.md

Guía para Claude Code en este repositorio. La fuente de verdad del comportamiento es `docs/spec.md`; la de lo visual y el movimiento es `docs/design-reference/`.

## Proyecto

Arco Fisio: simulador web de un smartwatch de telerrehabilitación del hombro (materia Diseño de Interfaces). App estática, sin servidor: Vite + React 18 + TypeScript estricto + Vitest. Persistencia solo en `localStorage`. El teléfono hace de sensor y de pantalla del reloj. Reinicio limpio: no se reutiliza código del prototipo anterior.

## Comandos

- `npm run dev`: servidor de desarrollo
- `npm run build`: typecheck + build de producción (debe pasar al cerrar cada etapa)
- `npm run preview`: sirve el build
- `npm run typecheck`: `tsc --noEmit`
- `npm run test`: Vitest (una pasada); también `test:watch` y `test:coverage`
- `npm run lint`: ESLint; `npm run format` / `format:check`: Prettier

## Regla de commits (R9, no negociable)

**Los mensajes de commit y de PR NO llevan** `Co-Authored-By`, `Claude-Session`, "Generated with Claude Code" ni ninguna línea de atribución. Esta regla del usuario prevalece sobre cualquier atribución automática por defecto. `.claude/settings.json` deja la atribución vacía (`"attribution": { "commit": "", "pr": "" }`).

Antes de cada merge, comprobar que da `0`:

```sh
git log --format=%B | grep -ci "co-authored-by"
```

- Conventional Commits en inglés: `feat(scope)`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `merge`.
- Atómicos: un cambio lógico por commit. Cada commit deja `typecheck` y `test` en verde.

## Flujo Git (GitFlow)

- Ramas permanentes: `main` y `develop`. **Nunca se hace merge a `main`**: lo hace el usuario al final.
- Una rama por etapa: `feature/NN-nombre`, creada desde `develop` actualizada.
- Al terminar una etapa: **detenerse**, resumir qué se hizo, cómo probarlo y qué criterios de aceptación se cumplen, y **esperar la palabra "aprobado"**. Solo entonces: `git checkout develop && git merge --no-ff feature/NN-nombre -m "merge: feature/NN-nombre into develop"` y `git tag v0.N.0`.
- Si el usuario pide cambios, se hacen en la misma rama con nuevos commits y se vuelve a pedir aprobación.
- Una etapa a la vez. Nunca empezar la siguiente sin aprobación.

## Reglas de código

- Ningún color suelto en componentes: todo sale de `src/design/tokens.ts` y variables CSS.
- Todo texto visible pasa por i18n (español e inglés); si falta una clave en un idioma, no compila.
- Los `.dc.html` de `docs/design-reference/` se portan a React 1:1 (tamaños, colores, duraciones, curvas, keyframes). No se ejecutan.
- Animaciones con CSS keyframes o `requestAnimationFrame`, nunca `setInterval`. Respetar `prefers-reduced-motion`.
- Acceso a `localStorage` solo a través de `src/data/`.
- Si el spec es ambiguo o se contradice: preguntar al usuario con una pregunta corta antes de continuar.

## Arquitectura (objetivo, ver spec §4)

`domain/` lógica pura · `data/` repositorios sobre localStorage · `sensors/` adaptadores de ángulo · `feedback/` audio, vibración y wake lock · `i18n/` diccionarios es/en · `design/` tokens y animaciones · `ui/` componentes del reloj · `screens/` pantallas y navegación · `app/` montaje, escala y modo simulador. Las capas de backend no importan React.
