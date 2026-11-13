# 03 · Geometría del reloj (el dial "Marea")

Todas las medidas están en el sistema de coordenadas de **384 × 384** (centro `(192, 192)`). Escalar proporcionalmente para otros tamaños.

## Mapeo ángulo → dial

El ángulo θ (0° a 180°) se dibuja sobre la **mitad derecha** del círculo, de abajo (0°) hacia arriba (180°), con el radio del anillo **R = 170**:

```
x(θ) = 192 + 170 · sin(θ)
y(θ) = 192 + 170 · cos(θ)
```

El **nivel del agua** usa la misma altura: `yAgua(θ) = 192 + 170 · cos(θ)`. Así, la superficie del agua toca el anillo exactamente donde está el marcador del ángulo.

Tabla de referencia (R = 170):

| θ | x | y | | θ | x | y |
|---|---|---|---|---|---|---|
| 0° | 192 | 362 | | 100° | 359.4 | 162.5 |
| 30° | 277 | 339.2 | | 106° | 355.4 | 145.1 |
| 60° | 339.2 | 277 | | 110° | 351.7 | 133.9 |
| 64° | 344.8 | 266.5 | | 125° | 331.3 | 94.5 |
| 72° | 353.7 | 244.5 | | 128° | 326.0 | 87.3 |
| 90° | 362 | 192 | | 150° | 277 | 44.8 |
| 96° | 361.1 | 174.2 | | 180° | 192 | 22 |

## Elementos del anillo

- **Pista:** arco de 0° a 180°, trazo 8 px, color `line`, extremos redondeados.
  `M192 362 A170 170 0 0 0 192 22` (sweep-flag = 0: sentido antihorario en pantalla).
- **Marcas:** el mismo arco con trazo 16 px, color `ink` a opacidad .22 y `stroke-dasharray="1.6 28.07"` (una marca cada 10°; longitud del arco ≈ 534.07).
- **Progreso:** arco desde 0° hasta θ, trazo 8 px: `M192 362 A170 170 0 0 0 x(θ) y(θ)` (flags `0 0`; θ < 180°).
  Color según estado (azul, menta, durazno, coral). Para "te pasaste" y "arco doloroso" se pinta azul hasta el objetivo/límite y el tramo extra en durazno/coral.
- **Objetivo:** muesca fina a la altura de y(T): `M342 y H380`, trazo 4 px `ink`, extremos redondeados (para T = 90°: `M342 192H380`).
- **Arco doloroso [P1, P2]:** tramo del anillo entre y(P1) e y(P2), trazo 12 px coral, más una superposición del color `paper` con `stroke-dasharray="3 6"` a opacidad .7 para el **rayado**.
  Ejemplo 100°–125°: `M359.4 162.5 A170 170 0 0 0 331.3 94.5`.
- **Marcador:** círculo r = 10, relleno del color de estado, borde 4 px `paper`, en `(x(θ), y(θ))`.

## Agua

Dos capas de ola con la superficie en `yAgua(θ)` (la segunda 8 px más abajo):

```
M-192 {y} q48-12 96 0 t96 0 t96 0 t96 0 t96 0 t96 0 t96 0 t96 0 V400 H-192 Z
```

- Periodo horizontal: **192 px**. La capa de atrás va con opacidad .16 y la de delante .30; color `water`.
- La segunda capa usa la misma forma con `q48 12` (cresta invertida) para que se crucen.
- Deriva horizontal: `translateX(0 → 192px)` en bucle lineal (8 s la delantera, 13 s la trasera en sentido inverso). Al ser exactamente un periodo, el bucle es continuo.
- El agua se recorta al círculo del reloj (`overflow: hidden` + `border-radius: 50%`).
- En pantallas sin medición, el agua es **ambiente**: nivel bajo que sube por fases (ver `04-animaciones.md`).

## Anillos circulares de progreso (calibración, reproductor, descanso)

- Radio 170–176 (centro 192,192), trazo 6–8 px, empieza arriba: `transform: rotate(-90 192 192)`.
- Circunferencia: `2π · 176 ≈ 1106` (para r = 170: ≈ 1068). Progreso = `dasharray="{p·C} {C}"`.
- Descanso: el anillo **y** el agua bajan juntos (agua = fracción restante de la altura total).

## Zona segura de contenido

- Círculo de 384: columna central de contenido de **≈ 270 px** de ancho; padding horizontal típico 50–58 px.
- Cerca del borde superior e inferior (y < 60 o y > 324) el ancho útil baja a < 250 px: poner solo elementos pequeños (etiquetas, píldoras, botones de ≤ 170 px).
- Menú radial: 7 botones de 54 px sobre una circunferencia de radio 132 desde las 12 en punto, cada 360/7 ≈ 51.43°. Centros: (192,60), (295.2,109.7), (320.7,221.4), (249.3,310.9), (134.7,310.9), (63.3,221.4), (88.8,109.7).
