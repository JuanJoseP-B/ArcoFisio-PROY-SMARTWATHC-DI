# Arco Fisio

Simulador web de un smartwatch de telerrehabilitación del hombro. Proyecto académico de Diseño de Interfaces.

El teléfono hace de sensor y de pantalla del reloj: al inclinar el brazo se calcula el ángulo en vivo y el reloj guía al usuario para **llegar** al ángulo prescrito y **no pasarse**, evitando su arco doloroso, con feedback visual, sonoro y por vibración. La app es estática (sin servidor ni cuentas) y guarda todo en `localStorage`. Está en español e inglés.

Stack: Vite + React 18 + TypeScript estricto + Vitest. Sin librerías de rutas ni de i18n: todo es propio.

> Versión 1.0. La especificación completa está en [`docs/spec.md`](docs/spec.md), la referencia de diseño en [`docs/design-reference/`](docs/design-reference/) y el estado detallado en [`PROJECT.md`](PROJECT.md).

## Qué incluye

- **Intro y cara del reloj**, con primera ejecución (idioma y permiso del sensor).
- **Sesión en vivo**: goniómetro con zonas (lejos, aproximación, muy cerca, objetivo, sobrepaso, dolor), repeticiones, series y descansos.
- **Medir rango** con calibración «brazo abajo».
- **Rutinas**: biblioteca, detalle, constructor propio y reproductor con pausa y progreso.
- **Arco doloroso**: se marca con dos toques y avisa dentro de la sesión.
- **Guía IA** con reglas locales (sin servicio externo), **Resumen** con cambio de rango con signo e **Historial**.
- **Ajustes**: idioma, sonido, vibración, tolerancia y borrar datos.
- **Accesibilidad**: contraste mínimo 4,5:1, foco visible, `prefers-reduced-motion`, controles con nombre y estados anunciados.

## Requisitos

- Node.js 20 o superior
- npm

## Cómo ejecutar

```sh
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve el build de producción
```

Otros scripts:

```sh
npm run typecheck      # tsc --noEmit
npm run test           # Vitest (una pasada; tarda unos 2,5 minutos)
npm run test:coverage  # Vitest con cobertura
npm run lint           # ESLint
npm run format         # Prettier (escribe); format:check solo comprueba
```

Sin teléfono, añade `?sim=1` a la URL: aparece un deslizador de ángulo fuera del círculo y el sensor arranca calibrado en 0°.

## Cómo probar en el teléfono

Los sensores de movimiento (`devicemotion`) solo funcionan en un **contexto seguro (HTTPS)** y, en iPhone, exigen un permiso concedido con un toque del usuario.

1. **Despliegue en Vercel (recomendado):** importa el repositorio; `vercel.json` ya fija el build y permite los sensores, la vibración y el wake lock. Abre la URL HTTPS en el teléfono.
2. **Desarrollo local con túnel HTTPS:** ejecuta `npm run dev -- --host` y expón el puerto 5173 con un túnel HTTPS (por ejemplo `cloudflared tunnel --url http://localhost:5173` o `ngrok http 5173`). Abre la URL del túnel en el teléfono.
3. **Misma red Wi‑Fi sin HTTPS:** `http://<ip-del-computador>:5173` abre la interfaz, pero el navegador no entrega datos del sensor. Sirve para revisar solo lo visual.

Detalles por plataforma:

- **Android · Chrome:** sensor, audio y vibración funcionan.
- **iPhone · Safari:** el permiso de movimiento se pide dentro de un toque; iPhone no permite vibrar desde la web, así que queda lo visual y lo sonoro.

La lista completa para verificar en cada teléfono está en [`docs/qa-checklist.md`](docs/qa-checklist.md).

## Guion de la demostración

1. Abrir la URL de Vercel en el teléfono. Aparece la intro y luego la cara del reloj.
2. Ajustes → idioma: mostrar español e inglés.
3. Medir rango → permitir sensores → **brazo abajo** → calibrar (0°).
4. Sesión → Abducción → rueda de ángulo → objetivo 90°.
5. Subir el brazo despacio: el número y el anillo siguen el ángulo en vivo.
6. Aproximación → pulsos cada vez más rápidos → **90°: verde y acorde** → pasarse: **rojo y zumbido**.
7. Dolor → marcar el arco 70°–110° → en la sesión, aviso al entrar.
8. Terminar → Resumen con el rango máximo y la comparación con signo (+/−).
9. Recargar la página: los datos siguen ahí.

## Estructura

```
src/
  domain/    lógica pura (ángulos, zonas, repeticiones, estadísticas, guía)
  data/      repositorios sobre localStorage
  sensors/   adaptadores de ángulo (devicemotion y simulado)
  feedback/  audio, vibración y wake lock
  i18n/      diccionarios es/en (falta una clave = no compila)
  design/    tokens, variables CSS y movimiento
  ui/        componentes del reloj
  screens/   pantallas y navegación por pila
  app/       montaje, escala y modo simulador
```

Las capas `domain/`, `data/`, `sensors/`, `feedback/` e `i18n/` no importan React.

## Flujo de trabajo

GitFlow con una rama por etapa (`feature/NN-nombre`) que se mezcla a `develop` con `--no-ff` y se etiqueta `v0.N.0`. `main` recibe `develop` únicamente al final. Los commits siguen Conventional Commits en inglés. Ver [`CLAUDE.md`](CLAUDE.md).

## Licencia

MIT. Ver [`LICENSE`](LICENSE).
