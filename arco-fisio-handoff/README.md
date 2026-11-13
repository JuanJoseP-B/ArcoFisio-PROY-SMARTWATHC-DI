# Arco Fisio · Paquete de traspaso de diseño (modo claro)

Este paquete conserva la referencia visual de **Arco Fisio**, proyecto académico de telerrehabilitación del hombro. Desde el 2026-11-13 el único destino de implementación es la app nativa para **Garmin Forerunner 165**. La web y la demo están canceladas; el teléfono no es el sensor del producto vigente.

**Prevalece [el SPEC Garmin](../docs/spec-v2.md).** Los HTML, SVG, previews y textos históricos sobre navegador/teléfono son material de consulta visual, no una fase web pendiente. El [prompt de continuación](docs/07-prompt-para-codex.md) se actualizó al alcance Garmin.

Estado: **modo claro completo (21 canvases)**. El modo oscuro está pendiente de diseño; en `tokens/` hay una propuesta de valores para él.

## Orden de lectura recomendado

1. `docs/01-producto-y-contexto.md` — qué es la app, cómo mide, flujos y reglas.
2. `docs/02-identidad-y-tokens.md` — identidad (Hipo), colores, tipografía, iconos, semántica de estados.
3. `docs/03-geometria-del-reloj.md` — matemática exacta del dial (ángulo → posición/nivel de agua).
4. `docs/04-animaciones.md` — animación de carga (≤ 4 s), ola, hilo de marea y reglas de movimiento.
5. `docs/05-pantallas.md` — las 20 pantallas con estados, textos, datos de ejemplo y navegación.
6. `docs/06-comportamiento-y-datos.md` — lógica de estados, repeticiones, datos locales, sonido/vibración, accesibilidad.
7. `docs/07-prompt-para-codex.md` — prompt listo para pegar y plan de trabajo por fases.

## Carpetas

| Carpeta | Contenido |
|---|---|
| `docs/` | Especificación escrita (todo lo anterior). |
| `tokens/` | `tokens.json` y `tokens.css` (claro + propuesta oscura). |
| `assets/` | `hipo.svg`, el caballito de mar (logo/mascota). |
| `preview/` | Las 21 pantallas como HTML estático. Abre `preview/00-Identidad.html` en un navegador; los botones enlazan entre pantallas y las animaciones de ola/carga corren con CSS. |
| `reference/` | Archivos originales del diseño (`*.dc.html`, `arco.css`, `canvas.json` con la posición de cada canvas). Son la **fuente exacta** de textos, medidas y colores por pantalla. |

## Qué es fuente de verdad

- **Textos, medidas y composición exactas:** los HTML de `reference/` (o su copia en `preview/`).
- **Reglas y comportamiento:** los documentos de `docs/`.
- Si un documento y un HTML difieren, el HTML manda para lo visual y el documento manda para el comportamiento.

## Decisiones abiertas (no resueltas a propósito)

- **Tecnología de implementación:** sin definir. El diseño no depende de ninguna.
- **Modo oscuro:** falta diseñarlo; los tokens propuestos están marcados como tales.
- **Datos de ejemplo** (objetivo 90°, arco doloroso 100°–125°, rutina de abducción 3 × 10, descanso 30 s) son ilustrativos y deben ser configurables.

## Nota sobre los ejemplos

El enunciado original sugería un arco doloroso de 70°–110° con objetivo de 90°. Como el objetivo caería dentro del arco, en las pantallas de sesión se usó **100°–125°**. Es solo un dato de ejemplo: la lógica debe funcionar con cualquier rango.
