# CLAUDE.md — Arco Fisio Garmin

Leer primero [AGENTS.md](AGENTS.md), [PROJECT.md](PROJECT.md) y [docs/spec-v2.md](docs/spec-v2.md).

**El único producto vigente es la app nativa del Garmin Forerunner 165. El usuario canceló la web y la demo el 2026-11-13.** No continuar React, Vite, sensores de teléfono, portafolio web ni Vercel. Los archivos existentes son antecedentes conservados.

La fase 04 está cancelada: terminar 03, después 05, 06 y 07. Una petición de continuar o hacer la siguiente fase no cambia este alcance. Las antiguas instrucciones de portar HTML a React quedan sustituidas por dibujos y controles nativos Monkey C.

Código activo: `ArcoFisioApp/`. Colores: `Palette.mc`; cadenas es/en: recursos; datos: `Application.Storage`; modelos puros: `source/logic/`. Verificar normal y tests para `fr165` con `-l 3 -w`, ejecutar `monkeydo ... /t` y observar pantallas en simulador. Comandos en [phase-01-handoff.md](docs/phase-01-handoff.md). Las pruebas del sensor físico siguen pendientes hasta tener reloj.

Antes de modificar, comprobar `git worktree list`: fase 03 tiene un worktree separado y cambios locales incompletos. Preservar trabajo. Actualizar `PROJECT.md` y handoff al cambiar estado, arquitectura, comandos o decisiones.

GitFlow: una rama por fase con convención existente `feature/NN-v2-...`; Conventional Commits en inglés, atómicos, sin atribución. **No incluir `Co-Authored-By`, `Claude-Session` ni “Generated with Claude Code”.** Merge a `develop` solo después de «aprobado»; `main` lo integra el usuario. No iniciar la siguiente fase sin aprobación.
