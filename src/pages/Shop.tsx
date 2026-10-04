import { useSearchParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { Grid } from '../components/ui'

export default function Shop() {
  const [q] = useSearchParams(), cat = q.get('category'), { products, wishlist, loading } = useStore()
  const list = q.get('wishlist') ? products.filter(p => wishlist.includes(p.id)) : products.filter(p => !cat || p.category === cat)
  const title = q.get('wishlist') ? 'Your Wishlist' : cat === 'men' ? 'Men’s Shawls' : cat === 'women' ? 'Women’s Shawls' : 'All Shawls'

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6 sm:mb-8 pb-4 border-b border-beige">
        <h1 className="text-3xl sm:text-4xl text-ink">{title}</h1>
        <p className="text-xs text-ink/60 uppercase tracking-widest font-mono">
          {!loading && `${list.length} ${list.length === 1 ? 'piece' : 'pieces'} available`}
        </p>
      </div>
      {loading ? (
        <div className="py-16 text-center text-ink/70 font-serif">Loading collection…</div>
      ) : list.length ? (
        <Grid items={list} />
      ) : (
        <div className="py-16 text-center text-ink/70 font-serif">Nothing here yet.</div>
      )}
    </div>
  )
}
