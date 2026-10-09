const ALLOWED_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'DIV', 'EM', 'H2', 'H3', 'H4',
  'HR', 'I', 'LI', 'OL', 'P', 'PRE', 'S', 'SPAN', 'STRONG', 'SUB', 'SUP', 'U', 'UL',
])
const BLOCKED_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'TEMPLATE'])

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
  if (!html) return ''
  if (typeof window === 'undefined') return stripHtml(html)
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
        if (child.tagName !== 'A' || !['href', 'title'].includes(name)) {
          child.removeAttribute(attr.name)
          continue
        }
        if (name === 'href' && /^(?:javascript|data|vbscript):/i.test(value)) {
          child.removeAttribute(attr.name)
        }
      }
      if (child.tagName === 'A' && child.hasAttribute('href')) {
        child.setAttribute('rel', 'noopener noreferrer')
      }
      walk(child)
      if (!ALLOWED_TAGS.has(child.tagName)) child.replaceWith(...Array.from(child.childNodes))
    }
  }
  walk(doc.body)
  return doc.body.innerHTML
}
