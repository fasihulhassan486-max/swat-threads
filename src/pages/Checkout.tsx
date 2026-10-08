import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { totals, SHIPPING_FEE, DELIVERY_TIME, EASYPAISA_NUMBER, EASYPAISA_ACCOUNT_NAME } from '../lib/pricing'
import { createOrder, Customer } from '../lib/woocommerce'
import { track } from '../lib/analytics'
import { pkr } from '../lib/format'
import { Icon } from '../components/ui'

const PK_PHONE_REGEX = /^(?:03\d{9}|\+923\d{9}|923\d{9})$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function Checkout() {
  const { lines, completeOrder } = useStore()
  const nav = useNavigate()
  const t = totals(lines)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [pay, setPay] = useState('easypaisa')

  const [f, setF] = useState({
    name: '',
    phone: '',
    email: '',
    house: '',
    street: '',
    area: '',
    city: '',
    deliveryInstructions: '',
  })

  const method = t.hasCustom && pay === 'cod' ? 'easypaisa' : pay

  useEffect(() => {
    track('InitiateCheckout', { value: t.total, currency: 'PKR' })
  }, [])

  const cleanPhone = f.phone.trim().replace(/[-\s]/g, '')
  const cleanEmail = f.email.trim().toLowerCase()

  const isPhoneValid = PK_PHONE_REGEX.test(cleanPhone)
  const isEmailValid = EMAIL_REGEX.test(cleanEmail)
  const isNameValid = f.name.trim().length >= 3
  const isAddressValid = Boolean(f.house.trim() && f.street.trim() && f.area.trim() && f.city.trim())

  const isFormValid = isNameValid && isPhoneValid && isEmailValid && isAddressValid

  async function place() {
    setErr('')

    // ─── FINAL VALIDATION ───
    if (!lines.length) {
      setErr('Your cart is empty. Please add a shawl to proceed.')
      return
    }
    if (!f.name.trim() || f.name.trim().length < 3) {
      setErr('Please enter your full name (minimum 3 characters).')
      return
    }
    if (!f.phone.trim()) {
      setErr('Active phone number is required.')
      return
    }
    if (!isPhoneValid) {
      setErr('Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).')
      return
    }
    if (!f.email.trim()) {
      setErr('Email address is required.')
      return
    }
    if (!isEmailValid) {
      setErr('Please enter a valid email address (e.g. yourname@gmail.com).')
      return
    }
    if (!f.house.trim()) {
      setErr('Please enter your House / Flat / Building number.')
      return
    }
    if (!f.street.trim()) {
      setErr('Please enter your Street / Road / Block name.')
      return
    }
    if (!f.area.trim()) {
      setErr('Please enter your Area / Sector / Colony.')
      return
    }
    if (!f.city.trim()) {
      setErr('Please enter your delivery City.')
      return
    }
    if (!method) {
      setErr('Please select a payment method.')
      return
    }

    setBusy(true)

    const fullAddress = `${f.house.trim()}, ${f.street.trim()}, ${f.area.trim()}`
    const customerData: Customer = {
      name: f.name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      address: fullAddress,
      city: f.city.trim(),
      deliveryInstructions: f.deliveryInstructions.trim() || undefined,
    }

    try {
      const res = await createOrder(lines, customerData, method, t)
      track('Purchase', { value: t.total, currency: 'PKR' })
      const dueNow = t.dueNow
      const bal = t.balanceCOD
      const orderId = res?.id || res?.number || Math.floor(100000 + Math.random() * 900000)

      completeOrder()
      nav('/order-confirmation', {
        state: {
          orderId,
          total: t.total,
          dueNow,
          bal,
          method,
          customer: customerData,
          lines,
          shipping: t.shipping,
          estimatedDelivery: DELIVERY_TIME,
        },
      })
    } catch (orderErr) {
      console.warn('Order submission failed:', orderErr)
      setErr('Could not submit order automatically. Please try again or reach our team on WhatsApp for instant assistance.')
    } finally {
      setBusy(false)
    }
  }

  if (!lines.length) {
    return (
      <div className="container-x py-16 sm:py-20 text-center font-serif">
        <p className="text-ink/70 mb-4 text-lg">Your cart is empty.</p>
        <Link to="/shop" className="btn-outline">
          Browse Collection
        </Link>
      </div>
    )
  }

  const paymentOptions = [
    { id: 'easypaisa', label: 'EasyPaisa Online Transfer', badge: 'Recommended' },
    { id: 'cod', label: 'Cash on Delivery (COD)' },
    { id: 'card', label: 'Credit / Debit Card' },
    { id: 'jazzcash', label: 'JazzCash' },
  ]

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="max-w-2xl mb-6 sm:mb-8">
        <p className="eyebrow mb-1">Secure Checkout</p>
        <h1 className="text-3xl sm:text-4xl text-ink font-serif">Complete Your Order</h1>
        <p className="text-xs sm:text-sm text-ink/70 mt-1 flex items-center gap-2">
          <Icon n="truck" className="w-4 h-4 text-brass shrink-0" />
          <span>Standard Delivery: <strong>{DELIVERY_TIME}</strong> across Pakistan</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
        {/* LEFT: CUSTOMER DETAILS & PAYMENT */}
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 1: CUSTOMER INFORMATION */}
          <div className="bg-white border border-beige p-5 sm:p-7 shadow-xs">
            <h2 className="text-xl font-serif text-ink mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-walnut text-white text-xs flex items-center justify-center font-sans">1</span>
              <span>Customer Information</span>
            </h2>
            <p className="text-xs text-ink/60 mb-5 pl-8">We will contact you on your active mobile number for order delivery.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/80 mb-1 font-medium">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="field"
                  placeholder="e.g. Fasih Ul Hassan"
                  value={f.name}
                  onChange={e => setF({ ...f, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/80 mb-1 font-medium">
                  Active Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  className="field"
                  placeholder="e.g. 0329 6424489 or +923296424489"
                  value={f.phone}
                  onChange={e => setF({ ...f, phone: e.target.value })}
                />
                <span className="text-[11px] text-ink/50 mt-0.5 block">Format: 03XXXXXXXXX or +923XXXXXXXXX</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-ink/80 mb-1 font-medium">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="field"
                  placeholder="e.g. customer@example.com"
                  value={f.email}
                  onChange={e => setF({ ...f, email: e.target.value })}
                />
                <span className="text-[11px] text-ink/50 mt-0.5 block">Order receipt and shipment tracking details will be sent here</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: DELIVERY ADDRESS */}
          <div className="bg-white border border-beige p-5 sm:p-7 shadow-xs">
            <h2 className="text-xl font-serif text-ink mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-walnut text-white text-xs flex items-center justify-center font-sans">2</span>
              <span>Delivery Address</span>
            </h2>
            <p className="text-xs text-ink/60 mb-5 pl-8">Delivered by trackable courier across Pakistan in {DELIVERY_TIME}.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/80 mb-1 font-medium">
                  House / Flat / Building No. <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="field"
                  placeholder="e.g. House #14, Flat 3B"
                  value={f.house}
                  onChange={e => setF({ ...f, house: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/80 mb-1 font-medium">
                  Street / Road / Block <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="field"
                  placeholder="e.g. Street 4, Block C"
                  value={f.street}
                  onChange={e => setF({ ...f, street: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/80 mb-1 font-medium">
                  Area / Sector / Colony <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="field"
                  placeholder="e.g. Saidu Sharif / F-10"
                  value={f.area}
                  onChange={e => setF({ ...f, area: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/80 mb-1 font-medium">
                  City <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="field"
                  placeholder="e.g. Mingora, Swat / Islamabad / Lahore"
                  value={f.city}
                  onChange={e => setF({ ...f, city: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-ink/80 mb-1 font-medium">
                  Delivery Instructions / Landmark <span className="text-ink/40 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  className="field"
                  placeholder="Nearby landmark, gate code, or preferred call time..."
                  value={f.deliveryInstructions}
                  onChange={e => setF({ ...f, deliveryInstructions: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PAYMENT METHOD */}
          <div className="bg-white border border-beige p-5 sm:p-7 shadow-xs">
            <h2 className="text-xl font-serif text-ink mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-walnut text-white text-xs flex items-center justify-center font-sans">3</span>
              <span>Payment Method</span>
            </h2>
            <p className="text-xs text-ink/60 mb-5 pl-8">Select your preferred payment method.</p>

            <div className="space-y-3">
              {paymentOptions.map(opt => {
                const isCodBlocked = opt.id === 'cod' && t.hasCustom
                const isSelected = method === opt.id

                return (
                  <div key={opt.id} className="border border-beige rounded-sm overflow-hidden transition-all">
                    <label
                      className={`flex items-center justify-between p-3.5 cursor-pointer ${
                        isSelected ? 'bg-beige/40 font-medium' : 'hover:bg-beige/20'
                      } ${isCodBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          disabled={isCodBlocked}
                          checked={isSelected}
                          onChange={() => setPay(opt.id)}
                          className="accent-walnut w-4 h-4"
                        />
                        <span className="text-sm text-ink">{opt.label}</span>
                      </div>
                      {opt.badge && (
                        <span className="text-[10px] uppercase tracking-wider bg-brass/20 text-walnut px-2 py-0.5 rounded-xs font-semibold">
                          {opt.badge}
                        </span>
                      )}
                      {isCodBlocked && (
                        <span className="text-xs text-ink/60 italic">
                          (Custom orders require deposit)
                        </span>
                      )}
                    </label>

                    {/* EASYPAISA DETAILS BOX */}
                    {isSelected && opt.id === 'easypaisa' && (
                      <div className="p-4 bg-emerald-50/70 border-t border-emerald-200/80 text-xs text-ink space-y-2">
                        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                          <span>EasyPaisa Transfer Details</span>
                        </div>
                        <div className="bg-white border border-emerald-200 p-3 rounded-sm space-y-1 font-mono">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-ink/60 font-sans">Payment Method:</span>
                            <span className="font-bold text-ink">EasyPaisa</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-ink/60 font-sans">EasyPaisa Number:</span>
                            <span className="font-bold text-emerald-800 text-base">{EASYPAISA_NUMBER}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-ink/60 font-sans">Account Name:</span>
                            <span className="font-bold text-ink">{EASYPAISA_ACCOUNT_NAME}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-ink/75 leading-relaxed pt-1">
                          Transfer the payable amount (<strong>{pkr(t.hasCustom ? t.dueNow : t.total)}</strong>) to the EasyPaisa account above after clicking <strong>Place Order</strong>. Our team will verify your transaction reference / screenshot via WhatsApp for instant dispatch.
                        </p>
                      </div>
                    )}

                    {/* COD DETAILS BOX */}
                    {isSelected && opt.id === 'cod' && (
                      <div className="p-4 bg-beige/30 border-t border-beige text-xs text-ink/80 leading-relaxed">
                        Pay in cash upon doorstep inspection when courier delivers your heirloom piece ({DELIVERY_TIME}).
                      </div>
                    )}

                    {/* CARD DETAILS BOX */}
                    {isSelected && opt.id === 'card' && (
                      <div className="p-4 bg-beige/30 border-t border-beige text-xs text-ink/80 leading-relaxed">
                        Secure credit or debit card payment. You will be redirected to the secure bank gateway.
                      </div>
                    )}

                    {/* JAZZCASH DETAILS BOX */}
                    {isSelected && opt.id === 'jazzcash' && (
                      <div className="p-4 bg-beige/30 border-t border-beige text-xs text-ink/80 leading-relaxed">
                        Pay via JazzCash mobile account or voucher at delivery.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY + SUBMIT */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <div className="bg-white border border-beige p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-serif text-ink border-b border-beige pb-3">Order Summary</h2>

            {/* ORDER ITEMS LIST */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-beige/50 text-xs">
              {lines.map(line => (
                <div key={line.id} className="pt-2 first:pt-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-medium text-ink">{line.name}</span>
                    <span className="font-semibold text-ink shrink-0">{pkr(line.unit)}</span>
                  </div>

                  {line.custom && (
                    <div className="mt-1 text-[11px] text-ink/70 space-y-0.5 bg-ivory p-1.5 rounded-xs border border-beige/60">
                      {line.custom.fabric && <p>Fabric: {line.custom.fabric}</p>}
                      {line.custom.color && <p>Color: {line.custom.color}</p>}
                      {line.custom.size && <p>Dimensions: {line.custom.size}</p>}
                      {line.custom.style && <p>Style: {line.custom.style}</p>}
                      {(line.custom.style === 'Embroidered' || line.custom.pattern === 'Embroidered' || line.custom.womensDesign === 'Embroidered') && (
                        <p className="text-walnut font-medium">Embroidery: PKR 1,000 Included</p>
                      )}
                      {line.custom.notes && <p className="italic">Note: “{line.custom.notes}”</p>}
                    </div>
                  )}

                  {line.gift && (
                    <p className="text-[11px] text-brass mt-0.5">
                      + Heirloom Gift Box ({pkr(line.giftDetails?.packagingPrice ?? 390)})
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* CALCULATIONS */}
            <div className="border-t border-beige pt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center text-ink/80">
                <span>Subtotal</span>
                <span className="font-medium text-ink">{pkr(t.subtotal)}</span>
              </div>

              {t.discount > 0 && (
                <div className="flex justify-between items-center text-emerald-700">
                  <span>Couple Bundle Savings (10%)</span>
                  <span>− {pkr(t.discount)}</span>
                </div>
              )}

              {t.gift > 0 && (
                <div className="flex justify-between items-center text-ink/80">
                  <span>Gift Packaging</span>
                  <span>+{pkr(t.gift)}</span>
                </div>
              )}

              {/* CLEAR SHIPPING CHARGE DISPLAY */}
              <div className="flex justify-between items-center text-ink/80 border-t border-beige/40 pt-2">
                <div>
                  <span className="block font-medium text-ink">Shipping</span>
                  <span className="text-[10px] text-ink/50">{DELIVERY_TIME}</span>
                </div>
                <span className="font-semibold text-ink">{pkr(SHIPPING_FEE)}</span>
              </div>

              {/* FINAL TOTAL */}
              <div className="border-t border-beige pt-3 flex justify-between items-baseline font-serif">
                <div>
                  <span className="text-base text-ink font-bold block">Final Total</span>
                  <span className="text-[10px] font-sans text-ink/50">All taxes &amp; shipping included</span>
                </div>
                <span className="text-xl sm:text-2xl text-walnut font-bold">{pkr(t.total)}</span>
              </div>

              {t.hasCustom && (
                <div className="bg-beige/40 border border-brass/30 p-2.5 rounded-xs space-y-1 text-[11px] mt-2">
                  <div className="flex justify-between font-medium text-ink">
                    <span>Advance Deposit Due Now (50%):</span>
                    <span className="font-bold text-walnut">{pkr(t.dueNow)}</span>
                  </div>
                  <div className="flex justify-between text-ink/70">
                    <span>Balance on Delivery (COD 50%):</span>
                    <span>{pkr(t.balanceCOD)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ERROR MESSAGE DISPLAY */}
            {err && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <span>⚠</span> {err}
                </p>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="button"
              disabled={busy}
              onClick={place}
              className="btn-primary w-full py-4 text-center text-xs tracking-[0.2em] font-medium min-h-[48px]"
            >
              {busy ? 'Placing Your Order…' : 'Place Order'}
            </button>

            <p className="text-[11px] text-ink/60 text-center leading-relaxed">
              By placing your order, you agree to our delivery schedule ({DELIVERY_TIME}) and store policies.
            </p>
          </div>

          {/* SECURITY & TRUST BADGE */}
          <div className="bg-beige/30 border border-beige p-4 text-xs text-ink/75 space-y-2">
            <div className="flex items-center gap-2 text-ink font-medium">
              <Icon n="check" className="w-4 h-4 text-brass shrink-0" />
              <span>Authentic Swat Valley Craftsmanship</span>
            </div>
            <div className="flex items-center gap-2 text-ink font-medium">
              <Icon n="truck" className="w-4 h-4 text-brass shrink-0" />
              <span>Nationwide Safe Delivery ({DELIVERY_TIME})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
