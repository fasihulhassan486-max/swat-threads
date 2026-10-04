import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { GiftFields, Icon, Media } from '../components/ui'
import { pkr } from '../lib/format'
import { track } from '../lib/analytics'

export default function Product() {
  const { id } = useParams()
  const { products, loading, inStock, inCart, addProduct, wishlist, toggleWish } = useStore()
  const p = products.find(x => x.id === id)
  const [v, setV] = useState(0)
  const [gift, setGift] = useState(false)
  const [note, setNote] = useState('')
  const [packing, setPacking] = useState('')

  useEffect(() => {
    if (p) track('ViewContent', { content_ids: [p.id], value: p.price, currency: 'PKR' })
  }, [p?.id])

  if (loading) return <div className="container-x py-16 sm:py-20 text-ink/70">Loading…</div>
  if (!p) return <div className="container-x py-16 sm:py-20">Not found. <Link to="/shop" className="underline">Back to shop</Link></div>

  const ok = inStock(p)
  const thumbs = p.images.length ? p.images : [0, 1, 2]

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* MEDIA COLUMN */}
        <div>
          <div className="aspect-[4/5] bg-beige overflow-hidden">
            <Media p={p} v={v} />
          </div>
          <div className="flex gap-2 sm:gap-3 mt-3 overflow-x-auto pb-2">
            {thumbs.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setV(i)}
                className={`w-16 sm:w-20 aspect-square border shrink-0 transition-colors ${v === i ? 'border-walnut ring-1 ring-walnut' : 'border-beige hover:border-walnut/50'}`}
              >
                <Media p={p} v={i} />
              </button>
            ))}
          </div>
        </div>

        {/* DETAILS COLUMN */}
        <div>
          {p.badge && (
            <span className="text-[10px] uppercase tracking-widest text-walnut border border-walnut px-2.5 py-1 inline-block">
              {p.badge}
            </span>
          )}
          <p className="text-xs uppercase tracking-widest text-ink/70 mt-3">1 of 1 · {p.sku}</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-ink my-2">{p.name}</h1>
          <div className="flex items-baseline gap-2 mb-4">
            <p className="text-xl sm:text-2xl font-serif text-walnut font-medium">{pkr(p.price)}</p>
            {p.originalPrice && (
              <span className="text-ink/60 line-through text-sm sm:text-base">{pkr(p.originalPrice)}</span>
            )}
          </div>

          {ok && (
            <div className="border border-brass/50 bg-beige/60 p-4 sm:p-5 mt-4">
              <p className="font-serif text-ink mb-2">Gifting this shawl?</p>
              <GiftFields
                gift={gift}
                note={note}
                packing={packing}
                onChange={(g, n, pk) => { setGift(g); setNote(n); setPacking(pk) }}
              />
            </div>
          )}

          <p className="text-ink/75 my-5 text-sm sm:text-base leading-relaxed">{p.description}</p>
          <p className={`text-xs sm:text-sm mb-6 ${ok ? 'text-emerald-700 font-medium' : 'text-ink/60'}`}>
            {ok ? '● In stock — only one piece available' : '○ Sold — one of one'}
          </p>

          <div className="flex gap-3">
            <button
              className="btn-primary flex-1 py-3.5 px-6 min-h-[48px]"
              disabled={!ok || inCart(p.id)}
              onClick={() => addProduct(p, gift, gift ? note : '', gift ? packing : '')}
            >
              {!ok ? 'Sold' : inCart(p.id) ? 'In your cart' : 'Add to Cart'}
            </button>
            <button
              className="btn-outline min-h-[48px] min-w-[48px] p-3 flex items-center justify-center"
              aria-label="Wishlist"
              onClick={() => toggleWish(p.id)}
            >
              <Icon n="heart" fill={wishlist.includes(p.id)} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
