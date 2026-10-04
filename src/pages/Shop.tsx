import { useSearchParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { Grid } from '../components/ui'

export default function Shop() {
  const [q] = useSearchParams()
  const cat = q.get('category')
  const { products, wishlist, loading } = useStore()

  const isWishlist = Boolean(q.get('wishlist'))
  const list = isWishlist
    ? products.filter(p => wishlist.includes(p.id))
    : products.filter(p => !cat || p.category === cat)

  const title = isWishlist
    ? 'Your Wishlist'
    : cat === 'men'
      ? "Men's Shawls"
      : cat === 'women'
        ? "Women's Shawls"
        : 'The Collection'

  const subtitle = isWishlist
    ? 'Your saved artisan pieces from the VIRAS collection.'
    : cat === 'men'
      ? 'Handwoven wool shawls from Swat, designed for warmth, understated elegance, and everyday winter wear.'
      : cat === 'women'
        ? 'Elegant shawls crafted in Swat, with wool and Swiss Lawn options for different seasons and styles.'
        : 'Handcrafted shawls rooted in the heritage of Swat Valley, Pakistan, made for modern wardrobes and meant to be kept.'

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-beige">
        <div className="max-w-2xl">
          <p className="eyebrow mb-1">VIRAS · Swat Valley</p>
          <h1 className="text-3xl sm:text-4xl text-ink font-serif">{title}</h1>
          <p className="text-xs sm:text-sm text-ink/70 mt-2 leading-relaxed">{subtitle}</p>
        </div>
        <p className="text-xs text-ink/60 uppercase tracking-widest font-mono shrink-0">
          {!loading && `${list.length} ${list.length === 1 ? 'artisan piece' : 'artisan pieces'}`}
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-ink/70 font-serif">Loading collection…</div>
      ) : list.length ? (
        <Grid items={list} />
      ) : (
        <div className="py-16 text-center text-ink/70 font-serif">
          {isWishlist ? 'You have no saved shawls yet.' : 'New artisan pieces are being prepared. Check back soon.'}
        </div>
      )}
    </div>
  )
}
