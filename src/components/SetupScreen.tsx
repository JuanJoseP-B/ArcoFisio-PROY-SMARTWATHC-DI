import React from 'react';

interface SetupScreenProps {
  onStart: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
      <span className="text-[10px] tracking-widest font-semibold uppercase text-zinc-500">
        NUEVA SESIÓN
      </span>
      <span className="text-3xl font-black tracking-tight text-white">Abducción 90°</span>
      <button
        onClick={onStart}
        className="mt-4 w-44 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition text-black text-lg font-black tracking-widest"
      >
        INICIAR
      </button>
    </div>
  );
};
