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

  const PK_PHONE_REGEX = /^(03\d{9}|\+923\d{9})$/

  async function place() {
    setBusy(true); setErr('')
    const normalizedPhone = f.phone.trim().replace(/[-\s]/g, '')

    if (!PK_PHONE_REGEX.test(normalizedPhone)) {
      setErr('Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).')
      setBusy(false)
      return
    }

    try {
      await createOrder(lines, { ...f, phone: normalizedPhone }, method, t)
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

  if (!lines.length) return (
    <div className="container-x py-16 sm:py-20 text-center">
      <p className="text-ink/70 mb-4">Your cart is empty.</p>
      <Link to="/shop" className="btn-outline">
        Browse Collection
      </Link>
    </div>
  )

  const isPhoneValid = PK_PHONE_REGEX.test(f.phone.trim().replace(/[-\s]/g, ''))
  const valid = Object.values(f).every(v => v.trim()) && isPhoneValid
  const opts = [['card', 'Credit / Debit Card'], ['jazzcash', 'JazzCash'], ['cod', 'Cash on Delivery']]

  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl text-ink mb-6 sm:mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">

        {/* LEFT: CUSTOMER DETAILS & PAYMENT */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-xl font-serif text-ink mb-3 sm:mb-4">1. Delivery Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {(['name', 'phone', 'address', 'city'] as const).map(k => (
                <input
                  key={k}
                  className={`field ${k === 'address' ? 'sm:col-span-2' : ''}`}
                  placeholder={{ name: 'Full name *', phone: 'Phone number *', address: 'Street address *', city: 'City *' }[k]}
                  value={f[k]}
                  onChange={e => setF({ ...f, [k]: e.target.value })}
                />
              ))}
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <h2 className="text-xl font-serif text-ink mb-3 sm:mb-4">2. Payment Method</h2>
            <div className="bg-beige/40 border border-beige p-3 sm:p-4 space-y-2">
              {opts.map(([v, l]) => {
                const off = v === 'cod' && t.hasCustom
                return (
                  <label key={v} className={`flex items-center gap-3 p-2.5 rounded transition-colors cursor-pointer ${off ? 'opacity-50 cursor-not-allowed' : 'hover:bg-beige/60'}`}>
                    <input
                      type="radio"
                      disabled={off}
                      checked={method === v}
                      onChange={() => setPay(v)}
                      className="accent-walnut w-4 h-4"
                    />
                    <span className="text-sm font-medium text-ink">{l}</span>
                    {off && <span className="text-xs text-ink/60 italic">(advance deposit required for custom orders)</span>}
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY + CTA */}
        <div className="lg:sticky lg:top-24 space-y-4">
          {/* FREE SHIPPING BANNER */}
          {freeShipping ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 sm:p-4 text-xs sm:text-sm font-medium">
              <span className="text-emerald-600 text-base">✓</span>
              <span>You have unlocked <strong>Free Express Shipping!</strong></span>
            </div>
          ) : lines.length > 0 && remaining > 0 ? (
            <div className="bg-beige/60 border border-beige text-ink/75 p-3 sm:p-4 text-xs">
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
            className="btn-primary w-full py-3.5 sm:py-4 px-6 text-center text-xs tracking-[0.2em]"
            onClick={place}
          >
            {busy ? 'Placing Order…' : 'Place Order'}
          </button>

          {err && <p className="text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 p-3">{err}</p>}
          <p className="text-[11px] sm:text-xs text-ink/70 leading-relaxed">
            {method === 'cod'
              ? 'Pay in full with cash on delivery at your doorstep.'
              : 'Due now: online. Any remaining balance is collected safely upon delivery.'}
          </p>
        </div>

      </div>
    </div>
  )
}
