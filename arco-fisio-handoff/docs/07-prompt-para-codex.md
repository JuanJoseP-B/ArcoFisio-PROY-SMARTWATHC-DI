# 07 · Continuar implementación — solo Garmin

Actualizado el 2026-11-13: sustituye el antiguo prompt y plan web de este paquete.

## Prompt para un nuevo chat

```text
Continúa Arco Fisio exclusivamente como app nativa Monkey C para Garmin Forerunner 165.
La página web y la demo están canceladas por completo; no desarrollar ni desplegar web.
Lee AGENTS.md, PROJECT.md y docs/spec-v2.md desde la raíz del repositorio.
Consulta docs/phase-02-03-review.md y el handoff de la fase.
Comprueba git worktree list y cambios locales: fase 03 vive en otro worktree.
Usa este paquete solo como referencia visual para pantallas nativas.
Sin reloj, trabaja con pruebas Monkey C, muestras sintéticas identificadas y simulador fr165.
No declares validado el sensor físico por ejecutar una simulación.
Termina la fase pendiente; no empieces otra ni mezcles ramas sin aprobación.
La fase 04 está cancelada. Después de 03 siguen 05, 06 y 07 solo Garmin.
```

## Plan único

El único plan de fases es [docs/spec-v2.md](../../docs/spec-v2.md). No utilizar la antigua numeración 0–11 del handoff para crear fases nuevas. Colores, geometría, ilustraciones y canvas siguen siendo referencias visuales; el alcance y comportamiento del SPEC prevalecen.
