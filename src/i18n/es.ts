/** Spanish dictionary. Its keys define `MessageKey`; `en.ts` must provide every one of them. */
export const es = {
  'intro.tagline': 'Cada grado cuenta',

  'zone.far': 'En camino',
  'zone.approach': 'Casi',
  'zone.near': 'Muy cerca',
  'zone.target': 'Objetivo alcanzado',
  'zone.overshoot': 'Te pasaste',
  'zone.pain': 'Dolor',
  'zone.rest': 'Descanso',

  'session.reps': 'Repeticiones',
  'session.progress': '{done} de {total}',

  'sensor.waiting': 'Esperando el sensor…',
  'sensor.noData': 'Sin datos del sensor',
  'sensor.denied': 'Permiso del sensor denegado',
  'sensor.unsupported': 'Este dispositivo no tiene sensor de movimiento',
  'sensor.uncalibrated': 'Calibra con el brazo abajo',
  'sensor.paused': 'Sensor en pausa',
  'sensor.enable': 'Activar sensor',
  'sensor.calibrate': 'Brazo abajo',
  'sensor.simHint': 'Para ensayar sin sensor abre la app con ?sim=1',
} as const

export type MessageKey = keyof typeof es
