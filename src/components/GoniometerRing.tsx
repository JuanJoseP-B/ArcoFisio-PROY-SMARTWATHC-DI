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
