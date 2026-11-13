# 04 · Animaciones

Principio: el movimiento cuenta la historia del agua, pero **durante el ejercicio no hay animación decorativa**. Solo se anima lo que informa (el nivel del agua y los anillos de progreso).

## 1. Animación de carga (obligatoria en cada apertura de la app)

Duración total: **≈ 3,8 s** (máximo 4 s). Se reproduce siempre al abrir. Después va a la cara del reloj (o a la bienvenida si es la primera vez).

| Tiempo | Qué pasa |
|---|---|
| 0,2 – 0,9 s | Una **gota** (círculo r = 8, color `acc`) cae desde `y = 22` hasta `y = 318`, con aparición rápida y desvanecimiento al final. Curva `cubic-bezier(.5, 0, .9, .6)`. |
| 0,85 – 2,05 s y 1,15 – 2,35 s | Dos **ondas** (círculos r = 70 en `(192, 326)`, trazo 3 y 2 px, color `acc`) escalan de .15 a 1 y se desvanecen (opacidad .8 → 0). |
| 0,9 – 2,8 s | El **agua sube** desde el fondo hasta el nivel de 90° (`y = 192`), `translateY(190px → 0)`, 1,9 s, `cubic-bezier(.3, .7, .3, 1)`. Las capas de ola derivan en horizontal sin parar. |
| 2,0 – 2,9 s | **Hipo emerge**: opacidad 0 → 1, `translateY(34px) scale(.92)` → normal, 0,9 s, `cubic-bezier(.2, .8, .2, 1)`. Luego flota ±5 px (3 s, bucle). |
| 3,0 – 3,6 s | Aparece el **nombre** "Arco Fisio" (fundido + subida de 10 px). |
| 3,4 – 3,8 s | Aparece el lema en cursiva: "tu hombro, a su ritmo". |

Referencia exacta: `reference/01-Intro.dc.html` y `reference/arco.css` (`@keyframes ld-*`, `dr`, `bob`).

```css
@keyframes dr      { to { transform: translateX(192px) } }
@keyframes bob     { 50% { transform: translateY(-5px) } }
@keyframes ld-drop { 0%{transform:translateY(0);opacity:0} 8%{opacity:1} 90%{opacity:1} 100%{transform:translateY(296px);opacity:0} }
@keyframes ld-rip  { 0%{transform:scale(.15);opacity:.8} 100%{transform:scale(1);opacity:0} }
@keyframes ld-rise { from{transform:translateY(190px)} to{transform:translateY(0)} }
@keyframes ld-in   { from{opacity:0;transform:translateY(34px) scale(.92)} to{opacity:1;transform:none} }
@keyframes ld-fade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
```

Reglas:

- Con **"reducir movimiento"** activo: sin gota ni ondas ni deriva; fundido simple de 0,6 s del logo y el nombre; duración total ≤ 1,5 s.
- La animación no debe bloquear: si la app termina de cargar antes, esperar a que acabe el fundido del nombre (3,8 s) para no cortarla.
- Permitir repetirla en el prototipo con un botón "Reproducir otra vez" (solo demostración).

## 2. Ola (ambiente)

- Dos capas con deriva horizontal en bucle lineal infinito: delantera 8 s, trasera 13 s en sentido inverso (ver `03-geometria-del-reloj.md`).
- Con "reducir movimiento": ola estática.

## 3. Hilo de marea (conexión entre módulos)

El hilo conductor del recorrido: **la ola sube un nivel al avanzar de módulo**. Cada canvas muestra un indicador de 5 barras ("Marea n/5") y un nivel de agua ambiente asociado a la fase.

| Fase | Indicador | Pantallas | Nivel de agua ambiente (`y`) |
|---|---|---|---|
| 1 · Carga | 1/5 | 01 | 338 |
| 2 · Arranque | 2/5 | 02, 03 | 318 |
| 3 · Preparar | 3/5 | 04–12 | 258–348 (según pantalla; ver cada HTML) |
| 4 · Sesión | 4/5 | 13, 14, 15 | 13: el nivel es el ángulo real; 14: ≈ 300; 15: baja con el temporizador |
| 5 · Resultados | 5/5 | 16–20 | 262–356 |

Transición entre pantallas (a implementar):

1. La pantalla saliente deja el agua en su nivel; la entrante arranca con el agua en el nivel de la saliente.
2. El agua se anima al nivel de la nueva pantalla: **600 ms**, `cubic-bezier(.3, .7, .3, 1)`.
3. El contenido de la pantalla nueva aparece con fundido + subida de 10 px (240 ms) cuando el agua ya está llegando.
4. Con "reducir movimiento": cambio instantáneo de nivel y fundido de 150 ms.
5. Al terminar una sesión, el agua "se calma": la amplitud de la ola baja a la mitad durante el resumen.

## 4. Animaciones funcionales (en medición)

- **Nivel de agua y marcador** siguen el ángulo en tiempo real. Suavizar la lectura (media móvil o filtro de baja frecuencia) para evitar temblor; transición máxima de 120 ms entre lecturas.
- **Barra de sostén** (estado "en objetivo"): crece de 0 a 100 % durante 1 s (`@keyframes hold`).
- **Anillo de calibración:** se llena en 3 s; si el brazo se mueve más de un umbral, se reinicia.
- **Descanso:** el anillo y el agua bajan de forma lineal durante el tiempo configurado.
- Cambios de estado (azul → menta → durazno → coral): cambio de color del progreso y del marcador en ≤ 150 ms, **acompañado siempre de texto, sonido y vibración**.
