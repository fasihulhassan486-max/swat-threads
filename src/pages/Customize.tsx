import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { Media } from '../components/ui'
import { customPrice, SIZE_EXTRA, PATTERN_EXTRA } from '../lib/pricing'
import { pkr } from '../lib/format'
import { site } from '../config/site'
import type { Product } from '../types'
export default function Customize() {
  const [base, setBase] = useState<Product | null>(null), [color, setColor] = useState(''), [size, setSize] = useState('Standard'), [pattern, setPattern] = useState('Plain'), [notes, setNotes] = useState('')
  const { addCustom, products } = useStore(), nav = useNavigate()
  const total = base ? customPrice(base.price, size, pattern) : 0, adv = Math.round(total * site.advanceRate)
  return (<div className="container-x py-12">
    <h1 className="text-4xl text-ink">Customize Your Shawl</h1>
    <p className="text-ink/70 max-w-2xl my-4">Choose a base design, then pick your color, size and pattern. Pay a 50% advance online; the remaining 50% is Cash on Delivery. Production takes 8–10 days.</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">{products.map(p => (
      <button key={p.id} onClick={() => { setBase(p); setColor(''); }} className="text-left"><div className="aspect-[4/5]"><Media p={p} /></div><p className="font-serif mt-2">{p.name}</p><p className="text-sm text-ink/70">From {pkr(p.price)}</p></button>))}</div>
    {base && <div className="fixed inset-0 z-50 bg-coal/70 grid place-items-center p-4" onClick={() => setBase(null)}>
      <div className="bg-ivory max-w-md w-full p-6 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl text-ink mb-4">Customize: {base.name}</h3>
        <div className="space-y-3">
          <input className="field" placeholder="Color (e.g. deep green)" value={color} onChange={e => setColor(e.target.value)} />
          <select className="field" value={size} onChange={e => setSize(e.target.value)}>{Object.entries(SIZE_EXTRA).map(([k, v]) => <option key={k} value={k}>{k} {v ? `(+${pkr(v)})` : ''}</option>)}</select>
          <select className="field" value={pattern} onChange={e => setPattern(e.target.value)}>{Object.entries(PATTERN_EXTRA).map(([k, v]) => <option key={k} value={k}>{k} {v ? `(+${pkr(v)})` : ''}</option>)}</select>
          <div><label className="block text-sm text-ink mb-1">Instructions for the artisan *</label>
            <textarea className="field" rows={4} placeholder="Tell us exactly what you want done on your shawl — borders, embroidery, name or text to stitch, motifs, fringe, anything special." value={notes} onChange={e => setNotes(e.target.value)} /></div></div>
        <dl className="text-sm my-5 space-y-1"><div className="flex justify-between"><dt>Total</dt><dd className="font-serif text-lg">{pkr(total)}</dd></div>
          <div className="flex justify-between"><dt>Advance deposit (online)</dt><dd>{pkr(adv)}</dd></div><div className="flex justify-between"><dt>Balance on delivery (COD)</dt><dd>{pkr(total - adv)}</dd></div></dl>
        <button className="btn-primary w-full" disabled={!color.trim() || !notes.trim()} onClick={() => { addCustom({ name: `Custom · ${base.name}`, unit: total, gift: false, note: '', custom: { baseId: base.id, color, size, pattern, notes } }); nav('/cart') }}>Add Custom Order</button></div></div>}
  </div>)
}
