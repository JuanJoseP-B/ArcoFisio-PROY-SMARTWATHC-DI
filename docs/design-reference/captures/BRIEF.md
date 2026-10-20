# Arco Fisio — Brief de diseño y animación para implementar

> Para Claude Code: este documento + la carpeta `referencias/` describen EXACTAMENTE cómo debe verse y moverse la app. Los archivos `.dc.html` de `referencias/` son prototipos funcionales (SVG + CSS + JS). Úsalos como **fuente de verdad** de geometría, colores, tiempos y curvas, y pórtalos al stack del proyecto (no copies la sintaxis `<x-dc>`, `{{hole}}`, `<sc-for>` ni `DCLogic`: son del editor donde se prototipó).

## 1. Qué es la app

Arco Fisio: app web que simula una app de **smartwatch redondo** para rehabilitación de hombro. Mide ángulos con el giroscopio del reloj (en web: `DeviceOrientationEvent` o un slider/simulación). **No es un reloj ni muestra la hora.**

Identidad: **el arco de tiro**. El anillo del goniómetro = el arco; cada repetición = una flecha; el objetivo = una diana. Personaje de marca: un **guerrero arquero de las llanuras** (tocado de plumas, túnica de gamuza con flecos, manta terracota, chaquira) que aparece en la intro.

## 2. Reglas generales

- Pantalla circular de **384×384 px** dentro de un marco negro (padding 12 px, anillo metálico `#9A9C9A` de 3 px, sombra `0 18px 40px rgba(31,58,43,.25)`), con destello de cristal: `radial-gradient(circle at 28% 18%, rgba(255,255,255,.55), transparent 42%)`.
- Zona segura: ningún texto ni control fuera del círculo interior de 328 px (28 px de margen). Anillos y arcos sí pueden ir al borde.
- Un dato protagonista por pantalla (72 px, cifras tabulares).
- **Ningún fondo liso**: fondo base `radial-gradient(circle at 50% 38%, #F8EEDD 0%, #EBD6B0 100%)` + una ilustración temática tenue (opacidad 0.10–0.16) detrás del contenido (ver §6).
- Todas las animaciones respetan `prefers-reduced-motion: reduce` (mostrar el estado final sin movimiento).
- Botones reales `<button>`, objetivos táctiles ≥ 48 px, contraste de texto ≥ 4.5:1.

## 3. Paleta "Tierra y oro"

| Token | Hex | Uso |
|---|---|---|
| `screen` | #F6EBD9 | Fondo base (con viñeta, ver §2) |
| `surface` | #EDD9B4 | Tarjetas, chips, celdas, perilla |
| `surface-raised` | #FBF4E8 | Miniaturas, tarjeta elevada |
| `surface-sunken` | #E3CA9C | Pistas de anillos y rieles |
| `ink` / `primary` | #1F3A2B | Verde selva: texto, botón primario, arco activo |
| `primary-soft` | #345A43 | Hover/pulsado, cuerda punteada |
| `ink-on-primary` | #EDD9B4 | Texto sobre verde |
| `ink-muted` | #5C5140 | Texto secundario |
| `gold` | #C8902E | Acento: arcos, flechas, ticks (no para texto pequeño) |
| `bronze` | #7A4E14 | Acento legible en texto y bordes |
| `terracotta` | #B5532F | Plumas de flecha, chaquira, detalles |
| `turquoise` | #2F7F86 | Cuentas de chaquira (detalle mínimo) |
| `stage` | #E9DCC4 | Fondo detrás del reloj |
| `zone-optimal` / tint | #2F6B3F / #DDE7CF | Zona óptima |
| `zone-caution` / tint | #8A5A12 / #F3DFB5 | Precaución |
| `zone-pain` / tint | #A3392D / #F4D3C8 | Dolor |
| `zone-rest` / tint | #3E5F6A / #DCE4E3 | Descanso |

Colores del personaje (solo intro): piel #8A5233, cabello #1E140E, gamuza #D9C3A0 / #C9AE86, manta #A6402A, madera del arco #5A3A1E, plumas #F3E9D8 con punta #2A1C12, cielo degradado #D98A3A → #EDBE72 → #F6DFAE, sol #FBF0D2, colinas #B5803F / #9C6B2E.

## 4. Tipografía

- Marca: **Cinzel** (Google Fonts, 500 y 700), mayúsculas. "ARCO" 52 px/700, tracking 0.1em; "FISIO" 26 px/500, tracking 0.42em.
- Interfaz: **Roboto Flex**. Escala: hero 72/600 · display 44 · title 20/600 · body 16 · button 15/600 · label 13/500 · caption 11/500 (mínimo).

## 5. Movimiento

Duraciones: 90 (pulsación) · 180 (cambio de valor) · 300 (pantallas) · 500 (énfasis) · 1600 ms (respiración/ambiente).
Curvas: estándar `cubic-bezier(.2,0,0,1)` · entrada `cubic-bezier(.05,.7,.1,1)` · salida `cubic-bezier(.3,0,.8,.15)` · rebote `cubic-bezier(.34,1.56,.64,1)`.
Las animaciones con valores continuos (ángulo, cuerda, flecha) se calculan por frame con `requestAnimationFrame` (en el prototipo se usó un intervalo de 33 ms).

## 6. Pantallas y animaciones (archivo de referencia entre paréntesis)

1. **Intro** (`Main.dc.html`, 9 s; en la app se reproduce una sola vez al abrir, con opción de saltar):
   - 0–7 %: aparece la escena de pradera (cielo degradado, sol que sube, colinas, pasto que se mece con seno por brizna).
   - 5–18 %: entra el guerrero desde la izquierda (−40 px → 0, fade). El tocado de 13 plumas en abanico y la cola de 7 plumas oscilan con el viento.
   - 22–42 %: tensa el arco: la cuerda (punto de anclaje) retrocede 52 px y el brazo se dobla; la flecha va con la cuerda.
   - 46 %: suelta. La cuerda vibra (seno amortiguado), la flecha sale disparada cruzando el sol, una pluma se desprende y flota girando.
   - 56–66 %: un círculo verde selva (#1F3A2B) se expande desde el centro y cubre la escena.
   - 63–80 %: anillo dorado se dibuja (stroke-dashoffset) + banda de chaquira.
   - 66–76 %: aparece "ARCO / flecha / FISIO / Cada grado cuenta" subiendo 14 px.
2. **Goniómetro** (`Goniometro.dc.html`): arco verde que crece con el ángulo; perilla con chevron en la punta; cuerda punteada desde 0° hasta la punta (siempre se ve un arco tensado); diana en el objetivo que crece con rebote al alcanzarlo; chip pasa a "Objetivo alcanzado" (verde). Fondo: abanico de plumas.
3. **Rueda de ángulo** (`RuedaAngulo.dc.html`): corona de ticks cada 5° (mayores cada 30° con etiqueta) que gira con detenciones y rebote 180 ms; flecha indicadora fija arriba que "golpea" en cada detención. Fondo: rayos de sol.
4. **Arco doloroso** (`ArcoDoloroso.dc.html`): banda roja tenue 70–110° que late (1600 ms); al cruzarla la perilla tiembla y se pinta de rojo, y el tramo recorrido se marca en rojo; chip "Dolor · 70–110°" / "Sin dolor". Fondo: plumas.
5. **Chips de zona** (`ChipZona.dc.html`): entran escalonados desde la derecha; cada uno con mini arco animado: Óptima = flecha que vuela; Precaución = cuerda vibrando; Dolor = arco que se sacude y flecha caída; Descanso = arco destensado que respira. Fondo: franjas de chaquira.
6. **Progreso por pasos** (`Progreso.dc.html`): anillo de 10 segmentos; cada repetición, una flecha vuela del centro hacia su segmento y lo rellena (dorado el más reciente, verde los anteriores); pastillas de serie abajo. Fondo: patrón de flechas.
7. **Temporizador de descanso** (`Temporizador.dc.html`): anillo azul de descanso que se vacía con halo que respira; la cuerda del arco central se tensa con el tiempo; en 0 suelta la flecha, el anillo pasa a verde y dice "¡Listo!". Fondo: pradera.
8. **Launcher hexagonal** (`Launcher.dc.html`): 7 celdas en panal (Medir, Sesión, Rutinas, Resumen, Dolor, Guía IA, Ajustes); la enfocada escala 1.2, se pinta verde con sombra; vecinas 0.94, lejanas 0.82 (ojo de pez), transición 300 ms con rebote. Fondo: chaquira.
9. **Botón píldora** (`Boton.dc.html`): al presionar escala 0.95, onda que se expande, la flecha del botón retrocede y sale disparada con estela dorada. Fondo: pradera.
10. **Tarjetas y lista** (`Lista.dc.html`): tarjetas entran como flechas que se clavan (desde la derecha con skew, rebote) escalonadas 120 ms; miniatura con mini-anillo de rango que se rellena. Fondo: flechas.
11. **Resumen** (`Resumen.dc.html`): flecha se clava en una diana (vibra), la diana se comprime y dos ondas se expanden; luego suben "142°" y chip "+12° vs. sesión anterior". Fondo: rayos de sol.

Los datos (150°, 142°, nombres de ejercicios) son de ejemplo.

## 7. Cómo implementarlo

1. Revisa el stack actual del proyecto y respétalo (si no hay, usa HTML + CSS + JS o React).
2. Crea los tokens de §3–§5 como variables CSS.
3. Crea un componente `WatchFrame` (marco + cristal + fondo con slot de ilustración).
4. Porta cada pantalla de `referencias/` en el orden de §6, conservando coordenadas SVG (viewBox 0 0 384 384, 0° arriba, sentido horario) y tiempos.
5. Conecta el ángulo real (giroscopio o simulación) al Goniómetro y al Arco doloroso.
6. Verifica cada pantalla abriéndola en el navegador y comparándola con su referencia.
