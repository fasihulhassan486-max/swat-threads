import { useSearchParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { Grid } from '../components/ui'
export default function Shop() {
  const [q] = useSearchParams(), cat = q.get('category'), { products, wishlist, loading } = useStore()
  const list = q.get('wishlist') ? products.filter(p => wishlist.includes(p.id)) : products.filter(p => !cat || p.category === cat)
  const title = q.get('wishlist') ? 'Your Wishlist' : cat === 'men' ? 'Men’s Shawls' : cat === 'women' ? 'Women’s Shawls' : 'All Shawls'
  return (<div className="container-x py-12"><h1 className="text-4xl text-ink mb-8">{title}</h1>
    {loading ? <p className="text-ink/70">Loading…</p> : list.length ? <Grid items={list} /> : <p className="text-ink/70">Nothing here yet.</p>}</div>)
}
