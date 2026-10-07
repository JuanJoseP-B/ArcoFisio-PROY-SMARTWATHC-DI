export type HapticZone = 
  | 'IDLE_GLENOHUMERAL' 
  | 'APPROACH_PULSE' 
  | 'NEAR_TARGET' 
  | 'TARGET_SUCCESS' 
  | 'OVERSHOOT_ERROR';

export interface GoniometerData {
  currentAngle: number;
  targetAngle: number;
  zone: HapticZone;
  isMoving: boolean;
}

export interface ZoneConfig {
  label: string;
  sublabel: string;
  strokeColor: string;
  textColor: string;
  pulseIntervalMs: number;
  enableRings: boolean;
}
