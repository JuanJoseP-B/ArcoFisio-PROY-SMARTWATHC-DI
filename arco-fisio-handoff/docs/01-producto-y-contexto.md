# 01 · Producto y contexto

## Qué es

Arco Fisio es un prototipo académico de una aplicación de **telerehabilitación del hombro**. Simula la interfaz de un **smartwatch circular**. En la demostración, el teléfono funciona como pantalla y como sensor: al inclinar el brazo al que está sujeto, la app calcula el ángulo y guía a la persona durante el ejercicio.

La app ayuda a la persona a:

- Llegar al ángulo indicado para el ejercicio.
- Evitar sobrepasar el ángulo objetivo.
- Identificar y evitar su **arco doloroso**, que puede marcar previamente.
- Seguir repeticiones, series y descansos.
- Recibir orientación visual y, en el producto, también **sonora y por vibración**.

El proyecto original es una app web estática, sin cuentas ni servidor; los datos se guardan **localmente en el dispositivo**. El diseño representa una interfaz de reloj aunque el prototipo se vea en la pantalla de un teléfono. Es un proyecto para la materia de Diseño de interfaces: el diseño debe sobresalir.

## Cómo funciona la medición

- La persona **calibra** el sensor con el brazo colgando: esa posición es **0°**.
- Brazo horizontal = **90°**. Brazo elevado = hasta **180°**.
- La pantalla muestra el ángulo actual y su relación con el objetivo: aproximándose, en objetivo, sobrepasado o dentro del arco doloroso.
- Una **repetición cuenta** cuando se llega al objetivo y se **sostiene al menos 1 segundo**.
- El **arco doloroso** tiene un límite inferior y uno superior; la interfaz comunica claramente cuándo el movimiento entra en ese rango.
- La **Guía IA** usa reglas locales sobre sesiones previas; no es un servicio externo ni un diagnóstico médico.

## Flujo principal

La persona abre la app, completa la configuración inicial si es la primera vez y llega a la cara del reloj. Desde el menú principal accede a:

1. Medir el rango de movimiento y calibrar el sensor.
2. Iniciar una sesión rápida: elegir ejercicio y configurar ángulo, repeticiones, series y descanso.
3. Buscar una rutina, revisar su detalle e iniciar el reproductor.
4. Crear una rutina personalizada.
5. Marcar o revisar el arco doloroso.
6. Consultar el resumen de una sesión y el historial.
7. Consultar la Guía IA y cambiar los ajustes.

## Presentación

- Cada pantalla es la vista del reloj: círculo de **384 × 384 px** de referencia. Toda la información importante cabe dentro del círculo.
- No es una app móvil convencional a pantalla completa. En el teléfono se muestra el círculo centrado.
- Se usa contenido de ejemplo coherente (objetivo 90°, abducción, arco doloroso 100°–125°); debe poder cambiarse.

## Restricciones de diseño

- La información y las acciones deben entenderse **sin mirar continuamente la pantalla** (alguien está haciendo ejercicio).
- **El color nunca va solo**: siempre acompañado de texto (y de patrón para el arco doloroso).
- Considerar estados normales, de carga o permiso, de error y de confirmación.
- No depender de una tecnología concreta.

## Lista de pantallas (20 + sistema)

| # | Canvas | Archivo |
|---|---|---|
| 00 | Identidad y sistema | `reference/Main.dc.html` |
| 01 | Intro y carga | `01-Intro` |
| 02 | Selección de idioma | `02-Idioma` |
| 03 | Sensor y permisos (denegado, no disponible) | `03-Sensor` |
| 04 | Cara principal del reloj | `04-Cara` |
| 05 | Menú principal | `05-Menu` |
| 06 | Selector de ejercicio | `06-Ejercicio` |
| 07 | Configuración de sesión rápida | `07-SesionRapida` |
| 08 | Rango y calibración | `08-Calibracion` |
| 09 | Biblioteca de rutinas | `09-Rutinas` |
| 10 | Detalle de rutina | `10-DetalleRutina` |
| 11 | Constructor de rutina | `11-Constructor` |
| 12 | Marcación del arco doloroso | `12-ArcoDoloroso` |
| 13 | Sesión en vivo | `13-SesionVivo` |
| 14 | Reproductor de rutina | `14-Reproductor` |
| 15 | Descanso entre series | `15-Descanso` |
| 16 | Resumen de sesión | `16-Resumen` |
| 17 | Historial | `17-Historial` |
| 18 | Guía IA | `18-GuiaIA` |
| 19 | Ajustes | `19-Ajustes` |
| 20 | Estados y diálogos | `20-Estados` |
