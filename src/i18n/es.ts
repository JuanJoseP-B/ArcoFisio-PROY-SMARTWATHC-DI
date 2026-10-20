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

  'sim.angle': 'Ángulo simulado',

  'face.open': 'Abrir aplicaciones',
  'launcher.label': 'Aplicaciones',
  'launcher.measure': 'Medir',
  'launcher.session': 'Sesión',
  'launcher.routines': 'Rutinas',
  'launcher.summary': 'Resumen',
  'launcher.pain': 'Dolor',
  'launcher.guide': 'Guía IA',
  'launcher.settings': 'Ajustes',

  'nav.back': 'Atrás',
  'mode.title': 'Ejercicio',
  'mode.abduction': 'Abducción',
  'mode.flexion': 'Flexión',
  'config.target': 'Ángulo objetivo',
  'config.detents': 'Detenciones cada 5°',
  'config.next': 'Continuar',
  'config.reps': 'Repeticiones',
  'config.sets': 'Series',
  'config.rest': 'Descanso',
  'config.seconds': '{n} s',
  'config.increase': 'Aumentar: {name}',
  'config.decrease': 'Disminuir: {name}',
  'config.start': 'Iniciar',

  'soon.note': 'Próximamente',
  'intro.skip': 'Saltar la introducción',
} as const

export type MessageKey = keyof typeof es
