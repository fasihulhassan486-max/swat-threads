import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { totals, FREE_SHIPPING_THRESHOLD } from '../lib/pricing'
import { Summary } from './Cart'
import { createOrder } from '../lib/woocommerce'
import { track } from '../lib/analytics'
import { pkr } from '../lib/format'

export default function Checkout() {
  const { lines, completeOrder } = useStore()
  const nav = useNavigate()
  const t = totals(lines)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [pay, setPay] = useState('card')
  const [f, setF] = useState({ name: '', phone: '', address: '', city: '' })
  const method = t.hasCustom && pay === 'cod' ? 'card' : pay

  const orderValue = t.subtotal - t.discount + t.gift
  const freeShipping = t.shipping === 0
  const remaining = FREE_SHIPPING_THRESHOLD - orderValue

  useEffect(() => { track('InitiateCheckout', { value: t.total, currency: 'PKR' }) }, [])

  async function place() {
    setBusy(true); setErr('')
    try {
      await createOrder(lines, f, method, t)
      track('Purchase', { value: t.total, currency: 'PKR' })
      const dueNow = t.dueNow, bal = t.balanceCOD
      completeOrder()
      nav('/order-confirmation', { state: { dueNow, bal, method } })
    } catch {
      setErr('Could not place your order. Please try again or message us on WhatsApp.')
    } finally {
      setBusy(false)
    }
  }

  if (!lines.length) return <div className="container-x py-20">Your cart is empty. <Link to="/shop" className="underline">Shop</Link></div>
  const valid = Object.values(f).every(v => v.trim())
  const opts = [['card', 'Card'], ['jazzcash', 'JazzCash'], ['cod', 'Cash on Delivery']]

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl text-ink mb-8">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-10">

        {/* LEFT: FORM */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {(['name', 'phone', 'address', 'city'] as const).map(k => (
              <input
                key={k}
                className={`field ${k === 'address' ? 'sm:col-span-2' : ''}`}
                placeholder={{ name: 'Full name', phone: 'Phone', address: 'Address', city: 'City' }[k]}
                value={f[k]}
                onChange={e => setF({ ...f, [k]: e.target.value })}
              />
            ))}
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <h3 className="text-xl text-ink mb-2">Payment method</h3>
            {opts.map(([v, l]) => {
              const off = v === 'cod' && t.hasCustom
              return (
                <label key={v} className={`flex items-center gap-2 py-2 ${off ? 'text-ink/40' : ''}`}>
                  <input type="radio" disabled={off} checked={method === v} onChange={() => setPay(v)} />
                  {l}
                  {off && <span className="text-xs">(not available for custom orders)</span>}
                </label>
              )
            })}
          </div>
        </div>

        {/* RIGHT: SUMMARY + CTA */}
        <div className="space-y-4">
          {/* FREE SHIPPING BANNER */}
          {freeShipping ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm font-medium">
              <span className="text-emerald-600 text-base">✓</span>
              <span>You have unlocked <strong>Free Express Shipping!</strong></span>
            </div>
          ) : lines.length > 0 && remaining > 0 ? (
            <div className="bg-beige/60 border border-beige text-ink/75 px-4 py-3 text-xs">
              <p className="mb-1.5">Add <strong className="text-ink">{pkr(remaining)}</strong> more to unlock Free Shipping</p>
              <div className="h-1.5 bg-beige border border-beige/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-walnut rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((orderValue / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                />
              </div>
            </div>
          ) : null}

          <Summary />

          <button
            disabled={!valid || busy}
            className="btn-primary w-full mt-1"
            onClick={place}
          >
            {busy ? 'Placing…' : 'Place Order'}
          </button>

          {err && <p className="text-sm text-red-700">{err}</p>}
          <p className="text-xs text-ink/70">
            {method === 'cod'
              ? 'Pay in full on delivery.'
              : 'Due now: online. Any remaining balance is collected on delivery.'}
          </p>
        </div>

      </div>
    </div>
  )
}
