import React from 'react';

interface SummaryScreenProps {
  onNewExercise: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ onNewExercise }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-16 h-16 rounded-full border-4 border-emerald-400 flex items-center justify-center text-emerald-400 text-4xl font-black">
        ✓
      </div>
      <span className="text-sm tracking-widest font-bold uppercase text-white">
        SESIÓN COMPLETADA
      </span>
      <button
        onClick={onNewExercise}
        className="mt-3 w-44 py-3 rounded-full bg-zinc-700 hover:bg-zinc-600 active:scale-95 transition text-zinc-100 text-xs font-bold tracking-widest"
      >
        NUEVO EJERCICIO
      </button>
    </div>
  );
};
