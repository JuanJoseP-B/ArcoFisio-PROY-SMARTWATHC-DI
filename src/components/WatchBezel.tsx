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
