import type { MessageKey } from './es'

/** English dictionary. Typing it as a full record makes a missing or extra key a compile error. */
export const en: Record<MessageKey, string> = {
  'intro.tagline': 'Every degree counts',

  'zone.far': 'On the way',
  'zone.approach': 'Almost',
  'zone.near': 'Very close',
  'zone.target': 'Target reached',
  'zone.overshoot': 'Too far',
  'zone.pain': 'Pain',
  'zone.rest': 'Rest',

  'session.reps': 'Repetitions',
  'session.progress': '{done} of {total}',

  'sensor.waiting': 'Waiting for the sensor…',
  'sensor.noData': 'No sensor data',
  'sensor.denied': 'Sensor permission denied',
  'sensor.unsupported': 'This device has no motion sensor',
  'sensor.uncalibrated': 'Calibrate with your arm down',
  'sensor.paused': 'Sensor paused',
  'sensor.enable': 'Enable sensor',
  'sensor.calibrate': 'Arm down',
  'sensor.simHint': 'To try it without a sensor open the app with ?sim=1',

  'sim.angle': 'Simulated angle',

  'face.open': 'Open apps',
  'launcher.label': 'Apps',
  'launcher.measure': 'Measure',
  'launcher.session': 'Session',
  'launcher.routines': 'Routines',
  'launcher.summary': 'Summary',
  'launcher.pain': 'Pain',
  'launcher.guide': 'AI Guide',
  'launcher.settings': 'Settings',

  'nav.back': 'Back',
  'mode.title': 'Exercise',
  'mode.abduction': 'Abduction',
  'mode.flexion': 'Flexion',
  'config.target': 'Target angle',
  'config.detents': 'Detents every 5°',
  'config.next': 'Continue',
  'config.reps': 'Repetitions',
  'config.sets': 'Sets',
  'config.rest': 'Rest',
  'config.seconds': '{n} s',
  'config.increase': 'Increase: {name}',
  'config.decrease': 'Decrease: {name}',
  'config.start': 'Start',

  'soon.note': 'Coming soon',
  'intro.skip': 'Skip the intro',
}
