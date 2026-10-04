import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { Media } from '../components/ui'
import { customPrice, SIZE_EXTRA, PATTERN_EXTRA } from '../lib/pricing'
import { pkr } from '../lib/format'
import { site } from '../config/site'
import type { Product } from '../types'

export default function Customize() {
  const [base, setBase] = useState<Product | null>(null)
  const [color, setColor] = useState('')
  const [size, setSize] = useState('Standard')
  const [pattern, setPattern] = useState('Plain')
  const [notes, setNotes] = useState('')
  const { addCustom, products } = useStore()
  const nav = useNavigate()

  const total = base ? customPrice(base.price, size, pattern) : 0
  const adv = Math.round(total * site.advanceRate)

  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl text-ink">Customize Your Shawl</h1>
      <p className="text-ink/70 max-w-2xl my-3 sm:my-4 text-sm sm:text-base leading-relaxed">
        Choose a base design, then pick your color, size and pattern. Pay a 50% advance online; the remaining 50% is Cash on Delivery. Production takes 8–10 days.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mt-6 sm:mt-8">
        {products.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => { setBase(p); setColor(''); }}
            className="text-left group cursor-pointer"
          >
            <div className="aspect-[4/5] bg-beige overflow-hidden">
              <Media p={p} />
            </div>
            <p className="font-serif mt-2 group-hover:text-walnut transition-colors">{p.name}</p>
            <p className="text-xs sm:text-sm text-ink/70">From {pkr(p.price)}</p>
          </button>
        ))}
      </div>

      {base && (
        <div
          className="fixed inset-0 z-50 bg-coal/70 grid place-items-center p-4 animate-fade-in"
          onClick={() => setBase(null)}
        >
          <div
            className="bg-ivory max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto border border-beige shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl sm:text-2xl text-ink font-serif">Customize: {base.name}</h3>
              <button
                type="button"
                onClick={() => setBase(null)}
                className="p-1 text-ink/60 hover:text-ink text-xl"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1">Color *</label>
                <input
                  className="field"
                  placeholder="Color (e.g. deep forest green)"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1">Size</label>
                <select className="field" value={size} onChange={e => setSize(e.target.value)}>
                  {Object.entries(SIZE_EXTRA).map(([k, v]) => (
                    <option key={k} value={k}>{k} {v ? `(+${pkr(v)})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1">Pattern</label>
                <select className="field" value={pattern} onChange={e => setPattern(e.target.value)}>
                  {Object.entries(PATTERN_EXTRA).map(([k, v]) => (
                    <option key={k} value={k}>{k} {v ? `(+${pkr(v)})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1">Instructions for artisan *</label>
                <textarea
                  className="field"
                  rows={4}
                  placeholder="Tell us exactly what you want done on your shawl — borders, embroidery, name or text to stitch, motifs, fringe, anything special."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>

            <dl className="text-xs sm:text-sm my-5 space-y-1.5 border-t border-beige/60 pt-3">
              <div className="flex justify-between">
                <dt>Total</dt>
                <dd className="font-serif text-lg font-semibold">{pkr(total)}</dd>
              </div>
              <div className="flex justify-between text-ink/80">
                <dt>Advance deposit (online)</dt>
                <dd>{pkr(adv)}</dd>
              </div>
              <div className="flex justify-between text-ink/80">
                <dt>Balance on delivery (COD)</dt>
                <dd>{pkr(total - adv)}</dd>
              </div>
            </dl>

            <button
              className="btn-primary w-full py-3.5"
              disabled={!color.trim() || !notes.trim()}
              onClick={() => {
                addCustom({
                  name: `Custom · ${base.name}`,
                  unit: total,
                  gift: false,
                  note: '',
                  custom: { baseId: base.id, color, size, pattern, notes }
                })
                nav('/cart')
              }}
            >
              Add Custom Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
