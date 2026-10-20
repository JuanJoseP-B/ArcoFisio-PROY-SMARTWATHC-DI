export const color = {
  stage: '#E9DCC4',
  screenBase: '#F6EBD9',
  screenGradientInner: '#F8EEDD',
  screenGradientOuter: '#EBD6B0',
  surface: '#EDD9B4',
  surfaceRaised: '#FBF4E8',
  surfaceSunken: '#E3CA9C',
  ink: '#1F3A2B',
  primarySoft: '#345A43',
  inkOnPrimary: '#EDD9B4',
  inkMuted: '#5C5140',
  gold: '#C8902E',
  bronze: '#7A4E14',
  terracotta: '#B5532F',
  turquoise: '#2F7F86',
  zoneOptimal: '#2F6B3F',
  zoneOptimalTint: '#DDE7CF',
  zoneCaution: '#8A5A12',
  zoneCautionTint: '#F3DFB5',
  zonePain: '#A3392D',
  zonePainTint: '#F4D3C8',
  zoneRest: '#3E5F6A',
  zoneRestTint: '#DCE4E3',
  hardwareBlack: '#000000',
  bezelMetal: '#9A9C9A',
  bezelShadow: 'rgba(31, 58, 43, 0.25)',
  glassHighlight: 'rgba(255, 255, 255, 0.55)',
  glassClear: 'rgba(255, 255, 255, 0)',
} as const

export type ColorToken = keyof typeof color

export const geometry = {
  screenSize: 384,
  bezelPadding: 12,
  bezelRing: 3,
  safeMargin: 28,
  ringRadius: 164,
  ringStroke: 14,
  ringCircumference: 1030.44,
  touchMin: 48,
  radiusPill: 999,
  radiusCard: 24,
  radiusSm: 12,
} as const

export const space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s6: 24,
} as const

export const safeDiameter = geometry.screenSize - 2 * geometry.safeMargin
export const bezelDiameter = geometry.screenSize + 2 * geometry.bezelPadding
export const watchExtent = bezelDiameter + 2 * geometry.bezelRing
