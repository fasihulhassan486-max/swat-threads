import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { totals } from '../lib/pricing'
import { pkr } from '../lib/format'
import { GiftFields, Media } from '../components/ui'
export function Summary() {
  const { lines } = useStore(), t = totals(lines)
  const R = ({ l, v, b = false }: { l: string; v: string; b?: boolean }) => <div className={`flex justify-between ${b ? 'font-serif text-lg border-t border-beige pt-2' : ''}`}><span>{l}</span><span>{v}</span></div>
  return (<div className="bg-beige p-6 space-y-2 text-sm"><R l="Subtotal" v={pkr(t.subtotal)} />
    {t.discount > 0 && <R l="Couple bundle discount" v={`− ${pkr(t.discount)}`} />}{t.gift > 0 && <R l="Gift packaging" v={pkr(t.gift)} />}
    <R l="Total" v={pkr(t.total)} b />
    {t.hasCustom && <><R l="Advance Deposit Due Now" v={pkr(t.dueNow)} /><R l="Due on Delivery (COD)" v={pkr(t.balanceCOD)} /></>}</div>)
}
export default function Cart() {
  const { lines, remove, setGift, products } = useStore()
  return (<div className="container-x py-12"><h1 className="text-4xl text-ink mb-8">Your Cart</h1>
    {!lines.length ? <p className="text-ink/70">Your cart is empty. <Link to="/shop" className="underline text-ink">Browse the collection</Link></p> :
      <div className="grid md:grid-cols-3 gap-10"><div className="md:col-span-2 divide-y divide-beige">
        {lines.map(l => { const p = products.find(x => x.id === (l.productId ?? l.custom?.baseId)); return (
          <div key={l.id} className="py-5 flex gap-4"><div className="w-20 h-24 shrink-0">{p && <Media p={p} />}</div>
            <div className="flex-1 text-sm"><p className="font-serif text-lg">{l.name}</p>
              {l.custom && <p className="text-ink/70">{l.custom.color} · {l.custom.size} · {l.custom.pattern}{l.custom.notes && ` · “${l.custom.notes}”`}</p>}
              <p>1 × {pkr(l.unit)}</p>
              {l.colorNote && <p className="text-ink/70">{l.colorNote}</p>}
              <div className="mt-2"><GiftFields gift={l.gift} note={l.note} packing={l.packing ?? ''} onChange={(g, n, pk) => setGift(l.id, g, n, pk)} /></div>
              <button onClick={() => remove(l.id)} className="text-ink/70 underline mt-2">Remove</button></div></div>) })}</div>
        <div><Summary /><Link to="/checkout" className="btn-primary w-full mt-4">Proceed to Checkout</Link></div></div>}</div>)
}
