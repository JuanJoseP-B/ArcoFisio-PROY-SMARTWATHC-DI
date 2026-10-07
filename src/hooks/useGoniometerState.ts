import { useState, useMemo, useEffect, useRef } from 'react';
import { HapticZone, ZoneConfig } from '../types/goniometer';
import { sound } from '../utils/soundSynthesizer';

export function useGoniometerState(initialAngle = 0, targetAngle = 90) {
  const [currentAngle, setCurrentAngle] = useState(initialAngle);
  const prevAngleRef = useRef(initialAngle);
  const pulseTimerRef = useRef<number | null>(null);

  const zone: HapticZone = useMemo(() => {
    if (currentAngle < 60) return 'IDLE_GLENOHUMERAL';
    if (currentAngle >= 60 && currentAngle < 85) return 'APPROACH_PULSE';
    if (currentAngle >= 85 && currentAngle < 88.5) return 'NEAR_TARGET';
    if (Math.abs(currentAngle - targetAngle) <= 1.5) return 'TARGET_SUCCESS';
    return 'OVERSHOOT_ERROR';
  }, [currentAngle, targetAngle]);

  const zoneConfig: ZoneConfig = useMemo(() => {
    switch (zone) {
      case 'IDLE_GLENOHUMERAL':
        return {
          label: 'GLENOHUMERAL',
          sublabel: 'RANGO INICIAL',
          strokeColor: '#38BDF8',
          textColor: 'text-sky-400',
          pulseIntervalMs: 0,
          enableRings: false,
        };
      case 'APPROACH_PULSE':
        return {
          label: 'APROXIMACIÓN',
          sublabel: 'RITMO ESCAPULAR',
          strokeColor: '#F59E0B',
          textColor: 'text-amber-500',
          pulseIntervalMs: 700,
          enableRings: true,
        };
      case 'NEAR_TARGET':
        return {
          label: 'CERCA DEL LÍMITE',
          sublabel: 'REDUZCA VELOCIDAD',
          strokeColor: '#FB923C',
          textColor: 'text-orange-400',
          pulseIntervalMs: 300,
          enableRings: true,
        };
      case 'TARGET_SUCCESS':
        return {
          label: 'OBJETIVO LOGRADO',
          sublabel: 'MANTENGA 90°',
          strokeColor: '#10B981',
          textColor: 'text-emerald-400',
          pulseIntervalMs: 0,
          enableRings: false,
        };
      case 'OVERSHOOT_ERROR':
        return {
          label: 'SOBREPASO',
          sublabel: 'RIESGO DE CHOQUE',
          strokeColor: '#EF4444',
          textColor: 'text-red-500',
          pulseIntervalMs: 150,
          enableRings: false,
        };
    }
  }, [zone]);

  // Manejo de clicks incrementales en rango seguro
  useEffect(() => {
    const prev = prevAngleRef.current;
    if (zone === 'IDLE_GLENOHUMERAL') {
      if (Math.floor(currentAngle / 15) !== Math.floor(prev / 15)) {
        sound.playClick(320);
      }
    }
    prevAngleRef.current = currentAngle;
  }, [currentAngle, zone]);

  // Manejo de pulsos continuos y eventos terminales
  useEffect(() => {
    if (pulseTimerRef.current) {
      window.clearInterval(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }

    if (zone === 'TARGET_SUCCESS') {
      sound.playSuccess();
    } else if (zone === 'OVERSHOOT_ERROR') {
      sound.playOvershootBuzz();
    } else if (zoneConfig.pulseIntervalMs > 0) {
      // Disparo inmediato + bucle periódico
      sound.playSoftPulse(zone === 'NEAR_TARGET' ? 580 : 440);
      pulseTimerRef.current = window.setInterval(() => {
        sound.playSoftPulse(zone === 'NEAR_TARGET' ? 580 : 440);
      }, zoneConfig.pulseIntervalMs);
    }

    return () => {
      if (pulseTimerRef.current) {
        window.clearInterval(pulseTimerRef.current);
      }
    };
  }, [zone, zoneConfig.pulseIntervalMs]);

  return {
    currentAngle,
    setCurrentAngle,
    targetAngle,
    zone,
    zoneConfig,
  };
}
