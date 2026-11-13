# 07 · Prompt para Codex y plan de trabajo

## Cómo usarlo

1. Descomprime el paquete en la raíz del proyecto (o en una carpeta `design/` dentro de él).
2. Abre el chat de Codex en esa carpeta y pega el **prompt** de abajo.
3. Trabaja por fases (sección "Plan por fases"): pide una fase por mensaje y revisa antes de pasar a la siguiente.

## Prompt (copiar y pegar)

```
Vas a ayudarme a implementar la interfaz de "Arco Fisio", un prototipo académico de
telerehabilitación del hombro que simula un smartwatch circular (el teléfono hace de
pantalla y de sensor). Todo el diseño ya está hecho en el paquete que está en esta
carpeta. Trabaja por bloques pequeños y espera mi confirmación entre fases.

LEE ANTES DE ESCRIBIR CÓDIGO, en este orden:
1. README.md
2. docs/01-producto-y-contexto.md
3. docs/02-identidad-y-tokens.md
4. docs/03-geometria-del-reloj.md
5. docs/04-animaciones.md
6. docs/05-pantallas.md
7. docs/06-comportamiento-y-datos.md
Después abre preview/00-Identidad.html y las demás pantallas en un navegador, y usa
reference/*.dc.html como fuente exacta de textos, medidas y colores. tokens/ tiene los
tokens y assets/hipo.svg es el logo/mascota.

QUÉ HAY QUE CONSTRUIR
- Las 20 pantallas y todos sus estados (normal, carga/permiso, error, confirmación),
  como un círculo de 384 × 384 px de referencia, escalable.
- El dial "Marea": el nivel del agua representa el ángulo del brazo; anillo con objetivo,
  arco doloroso (rayado) y marcador. La matemática exacta está en docs/03.
- La animación de carga de ≤ 4 s en cada apertura, y el hilo de marea entre pantallas (docs/04).
- La lógica de medición: calibración, estados (aproximándose / en objetivo / te pasaste /
  arco doloroso), repeticiones (sostener ≥ 1 s), series y descansos (docs/06).
- Datos guardados localmente en el dispositivo, sin cuentas ni servidor.
- Retroalimentación visual, sonora y por vibración (la vibración/sonido pueden simularse
  en el prototipo si la plataforma no los soporta).
- Modo claro. El modo oscuro todavía no está diseñado: deja los tokens listos para
  añadirlo después (variables/temas), sin implementarlo aún.

RESTRICCIONES
- La tecnología NO está decidida. Antes de escribir código, propón 2 o 3 opciones de stack
  (p. ej. web/PWA, multiplataforma, nativo para reloj) con pros y contras para: sensor de
  inclinación en un teléfono, interfaz circular y SVG animado, almacenamiento local,
  accesibilidad y facilidad de demostración en clase. Recomienda una y ESPERA mi aprobación.
- El significado nunca depende solo del color: siempre texto junto al color; el arco
  doloroso lleva además rayado.
- Objetivos táctiles ≥ 44 px, contraste ≥ 4,5:1, respetar "reducir movimiento".
- Durante el ejercicio no hay animación decorativa; solo se anima lo que informa.
- Los datos de ejemplo (objetivo 90°, arco doloroso 100°–125°, descanso 30 s, rutinas semilla)
  deben ser configurables, no estar fijos en el código.
- Si algo del diseño y de los documentos se contradice, el HTML de reference/ manda en lo
  visual y docs/ manda en el comportamiento. Si falta algo, pregúntame; no lo inventes.

FORMA DE TRABAJAR
- Haz commits atómicos y numerosos (varios commits pequeños en vez de uno grande), con
  mensajes claros en español. No incluyas en commits, código, comentarios ni PRs ninguna
  referencia a herramientas de IA, agentes ni coautorías.
- Entrega cada fase con: qué hiciste, cómo probarlo y qué sigue.
- Empieza ahora por la FASE 0: léelo todo, resúmeme en 10 líneas lo que entendiste,
  lista dudas y propón las opciones de stack. No escribas código todavía.
```

## Plan por fases (pídelo de a una)

| Fase | Objetivo | Criterio de aceptación |
|---|---|---|
| 0 | Leer paquete, resumir, dudas, proponer stack | Resumen correcto y stack aprobado por ti |
| 1 | Proyecto base + tokens (colores, tipografías, radios) + componentes: botón, pill, fila, selector ±, interruptor, chip, diálogo, anillo | Galería de componentes igual a `preview/00-Identidad.html` |
| 2 | Componente **Reloj** (círculo 384 escalable) + **Dial Marea** (ola, anillo, objetivo, arco doloroso, marcador) con ángulo simulado (slider) | Los 4 estados de la pantalla 13 se reproducen cambiando el ángulo |
| 3 | Animación de carga (≤ 4 s) + bienvenida + idioma + permiso/sensor con estados | Cronología de `docs/04` cumplida; estados de permiso denegado y no disponible |
| 4 | Cara, menú radial, selector de ejercicio, sesión rápida (4 pasos) | Navegación del mapa de `docs/05` funcionando |
| 5 | Sensor real (o simulado claramente rotulado) + calibración + medir rango | Calibración de 3 s con reinicio por movimiento; rango máximo guardado |
| 6 | Lógica de sesión: estados, repeticiones (≥ 1 s), series, descanso; sesión en vivo, reproductor, descanso | Reglas de `docs/06` verificadas con pruebas unitarias de la lógica |
| 7 | Rutinas: biblioteca, filtros, detalle, constructor; arco doloroso (marcación y aviso en detalle) | CRUD local de rutinas y arco doloroso |
| 8 | Resumen, historial, Guía IA (reglas locales) | Comparación con la sesión anterior correcta; estados sin datos |
| 9 | Ajustes (idioma, sonido, vibración, tolerancia, borrar datos) + todos los diálogos/errores del canvas 20 | Confirmaciones y estados recuperables completos |
| 10 | Hilo de marea entre pantallas, sonido/vibración, accesibilidad, "reducir movimiento", pulido | Lista de verificación de `docs/06` cumplida |
| 11 (después) | Modo oscuro | Tokens `dark` validados y pantallas revisadas |

## Lista de verificación final

- [ ] Las 20 pantallas y todos sus estados existen y se parecen a `preview/`.
- [ ] La animación de carga dura ≤ 4 s y se ejecuta en cada apertura.
- [ ] El nivel del agua sigue el ángulo y coincide con el marcador del anillo.
- [ ] Ningún estado depende solo del color.
- [ ] Los datos se guardan localmente y "Borrar datos" funciona con confirmación.
- [ ] La lógica de repeticiones, series y descansos tiene pruebas.
- [ ] Sin referencias a herramientas de IA en commits, código ni documentación del repositorio.
