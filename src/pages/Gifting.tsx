import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { pkr } from '../lib/format'
import { site } from '../config/site'
import { Icon, Media } from '../components/ui'
import type { GiftDetails } from '../types'

const OCCASIONS = [
  'Eid Mubarak',
  'Wedding / Shadi',
  'Birthday',
  'Anniversary',
  'Thank You',
  'Thinking of You',
  'Corporate Gift',
  'Other',
]

const PACKAGING_OPTIONS = [
  {
    id: 'wooden-box',
    name: 'Heirloom Pine Wooden Box',
    badge: 'Artisan Favorite',
    price: site.giftBoxPrice || 500,
    desc: 'Handcrafted Swat cedar/pine keepsake box with a brass latch, unbleached muslin cloth lining & artisan wax seal.',
  },
  {
    id: 'velvet-wrap',
    name: 'Royal Heritage Velvet Wrap',
    badge: 'Luxury Edition',
    price: 850,
    desc: 'Rich forest-emerald velvet wrap adorned with golden foil debossing and tied with raw mulberry silk ribbon.',
  },
  {
    id: 'botanical-wrap',
    name: 'Minimalist Botanical Wrap',
    badge: 'Organic & Pure',
    price: 350,
    desc: 'Textured handmade mountain paper wrapped with a dried Swat alpine wildflower sprig and natural jute cord.',
  },
]

export default function Gifting() {
  const { products, inStock, addProduct, loading } = useStore()
  const navigate = useNavigate()

  // State
  const [selectedId, setSelectedId] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'gifting' | 'men' | 'women'>('all')
  const [packagingId, setPackagingId] = useState<string>('wooden-box')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [occasion, setOccasion] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [packingNotes, setPackingNotes] = useState('')

  // Filter in-stock shawls
  const availableShawls = useMemo(() => {
    return products.filter(p => inStock(p))
  }, [products, inStock])

  // Check if there are any products tagged with 'gifting'
  const hasGiftingCategory = useMemo(() => {
    return availableShawls.some(p => p.category === 'gifting')
  }, [availableShawls])

  // Filtered by selected tab
  const displayedShawls = useMemo(() => {
    if (categoryFilter === 'all') return availableShawls
    if (categoryFilter === 'gifting') return availableShawls.filter(p => p.category === 'gifting')
    if (categoryFilter === 'men') return availableShawls.filter(p => p.category === 'men')
    if (categoryFilter === 'women') return availableShawls.filter(p => p.category === 'women')
    return availableShawls
  }, [availableShawls, categoryFilter])

  // Active selections
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedId) || null
  }, [products, selectedId])

  const selectedPackaging = useMemo(() => {
    return PACKAGING_OPTIONS.find(pkg => pkg.id === packagingId) || PACKAGING_OPTIONS[0]
  }, [packagingId])

  // Price calculations
  const productPrice = selectedProduct?.price ?? 0
  const packagingPrice = selectedPackaging.price
  const totalPrice = productPrice + packagingPrice

  // Handle Cart & Checkout
  const handleProceed = (destination: '/checkout' | '/cart') => {
    if (!selectedProduct) return

    const giftDetails: GiftDetails = {
      recipientName: recipientName.trim(),
      senderName: senderName.trim(),
      message: customMessage.trim(),
      packaging: selectedPackaging.name,
      packagingPrice: selectedPackaging.price,
      occasion: occasion.trim(),
    }

    const packingSummary = [
      `Packaging: ${selectedPackaging.name}`,
      recipientName && `To: ${recipientName.trim()}`,
      senderName && `From: ${senderName.trim()}`,
      occasion && `Occasion: ${occasion.trim()}`,
      packingNotes && `Note: ${packingNotes.trim()}`,
    ]
      .filter(Boolean)
      .join(' | ')

    addProduct(selectedProduct, true, customMessage.trim(), packingSummary, giftDetails)
    navigate(destination)
  }

  return (
    <div className="container-x py-12 max-w-6xl">
      {/* HEADER HERO */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="eyebrow !text-brass">Heirloom Gifting · Swat Valley</p>
        <h1 className="text-4xl md:text-5xl font-light text-ink my-3">Curate an Heirloom Gift</h1>
        <p className="text-ink/75 text-base leading-relaxed">
          Select an authentic handwoven shawl, choose bespoke artisan packaging, and compose a personalized handwritten card to be delivered anywhere in Pakistan.
        </p>

        {/* STEP PROGRESS PILLS */}
        <div className="flex items-center justify-center gap-2 mt-8 text-xs uppercase tracking-wider text-ink/60 overflow-x-auto pb-2">
          <span className={`px-3 py-1.5 border ${selectedProduct ? 'bg-brass text-coal border-brass font-medium' : 'border-ink/20 text-ink'}`}>
            1. Select Shawl {selectedProduct ? '✓' : ''}
          </span>
          <span className="text-ink/30">→</span>
          <span className="px-3 py-1.5 border border-ink/20 text-ink bg-beige/60">
            2. Choose Packaging
          </span>
          <span className="text-ink/30">→</span>
          <span className="px-3 py-1.5 border border-ink/20 text-ink bg-beige/60">
            3. Card &amp; Message
          </span>
          <span className="text-ink/30">→</span>
          <span className="px-3 py-1.5 border border-ink/20 text-ink bg-beige/60">
            4. Checkout
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* MAIN CONFIGURATION COLUMN (2 COLUMNS ON LARGE) */}
        <div className="lg:col-span-2 space-y-12">

          {/* STEP 1: SELECT A SHAWL */}
          <section className="bg-white border border-beige p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-beige">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-brass block">Step 01</span>
                <h2 className="text-2xl font-serif text-ink">Choose a Handwoven Shawl</h2>
              </div>

              {/* CATEGORY TABS */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 transition-colors border ${categoryFilter === 'all' ? 'bg-coal text-white border-coal' : 'bg-beige/50 text-ink border-beige hover:border-ink/30'}`}
                >
                  All ({availableShawls.length})
                </button>
                {hasGiftingCategory && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('gifting')}
                    className={`px-3 py-1.5 transition-colors border ${categoryFilter === 'gifting' ? 'bg-coal text-white border-coal' : 'bg-beige/50 text-ink border-beige hover:border-ink/30'}`}
                  >
                    Gifting Special
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCategoryFilter('men')}
                  className={`px-3 py-1.5 transition-colors border ${categoryFilter === 'men' ? 'bg-coal text-white border-coal' : 'bg-beige/50 text-ink border-beige hover:border-ink/30'}`}
                >
                  Men’s
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('women')}
                  className={`px-3 py-1.5 transition-colors border ${categoryFilter === 'women' ? 'bg-coal text-white border-coal' : 'bg-beige/50 text-ink border-beige hover:border-ink/30'}`}
                >
                  Women’s
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-ink/60 font-serif">
                <p>Loading available Swat shawls…</p>
              </div>
            ) : displayedShawls.length === 0 ? (
              <div className="py-12 text-center text-ink/60 font-serif">
                <p>No shawls available in this category currently.</p>
                <button
                  onClick={() => setCategoryFilter('all')}
                  className="mt-3 text-xs underline text-brass"
                >
                  View all available pieces
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-1 pr-2">
                {displayedShawls.map((shawl) => {
                  const isSelected = selectedId === shawl.id
                  return (
                    <div
                      key={shawl.id}
                      onClick={() => setSelectedId(shawl.id)}
                      className={`group cursor-pointer border p-3 flex flex-col justify-between transition-all duration-200 relative ${
                        isSelected
                          ? 'border-brass ring-2 ring-brass/60 bg-brass/5 shadow-md'
                          : 'border-beige hover:border-brass/40 bg-white hover:bg-beige/20'
                      }`}
                    >
                      {/* SELECTED BADGE */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10 bg-brass text-coal text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-sm">
                          <span>✓</span> Selected
                        </div>
                      )}

                      <div className="aspect-[4/5] bg-beige relative overflow-hidden mb-3">
                        <Media p={shawl} />
                        {shawl.badge && !isSelected && (
                          <span className="absolute top-2 left-2 bg-coal/80 text-white text-[9px] uppercase tracking-widest px-1.5 py-0.5">
                            {shawl.badge}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-ink/60">
                          {shawl.category} · {shawl.sku}
                        </p>
                        <h4 className="font-serif text-sm text-ink group-hover:text-brass transition-colors line-clamp-1">
                          {shawl.name}
                        </h4>
                        <p className="text-xs font-semibold text-ink mt-1">
                          {pkr(shawl.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        className={`w-full text-xs py-1.5 mt-3 transition-colors uppercase tracking-wider font-sans ${
                          isSelected
                            ? 'bg-brass text-coal font-medium'
                            : 'border border-ink/20 text-ink hover:border-brass hover:text-brass'
                        }`}
                      >
                        {isSelected ? 'Selected Piece' : 'Select'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {!selectedProduct && (
              <p className="text-xs text-brass mt-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brass animate-ping"></span>
                Please click on a shawl above to personalize your gift.
              </p>
            )}
          </section>

          {/* STEP 2: GIFT PACKAGING OPTIONS */}
          <section className="bg-white border border-beige p-6 md:p-8 shadow-sm">
            <div className="mb-6 pb-4 border-b border-beige">
              <span className="text-[11px] font-mono uppercase tracking-widest text-brass block">Step 02</span>
              <h2 className="text-2xl font-serif text-ink">Select Gift Packaging</h2>
              <p className="text-xs text-ink/70 mt-1">Every box or wrap is carefully prepared by hand before dispatch.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {PACKAGING_OPTIONS.map((pkg) => {
                const isSelected = packagingId === pkg.id
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setPackagingId(pkg.id)}
                    className={`cursor-pointer p-4 border flex flex-col justify-between transition-all duration-200 relative ${
                      isSelected
                        ? 'border-brass ring-2 ring-brass/60 bg-brass/5 shadow-sm'
                        : 'border-beige hover:border-brass/30 bg-white hover:bg-beige/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] uppercase tracking-widest bg-beige px-2 py-0.5 text-ink/70">
                          {pkg.badge}
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-brass bg-brass text-coal text-[10px]' : 'border-ink/30'}`}>
                          {isSelected && '✓'}
                        </div>
                      </div>
                      <h3 className="font-serif text-base text-ink mb-1">{pkg.name}</h3>
                      <p className="text-xs text-ink/70 leading-relaxed mb-3">{pkg.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-beige/60 flex items-center justify-between">
                      <span className="text-xs text-ink/60">Packaging add-on:</span>
                      <span className="text-sm font-semibold text-ink">+{pkr(pkg.price)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* STEP 3: RECIPIENT, SENDER & CARD MESSAGE */}
          <section className="bg-white border border-beige p-6 md:p-8 shadow-sm">
            <div className="mb-6 pb-4 border-b border-beige">
              <span className="text-[11px] font-mono uppercase tracking-widest text-brass block">Step 03</span>
              <h2 className="text-2xl font-serif text-ink">Personalize Your Gift Card</h2>
              <p className="text-xs text-ink/70 mt-1">
                Your message is calligraphed or hand-printed on heavy textured cotton cardstock and enclosed in an artisan wax-sealed envelope.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1.5">
                    Recipient Name (Who is this for?) *
                  </label>
                  <input
                    type="text"
                    className="field w-full"
                    placeholder="e.g. Ayesha Khan / Uncle Jamil"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1.5">
                    Sender Name (From whom?)
                  </label>
                  <input
                    type="text"
                    className="field w-full"
                    placeholder="e.g. Farhan / With love, The Alis"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                  />
                </div>
              </div>

              {/* OCCASION SELECTION */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1.5">
                  Select Occasion (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {OCCASIONS.map(occ => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setOccasion(occasion === occ ? '' : occ)}
                      className={`text-xs px-2.5 py-1 border transition-colors ${
                        occasion === occ
                          ? 'bg-brass text-coal border-brass font-medium'
                          : 'bg-beige/40 text-ink/80 border-beige hover:border-ink/30'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* MESSAGE TEXTAREA */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-ink/70">
                    Custom Gift Card Message *
                  </label>
                  <span className="text-[11px] text-ink/50">{customMessage.length} characters</span>
                </div>
                <textarea
                  className="field w-full"
                  rows={4}
                  placeholder="Write your heartfelt note here. It will be inscribed inside the gift box exactly as entered..."
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                />
              </div>

              {/* SPECIAL PACKING INSTRUCTIONS */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1.5">
                  Special Packing or Delivery Notes (Optional)
                </label>
                <textarea
                  className="field w-full"
                  rows={2}
                  placeholder="e.g. Please do not include pricing invoice in the box; wrap in double protection for overseas hand-carry..."
                  value={packingNotes}
                  onChange={e => setPackingNotes(e.target.value)}
                />
              </div>
            </div>
          </section>

        </div>

        {/* SIDEBAR: LIVE GIFT CARD PREVIEW & ORDER SUMMARY */}
        <div className="space-y-6">
          {/* LIVE GIFT CARD PREVIEW */}
          <div className="bg-[#FAF7F2] border border-brass/40 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brass/10 -rotate-45 translate-x-10 -translate-y-10" />
            <div className="flex items-center justify-between mb-4 border-b border-brass/20 pb-3">
              <span className="text-[10px] uppercase tracking-widest text-brass font-mono">Live Card Preview</span>
              <span className="text-[10px] text-ink/50 uppercase tracking-widest font-serif">Swat Threads</span>
            </div>

            <div className="space-y-4 font-serif text-ink">
              <p className="text-xs uppercase tracking-widest text-brass font-sans">
                {occasion ? `• ${occasion} •` : '• With Warmth •'}
              </p>
              <p className="text-lg text-ink font-light italic">
                Dearest {recipientName.trim() || 'Recipient'},
              </p>
              <p className="text-sm text-ink/80 font-light leading-relaxed min-h-[70px] italic whitespace-pre-line">
                {customMessage.trim() ? `“${customMessage.trim()}”` : '“Your custom gift message will appear here, handwritten on our archival cardstock...”'}
              </p>
              <div className="pt-3 border-t border-brass/20 flex justify-between items-end">
                <span className="text-xs text-ink/60 font-sans tracking-wide">
                  Swat Valley, Pakistan
                </span>
                <span className="font-serif italic text-sm text-ink">
                  — {senderName.trim() || 'Your Name'}
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC INVESTMENT SUMMARY */}
          <div className="bg-beige border border-brass/30 p-6 space-y-4">
            <h3 className="font-serif text-xl text-ink pb-2 border-b border-brass/20">
              Gift Summary
            </h3>

            {/* SELECTED ITEM */}
            {selectedProduct ? (
              <div className="flex gap-3 items-center py-2 border-b border-beige">
                <div className="w-14 h-16 bg-white shrink-0 overflow-hidden border border-beige">
                  <Media p={selectedProduct} />
                </div>
                <div className="flex-1 min-w-0 text-sm">
                  <p className="font-serif text-ink truncate">{selectedProduct.name}</p>
                  <p className="text-xs text-ink/60">1 of 1 · {selectedProduct.sku}</p>
                  <p className="text-sm font-medium text-ink">{pkr(selectedProduct.price)}</p>
                </div>
              </div>
            ) : (
              <div className="py-3 text-sm text-ink/60 border-b border-beige italic">
                No shawl selected yet. Pick one from Step 1.
              </div>
            )}

            {/* BREAKDOWN */}
            <div className="space-y-2 text-sm text-ink/80">
              <div className="flex justify-between">
                <span>Handwoven Shawl</span>
                <span>{pkr(productPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>{selectedPackaging.name}</span>
                <span>+{pkr(packagingPrice)}</span>
              </div>
              <div className="flex justify-between text-xs text-ink/60">
                <span>Handwritten Card &amp; Seal</span>
                <span className="text-brass uppercase font-sans font-medium">Included</span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="pt-3 border-t border-brass/30 flex justify-between items-baseline">
              <span className="font-serif text-lg text-ink">Total Investment</span>
              <span className="font-serif text-2xl text-ink font-semibold">{pkr(totalPrice)}</span>
            </div>

            {/* CTA BUTTONS */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={!selectedProduct}
                onClick={() => handleProceed('/checkout')}
                className="btn-primary w-full py-3.5 text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <span>→</span>
              </button>

              <button
                type="button"
                disabled={!selectedProduct}
                onClick={() => handleProceed('/cart')}
                className="btn-outline w-full py-2.5 text-center text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Gift to Cart &amp; View Cart
              </button>
            </div>

            {/* TRUST BADGE */}
            <div className="pt-4 border-t border-brass/20 text-[11px] text-ink/60 space-y-1.5">
              <p className="flex items-center gap-2">
                <Icon n="truck" className="w-4 h-4 text-brass shrink-0" />
                <span>Nationwide trackable delivery via courier</span>
              </p>
              <p className="flex items-center gap-2">
                <Icon n="box" className="w-4 h-4 text-brass shrink-0" />
                <span>Damage-proof double protective outer packaging</span>
              </p>
              <p className="flex items-center gap-2">
                <Icon n="cash" className="w-4 h-4 text-brass shrink-0" />
                <span>Card, JazzCash &amp; COD payment options at checkout</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
