# Instrucciones del proyecto para agentes

## Alcance vigente — decisión del usuario, 2026-11-13

**SOLO RELOJ GARMIN FORERUNNER 165. La web y su demo están canceladas.**

- Antes de trabajar, leer `PROJECT.md` y `docs/spec-v2.md`; este último es el SPEC vigente.
- No crear, completar, reparar, probar como requisito ni desplegar fases web, demo o portafolio web. No retomar React/Vite/Vercel por encontrar archivos antiguos.
- `src/` y la documentación web archivada son antecedentes; conservarlos sin continuar su desarrollo. HTML/SVG del handoff son referencias para la app nativa.
- Fase 04 cancelada. Orden restante: terminar 03 → 05 rutinas → 06 historial/guía/ajustes → 07 entrega Garmin. Conservar numeración.
- Pedir «la siguiente fase» no reactiva la web. Solo una instrucción explícita nueva del usuario puede cambiar este alcance.

## Antes de implementar

- Ejecutar `git worktree list` y comprobar rama/cambios locales. Fase 03 vive en un worktree separado; consultar rutas en `PROJECT.md`. No asumir que no existe porque la carpeta principal muestre fase 02.
- Leer el informe/handoff y tareas de la fase. Las notas históricas de otros worktrees no prevalecen sobre la cancelación del usuario.
- Preservar cambios locales; no descartar trabajo ni cambiar de rama para «limpiar».
- No iniciar una fase nueva al revisar otra. Resolver ambigüedades de producto sin inventar aprobación.

## Implementación y verificación

- Código activo: `ArcoFisioApp/`, Monkey C/Connect IQ, producto `fr165`.
- Colores en `Palette.mc`; textos es/en en recursos. Adaptar diseño a métricas nativas, comprobar que no se corte ni superponga.
- Motor puro, muestras con tiempo de captura, almacenamiento mediante `Application.Storage`. Animaciones no determinan conteos.
- Compilar normal y tests con `-d fr165 -l 3 -w`; ejecutar tests en simulador con `monkeydo ... fr165 /t`.
- Sin reloj: modelos con muestras sintéticas y revisión visual en simulador. Identificar simulación; nunca declarar precisión real ni pruebas físicas realizadas.
- npm, navegador y despliegue web no son requisitos de aceptación Garmin.
- Actualizar `PROJECT.md` y el handoff/informe cuando cambien estado o decisiones.

## Git

- Convención de ramas existente: `feature/NN-v2-...`.
- Commits atómicos, Conventional Commits en inglés; sin `Co-Authored-By`, `Claude-Session` ni líneas de atribución.
- Cerrar fase para revisión; merge a `develop` solo tras «aprobado». El usuario integra `main`.
- No rastrear `developer_key`, paquetes `.prg` ni generados del SDK.
