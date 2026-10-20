# Arco Fisio

Simulador web de un smartwatch de telerrehabilitación del hombro. Proyecto académico de Diseño de Interfaces.

El teléfono hace de sensor y de pantalla del reloj: al inclinar el brazo se calcula el ángulo en vivo y el reloj guía al usuario para llegar al ángulo prescrito sin pasarse. La app es estática (sin servidor) y guarda todo en `localStorage`.

Stack: Vite + React 18 + TypeScript estricto + Vitest.

> Estado: en construcción por etapas. La especificación completa está en [`docs/spec.md`](docs/spec.md) y la referencia de diseño en [`docs/design-reference/`](docs/design-reference/).

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
npm run test           # Vitest (una pasada)
npm run test:coverage  # Vitest con cobertura
npm run lint           # ESLint
npm run format         # Prettier (escribe)
```

## Cómo probar en el teléfono

Los sensores de movimiento (`devicemotion`) solo funcionan en un **contexto seguro (HTTPS)** y, en iPhone, exigen un permiso concedido con un toque del usuario.

1. **Despliegue en Vercel (recomendado):** abre la URL HTTPS en el teléfono. Vercel sirve HTTPS por defecto.
2. **Desarrollo local con túnel HTTPS:** ejecuta `npm run dev -- --host` y expón el puerto 5173 con un túnel HTTPS (por ejemplo `cloudflared tunnel --url http://localhost:5173` o `ngrok http 5173`). Abre la URL HTTPS del túnel en el teléfono.
3. **Misma red Wi‑Fi sin HTTPS:** `http://<ip-del-computador>:5173` abre la interfaz, pero el navegador del teléfono no entrega datos del sensor. Sirve para revisar solo lo visual.

Sin teléfono, añade `?sim=1` a la URL para mostrar el simulador de ángulo en el computador (disponible desde las etapas del sensor).

## Flujo de trabajo

GitFlow con una rama por etapa (`feature/NN-nombre`) que se mezcla a `develop` con `--no-ff` solo tras la aprobación del usuario. `main` recibe `develop` únicamente al final. Los commits siguen Conventional Commits en inglés. Ver [`CLAUDE.md`](CLAUDE.md).

## Licencia

MIT. Ver [`LICENSE`](LICENSE).
