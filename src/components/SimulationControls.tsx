import React, { useState, useEffect, useRef } from 'react';

interface SimulationControlsProps {
  currentAngle: number;
  onAngleChange: React.Dispatch<React.SetStateAction<number>>;
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
