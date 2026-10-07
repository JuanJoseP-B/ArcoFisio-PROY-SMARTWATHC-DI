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
