# Arco Fisio v2 · Especificación vigente — solo Garmin

Actualizado: 2026-11-13. Fuente de verdad del alcance, comportamiento y fases futuras.

## 0. Alcance confirmado y continuidad entre chats

**El usuario canceló por completo la página web y la demo. El único producto que se desarrolla y entrega es la app nativa para Garmin Forerunner 165.** Esta decisión sustituye cualquier planificación anterior de demo, portafolio web, React, Vite, navegador, teléfono como sensor o despliegue en Vercel.

- No desarrollar, reparar, completar, probar como requisito de fase ni publicar una versión web. No crear una interfaz web para suplir la falta del reloj.
- `src/`, los scripts npm y documentos web históricos permanecen como antecedentes. Su presencia no autoriza trabajo sobre ellos. No se pide borrarlos.
- Los HTML/SVG del handoff son referencias para dibujar la interfaz nativa; no son otra aplicación por implementar.
- Sin hardware: pruebas Monkey C, muestras sintéticas y simulador Connect IQ para `fr165`.
- Mantener la numeración: **04 cancelada; después de 03 sigue 05**, luego 06 y 07. No reutilizar 04 para otro producto.
- «Continúa», «haz la siguiente fase» o «termina el proyecto» se interpretan dentro de este alcance Garmin. Solo una instrucción explícita nueva del usuario puede reabrir la web.
- Al iniciar un chat: leer `AGENTS.md`, `PROJECT.md`, este SPEC y el informe/handoff; comprobar rama, worktrees y cambios locales antes de concluir que falta una implementación.

## 1. Producto y diseño

Arco Fisio es un proyecto académico de Diseño de Interfaces para guiar ejercicios de hombro desde un **Forerunner 165 estándar**. Aplicación Connect IQ `watch-app`, Monkey C, producto `fr165`, API mínima declarada 5.2.0 y permiso `Sensor`. Entrega instalable: `.prg` firmado con la clave local no rastreada.

Calibra una referencia de gravedad, mide inclinación desde la muñeca, muestra ángulo y estados de aproximación, registra repeticiones y series, administra descansos y guarda resultados en el reloj. No requiere servidor, cuentas, servicio externo de IA ni app de teléfono.

Identidad: **Marea claro**, Hipo, dial circular con agua, muesca de objetivo y banda rayada del arco doloroso. Español e inglés. Toque y botones físicos permiten las acciones principales. Color y sonido nunca son la única forma de comunicar un estado.

Referencia visual: [handoff](../arco-fisio-handoff/README.md), [pantallas](../arco-fisio-handoff/docs/05-pantallas.md) y [geometría](../arco-fisio-handoff/docs/03-geometria-del-reloj.md). Adaptar tipografía y distribución a métricas reales de Connect IQ: ninguna instrucción esencial puede quedar cortada o superpuesta. Los planes web incluidos en el handoff están sustituidos por este SPEC.

## 2. Arquitectura y estado de partida

| Parte | Responsabilidad |
|---|---|
| `SensorReader.mc` | Acelerómetro, tiempos de captura, disponibilidad y pérdida de señal. |
| `ArmTracker.mc`, `AngleMath.mc`, `CalibrationHold.mc` | Gravedad de referencia, filtro, ángulo, estabilidad y muestras para el motor. |
| `source/logic/` | Modelos puros: navegación, asistente, zonas, repeticiones, series, descanso, arco y registro. |
| `source/ui/`, `Palette.mc` | Pantallas, controles, dibujos Marea y navegación nativa. |
| `Prefs.mc`, `CalibrationStore.mc` | Persistencia con `Application.Storage`; tratar datos corruptos y fallos de escritura. |
| `resources/`, `resources-spa/` | Recursos y textos es/en. |
| `source/tests/` | Pruebas Monkey C en simulador. |

Código activo: `ArcoFisioApp/`. Las muestras llegan al motor con su **tiempo de captura**. Un fotograma o animación no puede avanzar por sí solo una repetición. Los modelos puros no leen sensores ni el reloj del sistema; pantallas, avisos y guardado consumen sus resultados.

Estado revisado: fase 02 integrada en `develop` mediante `47b11ac`; la carpeta principal permanece en su rama de fase 02. Fase 03 en otro worktree, rama `feature/03-v2-sesion-garmin`, motor confirmado hasta `fb9bcf6` y archivos locales incompletos. Consultar [PROJECT.md](../PROJECT.md) y [revisión](phase-02-03-review.md). La aceptación física de fase 01 sigue pendiente.

## 3. Reglas del comportamiento

| Tema | Regla |
|---|---|
| Calibración y lectura | Referencia «brazo abajo», lectura 0°–180°, cuenta de 3 s ligada a estabilidad. Movimiento reinicia la cuenta. Guardar referencia y avisar si falla. La inclinación de muñeca no equivale automáticamente al ángulo del hombro. |
| Objetivo y tolerancia | Objetivo especificado 0°–180° en pasos de 5°; tolerancia predeterminada ±2°, límites inclusivos. El asistente actual parte de 10°: discrepancia pendiente de resolver explícitamente y probar en límites, especialmente 0°. No adaptar el requisito al código silenciosamente. |
| Asistente rápido | Ejercicio, objetivo, repeticiones, series, descanso. Valores iniciales actuales: 90°, 10 repeticiones, 3 series, 30 s; límites implementados: 1–50 repeticiones, 1–10 series, 5–180 s en pasos de 5. Guardar/restaurar opciones válidas. |
| Sostén y repetición | Sostener objetivo 1000 ms marca el sostén. Registrar repetición al retornar al umbral; puede ser no sostenida. Distinguir «sostén logrado» de «repetición registrada». Una muestra repetida o antigua no avanza el sostén. |
| Aproximación | Conservar zonas lejos, aproximación y cerca; pueden compartir familia visual y mantener avisos distinguibles donde el dispositivo lo permita. |
| Arco doloroso | **Decisión de producto pendiente antes de cerrar 03.** Regla histórica: objetivo/sobrepaso antes que dolor. Alternativa: dolor primero. `EngineConfig.PAIN_RULE` mantiene la histórica por defecto. Probar objetivo 90° con arco 70°–110° a 90°, y arco 100°–125° a 106°. La alternativa implementada impide sostén dentro del arco, pero sigue registrando repetición al retornar: no afirmar que elimina toda repetición dolorosa. Acordar aviso y conteo definitivos. |
| Pérdida de lecturas | Pausar, conservar avance y reiniciar sostén en curso. No consumir muestras pendientes antiguas como nuevas al reanudar. Probar tanto modelo como conexión lector→cola→sesión. Ajustar tiempos con mediciones físicas. |
| Series y descanso | Transición entre series, cuenta, salto de descanso y final anticipado con resultados parciales. Distinguir completada/detenida; comprobar salto de la última serie. |
| Resumen y guardado | Máximo, repeticiones registradas/sostenidas, series y terminación. Comparación con signo o primera sesión. No anunciar guardado si falla `Application.Storage`. Historial exclusivo de la instalación Garmin. |
| Rutinas | Un ejercicio en la primera entrega. Sin importación ni sincronización web. Varios bloques y metas semanales reales requieren ampliación explícita. |
| Guía y ajustes | Consejos de reglas locales, estado sin datos, idioma, tolerancia, avisos y borrado confirmado. Nuevas sugerencias del handoff requieren decisión de producto. |

El código histórico puede consultarse para entender fórmulas y ejemplos; no se exige mantener dos productos ni ejecutar pruebas web para aceptar Garmin. Este SPEC prevalece cuando difiera del comportamiento histórico.

## 4. Fases y aceptación

| Fase | Alcance Garmin | Aceptación |
|---|---|---|
| **00 · Base reproducible** | Manifiesto, perfil, SDK, firma local y plantilla. Integrada. | Compila y abre en simulador; comandos documentados; clave y salidas fuera de Git. Comprobaciones web antiguas son historia, no requisitos vigentes. |
| **01 · Sensor** | Prototipo de canvas 03 y 08: leer, calibrar, medir y diagnosticar. | Instalar en reloj y registrar referencias 0°, 45°, 90° y >90°, repetibilidad, postura, cadencia, latencia, interrupciones y avisos. Sigue abierta hasta prueba física. |
| **02 · Identidad y navegación** | Canvas 00–07: carga, bienvenida, idioma, sensor, cara, menú, ejercicio, asistente. | Recorrido hasta preparar sesión con toque y botones; es/en legibles dentro del círculo. Compilación, tests y revisión visual. Corregir superposiciones y textos esenciales truncados. |
| **03 · Sesión completa** | Canvas 08, 12, 13, 15, 16 y 20: motor conectado a muestras, dial, arco, avisos, descanso, resumen y persistencia. | Dos series con descanso; final anticipado; pérdida/recuperación; máximos y conteo correctos; guardado y errores visibles. Modelos con muestras sintéticas y recorrido integrado observado en simulador. Validación física identificada aparte como pendiente. |
| **04 · CANCELADA** | Antigua demo web, cancelada por el usuario el 2026-11-13. | **No implementar, reactivar ni convertir en requisito de otra fase.** |
| **05 · Rutinas y reproductor** | Canvas 09–11 y 14: biblioteca, detalle, constructor de un ejercicio, selección, pausa y reproducción Garmin. | Abrir incluida; guardar/editar propia; iniciar, pausar y continuar; advertir coincidencia con arco según regla acordada. Reutilizar motor de 03. |
| **06 · Historial, guía y ajustes** | Canvas 17–19 y diálogos restantes del 20. | Historial/ajustes sobreviven al reinicio; comparación, primera sesión, sin datos, cancelación de borrado y fallo de almacenamiento. |
| **07 · Entrega Garmin** | `.prg` para `fr165`, instalación y evidencia. | Instalar y completar recorrido en reloj físico; legibilidad en movimiento, toque, botones, sensor y avisos. Documentar resultados y limitaciones. Sin página, alojamiento, enlace de demo ni portafolio web. |

**Orden:** terminar pendientes de 02 y 03; después 05, 06 y 07. Aprovechar préstamo del reloj para validación física de 01 y sesión. Avanzar en lógica/pantallas sin hardware; no declarar validación física por resultados del simulador.

**Corte mínimo:** fases 00–03 y empaquetado/verificación física de 07. Las fases 05 y 06 completan funciones restantes. La fase 04 no forma parte de ninguna entrega.

## 5. Trabajo sin smartwatch

1. Compilar código **actual**, incluidos cambios locales, normal y tests con `monkeyc -d fr165 -l 3 -w`. [Comandos](phase-01-handoff.md). Diferenciar resultado de un commit del trabajo sin confirmar.
2. Ejecutar Monkey C con `monkeydo ... fr165 /t`, simulador previamente abierto. Los modelos puros no necesitan sensor.
3. Secuencias deterministas `(ángulo, tiempo)`: 999/1000 ms, retorno, sobrepaso, arco, muestras repetidas, pausas, recuperación, dos series, descanso, saltos y final anticipado.
4. Para recorrido completo, conectar muestras sintéticas **solo de desarrollo/pruebas** al mismo flujo del sensor; indicar que son simuladas, permitir interrupción/reanudación y evitar guardarlas como mediciones reales. El paquete normal usa el sensor del reloj y no inventa lecturas cuando falta.
5. Revisar pantallas en simulador `fr165`: textos es/en, tamaños, contraste, foco por botones, toque, volver/cancelar, límites y diálogos. Los tests del motor no sustituyen revisión visual.
6. Cuando haya reloj, ejecutar [plan físico](sensor-test-plan.md) y [registro](phase-01-device-record.md). Solo allí se validan precisión/repetibilidad, latencia, percepción de avisos y legibilidad en movimiento.

## 6. Continuidad, ramas y cierre

- Usar `git worktree list`: no concluir que 03 no existe por ver una pantalla provisional en 02.
- Una rama por fase con convención existente `feature/NN-v2-...`; preservar cambios locales y trabajar en el worktree correcto. No mezclar ramas solo para actualizar documentación.
- Actualizar `PROJECT.md`, handoff/informe y tareas al cambiar estado. Separar implementado, compilado, probado por modelos, observado en simulador y validado físicamente.
- Commits atómicos en inglés, sin atribución. No heredar metas artificiales de número de commits del plan web.
- Cierre con revisión del usuario; merge a `develop` solo tras «aprobado». `main` lo integra el usuario. Esta revisión no autoriza comenzar otra fase.
- Si se pide una fase cancelada, explicar cancelación y señalar la fase Garmin pendiente. Los documentos archivados no reabren la web.
