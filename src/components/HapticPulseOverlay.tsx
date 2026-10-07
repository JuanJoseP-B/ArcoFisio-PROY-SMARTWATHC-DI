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
