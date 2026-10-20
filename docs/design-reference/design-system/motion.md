# Movimiento

Preparado para las animaciones de apertura, launcher, transiciones, modos de entrenamiento, medidor e IA.

| Token | Valor | Para |
|---|---|---|
| `dur-instant` | 90 ms | Pulsación, cambio de chip |
| `dur-quick` | 180 ms | Controles, valor de la rueda |
| `dur-standard` | 300 ms | Transición entre pantallas |
| `dur-emphasis` | 500 ms | Apertura de app, llegar al objetivo |
| `dur-ambient` | 1600 ms | Respiración de la IA, pulso del temporizador |
| `ease-standard` | cubic-bezier(0.2, 0, 0, 1) | Por defecto |
| `ease-enter` | cubic-bezier(0.05, 0.7, 0.1, 1) | Entradas |
| `ease-exit` | cubic-bezier(0.3, 0, 0.8, 0.15) | Salidas |
| `spring-snappy` | rigidez 700, amortiguación 0.75 | Rueda con detenciones de 5° |
| `spring-gentle` | rigidez 300, amortiguación 0.85 | Panal del launcher, arco del goniómetro |
| `spring-bouncy` | rigidez 400, amortiguación 0.6 | Celebración del resumen |

Reglas: las transiciones entre pantallas son radiales (escala 0.92→1 + fundido desde el centro del círculo); nada entra por los lados rectos. `prefers-reduced-motion` reduce todo a fundidos.
