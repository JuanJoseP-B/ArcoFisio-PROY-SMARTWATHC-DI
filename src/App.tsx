import React, { useState } from 'react';
import { WatchBezel } from './components/WatchBezel';
import { GoniometerRing } from './components/GoniometerRing';
import { HapticPulseOverlay } from './components/HapticPulseOverlay';
import { AngleReadout } from './components/AngleReadout';
import { SimulationControls } from './components/SimulationControls';
import { SetupScreen } from './components/SetupScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { useGoniometerState } from './hooks/useGoniometerState';

type Screen = 'SETUP' | 'EXERCISE' | 'SUMMARY';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('SETUP');
  const { currentAngle, setCurrentAngle, targetAngle, zone, zoneConfig } = useGoniometerState(0, 90);

  // Al cambiar de vista se reinicia el ángulo a 0° para detener pulsos/sonidos activos.
  const goTo = (next: Screen) => {
    setCurrentAngle(0);
    setScreen(next);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 p-6 font-sans">
      <WatchBezel>
        {screen === 'SETUP' && <SetupScreen onStart={() => goTo('EXERCISE')} />}

        {screen === 'EXERCISE' && (
          <>
            <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-[10px] tracking-widest font-bold top-8 h-fit">
              ARCO FISIO
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GoniometerRing
                angle={currentAngle}
                strokeColor={zoneConfig.strokeColor}
                targetAngle={targetAngle}
              />
            </div>
            <HapticPulseOverlay zone={zone} strokeColor={zoneConfig.strokeColor} />
            <AngleReadout angle={currentAngle} config={zoneConfig} />
            <button
              onClick={() => goTo('SUMMARY')}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-[10px] font-bold tracking-widest text-zinc-300"
            >
              FINALIZAR
            </button>
          </>
        )}

        {screen === 'SUMMARY' && <SummaryScreen onNewExercise={() => goTo('SETUP')} />}
      </WatchBezel>

      {screen === 'EXERCISE' && (
        <SimulationControls
          currentAngle={currentAngle}
          onAngleChange={setCurrentAngle}
          targetAngle={targetAngle}
        />
      )}
    </div>
  );
};

export default App;
