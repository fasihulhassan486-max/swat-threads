import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { GiftFields, Icon, Media } from '../components/ui'
import { pkr } from '../lib/format'
import { track } from '../lib/analytics'
export default function Product() {
  const { id } = useParams(), { products, loading, inStock, inCart, addProduct, wishlist, toggleWish } = useStore(), p = products.find(x => x.id === id)
  const [v, setV] = useState(0), [gift, setGift] = useState(false), [note, setNote] = useState(''), [packing, setPacking] = useState('')
  useEffect(() => { if (p) track('ViewContent', { content_ids: [p.id], value: p.price, currency: 'PKR' }) }, [p?.id])
  if (loading) return <div className="container-x py-20 text-ink/70">Loading…</div>
  if (!p) return <div className="container-x py-20">Not found. <Link to="/shop" className="underline">Back to shop</Link></div>
  const ok = inStock(p), thumbs = p.images.length ? p.images : [0, 1, 2]
  return (<div className="container-x py-12 grid md:grid-cols-2 gap-10">
    <div><div className="aspect-[4/5] bg-beige"><Media p={p} v={v} /></div>
      <div className="flex gap-3 mt-3">{thumbs.map((_, i) => <button key={i} onClick={() => setV(i)} className={`w-20 aspect-square border ${v === i ? 'border-walnut' : 'border-beige'}`}><Media p={p} v={i} /></button>)}</div></div>
    <div>
      {p.badge && <span className="text-[10px] uppercase tracking-widest text-walnut border border-walnut px-2 py-1">{p.badge}</span>}
      <p className="text-xs uppercase tracking-widest text-ink/70 mt-3">1 of 1 · {p.sku}</p>
      <h1 className="text-4xl text-ink my-2">{p.name}</h1>
      <p className="text-xl">{pkr(p.price)} {p.originalPrice && <span className="text-ink/70 line-through text-base ml-2">{pkr(p.originalPrice)}</span>}</p>
      {ok && <div className="border border-brass bg-beige p-4 mt-5"><p className="font-serif text-ink mb-2">Gifting this shawl?</p><GiftFields gift={gift} note={note} packing={packing} onChange={(g, n, pk) => { setGift(g); setNote(n); setPacking(pk) }} /></div>}
      <p className="text-ink/70 my-5">{p.description}</p>
      <p className={`text-sm mb-5 ${ok ? 'text-ink' : 'text-ink/70'}`}>{ok ? 'In stock — only one piece' : 'Sold — one of one'}</p>
            <div className="flex gap-3">
        <button className="btn-primary flex-1" disabled={!ok || inCart(p.id)} onClick={() => addProduct(p, gift, gift ? note : '', gift ? packing : '')}>{!ok ? 'Sold' : inCart(p.id) ? 'In your cart' : 'Add to Cart'}</button>
        <button className="btn-outline" aria-label="Wishlist" onClick={() => toggleWish(p.id)}><Icon n="heart" fill={wishlist.includes(p.id)} /></button></div></div></div>)
}
