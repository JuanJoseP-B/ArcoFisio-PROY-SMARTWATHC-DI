# 02 · Identidad y tokens

## Concepto: "Marea"

La interfaz se basa en el agua. **El nivel del agua dentro del reloj representa el ángulo del brazo**: abajo (0°) el agua está en el fondo; con el brazo arriba (180°) llega al borde superior. La mascota es **Hipo**, un caballito de mar.

### Hipo (caballito de mar)

- Su cuerpo curvo dibuja el arco del hombro; el cuerpo segmentado recuerda una columna que se mueve con control; la cola enrollada es una ola.
- Archivo: `assets/hipo.svg` (viewBox `14 2 84 138`, color de acento `#4263EB`).
- Uso: carga, bienvenida, estados vacíos, guía. **No** aparece durante el ejercicio activo (distrae).
- Wordmark: "Arco" en DM Sans 700 + "Fisio" en Newsreader cursiva, color azul hondo.

## Colores (modo claro)

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#EAF0F9` | Fondo del lienzo (fuera del reloj) |
| `paper` | `#F7F9FD` | Fondo de la pantalla del reloj |
| `card` | `#FFFFFF` | Tarjetas y filas |
| `ink` | `#0F1B3D` | Texto principal |
| `ink2` | `#4B5878` | Texto secundario (contraste ≈ 6,7:1 sobre paper) |
| `line` | `#D3DCEF` | Bordes, pistas, divisores |
| `acc` | `#4263EB` | Acento y acciones (≈ 5:1 con blanco) |
| `acc2` | `#2B45B8` | Texto de acento sobre bruma |
| `tint` | `#DCE4FF` | Fondos suaves ("bruma") |
| `onacc` | `#FFFFFF` | Texto sobre `acc` |
| `mint` / `mintd` / `mintt` | `#4FD1B5` / `#0B6B58` / `#D6F5EE` | Objetivo logrado / texto / fondo suave |
| `amber` / `amberd` / `ambert` | `#FFB26B` / `#8F4504` / `#FFE9D2` | Te pasaste, avisos / texto / fondo suave |
| `rose` / `rosed` / `roset` | `#F2668B` / `#A3234B` / `#FDE0E8` | Arco doloroso, acciones destructivas / texto / fondo suave |
| `onm` / `ona` / `onr` | `#06332B` / `#3A1C00` / `#3A0618` | Texto sobre mint / amber / rose |
| `water` | `#4263EB` | Agua (se pinta con opacidad .16 y .30) |

Reglas de color:

- Menta, durazno y coral se distinguen por **luminosidad** además de por tono (aptos para daltonismo).
- **Siempre texto junto al color.** El arco doloroso lleva además **rayado** (ver geometría).
- Texto: ≥ 4,5:1 (≥ 3:1 desde 24 px). Los colores `*d` existen para texto sobre los fondos `*t`.

## Tipografía

Doble tipografía, ambas de Google Fonts:

- **DM Sans** (400, 500, 700): datos, números y acciones. Números con `font-variant-numeric: tabular-nums`.
- **Newsreader cursiva** (400): voz de la guía, saludos y énfasis. **Nunca para cifras.**

| Rol | Estilo |
|---|---|
| `big` (ángulo) | DM Sans 700, 88/1, tracking −0.04em |
| `mid` | DM Sans 700, 48/1, tracking −0.03em |
| `ttl` | DM Sans 700, 21/1.15 |
| `msg` (guía) | Newsreader italic 400, 25/1.15 |
| `lbl` | DM Sans 500, 13.5, mayúsculas, tracking .1em |
| `sub` | DM Sans 500, 15/1.35, color `ink2` |
| botón | DM Sans 700, 17 |

Mínimo 13 px en el reloj.

## Forma y espacio

- Pantalla: círculo 384 × 384, `border-radius: 50%`, sombra de contorno de 3 px `line`.
- Botones: píldora (radio 99), alto mínimo **48 px**. Selectores `+/−`: 56 px (46 px en el constructor). Todo objetivo táctil ≥ 44 px.
- Filas de lista: radio 26, alto mínimo 50, borde 1.5 px `line`.
- Tarjetas de diálogo: radio 30.
- Separación habitual entre elementos del reloj: 6–8 px.

## Iconografía

Trazo de 2 px, 24 × 24, extremos redondeados, color `currentColor`. Catálogo usado: goniómetro (medir), play (sesión rápida), lista (rutinas), arco con "!" (arco doloroso), barras (historial), destello (guía), sliders (ajustes), check, alerta (triángulo con "!"), pausa, siguiente, chevron, más/menos, globo (idioma), altavoz (sonido), vibración, flechas laterales (tolerancia), papelera, sensor (con y sin barra diagonal). Los trazados SVG están en los HTML de `reference/`.

## Semántica de estados (sesión)

| Estado | Condición (objetivo T, tolerancia tol, arco [P1, P2]) | Color | Texto principal | Pill | Sonido | Vibración |
|---|---|---|---|---|---|---|
| Aproximándose | ángulo < T − tol | azul `acc` | "Sigue subiendo" | Aproximándote | tono suave y constante | ninguna |
| En objetivo | T − tol ≤ ángulo ≤ T + tol | menta | "Sostén un segundo" | En objetivo | tono corto al contar la rep | 1 pulso |
| Te pasaste | ángulo > T + tol y < P1 | durazno | "Baja un poco" | Te pasaste +N° | dos tonos graves | 2 pulsos |
| Arco doloroso | P1 ≤ ángulo ≤ P2 | coral + rayado | "Baja, zona dolorosa" | Arco doloroso | tono continuo | 3 pulsos |

Si hay conflicto (p. ej. el objetivo cae dentro del arco), **el arco doloroso tiene prioridad** y la rep no se cuenta.

## Tokens

`tokens/tokens.json` y `tokens/tokens.css` contienen todo lo anterior. La sección `dark` es **solo una propuesta** (no diseñada ni validada).
