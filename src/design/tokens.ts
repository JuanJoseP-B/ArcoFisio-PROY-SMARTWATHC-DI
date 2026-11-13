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
  zoneCaution: '#845610',
  zoneCautionTint: '#F3DFB5',
  zonePain: '#A3392D',
  zonePainTint: '#F4D3C8',
  zoneRest: '#3E5F6A',
  zoneRestTint: '#DCE4E3',
  hardwareBlack: '#000000',
  bezelMetal: '#9A9C9A',
  bezelShadow: 'rgba(31, 58, 43, 0.25)',
  cellShadow: 'rgba(31, 58, 43, 0.18)',
  rippleLight: 'rgba(237, 217, 180, 0.35)',
  glassHighlight: 'rgba(255, 255, 255, 0.55)',
  glassClear: 'rgba(255, 255, 255, 0)',
} as const

export type ColorToken = keyof typeof color

/** Marea light palette from the v2 design handoff, separate during v1 migration. */
export const mareaColor = {
  background: '#EAF0F9',
  paper: '#F7F9FD',
  card: '#FFFFFF',
  ink: '#0F1B3D',
  inkSecondary: '#4B5878',
  line: '#D3DCEF',
  accent: '#4263EB',
  accentDark: '#2B45B8',
  accentTint: '#DCE4FF',
  onAccent: '#FFFFFF',
  mint: '#4FD1B5',
  mintDark: '#0B6B58',
  mintTint: '#D6F5EE',
  onMint: '#06332B',
  amber: '#FFB26B',
  amberDark: '#8F4504',
  amberTint: '#FFE9D2',
  onAmber: '#3A1C00',
  rose: '#F2668B',
  roseDark: '#A3234B',
  roseTint: '#FDE0E8',
  onRose: '#3A0618',
  water: '#4263EB',
  shadow: 'rgba(15, 27, 61, 0.13)',
} as const

/**
 * Text colors for lines drawn straight over the water, where two translucent layers lower the
 * contrast of the handoff's `inkSecondary` (3.8:1) and `accentDark` (4.2:1). These two are
 * slightly darker and reach 4.5:1 on the deepest water as well as on paper, card and tint.
 */
export const mareaText = {
  secondary: '#3F4B6B',
  link: '#2A40A8',
} as const

/** Colors of the intro illustration (archer, prairie, sky). Used by the intro only. */
export const sceneColor = {
  skyTop: '#D98A3A',
  skyMid: '#EDBE72',
  skyBottom: '#F6DFAE',
  sun: '#FBF0D2',
  sunHalo: '#F8E7BE',
  hillFar: '#B5803F',
  hillNear: '#9C6B2E',
  skin: '#8A5233',
  hair: '#1E140E',
  buckskin: '#D9C3A0',
  buckskinShade: '#C9AE86',
  blanket: '#A6402A',
  wood: '#5A3A1E',
  feather: '#F3E9D8',
  featherTip: '#2A1C12',
} as const

export type SceneColorToken = keyof typeof sceneColor

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

export const fontFamily = {
  sans: '"Roboto Flex", system-ui, sans-serif',
  brand: 'Cinzel, serif',
} as const

export const typography = {
  hero: { size: 72, lineHeight: 72, weight: 600 },
  display: { size: 44, lineHeight: 48, weight: 500 },
  title: { size: 20, lineHeight: 24, weight: 600 },
  body: { size: 16, lineHeight: 20, weight: 400 },
  button: { size: 15, lineHeight: 20, weight: 600 },
  label: { size: 13, lineHeight: 16, weight: 500 },
  caption: { size: 11, lineHeight: 14, weight: 500 },
} as const

export type TypeStyle = keyof typeof typography

export const duration = {
  instant: 90,
  quick: 180,
  standard: 300,
  emphasis: 500,
  ambient: 1600,
} as const

export const easing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  enter: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  exit: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  wheel: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  honeycomb: 'cubic-bezier(0.34, 1.35, 0.64, 1)',
} as const

/** Marea fonts: DM Sans for data and actions, Newsreader italic for the guide's voice. Both are bundled, never fetched. */
export const mareaFont = {
  sans: '"DM Sans", system-ui, sans-serif',
  serif: '"Newsreader", Georgia, serif',
} as const

/** Marea type scale (handoff 02). `tracking` is in em. Figures use DM Sans only. */
export const mareaType = {
  big: { size: 88, lineHeight: 1, weight: 700, tracking: -0.04 },
  mid: { size: 48, lineHeight: 1, weight: 700, tracking: -0.03 },
  title: { size: 21, lineHeight: 1.15, weight: 700, tracking: -0.01 },
  message: { size: 25, lineHeight: 1.15, weight: 400, tracking: 0 },
  label: { size: 13.5, lineHeight: 1.2, weight: 500, tracking: 0.1 },
  sub: { size: 15, lineHeight: 1.35, weight: 500, tracking: 0 },
  button: { size: 17, lineHeight: 1.2, weight: 700, tracking: 0 },
} as const

/** Marea sizes (handoff 02 and 03), in px of the 384 watch space. */
export const mareaGeometry = {
  touchMin: 48,
  stepperButton: 56,
  menuButton: 54,
  menuRadius: 132,
  safeColumn: 270,
  listRowRadius: 26,
  optionRadius: 28,
  focusRing: 3,
  waveBackOpacity: 0.16,
  waveFrontOpacity: 0.3,
} as const

/** Marea motion (handoff 04), in ms. */
export const mareaDuration = {
  waterLevel: 600,
  contentIn: 240,
  reducedFade: 150,
  loading: 3800,
  loadingReduced: 1400,
  waveFront: 8000,
  waveBack: 13000,
} as const

export const mareaEasing = {
  water: 'cubic-bezier(0.3, 0.7, 0.3, 1)',
  emerge: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  drop: 'cubic-bezier(0.5, 0, 0.9, 0.6)',
} as const
