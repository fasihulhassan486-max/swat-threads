import { useEffect, useRef, useState } from 'react'
import { hasHtmlText, sanitizeHtml } from '../lib/html'

export default function ExpandableHtml({ html, className = '' }: { html: string; className?: string }) {
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const measureRef = useRef<HTMLDivElement>(null)
  const safe = sanitizeHtml(html)

  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [safe])

  if (!hasHtmlText(html)) return null

  return (
    <div className={`relative ${className}`}>
      <div
        ref={measureRef}
        className="prose max-w-none text-sm sm:text-base leading-relaxed line-clamp-2 overflow-hidden invisible absolute inset-x-0 top-0 pointer-events-none"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
      <div
        className={`prose max-w-none text-ink/75 text-sm sm:text-base leading-relaxed ${expanded ? '' : 'line-clamp-2 overflow-hidden'}`}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
      {overflows && (
        <button
          type="button"
          className="mt-2 text-xs uppercase tracking-[0.16em] text-walnut hover:text-coal focus:outline-none focus-visible:ring-2 focus-visible:ring-walnut/40"
          aria-expanded={expanded}
          aria-label={expanded ? 'Show less of the product description' : 'View the full product description'}
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? 'Show Less' : 'View All'}
        </button>
      )}
    </div>
  )
}
