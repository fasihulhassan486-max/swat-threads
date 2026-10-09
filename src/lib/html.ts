const BLOCKED_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'FORM', 'INPUT', 'BUTTON'])

export function stripHtml(html: string): string {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, '’')
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function hasHtmlText(html: string): boolean {
  return Boolean(stripHtml(html))
}

export function sanitizeHtml(html: string): string {
  if (!html || typeof window === 'undefined') return html || ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      if (BLOCKED_TAGS.has(child.tagName)) {
        child.remove()
        continue
      }
      for (const attr of Array.from(child.attributes)) {
        const name = attr.name.toLowerCase()
        const value = attr.value.trim()
        if (name.startsWith('on') || name === 'srcdoc' || name === 'xlink:href') {
          child.removeAttribute(attr.name)
          continue
        }
        if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(value)) {
          child.removeAttribute(attr.name)
        }
      }
      walk(child)
    }
  }
  walk(doc.body)
  return doc.body.innerHTML
}
