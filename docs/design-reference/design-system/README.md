# Arco Fisio

Sistema de diseño de **Arco Fisio**, app de smartwatch redondo (Wear OS / Pixel Watch) para rehabilitación y entrenamiento de movilidad del hombro. Toda la interfaz vive en una pantalla circular de 384×384 px dentro de un marco metálico fino con destello de cristal curvo.

## Principios

1. **Un dato protagonista por pantalla.** Grados, tiempo o repeticiones en `hero` (72 px, Roboto Flex 600, cifras tabulares), legible de un vistazo con el brazo en movimiento.
2. **Tono claro único.** No hay tema oscuro. La pantalla es `screen` (#FBF4E6, derivado de Dutch White); `dutch-white` es la superficie protagonista; `gunmetal` es la tinta y la acción; `ecru` es el acento cálido. El negro `#000000` queda para el hardware (marco y cristal).
3. **Elegante, cálido, premium.** Mucho aire, una sola acción primaria, ningún degradado decorativo salvo el destello del cristal.
4. **Zona segura de 28 px.** Ningún texto ni control fuera del círculo interior de 328 px. Los arcos y anillos sí pueden ocupar el borde.

## Color

| Token | Valor | Uso |
|---|---|---|
| `dutch-white` | #F7E5C1 | Protagonista: superficies, chips, perilla |
| `ecru` | #B8A85D | Acento: arcos, marca de objetivo (no para texto) |
| `ecru-deep` | #6F6528 | Ecru legible en texto y bordes (5.4:1) |
| `gunmetal` | #1C393F | Tinta, botón primario, arco activo |
| `screen` | #FBF4E6 | Fondo de pantalla |
| `black` | #000000 | Solo hardware |

Zonas: `zone-optimal`, `zone-caution`, `zone-pain`, `zone-rest`, cada una con su `-tint` de fondo. Se distinguen también por luminosidad y siempre llevan palabra; nunca solo color.

## Tipografía

Roboto Flex (Google Fonts, eje óptico 8–144). Escala: `hero` 72 · `display` 44 · `title` 20 · `body` 16 · `button` 15 · `label` 13 · `caption` 11 (mínimo). Una línea por título, centrado.

## Geometría

Pantalla 384 px · zona segura 28 px · objetivo táctil 48 px · radios `radius-pill`, `radius-card` 24, `radius-sm` 12 · trazo de anillo 14 px.

## Movimiento

Ver `motion.md`. Duraciones 90 / 180 / 300 / 500 / 1600 ms, curvas estándar-entrada-salida y tres resortes (snappy, gentle, bouncy). `window.ArcoFisio.motion` expone los mismos valores para las animaciones que siguen.

## Componentes

Botón píldora, Tarjeta, Celda hexagonal, Goniómetro, Rueda de ángulo, Chip de zona, Progreso por pasos, Temporizador, Lista con scroll, Arco doloroso. Las clases viven en `components/bundle.css` (`.af-watch`, `.af-screen`, `.af-btn`, `.af-chip`…), y `ArcoFisio.arc()` / `ArcoFisio.polar()` dibujan arcos sobre el círculo (0° arriba, sentido horario).

## Pantallas

Cara del reloj, Launcher hexagonal, Selector de modo, Configuración, Sesión, Resumen, Biblioteca, Detalle de rutina, Reproductor, Constructor, Medir rango, Arco doloroso, Orientación IA y Ajustes.

## Iconografía

No hay set de iconos de marca todavía: los previews usan glifos tipográficos de marcador de posición. Sustituir por Material Symbols Rounded (peso 500, 24 px) en `gunmetal`.
