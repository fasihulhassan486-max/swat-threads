import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { totals, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../lib/pricing'
import { pkr } from '../lib/format'
import { GiftFields, Media } from '../components/ui'

export function Summary() {
  const { lines } = useStore()
  const t = totals(lines)
  const orderValue = t.subtotal - t.discount + t.gift
  const remaining = FREE_SHIPPING_THRESHOLD - orderValue
  const freeShipping = t.shipping === 0

  const Row = ({ l, v, b = false, green = false }: { l: string; v: React.ReactNode; b?: boolean; green?: boolean }) => (
    <div className={`flex justify-between items-center ${b ? 'font-serif text-lg border-t border-beige/80 pt-3 mt-1' : ''}`}>
      <span className={green ? 'text-emerald-700' : ''}>{l}</span>
      <span className={green ? 'text-emerald-700 font-medium' : ''}>{v}</span>
    </div>
  )

  return (
    <div className="bg-beige p-6 space-y-2.5 text-sm">
      <Row l="Subtotal" v={pkr(t.subtotal)} />
      {t.discount > 0 && <Row l="Couple bundle discount (10%)" v={`− ${pkr(t.discount)}`} />}
      {t.gift > 0 && <Row l="Gift packaging" v={pkr(t.gift)} />}

      {/* SHIPPING ROW */}
      <Row
        l="Shipping"
        v={
          freeShipping
            ? <span className="bg-emerald-100 text-emerald-700 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold">FREE</span>
            : pkr(SHIPPING_FEE)
        }
        green={freeShipping}
      />

      {/* PROGRESS BAR — only if not yet free */}
      {lines.length > 0 && !freeShipping && remaining > 0 && (
        <div className="pt-1">
          <div className="flex justify-between text-[11px] text-ink/60 mb-1.5">
            <span>Add {pkr(remaining)} more for Free Shipping</span>
            <span>{Math.round((orderValue / FREE_SHIPPING_THRESHOLD) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-beige/80 border border-beige/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-walnut rounded-full transition-all duration-500"
              style={{ width: `${Math.min((orderValue / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <Row l="Total" v={pkr(t.total)} b />
      {t.hasCustom && (
        <>
          <Row l="Advance Deposit Due Now" v={pkr(t.dueNow)} />
          <Row l="Due on Delivery (COD)" v={pkr(t.balanceCOD)} />
        </>
      )}
    </div>
  )
}

export default function Cart() {
  const { lines, remove, setGift, products } = useStore()
  return (
    <div className="container-x py-12">
      <h1 className="text-4xl text-ink mb-8">Your Cart</h1>
      {!lines.length
        ? <p className="text-ink/70">Your cart is empty. <Link to="/shop" className="underline text-ink">Browse the collection</Link></p>
        : (
          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 divide-y divide-beige">
              {lines.map(l => {
                const p = products.find(x => x.id === (l.productId ?? l.custom?.baseId))
                return (
                  <div key={l.id} className="py-5 flex gap-4">
                    <div className="w-20 h-24 shrink-0">{p && <Media p={p} />}</div>
                    <div className="flex-1 text-sm">
                      <p className="font-serif text-lg">{l.name}</p>
                      {l.custom && <p className="text-ink/70">{l.custom.color} · {l.custom.size} · {l.custom.pattern}{l.custom.notes && ` · "${l.custom.notes}"`}</p>}
                      <p>1 × {pkr(l.unit)}</p>
                      {l.colorNote && <p className="text-ink/70">{l.colorNote}</p>}
                      {l.giftDetails ? (
                        <div className="mt-2 bg-beige/60 border border-brass/30 p-2.5 text-xs space-y-1">
                          <p className="font-serif font-medium text-ink flex items-center justify-between">
                            <span>🎁 {l.giftDetails.packaging}</span>
                            <span className="font-sans">+{pkr(l.giftDetails.packagingPrice ?? 500)}</span>
                          </p>
                          {l.giftDetails.recipientName && <p className="text-ink/80"><span className="text-ink/60">For:</span> {l.giftDetails.recipientName}</p>}
                          {l.giftDetails.senderName && <p className="text-ink/80"><span className="text-ink/60">From:</span> {l.giftDetails.senderName}</p>}
                          {l.giftDetails.occasion && <p className="text-ink/80"><span className="text-ink/60">Occasion:</span> {l.giftDetails.occasion}</p>}
                          {l.giftDetails.message && <p className="italic text-ink/90 border-l-2 border-brass pl-2 py-0.5 mt-1 bg-white/40">"{l.giftDetails.message}"</p>}
                        </div>
                      ) : (
                        <div className="mt-2"><GiftFields gift={l.gift} note={l.note} packing={l.packing ?? ''} onChange={(g, n, pk) => setGift(l.id, g, n, pk)} /></div>
                      )}
                      <button onClick={() => remove(l.id)} className="text-ink/70 underline mt-2">Remove</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div>
              <Summary />
              <Link to="/checkout" className="btn-primary w-full mt-4">Proceed to Checkout</Link>
            </div>
          </div>
        )}
    </div>
  )
}
