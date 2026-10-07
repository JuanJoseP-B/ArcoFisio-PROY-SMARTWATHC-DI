import React from 'react';
import { WatchBezel } from './components/WatchBezel';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 p-6">
      <WatchBezel>
        <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs tracking-widest">
          ARCO FISIO
        </div>
      </WatchBezel>
    </div>
  );
};

export default App;
