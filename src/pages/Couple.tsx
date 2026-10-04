import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { bundleDiscount } from '../lib/pricing'
import { pkr } from '../lib/format'
import { Icon, Media } from '../components/ui'

// Complimentary gifts total value (displayed only for messaging)
const FREE_GIFTS_VALUE = 1800

export default function Couple() {
  const { products, inStock, inCart, addBundle, addProduct, loading } = useStore()
  const navigate = useNavigate()
  const [added, setAdded] = useState<string>('')

  // Separate pools
  const menShawls = useMemo(() => products.filter(p => p.category === 'men' && inStock(p)), [products, inStock])
  const womenShawls = useMemo(() => products.filter(p => p.category === 'women' && inStock(p)), [products, inStock])
  const bundleProducts = useMemo(() => products.filter(p => p.category === 'couple-bundle' && inStock(p)), [products, inStock])

  // Build pairing display:
  // If WooCommerce has 'couple-bundle' products, show those as standalone cards.
  // Otherwise fall back to auto-pairing men + women shawls.
  const hasDedicatedBundles = bundleProducts.length > 0

  // Auto-paired bundles: zip men & women together
  const pairedBundles = useMemo(() => {
    const pairs: Array<{ id: string; men: typeof menShawls[0]; women: typeof womenShawls[0]; discount: number; total: number }> = []
    const mLen = menShawls.length, wLen = womenShawls.length
    const count = Math.min(mLen, wLen, 6) // show up to 6 pairs
    for (let i = 0; i < count; i++) {
      const m = menShawls[i], w = womenShawls[i]
      const disc = bundleDiscount([m.price], [w.price])
      pairs.push({ id: `${m.id}-${w.id}`, men: m, women: w, discount: disc, total: m.price + w.price - disc })
    }
    return pairs
  }, [menShawls, womenShawls])

  // Handle adding a dedicated bundle product
  const handleAddBundleProduct = (p: typeof bundleProducts[0]) => {
    addProduct(p, false, '', 'Couple Bundle — includes Swati Cap & Pakol (Free)')
    setAdded(p.id)
    setTimeout(() => navigate('/cart'), 800)
  }

  // Handle adding an auto-paired bundle
  const handleAddPair = (men: typeof menShawls[0], women: typeof womenShawls[0]) => {
    const pairId = `${men.id}-${women.id}`
    addBundle(men, women, 'Couple Bundle — includes Swati Cap & Pakol (Free)')
    setAdded(pairId)
    setTimeout(() => navigate('/cart'), 800)
  }

  const isPairInCart = (men: typeof menShawls[0], women: typeof womenShawls[0]) =>
    inCart(men.id) || inCart(women.id)

  return (
    <div className="container-x py-8 sm:py-12">

      {/* ─── LUXURY HERO BANNER ─── */}
      <div className="bg-coal text-white relative overflow-hidden mb-8 sm:mb-14 p-5 sm:p-8 md:p-12">
        {/* Decorative grain overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #B08D57 0 1px, transparent 1px 14px)' }} />

        <div className="relative max-w-3xl">
          {/* BANNER LABEL */}
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <span className="h-px w-6 sm:w-8 bg-brass" />
            <span className="text-brass text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] sm:tracking-[0.3em]">
              His &amp; Hers Heirloom Set
            </span>
            <span className="h-px w-6 sm:w-8 bg-brass" />
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-light leading-tight mb-3 sm:mb-4">
            Curated Pairs of<br className="hidden sm:block" /> Men's &amp; Women's Shawls
          </h1>

          <p className="text-white/75 text-xs sm:text-base leading-relaxed max-w-2xl mb-5 sm:mb-6">
            Every couple bundle includes a <span className="text-brass font-medium">Complimentary Traditional Swati Cap (for Her)</span> &amp; <span className="text-brass font-medium">Handmade Pakol (for Him)</span> — a combined <span className="text-brass font-medium">{pkr(FREE_GIFTS_VALUE)} value, yours absolutely free.</span>
          </p>

          {/* KEY OFFERS ROW */}
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 border border-white/20 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs">
              <span className="text-brass text-sm sm:text-base">✓</span>
              <span>10% Couple Bundle Discount</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 border border-white/20 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs">
              <span className="text-brass text-sm sm:text-base">✓</span>
              <span>Free Swati Cap &amp; Handmade Pakol</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 border border-white/20 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs">
              <span className="text-brass text-sm sm:text-base">✓</span>
              <span>Each piece is one-of-one artisan crafted</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION HEADING ─── */}
      <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-beige pb-4 sm:pb-6">
        <div>
          <p className="eyebrow mb-1">
            {hasDedicatedBundles ? 'Curated Bundle Collection' : 'Available Paired Sets'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif text-ink">
            {hasDedicatedBundles ? 'Select Your Bundle' : 'Men\'s & Women\'s Pairs'}
          </h2>
          <p className="text-ink/70 text-xs sm:text-sm mt-1">
            {loading
              ? 'Loading collection…'
              : hasDedicatedBundles
                ? `${bundleProducts.length} curated bundle${bundleProducts.length !== 1 ? 's' : ''} available`
                : pairedBundles.length > 0
                  ? `${pairedBundles.length} pair${pairedBundles.length !== 1 ? 's' : ''} available — each includes free complimentary gifts`
                  : 'No bundles available right now — check back soon.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink/60 bg-beige/50 border border-beige px-3 py-2 self-start sm:self-auto">
          <Icon n="leaf" className="w-4 h-4 text-walnut shrink-0" />
          <span>Free gifts: Swati Cap + Pakol included in every bundle</span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-ink/60 font-serif text-lg">
          Loading available collections…
        </div>
      ) : hasDedicatedBundles ? (
        /* ─── DEDICATED COUPLE-BUNDLE PRODUCT GRID ─── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

          {bundleProducts.map(p => {
            const bundleDisc = p.originalPrice && p.originalPrice > p.price ? p.originalPrice - p.price : 0
            const isAdded = added === p.id
            const alreadyInCart = inCart(p.id)

            return (
              <div
                key={p.id}
                className="group bg-white border border-beige/70 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* IMAGE */}
                <div className="relative aspect-[4/5] bg-ivory overflow-hidden">
                  <Media p={p} />

                  {/* GIFT BADGE */}
                  <div className="absolute top-0 left-0 right-0 bg-walnut/95 text-white text-[10px] font-mono uppercase tracking-widest text-center py-1.5 flex items-center justify-center gap-1.5">
                    <span className="text-brass">✓</span>
                    <span>Free Swati Cap &amp; Pakol Included</span>
                  </div>

                  {/* ORIGINAL PRICE BADGE */}
                  {bundleDisc > 0 && (
                    <div className="absolute bottom-3 right-3 bg-brass text-coal text-[10px] font-bold uppercase tracking-wide px-2 py-1">
                      Save {pkr(bundleDisc)}
                    </div>
                  )}
                </div>

                {/* CARD BODY */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-ink/50 mb-1">{p.sku} · Couple Bundle</p>
                    <h3 className="font-serif text-xl text-ink group-hover:text-walnut transition-colors mb-1">
                      {p.name}
                    </h3>

                    {/* PRICE ROW */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-serif text-2xl text-walnut font-semibold">{pkr(p.price)}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-sm text-ink/50 line-through">{pkr(p.originalPrice)}</span>
                      )}
                    </div>

                    {/* INCLUSIONS LIST */}
                    <div className="space-y-1.5 text-xs text-ink/75 mb-5">
                      <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-2">What's Included:</p>
                      <div className="flex items-center gap-2">
                        <span className="text-walnut font-bold">✓</span>
                        <span>1× Men's Handwoven Shawl</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-walnut font-bold">✓</span>
                        <span>1× Women's Handwoven Shawl</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-brass font-bold">✓</span>
                        <span className="text-brass font-medium">1× Traditional Swati Cap (Her) — Free</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-brass font-bold">✓</span>
                        <span className="text-brass font-medium">1× Handmade Pakol (Him) — Free</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    disabled={alreadyInCart || isAdded}
                    onClick={() => handleAddBundleProduct(p)}
                    className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isAdded
                      ? '✓ Added — Redirecting…'
                      : alreadyInCart
                        ? 'Already in Cart'
                        : 'Add Couple Bundle to Cart'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : pairedBundles.length > 0 ? (
        /* ─── AUTO-PAIRED BUNDLE GRID (MEN + WOMEN PAIRS) ─── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {pairedBundles.map(({ id, men, women, discount, total }) => {
            const subtotal = men.price + women.price
            const isAdded = added === id
            const alreadyInCart = isPairInCart(men, women)

            return (
              <div
                key={id}
                className="group bg-white border border-beige/70 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* SPLIT IMAGE: MEN | WOMEN */}
                <div className="relative grid grid-cols-2 aspect-[4/3] bg-ivory overflow-hidden">
                  <div className="relative overflow-hidden">
                    <Media p={men} />
                    <div className="absolute bottom-0 left-0 right-0 bg-coal/75 text-white text-[9px] uppercase tracking-widest text-center py-1 font-mono">
                      His
                    </div>
                  </div>
                  <div className="relative overflow-hidden border-l border-white/30">
                    <Media p={women} />
                    <div className="absolute bottom-0 left-0 right-0 bg-brass/80 text-coal text-[9px] uppercase tracking-widest text-center py-1 font-mono">
                      Hers
                    </div>
                  </div>

                  {/* GIFT BADGE — spans both columns */}
                  <div className="absolute top-0 left-0 right-0 bg-walnut/95 text-white text-[10px] font-mono uppercase tracking-widest text-center py-1.5 flex items-center justify-center gap-1.5 col-span-2">
                    <span className="text-brass">✓</span>
                    <span>Free Swati Cap &amp; Pakol Included</span>
                  </div>

                  {/* DISCOUNT PILL */}
                  <div className="absolute bottom-8 right-2 bg-brass text-coal text-[10px] font-bold uppercase tracking-wide px-2 py-1">
                    Save {pkr(discount)}
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    {/* TITLES */}
                    <p className="text-[10px] uppercase tracking-widest text-ink/50 mb-0.5">His &amp; Hers Pair · Couple Bundle</p>
                    <h3 className="font-serif text-lg text-ink group-hover:text-walnut transition-colors leading-snug mb-3">
                      <span className="block">{men.name}</span>
                      <span className="block text-ink/70">+ {women.name}</span>
                    </h3>

                    {/* PRICE ROW */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-serif text-2xl text-walnut font-semibold">{pkr(total)}</span>
                      <span className="text-sm text-ink/50 line-through">{pkr(subtotal)}</span>
                      <span className="text-xs text-brass font-medium font-sans">10% off</span>
                    </div>

                    {/* INCLUSIONS */}
                    <div className="space-y-1.5 text-xs text-ink/75 mb-5">
                      <p className="text-[10px] uppercase tracking-wider text-ink/50 font-mono mb-2">What's Included:</p>
                      <div className="flex items-center gap-2">
                        <span className="text-walnut font-bold">✓</span>
                        <span>1× Men's Shawl <span className="text-ink/50">({men.name})</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-walnut font-bold">✓</span>
                        <span>1× Women's Shawl <span className="text-ink/50">({women.name})</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-brass font-bold">✓</span>
                        <span className="text-brass font-medium">1× Traditional Swati Cap (Her) — Free</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-brass font-bold">✓</span>
                        <span className="text-brass font-medium">1× Handmade Pakol (Him) — Free</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    disabled={alreadyInCart || isAdded}
                    onClick={() => handleAddPair(men, women)}
                    className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isAdded
                      ? '✓ Added — Redirecting…'
                      : alreadyInCart
                        ? 'Already in Cart'
                        : 'Add Couple Bundle to Cart'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="py-24 text-center border border-dashed border-beige bg-ivory/40">
          <p className="font-serif text-2xl text-ink mb-2">No Bundles Available Right Now</p>
          <p className="text-ink/60 text-sm mb-6">All our shawls may be sold. New pieces are added regularly.</p>
          <a href="/shop" className="btn-outline">Browse All Shawls</a>
        </div>
      )}

      {/* ─── BOTTOM ASSURANCE STRIP ─── */}
      {!loading && (hasDedicatedBundles || pairedBundles.length > 0) && (
        <div className="mt-16 bg-beige border border-beige/80 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-beige/70 text-center text-xs text-ink/70">
          <div className="p-5 space-y-1">
            <Icon n="leaf" className="w-5 h-5 text-walnut mx-auto mb-2" />
            <p className="font-serif text-sm text-ink">Authentic Swat Artisans</p>
            <p>Every piece is handwoven in Swat Valley, Pakistan</p>
          </div>
          <div className="p-5 space-y-1">
            <Icon n="truck" className="w-5 h-5 text-walnut mx-auto mb-2" />
            <p className="font-serif text-sm text-ink">Nationwide Tracked Delivery</p>
            <p>Delivered safely to your door across Pakistan</p>
          </div>
          <div className="p-5 space-y-1">
            <Icon n="box" className="w-5 h-5 text-walnut mx-auto mb-2" />
            <p className="font-serif text-sm text-ink">Free Complimentary Gifts</p>
            <p>Swati Cap &amp; Pakol ({pkr(FREE_GIFTS_VALUE)} value) in every bundle</p>
          </div>
        </div>
      )}
    </div>
  )
}
