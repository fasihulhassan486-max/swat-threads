import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { bundleDiscount } from '../lib/pricing'
import { pkr } from '../lib/format'
const COLORS = ['Forest green', 'Ivory', 'Walnut brown', 'Saffron', 'Rosewood', 'Charcoal', 'Indigo', 'Ash grey']
export default function CoupleBundle() {
  const { products, inStock, addBundle, inCart } = useStore(), nav = useNavigate()
  const [m, setM] = useState(''), [w, setW] = useState(''), [liked, setLiked] = useState<string[]>([]), [idea, setIdea] = useState('')
  const opts = (c: string) => products.filter(p => p.category === c && inStock(p) && !inCart(p.id))
  const pm = products.find(p => p.id === m), pw = products.find(p => p.id === w)
  const sub = (pm?.price ?? 0) + (pw?.price ?? 0), disc = pm && pw ? bundleDiscount([pm.price], [pw.price]) : 0
  const colorNote = [liked.length ? `Liked colours: ${liked.join(', ')}` : '', idea && `Suggestion: ${idea}`].filter(Boolean).join(' | ')
  return (
    <div className="bg-coal text-white p-6 md:p-8 border-t-2 border-brass">
      <div className="grid md:grid-cols-2 gap-4">
        {([['Choose a men’s shawl', m, setM, 'men'], ['Choose a women’s shawl', w, setW, 'women']] as const).map(([l, v, set, c]) => (
          <select key={l} className="field !bg-coal !text-white !border-white/40" value={v} onChange={e => set(e.target.value)}>
            <option value="">{l}</option>{opts(c).map(p => <option key={p.id} value={p.id}>{p.name} — {pkr(p.price)}</option>)}</select>))}</div>
      <p className="eyebrow !text-brass mt-6 mb-2">Colours you like (pick any)</p>
      <div className="flex flex-wrap gap-2">{COLORS.map(c => <button key={c} type="button" onClick={() => setLiked(l => l.includes(c) ? l.filter(x => x !== c) : [...l, c])}
        className={`px-3 py-1 text-xs border ${liked.includes(c) ? 'bg-white text-coal border-white' : 'border-white/40'}`}>{c}</button>)}</div>
      <textarea className="field mt-3 !bg-coal !text-white !border-white/40" rows={2} placeholder="Suggest your own colours or tell us what you like — we’ll do our best to match" value={idea} onChange={e => setIdea(e.target.value)} />
      <dl className="mt-5 text-sm space-y-1 max-w-xs">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{pkr(sub)}</dd></div>
        <div className="flex justify-between text-brass"><dt>10% discount</dt><dd>− {pkr(disc)}</dd></div>
        <div className="flex justify-between font-serif text-lg border-t border-white/30 pt-1"><dt>Bundle price</dt><dd>{pkr(sub - disc)}</dd></div></dl>
      <button disabled={!pm || !pw} className="btn-dark-outline mt-5" onClick={() => { addBundle(pm!, pw!, colorNote); nav('/cart') }}>Add Couple Bundle to Cart</button>
    </div>)
}
