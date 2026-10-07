import React from 'react';
import { WatchBezel } from './components/WatchBezel';
import { GoniometerRing } from './components/GoniometerRing';
import { HapticPulseOverlay } from './components/HapticPulseOverlay';
import { AngleReadout } from './components/AngleReadout';
import { SimulationControls } from './components/SimulationControls';
import { useGoniometerState } from './hooks/useGoniometerState';

const App: React.FC = () => {
  const { currentAngle, setCurrentAngle, targetAngle, zone, zoneConfig } = useGoniometerState(0, 90);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 p-6 font-sans">
      <WatchBezel>
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
      </WatchBezel>

      <SimulationControls
        currentAngle={currentAngle}
        onAngleChange={setCurrentAngle}
        targetAngle={targetAngle}
      />
    </div>
  );
};

export default App;
