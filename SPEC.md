# ESPECIFICACIÓN TÉCNICA Y GUÍA DE EJECUCIÓN (CLAUDE CODE)
## Proyecto: "Arco Fisio" — Simulador Wearable de Rehabilitación (Hito 60% UI/Interacción)

---

### 1. Contexto, Visión del Sistema y Alcance (60%)

#### 1.1. Propósito Clínico y Problema
"Arco Fisio" es una solución wearable orientada a la telerrehabilitación del complejo articular del hombro, específicamente en el movimiento de **abducción activa en el plano frontal**. El propósito fundamental es guiar al paciente mediante biofeedback háptico sensorial progresivo para alcanzar de manera exacta un ángulo diana prescrito (por defecto **90°**), eliminando la necesidad de que el paciente desvíe la mirada o adopte posturas compensatorias para visualizar una pantalla.

#### 1.2. Alcance del Hito 60% (Entorno de Simulación Web)
El objetivo de este hito es disponer del 100% de la capa de presentación visual interactiva y su modelo sensorial simulado en un navegador web:
* **Entorno**: Web SPA desarrollada con **React 18+**, **TypeScript** y **Tailwind CSS**.
* **Simulación de Chasis**: Viewport circular/cuadrado con bisel (`384x384px`) representativo de smartwatches contemporáneos.
* **Simulación Sensorial Háptica**: 
  * *Visual*: Ondas de pulso concéntricas estilo sonar (animaciones reactivas basadas en CSS/Tailwind y transformaciones de escala/opacidad).
  * *Auditiva*: Síntesis procedural determinista en tiempo real mediante **Web Audio API** (sin dependencias de archivos de audio externos).
* **Consola de Control Externo**: Banco de pruebas interactivo con slider goniométrico (`0° a 180°`), presets de posición y simulación de movimiento biomecánico continuo.

---

### 2. Fundamentos Biomecánicos y Clínicos

#### 2.1. Fases Cinemáticas de la Abducción de Hombro
Según la literatura anatómica y goniométrica estándar (Criterios AO / AAOS / Taboadela):
1. **Fase 1 (0° a 60°)**:
   * **Articulación motora**: Glenohumeral (enartrosis).
   * **Musculatura**: El supraespinoso actúa en los primeros 30° como estabilizador y abductor inicial junto al manguito rotador; el deltoides ejerce como motor primario hasta los 60°.
   * **Zona en la App**: Zona segura (`IDLE_GLENOHUMERAL`). Progresión angular con feedback táctil sutil discreto.
2. **Fase 2 (60° a 150°)**:
   * **Articulación motora**: Movimiento acoplado glenohumeral y escapulotorácica (ritmo escapulotorácico 1:2: por cada 1° glenohumeral, 2° escapulotorácicos). Participación del serrato anterior y trapecio.
   * **Relevancia Patológica (El "Arco Doloroso")**: Entre los 60° y 90° (extensible a 120°), se produce el impacto fisiológico del troquíter humeral contra el acromion y el borde superior de la cavidad glenoidea, comprimiendo el tendón del supraespinoso en el espacio subacromial.
   * **Zona en la App**: Zona de advertencia y aproximación (`APPROACH_PULSE` y `NEAR_TARGET`). Pulso sensorial rítmico que alerta al paciente de la proximidad al límite terapéutico.
3. **Ángulo Diana (90° ± 1.5°)**:
   * Límite funcional estándar en rehabilitación para evitar el pinzamiento tendinoso y prevenir sustituciones posturales (ej. elevación forzada del hombro por espasmo del trapecio).
   * **Zona en la App**: Confirmación de éxito (`TARGET_SUCCESS`).
4. **Fase 3 (> 91.5° / 150° a 180°)**:
   * Movimiento que demanda inclinación lateral del raquis e hiperlordosis compensatoria si hay rigidez.
   * **Zona en la App**: Alarma de sobrepaso (`OVERSHOOT_ERROR`).

#### 2.2. Método Goniométrico del Cero Neutro (Gold Standard)
* Se toma como base la posición anatómica de reposo del brazo paralelo al tronco como **0° neutro**.
* El incremento angular de abducción se calcula en sentido cráneo-caudal en el plano frontal a lo largo del arco `0° -> 180°`.

---

### 3. Sistema de Diseño Wearable (watchOS / Wear OS Guidelines)

#### 3.1. Directrices de Visualización
* **OLED Pure Black**: Fondo `#000000` absoluto. En pantallas OLED de reloj, el negro apaga físicamente los píxeles, fusionando la interfaz con el marco de hardware y ahorrando batería.
* **Información Glanceable**: Toda la métrica principal debe ser legible en menos de 1 segundo. Cero menús anidados o jerarquías complejas.
* **Escala Tipográfica y Contraste (WCAG 2.2)**: Tipografías sans-serif de alto grosor con números tabulares (`font-mono` o `tabular-nums`) para evitar fluctuaciones horizontales en el renderizado continuo.

#### 3.2. Tokens de Color Semántico
| Token | Valor Hex | Significado Clínico / Funcional |
| :--- | :--- | :--- |
| `bg-watch` | `#000000` | Fondo negro OLED que oculta los bordes físicos. |
| `accent-primary` | `#00E5FF` | Cian luminiscente: color clave del sistema y modo activo. |
| `phase-safe` | `#38BDF8` | Azul cielo: Fase glenohumeral inicial (0°-59°). |
| `phase-warning` | `#F59E0B` | Ámbar cálido: Inicio del ritmo escapular y zona de aproximación (60°-84°). |
| `phase-critical` | `#FB923C` | Naranja intenso: Proximidad crítica inmediata (85°-89°). |
| `target-success` | `#10B981` | Verde esmeralda: Ángulo objetivo exacto alcanzado (90°). |
| `hazard-overshoot`| `#EF4444` | Rojo carmesí: Sobrepaso angular de riesgo (>90°). |
| `ring-track` | `#18181B` | Gris zinc muy oscuro para el carril inactivo del goniómetro. |

---

### 4. Modelo de Transición de Estados Sensoriales

```
[0° - 59°] ------------> [60° - 84°] ------------> [85° - 89°] ------------> [90° ± 1.5°] ------------> [> 91.5°]
IDLE_GLENOHUMERAL        APPROACH_PULSE           NEAR_TARGET              TARGET_SUCCESS           OVERSHOOT_ERROR
- Clics suaves cada 15°   - Pulso ámbar 700ms      - Doble pulso 300ms      - Destello verde         - Estroboscópico rojo
- Tono seco 350 Hz       - Onda senoidal 440 Hz   - Onda senoidal 580 Hz   - Acorde armónico        - Diente de sierra 220 Hz
```

---

### 5. Arquitectura del Código Fuente (React + TypeScript)

Estructura de archivos esperada en el proyecto:
```
src/
├── types/
│   └── goniometer.ts
├── utils/
│   └── soundSynthesizer.ts
├── hooks/
│   ├── useGoniometerState.ts
│   └── useHapticEngine.ts
├── components/
│   ├── WatchBezel.tsx
│   ├── GoniometerRing.tsx
│   ├── HapticPulseOverlay.tsx
│   ├── AngleReadout.tsx
│   └── SimulationControls.tsx
├── App.tsx
├── index.css
└── main.tsx
```

#### 5.1. Definición de Tipos (`src/types/goniometer.ts`)
```typescript
export type HapticZone = 
  | 'IDLE_GLENOHUMERAL' 
  | 'APPROACH_PULSE' 
  | 'NEAR_TARGET' 
  | 'TARGET_SUCCESS' 
  | 'OVERSHOOT_ERROR';

export interface GoniometerData {
  currentAngle: number;
  targetAngle: number;
  zone: HapticZone;
  isMoving: boolean;
}

export interface ZoneConfig {
  label: string;
  sublabel: string;
  strokeColor: string;
  textColor: string;
  pulseIntervalMs: number;
  enableRings: boolean;
}
```

#### 5.2. Sintetizador Web Audio API (`src/utils/soundSynthesizer.ts`)
```typescript
class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Clic háptico discreto (WKHapticTypeClick)
  public playClick(freq = 350) {
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  // Pulso suave de proximidad (Soft Impact)
  public playSoftPulse(freq = 440) {
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Acorde armónico de confirmación (WKHapticTypeSuccess)
  public playSuccess() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    [880, 1760].forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    });
  }

  // Zumbido disonante de advertencia (WKHapticTypeFailure)
  public playOvershootBuzz() {
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }
}

export const sound = new SoundSynthesizer();
```

#### 5.3. Hook de Detección de Zonas y Audio (`src/hooks/useGoniometerState.ts`)
```typescript
import { useState, useMemo, useEffect, useRef } from 'react';
import { HapticZone, ZoneConfig } from '../types/goniometer';
import { sound } from '../utils/soundSynthesizer';

export function useGoniometerState(initialAngle = 0, targetAngle = 90) {
  const [currentAngle, setCurrentAngle] = useState(initialAngle);
  const prevAngleRef = useRef(initialAngle);
  const pulseTimerRef = useRef<number | null>(null);

  const zone: HapticZone = useMemo(() => {
    if (currentAngle < 60) return 'IDLE_GLENOHUMERAL';
    if (currentAngle >= 60 && currentAngle < 85) return 'APPROACH_PULSE';
    if (currentAngle >= 85 && currentAngle < 88.5) return 'NEAR_TARGET';
    if (Math.abs(currentAngle - targetAngle) <= 1.5) return 'TARGET_SUCCESS';
    return 'OVERSHOOT_ERROR';
  }, [currentAngle, targetAngle]);

  const zoneConfig: ZoneConfig = useMemo(() => {
    switch (zone) {
      case 'IDLE_GLENOHUMERAL':
        return {
          label: 'GLENOHUMERAL',
          sublabel: 'RANGO INICIAL',
          strokeColor: '#38BDF8',
          textColor: 'text-sky-400',
          pulseIntervalMs: 0,
          enableRings: false,
        };
      case 'APPROACH_PULSE':
        return {
          label: 'APROXIMACIÓN',
          sublabel: 'RITMO ESCAPULAR',
          strokeColor: '#F59E0B',
          textColor: 'text-amber-500',
          pulseIntervalMs: 700,
          enableRings: true,
        };
      case 'NEAR_TARGET':
        return {
          label: 'CERCA DEL LÍMITE',
          sublabel: 'REDUZCA VELOCIDAD',
          strokeColor: '#FB923C',
          textColor: 'text-orange-400',
          pulseIntervalMs: 300,
          enableRings: true,
        };
      case 'TARGET_SUCCESS':
        return {
          label: 'OBJETIVO LOGRADO',
          sublabel: 'MANTENGA 90°',
          strokeColor: '#10B981',
          textColor: 'text-emerald-400',
          pulseIntervalMs: 0,
          enableRings: false,
        };
      case 'OVERSHOOT_ERROR':
        return {
          label: 'SOBREPASO',
          sublabel: 'RIESGO DE CHOQUE',
          strokeColor: '#EF4444',
          textColor: 'text-red-500',
          pulseIntervalMs: 150,
          enableRings: false,
        };
    }
  }, [zone]);

  // Manejo de clicks incrementales en rango seguro
  useEffect(() => {
    const prev = prevAngleRef.current;
    if (zone === 'IDLE_GLENOHUMERAL') {
      if (Math.floor(currentAngle / 15) !== Math.floor(prev / 15)) {
        sound.playClick(320);
      }
    }
    prevAngleRef.current = currentAngle;
  }, [currentAngle, zone]);

  // Manejo de pulsos continuos y eventos terminales
  useEffect(() => {
    if (pulseTimerRef.current) {
      window.clearInterval(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }

    if (zone === 'TARGET_SUCCESS') {
      sound.playSuccess();
    } else if (zone === 'OVERSHOOT_ERROR') {
      sound.playOvershootBuzz();
    } else if (zoneConfig.pulseIntervalMs > 0) {
      // Disparo inmediato + bucle periódico
      sound.playSoftPulse(zone === 'NEAR_TARGET' ? 580 : 440);
      pulseTimerRef.current = window.setInterval(() => {
        sound.playSoftPulse(zone === 'NEAR_TARGET' ? 580 : 440);
      }, zoneConfig.pulseIntervalMs);
    }

    return () => {
      if (pulseTimerRef.current) {
        window.clearInterval(pulseTimerRef.current);
      }
    };
  }, [zone, zoneConfig.pulseIntervalMs]);

  return {
    currentAngle,
    setCurrentAngle,
    targetAngle,
    zone,
    zoneConfig,
  };
}
```

#### 5.4. Componente Goniométrico SVG (`src/components/GoniometerRing.tsx`)
```tsx
import React from 'react';

interface GoniometerRingProps {
  angle: number;       // 0 a 180
  strokeColor: string;
  targetAngle?: number;
}

export const GoniometerRing: React.FC<GoniometerRingProps> = ({
  angle,
  strokeColor,
  targetAngle = 90,
}) => {
  const size = 320;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Calculamos longitud para un semicírculo superior/lateral (240 grados de recorrido visual)
  const arcDegrees = 240;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (arcDegrees / 360) * circumference;

  // Normalizamos ángulo (0° a 180°) dentro de los 240° del arco
  const clampedAngle = Math.min(Math.max(angle, 0), 180);
  const progressRatio = clampedAngle / 180;
  const strokeDashoffset = arcLength - progressRatio * arcLength;

  // Conversión de grados a coordenadas para muescas (30°, 60°, 90°)
  const getMarkerCoords = (deg: number) => {
    const startAngle = 150; // Inicia en 150° (cuadrante inferior-izquierdo)
    const angleRad = ((startAngle + (deg / 180) * arcDegrees) * Math.PI) / 180;
    const rInner = radius - 14;
    const rOuter = radius + 6;
    return {
      x1: center + rInner * Math.cos(angleRad),
      y1: center + rInner * Math.sin(angleRad),
      x2: center + rOuter * Math.cos(angleRad),
      y2: center + rOuter * Math.sin(angleRad),
    };
  };

  const markers = [30, 60, targetAngle];

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="rotate-0 transition-transform duration-300"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Carril de Fondo */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1C1917"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(150 ${center} ${center})`}
        />

        {/* Arco Reactivo de Progreso */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-150 ease-out"
          transform={`rotate(150 ${center} ${center})`}
        />

        {/* Muescas Clínicas */}
        {markers.map((deg) => {
          const coords = getMarkerCoords(deg);
          const isTarget = deg === targetAngle;
          return (
            <g key={deg}>
              <line
                x1={coords.x1}
                y1={coords.y1}
                x2={coords.x2}
                y2={coords.y2}
                stroke={isTarget ? '#10B981' : '#71717A'}
                strokeWidth={isTarget ? 3.5 : 2}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
```

#### 5.5. Anillos Concéntricos de Pulso Háptico (`src/components/HapticPulseOverlay.tsx`)
```tsx
import React from 'react';
import { HapticZone } from '../types/goniometer';

interface HapticPulseOverlayProps {
  zone: HapticZone;
  strokeColor: string;
}

export const HapticPulseOverlay: React.FC<HapticPulseOverlayProps> = ({
  zone,
  strokeColor,
}) => {
  if (zone !== 'APPROACH_PULSE' && zone !== 'NEAR_TARGET' && zone !== 'TARGET_SUCCESS') {
    return null;
  }

  const isRapid = zone === 'NEAR_TARGET';
  const isSuccess = zone === 'TARGET_SUCCESS';

  if (isSuccess) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-56 h-56 rounded-full border-4 border-emerald-400 opacity-80 animate-ping duration-1000" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Onda 1 */}
      <div
        className="absolute rounded-full border-2"
        style={{
          borderColor: strokeColor,
          width: '180px',
          height: '180px',
          animation: `sonarRipple ${isRapid ? '0.6s' : '1.2s'} cubic-bezier(0, 0.2, 0.8, 1) infinite`,
        }}
      />
      {/* Onda 2 con retraso */}
      <div
        className="absolute rounded-full border-2"
        style={{
          borderColor: strokeColor,
          width: '180px',
          height: '180px',
          animation: `sonarRipple ${isRapid ? '0.6s' : '1.2s'} cubic-bezier(0, 0.2, 0.8, 1) infinite`,
          animationDelay: isRapid ? '0.3s' : '0.6s',
        }}
      />
    </div>
  );
};
```

#### 5.6. Chasis y Lectura Central (`src/components/WatchBezel.tsx` y `AngleReadout.tsx`)
```tsx
// src/components/WatchBezel.tsx
import React from 'react';

export const WatchBezel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative p-3 rounded-full bg-gradient-to-b from-zinc-700 via-zinc-900 to-black shadow-2xl border-4 border-zinc-800">
      {/* Bisel interior reflectivo */}
      <div className="w-[384px] h-[384px] rounded-full bg-black relative overflow-hidden flex flex-col items-center justify-between p-4 shadow-inner">
        {/* Simulación de reflejo de cristal curvado */}
        <div className="absolute -top-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        {children}
      </div>
    </div>
  );
};

// src/components/AngleReadout.tsx
import React from 'react';
import { ZoneConfig } from '../types/goniometer';

export const AngleReadout: React.FC<{
  angle: number;
  config: ZoneConfig;
}> = ({ angle, config }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
      <span className="text-[10px] tracking-widest font-semibold uppercase text-zinc-400 mb-1">
        ÁNGULO ACTUAL
      </span>
      <div className="flex items-baseline justify-center">
        <span className={`text-6xl font-black tracking-tight tabular-nums ${config.textColor}`}>
          {Math.round(angle)}
        </span>
        <span className={`text-3xl font-bold ml-0.5 ${config.textColor}`}>°</span>
      </div>
      <div className="mt-2 px-2.5 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-800">
        <span className={`text-[10px] tracking-wider font-bold ${config.textColor}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
};
```

#### 5.7. Consola de Simulación Externa (`src/components/SimulationControls.tsx`)
```tsx
import React, { useState, useEffect, useRef } from 'react';

interface SimulationControlsProps {
  currentAngle: number;
  onAngleChange: (angle: number) => void;
  targetAngle: number;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  currentAngle,
  onAngleChange,
  targetAngle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let forward = true;
    const speed = 0.4; // Grados por frame (~24°/seg a 60fps)

    const step = () => {
      onAngleChange((prev: number) => {
        let next = forward ? prev + speed : prev - speed;
        if (next >= 120) {
          forward = false;
          next = 120;
        } else if (next <= 0) {
          forward = true;
          next = 0;
        }
        return next;
      });
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, onAngleChange]);

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col gap-5 text-white">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <h3 className="text-sm font-bold tracking-wide uppercase text-zinc-300">
          Banco de Pruebas Biomecánico
        </h3>
        <span className="text-xs font-mono text-cyan-400">Target: {targetAngle}°</span>
      </div>

      {/* Control Deslizante Manual */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>0° (Posición Neutra)</span>
          <span className="font-bold text-white text-sm font-mono">{Math.round(currentAngle)}°</span>
          <span>180° (Abducción Total)</span>
        </div>
        <input
          type="range"
          min="0"
          max="180"
          step="0.5"
          value={currentAngle}
          onChange={(e) => onAngleChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Presets Rápidos */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: '0° Neutro', val: 0 },
          { label: '60° Pulso', val: 60 },
          { label: '90° Target', val: 90 },
          { label: '110° Exceso', val: 110 },
        ].map((item) => (
          <button
            key={item.val}
            onClick={() => onAngleChange(item.val)}
            className="py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-200"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Botón de Reproducción Automática */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
          isPlaying
            ? 'bg-amber-600 hover:bg-amber-500 text-white'
            : 'bg-cyan-600 hover:bg-cyan-500 text-white'
        }`}
      >
        {isPlaying ? 'Detener Movimiento' : 'Simular Movimiento Continuo (0° ⟷ 120°)'}
      </button>
    </div>
  );
};
```

#### 5.8. Archivo CSS de Animaciones (`src/index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes sonarRipple {
  0% {
    transform: scale(0.6);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}
```

---

### 6. Flujo de Trabajo GitFlow y Comandos de Ejecución

El equipo debe ejecutar estrictamente las siguientes secuencias de Git:

```bash
# ==========================================
# FASE 1: INICIALIZACIÓN Y ESQUELETO BASE
# ==========================================
git init
git checkout -b main
git commit --allow-empty -m "chore: initial commit"
git checkout -b develop

# Rama para Setup y Tokens
git checkout -b feature/watch-scaffold-and-tokens
# (Crear estructura, configurar tailwind.config.js, index.css y WatchBezel.tsx)
git add .
git commit -m "feat(ui): setup watch bezel shell and OLED dark tokens"
git checkout develop
git merge --no-ff feature/watch-scaffold-and-tokens -m "merge: feature/watch-scaffold-and-tokens into develop"

# ==========================================
# FASE 2: MOTOR SENSORIAL Y ESTADOS
# ==========================================
git checkout -b feature/haptic-audio-engine
# (Crear types/goniometer.ts, utils/soundSynthesizer.ts y hooks/useGoniometerState.ts)
git add .
git commit -m "feat(audio): implement Web Audio API synthesizer and haptic zone resolver"
git checkout develop
git merge --no-ff feature/haptic-audio-engine -m "merge: feature/haptic-audio-engine into develop"

# ==========================================
# FASE 3: COMPONENTES SVG Y SIMULADOR
# ==========================================
git checkout -b feature/ui-goniometer-and-controls
# (Crear GoniometerRing.tsx, HapticPulseOverlay.tsx, AngleReadout.tsx y SimulationControls.tsx)
git add .
git commit -m "feat(svg): assemble radial goniometer ring and interactive simulation bench"
git checkout develop
git merge --no-ff feature/ui-goniometer-and-controls -m "merge: feature/ui-goniometer-and-controls into develop"

# ==========================================
# RELEASE V0.6.0 (HITO 60%)
# ==========================================
git checkout -b release/v0.6.0-visual-simulator
git commit --allow-empty -m "chore: bump version to 0.6.0"
git checkout main
git merge --no-ff release/v0.6.0-visual-simulator -m "release: v0.6.0 visual simulator"
git tag -a v0.6.0 -m "Release v0.6.0: 60% completion of visual and haptic UI simulator"
git checkout develop
git merge --no-ff release/v0.6.0-visual-simulator -m "chore: sync release v0.6.0 into develop"
git branch -d release/v0.6.0-visual-simulator
```

---

### 7. Criterios de Aceptación (Definición de Terminado - DoD para Claude Code)
1. El viewport del smartwatch se renderiza centrado, con resolución circular nítida de 384x384px y fondo `#000000`.
2. Al deslizar el slider goniométrico entre 0° y 59°, el anillo SVG avanza suavemente emitiendo clics sonoros cada 15°.
3. Al alcanzar 60°, el sistema conmuta automáticamente al color ámbar y comienza a emitir ondas de sonar concéntricas continuas junto con pulsos de 440 Hz a intervalos de 700ms.
4. Entre 85° y 89°, las ondas y los pulsos aumentan su frecuencia a 300ms.
5. A los 90° exactos (±1.5°), se detienen las ondas de aproximación, el anillo emite un destello verde esmeralda y suena el acorde dual de éxito.
6. A partir de 91.5°, el display parpadea en rojo y reproduce el tono de advertencia disonante.
