import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { pkr } from '../lib/format'
import { Icon, Media } from '../components/ui'
import type { GiftDetails } from '../types'

const OCCASIONS = [
  'Eid Mubarak',
  'Wedding / Shadi',
  'Birthday',
  'Anniversary',
  'Thank You',
  'Thinking of You',
  'Other',
]

export default function Gifting() {
  const { products, inStock, addProduct, loading } = useStore()
  const navigate = useNavigate()

  // Form State
  const [selectedId, setSelectedId] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'gifting' | 'men' | 'women'>('all')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [occasion, setOccasion] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  // In-stock products
  const availableShawls = useMemo(() => {
    return products.filter(p => inStock(p))
  }, [products, inStock])

  // Check if any product has the 'gifting' category
  const hasGiftingCategory = useMemo(() => {
    return availableShawls.some(p => p.category === 'gifting')
  }, [availableShawls])

  // Filtered list
  const displayedShawls = useMemo(() => {
    if (categoryFilter === 'all') return availableShawls
    if (categoryFilter === 'gifting') return availableShawls.filter(p => p.category === 'gifting')
    if (categoryFilter === 'men') return availableShawls.filter(p => p.category === 'men')
    if (categoryFilter === 'women') return availableShawls.filter(p => p.category === 'women')
    return availableShawls
  }, [availableShawls, categoryFilter])

  // Currently selected product
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedId) || null
  }, [products, selectedId])

  // Fixed Packaging Price & Total
  const PACKAGING_PRICE = 390
  const productPrice = selectedProduct ? selectedProduct.price : 0
  const totalPrice = selectedProduct ? productPrice + PACKAGING_PRICE : PACKAGING_PRICE

  // Handle Checkout & Cart
  const handleCheckout = (destination: '/checkout' | '/cart' = '/checkout') => {
    if (!selectedProduct) return

    const trimmedRecipient = recipientName.trim()
    const trimmedMessage = customMessage.trim()

    if (!trimmedRecipient) {
      alert('Please enter a recipient name for the gift card.')
      return
    }

    if (!trimmedMessage) {
      alert('Please enter a personalized gift message to be handwritten on the card.')
      return
    }

    const giftDetails: GiftDetails = {
      recipientName: trimmedRecipient,
      senderName: senderName.trim(),
      message: trimmedMessage,
      packaging: 'Signature Gift Packaging, Satin Ribbon & Handwritten Card — PKR 390',
      packagingPrice: 390,
      occasion: occasion.trim(),
    }

    const packingSummary = [
      'Packaging: Signature Gift Packaging, Satin Ribbon & Handwritten Card — PKR 390',
      trimmedRecipient && `To: ${trimmedRecipient}`,
      senderName.trim() && `From: ${senderName.trim()}`,
      occasion && `Occasion: ${occasion.trim()}`,
    ]
      .filter(Boolean)
      .join(' | ')

    addProduct(selectedProduct, true, trimmedMessage, packingSummary, giftDetails)
    navigate(destination)
  }

  return (
    <div className="container-x py-8 sm:py-12">
      {/* PAGE HEADER */}
      <div className="max-w-2xl mb-8 sm:mb-12">
        <p className="eyebrow mb-2">Thoughtful Gifting · Swat Valley</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-ink tracking-tight mb-3">
          Gift a Handwoven Shawl
        </h1>
        <p className="text-ink/70 text-sm sm:text-base leading-relaxed">
          A thoughtful piece of Swat, beautifully packed and ready to gift.
        </p>
      </div>

      {/* 2-COLUMN MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: STEP-BY-STEP GIFT CREATION FORM */}
        <div className="lg:col-span-7 space-y-8 sm:space-y-12">

          {/* STEP 1: CHOOSE A HANDWOVEN SHAWL */}
          <section className="bg-white border border-beige/70 p-4 sm:p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6 pb-4 border-b border-beige/60">
              <div>
                <span className="text-[11px] font-mono tracking-widest text-walnut uppercase block">Step 01</span>
                <h2 className="text-xl sm:text-2xl font-serif text-ink">Choose a Handwoven Shawl</h2>
              </div>

              {/* CATEGORY FILTER TABS */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2.5 sm:px-3 py-1.5 transition-colors border ${
                    categoryFilter === 'all'
                      ? 'bg-walnut text-white border-walnut'
                      : 'bg-ivory text-ink/80 border-beige hover:border-walnut/40'
                  }`}
                >
                  All ({availableShawls.length})
                </button>
                {hasGiftingCategory && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('gifting')}
                    className={`px-2.5 sm:px-3 py-1.5 transition-colors border ${
                      categoryFilter === 'gifting'
                        ? 'bg-walnut text-white border-walnut'
                        : 'bg-ivory text-ink/80 border-beige hover:border-walnut/40'
                    }`}
                  >
                    Gifting Special
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCategoryFilter('men')}
                  className={`px-2.5 sm:px-3 py-1.5 transition-colors border ${
                    categoryFilter === 'men'
                      ? 'bg-walnut text-white border-walnut'
                      : 'bg-ivory text-ink/80 border-beige hover:border-walnut/40'
                  }`}
                >
                  Men’s
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('women')}
                  className={`px-2.5 sm:px-3 py-1.5 transition-colors border ${
                    categoryFilter === 'women'
                      ? 'bg-walnut text-white border-walnut'
                      : 'bg-ivory text-ink/80 border-beige hover:border-walnut/40'
                  }`}
                >
                  Women’s
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-ink/60 font-serif">
                <p>Loading available Swat shawls…</p>
              </div>
            ) : displayedShawls.length === 0 ? (
              <div className="py-12 text-center text-ink/60 font-serif">
                <p>No shawls available in this category right now.</p>
                <button
                  onClick={() => setCategoryFilter('all')}
                  className="mt-2 text-xs underline text-walnut py-1"
                >
                  Show all available shawls
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-h-[480px] overflow-y-auto p-1 pr-2">
                {displayedShawls.map((shawl) => {
                  const isSelected = selectedId === shawl.id
                  return (
                    <div
                      key={shawl.id}
                      onClick={() => setSelectedId(shawl.id)}
                      className={`group cursor-pointer border p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-200 relative ${
                        isSelected
                          ? 'border-walnut ring-1 ring-walnut bg-beige/10 shadow-sm'
                          : 'border-beige hover:border-walnut/50 bg-white hover:bg-ivory/50'
                      }`}
                    >
                      {/* SELECTED BADGE */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10 bg-walnut text-white text-[9px] sm:text-[10px] font-sans uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-sm">
                          <span>✓</span> Selected
                        </div>
                      )}

                      <div className="aspect-[4/5] bg-beige/40 relative overflow-hidden mb-2 sm:mb-3">
                        <Media p={shawl} />
                        {shawl.badge && !isSelected && (
                          <span className="absolute top-2 left-2 bg-coal/80 text-white text-[9px] uppercase tracking-widest px-1.5 py-0.5">
                            {shawl.badge}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-ink/50">
                          {shawl.category} · {shawl.sku}
                        </p>
                        <h3 className="font-serif text-xs sm:text-sm text-ink group-hover:text-walnut transition-colors line-clamp-1 mt-0.5">
                          {shawl.name}
                        </h3>
                        <p className="text-xs font-semibold text-ink mt-1">
                          {pkr(shawl.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        className={`w-full text-[10px] sm:text-[11px] py-1.5 mt-2.5 sm:mt-3 transition-colors uppercase tracking-wider font-sans ${
                          isSelected
                            ? 'bg-walnut text-white font-medium'
                            : 'border border-beige text-ink/80 hover:border-walnut hover:text-walnut'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {!selectedProduct && (
              <p className="text-xs text-walnut mt-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-walnut animate-pulse shrink-0"></span>
                Please choose a shawl above to complete your gift box.
              </p>
            )}
          </section>

          {/* STEP 2: SIGNATURE GIFT PACKAGING */}
          <section className="bg-white border border-beige/70 p-4 sm:p-6 md:p-8 shadow-sm">
            <div className="mb-6 pb-4 border-b border-beige/60">
              <span className="text-[11px] font-mono tracking-widest text-walnut uppercase block">Step 02</span>
              <h2 className="text-xl sm:text-2xl font-serif text-ink">Signature Gift Packaging</h2>
              <p className="text-xs text-ink/70 mt-1">Present your shawl beautifully with a quality gift box and personalized handwritten card.</p>
            </div>

            {/* SINGLE ELEGANT PACKAGING CARD */}
            <div className="border border-walnut/40 bg-[#FAF7F2] p-4 sm:p-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 max-w-lg">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-walnut text-white text-[10px] font-mono uppercase tracking-widest px-2 py-0.5">
                      Fixed Add-on
                    </span>
                    <span className="text-[10px] text-ink/60 uppercase tracking-wider font-sans">
                      Gift Packaging
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl text-ink">
                    Signature Gift Packaging, Satin Ribbon &amp; Handwritten Card — PKR 390
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-ink/75 leading-relaxed pt-1">
                    Your shawl will be carefully folded and placed in a clean, presentable gift box, finished with thoughtful packaging and your personalized handwritten message.
                  </p>

                  <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-ink/70">
                    <div className="flex items-center gap-1.5">
                      <span className="text-walnut font-bold">✓</span>
                      <span>Presentable Gift Box</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-walnut font-bold">✓</span>
                      <span>Protective Shawl Packaging</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-walnut font-bold">✓</span>
                      <span>Personalized Handwritten Gift Card</span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 bg-white/80 border border-beige px-3 py-2 rounded-sm self-start">
                  <span className="block text-[11px] uppercase tracking-wider text-ink/60 font-sans">Packaging</span>
                  <span className="font-serif text-lg sm:text-xl text-walnut font-semibold">PKR 390</span>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 3: PERSONALIZE YOUR GIFT CARD */}
          <section className="bg-white border border-beige/70 p-4 sm:p-6 md:p-8 shadow-sm">
            <div className="mb-6 pb-4 border-b border-beige/60">
              <span className="text-[11px] font-mono tracking-widest text-walnut uppercase block">Step 03</span>
              <h2 className="text-xl sm:text-2xl font-serif text-ink">Personalize Your Gift Card</h2>
              <p className="text-xs text-ink/70 mt-1">
                Add a personal message and we'll handwrite it on your gift card.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1.5">
                    Recipient Name (“To”) *
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    className="field w-full"
                    placeholder="e.g. Ayesha Khan"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1.5">
                    Sender Name (“From”)
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    className="field w-full"
                    placeholder="e.g. Farhan Ali"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                  />
                </div>
              </div>

              {/* OCCASION SELECTION CHIPS */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1.5">
                  Select Occasion (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {OCCASIONS.map(occ => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setOccasion(occasion === occ ? '' : occ)}
                      className={`text-xs px-2.5 sm:px-3 py-1.5 border transition-colors ${
                        occasion === occ
                          ? 'bg-walnut text-white border-walnut'
                          : 'bg-ivory text-ink/80 border-beige hover:border-walnut/40'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* GIFT CARD MESSAGE */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-ink/70">
                    Custom Gift Message *
                  </label>
                  <span className="text-[11px] text-ink/40">{customMessage.length}/500 characters</span>
                </div>
                <textarea
                  className="field w-full"
                  rows={4}
                  maxLength={500}
                  placeholder="Write your personal message here. It will be handwritten on the card exactly as entered..."
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                />
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: STICKY GIFT SUMMARY CARD */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="bg-white border border-beige/80 p-4 sm:p-6 md:p-8 shadow-sm space-y-5 sm:space-y-6">
            
            <div className="pb-4 border-b border-beige/60">
              <span className="eyebrow block mb-1">Your Gift Order</span>
              <h2 className="text-xl sm:text-2xl font-serif text-ink">Gift Summary</h2>
            </div>

            {/* SELECTED ITEM DISPLAY */}
            {selectedProduct ? (
              <div className="flex gap-3 sm:gap-4 items-center p-3 bg-ivory border border-beige/60">
                <div className="w-14 h-18 sm:w-16 sm:h-20 bg-white shrink-0 overflow-hidden border border-beige">
                  <Media p={selectedProduct} />
                </div>
                <div className="flex-1 min-w-0 text-sm">
                  <p className="font-serif text-sm sm:text-base text-ink truncate">{selectedProduct.name}</p>
                  <p className="text-[11px] sm:text-xs text-ink/50 uppercase tracking-widest">{selectedProduct.sku}</p>
                  <p className="text-xs sm:text-sm font-semibold text-walnut mt-1">{pkr(selectedProduct.price)}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 px-4 bg-ivory/60 border border-dashed border-beige text-center text-xs sm:text-sm text-ink/60 font-serif">
                Select a shawl from Step 1 to preview your gift box.
              </div>
            )}

            {/* PRICING LINE ITEMS */}
            <div className="space-y-2 text-xs text-ink/75 pt-1">
              <div className="flex justify-between items-center">
                <span>Selected Shawl</span>
                <span className="font-medium text-ink">{selectedProduct ? pkr(productPrice) : '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Signature Gift Packaging</span>
                <span className="font-medium text-ink">{pkr(PACKAGING_PRICE)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Personalized Handwritten Gift Card</span>
                <span className="text-walnut font-medium">Included</span>
              </div>
            </div>

            {/* LIVE GIFT CARD PREVIEW */}
            <div className="bg-[#FAF7F2] border border-beige p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-beige/60 pb-2">
                <span className="text-[10px] uppercase tracking-widest text-walnut font-mono">Live Card Preview</span>
                <span className="text-[10px] text-ink/40 uppercase tracking-widest font-serif">Swat Threads</span>
              </div>

              <div className="space-y-2.5 sm:space-y-3 font-serif text-ink">
                <p className="text-[11px] sm:text-xs uppercase tracking-widest text-walnut font-sans">
                  {occasion ? `• ${occasion} •` : '• With Warmth •'}
                </p>
                <p className="text-sm sm:text-base text-ink font-light italic">
                  Dearest {recipientName.trim() || 'Recipient'},
                </p>
                <p className="text-xs text-ink/80 font-light leading-relaxed min-h-[48px] italic whitespace-pre-line">
                  {customMessage.trim()
                    ? `“${customMessage.trim()}”`
                    : '“Your personal message will be handwritten on your gift card...”'}
                </p>
                <div className="pt-2 border-t border-beige/60 flex justify-between items-end">
                  <span className="text-[10px] sm:text-[11px] text-ink/50 font-sans tracking-wide">
                    Swat Valley, PK
                  </span>
                  <span className="font-serif italic text-xs text-ink">
                    — {senderName.trim() || 'Your Name'}
                  </span>
                </div>
              </div>
            </div>

            {/* TOTAL */}
            <div className="pt-3 sm:pt-4 border-t border-beige/60 flex justify-between items-baseline">
              <span className="font-serif text-base sm:text-lg text-ink">Total</span>
              <span className="font-serif text-2xl sm:text-3xl text-ink font-semibold">{pkr(totalPrice)}</span>
            </div>

            {/* CALL TO ACTION BUTTON */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={!selectedProduct}
                onClick={() => handleCheckout('/checkout')}
                className="btn-primary w-full py-3.5 sm:py-4 px-6 text-center text-xs tracking-[0.2em] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Add Gift to Cart &amp; Checkout</span>
                <span>→</span>
              </button>

              <button
                type="button"
                disabled={!selectedProduct}
                onClick={() => handleCheckout('/cart')}
                className="w-full text-center text-xs text-ink/60 hover:text-walnut underline transition-colors py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                or add to cart &amp; view cart →
              </button>
            </div>

            {/* LUXURY TRUST NOTES */}
            <div className="pt-3 sm:pt-4 border-t border-beige/60 text-[11px] text-ink/60 space-y-1.5 sm:space-y-2">
              <p className="flex items-center gap-2">
                <Icon n="truck" className="w-3.5 h-3.5 text-walnut shrink-0" />
                <span>Trackable courier delivery across Pakistan</span>
              </p>
              <p className="flex items-center gap-2">
                <Icon n="box" className="w-3.5 h-3.5 text-walnut shrink-0" />
                <span>Double-protected outer parcel for zero damage</span>
              </p>
              <p className="flex items-center gap-2">
                <Icon n="cash" className="w-3.5 h-3.5 text-walnut shrink-0" />
                <span>Cash on Delivery &amp; online payment accepted</span>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
