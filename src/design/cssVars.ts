import {
  color,
  duration,
  easing,
  fontFamily,
  geometry,
  safeDiameter,
  space,
  typography,
} from './tokens'

const kebab = (name: string) =>
  name.replace(/([a-z])(\d)/g, '$1-$2').replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)

const px = (n: number) => `${n}px`
const ms = (n: number) => `${n}ms`

export function buildCssVariables(): Record<string, string> {
  const vars: Record<string, string> = {}

  for (const [name, value] of Object.entries(color)) vars[`--af-color-${kebab(name)}`] = value

  for (const [name, value] of Object.entries(geometry)) {
    vars[`--af-${kebab(name)}`] = name === 'ringCircumference' ? String(value) : px(value)
  }
  vars['--af-safe-diameter'] = px(safeDiameter)

  for (const [name, value] of Object.entries(space)) vars[`--af-space-${name.slice(1)}`] = px(value)

  for (const [name, value] of Object.entries(fontFamily)) vars[`--af-font-${name}`] = value

  for (const [name, style] of Object.entries(typography)) {
    vars[`--af-type-${name}-size`] = px(style.size)
    vars[`--af-type-${name}-line`] = px(style.lineHeight)
    vars[`--af-type-${name}-weight`] = String(style.weight)
  }

  for (const [name, value] of Object.entries(duration)) vars[`--af-dur-${name}`] = ms(value)
  for (const [name, value] of Object.entries(easing)) vars[`--af-ease-${name}`] = value

  return vars
}

export function installCssVariables(target: HTMLElement = document.documentElement): void {
  for (const [name, value] of Object.entries(buildCssVariables())) {
    target.style.setProperty(name, value)
  }
}
