import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { totals } from '../lib/pricing'
import { Summary } from './Cart'
import { createOrder } from '../lib/woocommerce'
import { track } from '../lib/analytics'
import { useEffect } from 'react'
export default function Checkout() {
  const { lines, completeOrder } = useStore(), nav = useNavigate(), t = totals(lines)
  const [busy, setBusy] = useState(false), [err, setErr] = useState(''), [pay, setPay] = useState('card'), [f, setF] = useState({ name: '', phone: '', address: '', city: '' })
  const method = t.hasCustom && pay === 'cod' ? 'card' : pay
  useEffect(() => { track('InitiateCheckout', { value: t.total, currency: 'PKR' }) }, [])
  async function place() {
    setBusy(true); setErr('')
    try { await createOrder(lines, f, method, t); track('Purchase', { value: t.total, currency: 'PKR' }); const dueNow = t.dueNow, bal = t.balanceCOD; completeOrder(); nav('/order-confirmation', { state: { dueNow, bal, method } }) }
    catch { setErr('Could not place your order. Please try again or message us on WhatsApp.') } finally { setBusy(false) }
  }
  if (!lines.length) return <div className="container-x py-20">Your cart is empty. <Link to="/shop" className="underline">Shop</Link></div>
  const valid = Object.values(f).every(v => v.trim())
  const opts = [['card', 'Card'], ['jazzcash', 'JazzCash'], ['cod', 'Cash on Delivery']]
  return (<div className="container-x py-12"><h1 className="text-4xl text-ink mb-8">Checkout</h1>
    <div className="grid md:grid-cols-3 gap-10"><div className="md:col-span-2 space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">{(['name', 'phone', 'address', 'city'] as const).map(k => <input key={k} className={`field ${k === 'address' ? 'sm:col-span-2' : ''}`} placeholder={{ name: 'Full name', phone: 'Phone', address: 'Address', city: 'City' }[k]} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />)}</div>
      <div><h3 className="text-xl text-ink mb-2">Payment method</h3>
        {opts.map(([v, l]) => { const off = v === 'cod' && t.hasCustom; return (
          <label key={v} className={`flex items-center gap-2 py-2 ${off ? 'text-ink/40' : ''}`}><input type="radio" disabled={off} checked={method === v} onChange={() => setPay(v)} /> {l}{off && <span className="text-xs">(not available for custom orders)</span>}</label>) })}</div></div>
      <div><Summary /><button disabled={!valid || busy} className="btn-primary w-full mt-4" onClick={place}>{busy ? 'Placing…' : 'Place Order'}</button>
        {err && <p className="text-sm text-red-700 mt-2">{err}</p>}
        <p className="text-xs text-ink/70 mt-2">{method === 'cod' ? 'Pay in full on delivery.' : 'Due now: online. Any remaining balance is collected on delivery.'}</p></div></div></div>)
}
