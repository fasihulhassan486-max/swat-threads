import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { pkr } from '../lib/format'
import { site } from '../config/site'
const OCC = ['Eid', 'Wedding', 'Birthday', 'Anniversary', 'Thank you', 'Other']
export default function Gifting() {
  const { products, inStock, inCart, addProduct, loading } = useStore(), nav = useNavigate()
  const [id, setId] = useState(''), [to, setTo] = useState(''), [occ, setOcc] = useState(''), [note, setNote] = useState(''), [pack, setPack] = useState('')
  const list = products.filter(p => inStock(p) && !inCart(p.id)), p = products.find(x => x.id === id)
  return (<div className="container-x max-w-2xl py-12">
    <p className="eyebrow">Gifting</p><h1 className="text-4xl text-ink my-2">Gift a Swat Shawl</h1>
    <p className="text-ink/70 mb-8">Send a shawl to someone you love, in an heirloom pine wooden gift box (+{pkr(site.giftBoxPrice)}) with your own message and packing instructions.</p>
    <div className="space-y-3">
      <select className="field" value={id} onChange={e => setId(e.target.value)} disabled={loading}><option value="">Choose a shawl</option>{list.map(x => <option key={x.id} value={x.id}>{x.name} — {pkr(x.price)}</option>)}</select>
      <div className="grid sm:grid-cols-2 gap-3"><input className="field" placeholder="Who is it for? (name)" value={to} onChange={e => setTo(e.target.value)} />
        <select className="field" value={occ} onChange={e => setOcc(e.target.value)}><option value="">Occasion (optional)</option>{OCC.map(o => <option key={o}>{o}</option>)}</select></div>
      <textarea className="field" rows={4} placeholder="Your gift message — write exactly what you want on the card" value={note} onChange={e => setNote(e.target.value)} />
      <textarea className="field" rows={3} placeholder="Packing instructions — the type of gift packaging you want (wrapping, ribbon colour, extras…)" value={pack} onChange={e => setPack(e.target.value)} /></div>
    <p className="mt-5 font-serif text-lg">Total: {pkr((p?.price ?? 0) + site.giftBoxPrice)}</p>
    <button className="btn-primary mt-4" disabled={!p} onClick={() => { addProduct(p!, true, note, [to && `For: ${to}`, occ && `Occasion: ${occ}`, pack].filter(Boolean).join(' | ')); nav('/cart') }}>Add Gift to Cart</button></div>)
}
