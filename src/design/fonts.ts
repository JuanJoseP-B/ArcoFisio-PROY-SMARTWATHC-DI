const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2'

export const robotoFlexUrl = `${GOOGLE_FONTS}?family=Roboto+Flex:opsz,wght@8..144,400..700&display=swap`
export const cinzelUrl = `${GOOGLE_FONTS}?family=Cinzel:wght@500;700&display=swap`

export function loadFontStylesheet(href: string, doc: Document = document): HTMLLinkElement {
  const existing = Array.from(doc.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
  const found = existing.find((link) => link.href === href)
  if (found) return found

  const link = doc.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  doc.head.appendChild(link)
  return link
}

export const loadBrandFont = (doc: Document = document) => loadFontStylesheet(cinzelUrl, doc)
