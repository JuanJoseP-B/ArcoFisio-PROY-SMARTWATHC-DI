# Arco Fisio v2 · Especificación de la app Garmin y la demo web

Estado: plan de implementación, 2026-11-12.

## 1. Resultado esperado

- **Garmin:** una aplicación Connect IQ de tipo `Watch App`, escrita en Monkey C para el Forerunner 165 estándar. Usa el sensor del reloj para calibrar, medir la inclinación, guiar una sesión y guardar sus resultados localmente. La entrega inicial se instala mediante un `.prg`.
- **Portafolio:** una demo web en React y TypeScript basada en la app actual. Abre desde un enlace y permite completar el recorrido con ángulos simulados desde computador o celular, sin cuenta, reloj ni permiso de movimiento. El diseño definitivo del contenedor del portafolio se integra cuando esté disponible.
- **Diseño compartido:** modo claro *Marea*, Hipo, dial circular con nivel de agua, muesca de objetivo y arco doloroso rayado. Español e inglés en ambas versiones. Portugués y modo oscuro quedan como ampliaciones.

El punto de partida visual es el [handoff de Claude Design](../arco-fisio-handoff/README.md), en particular sus [21 canvas](../arco-fisio-handoff/docs/05-pantallas.md) y la [geometría del dial](../arco-fisio-handoff/docs/03-geometria-del-reloj.md). El comportamiento de referencia es la web actual, etiquetada como `v1.0.0`, y su [spec histórico](spec.md). Cuando el handoff propone una regla diferente, se aplica el criterio de la sección 3.

## 2. Estado de partida y arquitectura

| Parte | Estado observado | Decisión |
|---|---|---|
| `ArcoFisioApp/` | Plantilla Connect IQ con manifiesto `watch-app`, producto `fr165`, API mínima 5.2.0 y permisos aún sin declarar. | Reutilizar el proyecto generado. Separar la lectura del sensor, el motor, el almacenamiento y las vistas. |
| Entorno Garmin | SDK activo 9.3.0 y perfil `fr165` presentes en Windows. | Confirmar compilación y arranque en el simulador como primera fase. |
| Web en la raíz | Vite, React, TypeScript y simulador de ángulo existente con `?sim=1`. | Mantener la estructura y los puntos de entrada. Reutilizar el motor y los datos locales. Reconstruir los componentes visuales que cambien con *Marea*. |
| Handoff | 21 canvas de referencia en modo claro. | Usar HTML, SVG y tokens como referencia. Dibujar los componentes equivalentes con gráficos nativos en Garmin y con CSS/SVG en la web. |

Las dos implementaciones compartirán la **especificación, los ejemplos de entrada/salida y la semántica visual**. El motor TypeScript se reutiliza en la web y se porta a Monkey C donde haga falta. Las fuentes de ángulo entregan muestras con tiempo de captura al motor. Los avisos y el dibujo consumen los resultados del motor, de modo que una animación o un fotograma atrasado no determinen cuándo se cuenta una repetición. Garmin guardará sus datos con almacenamiento local de Connect IQ y la web seguirá usando `localStorage`. Cada historial pertenece a su instalación.

## 3. Reglas y decisiones

| Tema | Criterio para v2 |
|---|---|
| Calibración y ángulo | Conservar la referencia de gravedad con el brazo abajo y el rango de 0° a 180°. En Garmin se mide desde la muñeca. Validar si la postura de brazo extendido permite una lectura suficientemente repetible y documentar las limitaciones observadas. El conteo visual de 3 s del canvas se acepta cuando esté conectado a una comprobación de estabilidad. |
| Objetivo y tolerancia | Objetivo de 0° a 180° en pasos de 5°. Mantener ±2° por defecto y tolerancia configurable. Las muestras que quedan dentro de la tolerancia incluyen los límites. |
| Repeticiones | En v1, sostener el objetivo 1 s marca el sostén. La repetición se registra al bajar hasta el umbral de retorno y puede quedar registrada como no sostenida. El contador que cierra la serie incluye esas repeticiones. Mantener ese comportamiento como referencia de paridad y distinguir «sostén logrado» de «repetición registrada» en la UI. |
| Prioridad del arco doloroso | **Decisión pendiente de producto.** V1 evalúa primero objetivo y sobrepaso. El handoff da prioridad al arco y propone no contar dentro de él. Documentar ambos resultados con objetivo 90°, arco 70°–110° y lectura de 90°, y con objetivo 90°, arco 100°–125° y lectura de 106°. Mantener v1 como referencia para la comparación. Resolver qué aviso se muestra y cómo afecta el conteo antes de cerrar la sesión en vivo. |
| Zonas de aproximación | Mantener las tres zonas internas de aproximación de v1. Se pueden presentar como una familia visual en el nuevo dial y conservar sus diferencias de feedback si el dispositivo las admite. |
| Pérdida de lecturas | Pausar la sesión, conservar el avance en curso y reiniciar el sostén. Verificar que una muestra antigua no pueda completar el segundo de sostén. El tiempo para declarar pérdida se ajusta con la cadencia medida en el reloj. |
| Series y descanso | Mantener el paso a descanso entre series, la opción de saltarlo y la terminación anticipada con sus resultados parciales. Distinguir «sesión completa» de «sesión terminada antes». |
| Rutinas e historial | La primera versión de estas pantallas usa rutinas de un ejercicio y el historial actual. Mantener compatibilidad con los datos web existentes. Rutinas de varios bloques, metas semanales, filtros avanzados y detalle de dolor por repetición se evalúan después del flujo completo. |
| Guía y ajustes | Reutilizar los consejos de reglas locales y mostrar el estado sin datos. Las nuevas sugerencias de objetivo o descanso del canvas requieren una decisión de producto. Confirmar antes de borrar datos. Mantener la semántica de borrado actual mientras no se acuerde conservar ajustes concretos. |

Fuentes de comportamiento: [repeticiones](../src/domain/repetitions.ts), [zonas](../src/domain/zones.ts), [sesión](../src/domain/sessionRun.ts), [series y descanso](../src/domain/workout.ts) y [modelo de datos](../src/data/types.ts).

## 4. Fases y criterios de aceptación

Cada fase tiene una entrega que se puede revisar de forma independiente. Las fases web pueden avanzar mientras se coordina el préstamo del reloj. La prueba física de la fase 01 tiene prioridad cuando el reloj esté disponible.

| Fase | Alcance y canvas | Se considera lista cuando… |
|---|---|---|
| **00 · Base reproducible** | Revisar manifiesto y perfil `fr165`, comprobar la web v1, preparar la plantilla Monkey C y su configuración local. Excluir de Git la clave privada de firma y las salidas generadas antes de agregar archivos. | La plantilla compila y abre en el simulador del Forerunner 165, la web v1 abre con `?sim=1` y quedan documentados los comandos y el estado inicial. |
| **01 · Sensor en el reloj** | Prototipo técnico del **03 y 08**. Declarar permiso de sensor, leer muestras con tiempos, calibrar y dibujar grados. Medir latencia, estabilidad, interrupciones y disponibilidad de tonos/vibración. | Se instala el `.prg` en el reloj real y se registran lecturas de referencia a 0°, 45°, 90° y por encima de 90°, con brazo extendido y repeticiones de la misma postura. Se documenta qué cambia al flexionar el codo o girar la muñeca y qué cadencia de lectura llega a la app. |
| **02 · Identidad y navegación** | **00–07.** Tokens, Hipo, círculo, tipografía, botones y componentes de navegación. Entrada, idioma, estado del sensor, cara, menú y asistente de sesión. Garmin con toque y botones. Web con foco visible, teclado y movimiento reducido. | Se puede navegar desde inicio hasta preparar una sesión. Los textos en español e inglés, el foco y los controles caben en la zona útil del círculo en ambas versiones. |
| **03 · Sesión completa en Garmin** | Completar **08, 12, 13, 15, 16 y 20**. Portar el motor, incorporar el dial *Marea*, arco doloroso, avisos, descanso, resumen y guardado. | Una sesión de dos series se completa en el reloj, incluido el descanso. Se puede terminar antes y recuperar una interrupción de lecturas. Se verifican el máximo, las repeticiones y el aviso de dolor con las reglas acordadas. |
| **04 · Demo funcional de Marea** | Conectar los mismos recorridos de la fase 03 al motor web existente. Añadir control de ángulo accesible fuera del círculo y modo simulado explícito desde la entrada. | Una persona completa una sesión desde escritorio o celular, alcanza el objetivo, ve los avisos y llega al resumen sin conceder permisos. Los mismos ejemplos producen resultados equivalentes en ambos motores. |
| **05 · Rutinas y reproductor** | **09–11 y 14.** Biblioteca, detalle, constructor de un ejercicio, selección y reproducción. | Se puede abrir una rutina incluida, guardar y editar una propia, iniciarla, pausar y continuar. El detalle avisa si el objetivo coincide con el arco según la regla acordada. |
| **06 · Historial, guía y ajustes** | **17–19** y estados restantes de **20**. Historial local, comparación, guía, tolerancia, avisos, idioma y borrado confirmado. | El historial y los ajustes se conservan tras reabrir. Se revisan los estados sin datos, primera sesión, cancelación de borrado y fallo de guardado. |
| **07 · Entrega y portafolio** | Revisar el flujo en reloj real, escritorio y celular. Preparar `.prg` para el modelo, instrucciones de instalación y enlace de la demo. Integrar la presentación visual del portafolio cuando se comparta. | El paquete se instala y abre en el Forerunner 165. El enlace público abre la demo en modo simulado y una persona puede terminar la sesión desde un navegador móvil o de escritorio. El portafolio identifica qué parte está simulada y muestra evidencia del reloj real. |

**Corte mínimo de entrega:** fases 00–04 y publicación del recorrido principal en la fase 07. Las fases 05 y 06 completan el alcance de los canvas. Si el reloj solo está disponible por un periodo corto, aprovechar el préstamo para instalar y medir desde la fase 01 y reservar una segunda prueba para la sesión completa.

## 5. Verificación y seguimiento

- **Paridad del motor.** Usar secuencias de ángulo y tiempo comunes para comprobar sostén de 999 ms y 1000 ms, retorno, sobrepaso, intersección con el arco, pausa sin muestras, salto de descanso y final anticipado. Incluir la primera sesión y comparaciones positivas, negativas y sin cambio.
- **Garmin.** Usar el simulador para navegar y comprobar el diseño. En el reloj físico comprobar el sensor, la respuesta de los avisos, la legibilidad en movimiento y el funcionamiento de toque y botones. Si la lectura desde la muñeca no resulta repetible, registrar la postura y las limitaciones antes de definir el alcance de la sesión guiada.
- **Web.** Comprobar foco, teclado, tacto, movimiento reducido, textos de ambos idiomas y persistencia de datos. Señalar el modo simulado y evitar que el sonido sea indispensable para entender un estado.
- **Flujo del repositorio.** Trabajar desde `develop` en una rama por fase, con la convención `feature/NN-nombre` existente y numeración que no choque con v1. Revisión del usuario al cerrar cada fase antes de mezclar a `develop`. Mantener los commits atómicos y actualizar `PROJECT.md` con el estado y las decisiones aceptadas. La primera implementación empieza en la fase 00.
