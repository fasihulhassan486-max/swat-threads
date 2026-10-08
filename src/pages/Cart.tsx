import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { totals, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../lib/pricing'
import { pkr } from '../lib/format'
import { GiftFields, Media } from '../components/ui'

export function Summary() {
  const { lines } = useStore()
  const t = totals(lines)

  const Row = ({ l, v, b = false, green = false }: { l: string; v: React.ReactNode; b?: boolean; green?: boolean }) => (
    <div className={`flex justify-between items-center ${b ? 'font-serif text-base sm:text-lg border-t border-beige/80 pt-3 mt-1' : ''}`}>
      <span className={green ? 'text-emerald-700' : ''}>{l}</span>
      <span className={green ? 'text-emerald-700 font-medium' : ''}>{v}</span>
    </div>
  )

  return (
    <div className="bg-beige p-4 sm:p-6 space-y-2.5 text-xs sm:text-sm">
      <Row l="Subtotal" v={pkr(t.subtotal)} />
      {t.discount > 0 && <Row l="Couple bundle discount (10%)" v={`− ${pkr(t.discount)}`} />}
      {t.gift > 0 && <Row l="Gift packaging" v={pkr(t.gift)} />}

      {/* SHIPPING ROW */}
      <div className="flex justify-between items-center">
        <span>Shipping (3 to 4 Working Days)</span>
        {t.shipping === 0 ? (
          <span className="text-emerald-700 font-medium">Free 🎉</span>
        ) : (
          <span>
            {pkr(SHIPPING_FEE)}
            <span className="block text-[10px] text-ink/50">Free above {pkr(FREE_SHIPPING_THRESHOLD)}</span>
          </span>
        )}
      </div>

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
    <div className="container-x py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl text-ink mb-6 sm:mb-8">Your Cart</h1>
      {!lines.length ? (
        <div className="py-12 text-center">
          <p className="text-ink/70 mb-4">Your cart is empty.</p>
          <Link to="/shop" className="btn-outline">
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-2 divide-y divide-beige">
            {lines.map(l => {
              const p = products.find(x => x.id === (l.productId ?? l.custom?.baseId))
              return (
                <div key={l.id} className="py-4 sm:py-5 flex gap-3 sm:gap-4">
                  <div className="w-16 h-20 sm:w-20 sm:h-24 shrink-0 bg-beige/40 overflow-hidden">
                    {p && <Media p={p} />}
                  </div>
                  <div className="flex-1 min-w-0 text-sm">
                    <p className="font-serif text-base sm:text-lg text-ink truncate">{l.name}</p>
                    {l.custom && (
                      <div className="text-xs sm:text-sm text-ink/75 my-1 space-y-0.5 bg-ivory/60 border border-beige/60 p-2.5 rounded-sm">
                        {l.custom.customizationType === 'couple' ? (
                          <>
                            <p className="font-medium text-ink">Couple Customization</p>
                            <p><span className="text-ink/60">Men's:</span> {l.custom.mensCustomColor ? `Custom (${l.custom.mensCustomColor})` : l.custom.mensColor} · {l.custom.mensDesign}</p>
                            {l.custom.mensSpecialRequest && <p className="italic text-ink/60">“{l.custom.mensSpecialRequest}”</p>}
                            <p><span className="text-ink/60">Women's:</span> {l.custom.womensFabric} · {l.custom.womensCustomColor ? `Custom (${l.custom.womensCustomColor})` : l.custom.womensColor} · {l.custom.womensDesign}</p>
                            {l.custom.womensSpecialRequest && <p className="italic text-ink/60">“{l.custom.womensSpecialRequest}”</p>}
                            {l.custom.sharedCoupleCustomization && (
                              <p className="border-t border-beige/60 pt-1 mt-1 text-walnut font-medium">Coordination: “{l.custom.sharedCoupleCustomization}”</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p>
                              {l.custom.fabric && <span>{l.custom.fabric} · </span>}
                              <span>{l.custom.customColor ? `Custom (${l.custom.customColor})` : l.custom.color}</span>
                              <span> · {l.custom.customDimensions ? `Custom (${l.custom.customDimensions})` : l.custom.size}</span>
                              <span> · {l.custom.styleFinish || l.custom.style || l.custom.pattern}</span>
                            </p>
                            {(l.custom.specialInstructions || l.custom.notes) && (
                              <p className="italic text-ink/70">“{l.custom.specialInstructions || l.custom.notes}”</p>
                            )}
                            {l.custom.referenceImage && (
                              <p className="text-[11px] text-brass flex items-center gap-1">
                                <span>📎 Reference:</span> {l.custom.referenceImage}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    <p className="text-xs sm:text-sm mt-0.5">1 × {pkr(l.unit)}</p>
                    {l.colorNote && <p className="text-xs text-ink/70 mt-0.5">{l.colorNote}</p>}
                    {l.giftDetails ? (
                      <div className="mt-2 bg-beige/60 border border-brass/30 p-2.5 text-xs space-y-1">
                        <p className="font-serif font-medium text-ink flex items-center justify-between">
                          <span>🎁 {l.giftDetails.packaging}</span>
                          <span className="font-sans">+{pkr(l.giftDetails.packagingPrice ?? 390)}</span>
                        </p>
                        {l.giftDetails.recipientName && (
                          <p className="text-ink/80"><span className="text-ink/60">For:</span> {l.giftDetails.recipientName}</p>
                        )}
                        {l.giftDetails.senderName && (
                          <p className="text-ink/80"><span className="text-ink/60">From:</span> {l.giftDetails.senderName}</p>
                        )}
                        {l.giftDetails.occasion && (
                          <p className="text-ink/80"><span className="text-ink/60">Occasion:</span> {l.giftDetails.occasion}</p>
                        )}
                        {l.giftDetails.message && (
                          <p className="italic text-ink/90 border-l-2 border-brass pl-2 py-0.5 mt-1 bg-white/40">
                            "{l.giftDetails.message}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2">
                        <GiftFields
                          gift={l.gift}
                          note={l.note}
                          packing={l.packing ?? ''}
                          onChange={(g, n, pk) => setGift(l.id, g, n, pk)}
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(l.id)}
                      className="text-xs text-ink/60 hover:text-ink underline mt-2 py-1 inline-block"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="lg:sticky lg:top-24 space-y-4">
            <Summary />
            <Link to="/checkout" className="btn-primary w-full py-3.5 sm:py-4 px-6 text-center block">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
