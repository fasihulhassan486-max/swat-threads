import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { matchesCategory } from '../context/StoreContext'
import { site } from '../config/site'
import { pkr } from '../lib/format'
import { Icon, Media } from '../components/ui'
import type { Product } from '../types'

// Complimentary gifts total value (displayed only for messaging)
const FREE_GIFTS_VALUE = 1800

export default function Couple() {
  const { products, loading: ctxLoading, inStock, inCart, addProduct } = useStore()
  const navigate = useNavigate()
  const [added, setAdded] = useState<string>('')

  // ── Derive couple-bundle products from context (already fetched by StoreContext) ──
  const ctxBundles = products.filter(p => matchesCategory(p, 'couple-bundle') && inStock(p))

  // ── Direct API fetch if StoreContext hasn't loaded couple-bundle products yet ──
  const [apiBundles, setApiBundles] = useState<Product[]>([])
  const [apiLoading, setApiLoading] = useState(false)
  const [apiFetched, setApiFetched] = useState(false)

  useEffect(() => {
    // Only fire API fetch if context is done loading and has no couple-bundle products
    if (ctxLoading || ctxBundles.length > 0 || apiFetched) return

    const fetchCoupleBundles = async () => {
      setApiLoading(true)
      setApiFetched(true)
      try {
        const wpUrl = import.meta.env.VITE_WORDPRESS_URL || site.wc.url
        if (!wpUrl) return
        const baseUrl = wpUrl.replace(/\/$/, '')
        const consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY || site.wc.key || ''
        const consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET || site.wc.secret || ''

        // Try Store API first (no auth needed), then v3 fallback
        const storeUrl = `${baseUrl}/wp-json/wc/store/v1/products?category=couple-bundle&per_page=50`
        const v3Url = `${baseUrl}/wp-json/wc/v3/products?category=couple-bundle&per_page=50&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`

        let data: any[] | null = null

        try {
          const res = await fetch(storeUrl)
          if (res.ok) {
            const json = await res.json()
            if (Array.isArray(json) && json.length > 0) data = json
          }
        } catch { /* fall through to v3 */ }

        if (!data && consumerKey) {
          try {
            const res = await fetch(v3Url)
            if (res.ok) {
              const json = await res.json()
              if (Array.isArray(json)) data = json
            }
          } catch { /* ignore */ }
        }

        if (data && data.length > 0) {
          const mapped: Product[] = data.map((item: any) => {
            const div = 10 ** (item.prices?.currency_minor_unit ?? 0)
            const price = item.prices?.price
              ? Number(item.prices.price) / div
              : parseFloat(item.price || item.regular_price || '0') || 0
            const reg = item.prices?.regular_price
              ? Number(item.prices.regular_price) / div
              : parseFloat(item.regular_price || '0') || 0

            const rawImages = Array.isArray(item.images) ? item.images : []
            const images = rawImages
              .map((img: any, idx: number) => ({
                id: img?.id || img?.src || idx,
                src: typeof img === 'string' ? img : img?.src || '',
                alt: typeof img === 'object' ? (img?.alt || img?.name || item.name || 'Bundle Image') : (item.name || 'Bundle Image'),
              }))
              .filter((i: any) => Boolean(i.src))

            return {
              id: String(item.id),
              sku: item.sku || `ST-${item.id}`,
              name: (item.name || '').replace(/<[^>]+>/g, '').trim(),
              price,
              originalPrice: reg > price ? reg : undefined,
              category: 'couple-bundle' as const,
              badge: item.tags?.[0]?.name || undefined,
              featured: Boolean(item.featured),
              description: item.description || item.short_description || '',
              short_description: item.short_description || '',
              tone: '#8a8478',
              stockQuantity: item.is_in_stock !== undefined ? (item.is_in_stock ? 10 : 0) : (item.stock_status === 'outofstock' ? 0 : 1),
              image: images[0]?.src || '',
              images,
            }
          }).filter(p => p.stockQuantity > 0)

          setApiBundles(mapped)
        }
      } catch (err) {
        console.warn('[Couple] Failed to fetch couple-bundle products:', err)
      } finally {
        setApiLoading(false)
      }
    }

    fetchCoupleBundles()
  }, [ctxLoading, ctxBundles.length, apiFetched])

  // Final bundle list: prefer context (already normalized), fall back to direct API fetch
  const bundleProducts = ctxBundles.length > 0 ? ctxBundles : apiBundles
  const isLoading = ctxLoading || apiLoading

  const handleAdd = (p: Product) => {
    addProduct(p, false, '', 'Couple Bundle — includes Swati Cap & Pakol (Free)')
    setAdded(p.id)
    setTimeout(() => navigate('/cart'), 800)
  }

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
            Curated Couple Bundles<br className="hidden sm:block" /> Handcrafted in Swat
          </h1>

          <p className="text-white/75 text-xs sm:text-base leading-relaxed max-w-2xl mb-5 sm:mb-6">
            Every couple bundle includes a <span className="text-brass font-medium">Complimentary Traditional Swati Cap (for Her)</span> &amp; <span className="text-brass font-medium">Handmade Pakol (for Him)</span> — a combined <span className="text-brass font-medium">{pkr(FREE_GIFTS_VALUE)} value, yours absolutely free.</span>
          </p>

          {/* KEY OFFERS ROW */}
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 border border-white/20 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs">
              <span className="text-brass text-sm sm:text-base">✓</span>
              <span>Pre-configured by Our Artisan Team</span>
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
          <p className="eyebrow mb-1">Curated Bundle Collection</p>
          <h2 className="text-2xl sm:text-3xl font-serif text-ink">Select Your Bundle</h2>
          <p className="text-ink/70 text-xs sm:text-sm mt-1">
            {isLoading
              ? 'Loading bundles…'
              : bundleProducts.length > 0
                ? `${bundleProducts.length} bundle${bundleProducts.length !== 1 ? 's' : ''} available`
                : 'No bundles listed yet — check back soon.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink/60 bg-beige/50 border border-beige px-3 py-2 self-start sm:self-auto">
          <Icon n="leaf" className="w-4 h-4 text-walnut shrink-0" />
          <span>Free gifts: Swati Cap + Pakol included in every bundle</span>
        </div>
      </div>

      {/* ─── CONTENT AREA ─── */}
      {isLoading ? (
        <div className="py-24 text-center text-ink/60 font-serif text-lg">
          Loading available bundles…
        </div>

      ) : bundleProducts.length > 0 ? (
        /* ─── WOOCOMMERCE BUNDLE PRODUCT GRID ─── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {bundleProducts.map(p => {
            const savingsAmt = p.originalPrice && p.originalPrice > p.price ? p.originalPrice - p.price : 0
            const isAdded = added === p.id
            const alreadyInCart = inCart(p.id)
            // Use first image from WooCommerce product
            const mainImg = p.images?.[0]
            const imgSrc = typeof mainImg === 'string' ? mainImg : mainImg?.src || ''
            const imgAlt = typeof mainImg === 'object' ? (mainImg?.alt || p.name) : p.name

            return (
              <div
                key={p.id}
                className="group bg-white border border-beige/70 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* ── IMAGE ── */}
                <Link to={`/product/${p.id}`} className="block relative aspect-[4/5] bg-ivory overflow-hidden">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={imgAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Media p={p} />
                  )}

                  {/* FREE GIFT RIBBON */}
                  <div className="absolute top-0 left-0 right-0 bg-walnut/95 text-white text-[10px] font-mono uppercase tracking-widest text-center py-1.5 flex items-center justify-center gap-1.5">
                    <span className="text-brass">✓</span>
                    <span>Free Swati Cap &amp; Pakol Included</span>
                  </div>

                  {/* SAVINGS BADGE */}
                  {savingsAmt > 0 && (
                    <div className="absolute bottom-3 right-3 bg-brass text-coal text-[10px] font-bold uppercase tracking-wide px-2 py-1">
                      Save {pkr(savingsAmt)}
                    </div>
                  )}

                  {/* BUNDLE BADGE */}
                  {p.badge && (
                    <span className="absolute bottom-3 left-3 bg-coal/80 text-brass text-[10px] uppercase tracking-widest px-2 py-1">
                      {p.badge}
                    </span>
                  )}
                </Link>

                {/* ── CARD BODY ── */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-ink/50 mb-1">{p.sku} · Couple Bundle</p>

                    {/* WooCommerce Title */}
                    <Link to={`/product/${p.id}`}>
                      <h3 className="font-serif text-xl text-ink group-hover:text-walnut transition-colors mb-1 leading-snug">
                        {p.name}
                      </h3>
                    </Link>

                    {/* PRICE ROW — from WooCommerce regular/sale price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-serif text-2xl text-walnut font-semibold">{pkr(p.price)}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-sm text-ink/50 line-through">{pkr(p.originalPrice)}</span>
                      )}
                      {savingsAmt > 0 && (
                        <span className="text-xs text-brass font-medium font-sans">
                          {Math.round((savingsAmt / p.originalPrice!) * 100)}% off
                        </span>
                      )}
                    </div>

                    {/* WooCommerce Short Description */}
                    {p.short_description ? (
                      <div
                        className="text-xs text-ink/70 leading-relaxed mb-4 line-clamp-3 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: p.short_description }}
                      />
                    ) : (
                      /* INCLUSIONS LIST as fallback */
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
                    )}
                  </div>

                  {/* ── CTAs ── */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={alreadyInCart || isAdded}
                      onClick={() => handleAdd(p)}
                      className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isAdded
                        ? '✓ Added — Redirecting…'
                        : alreadyInCart
                          ? 'Already in Cart'
                          : 'Add Bundle to Cart'}
                    </button>
                    <Link
                      to={`/product/${p.id}`}
                      className="text-center text-xs text-ink/60 hover:text-walnut underline underline-offset-2 transition-colors py-1"
                    >
                      View full details →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      ) : (
        /* ─── EMPTY STATE — no WooCommerce couple-bundle products yet ─── */
        <div className="py-24 text-center border border-dashed border-beige bg-ivory/40 px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-beige flex items-center justify-center">
            <Icon n="box" className="w-8 h-8 text-walnut" />
          </div>
          <p className="font-serif text-2xl text-ink mb-2">Couple Bundles Coming Soon</p>
          <p className="text-ink/60 text-sm mb-2 max-w-md mx-auto">
            Our artisan team is curating His &amp; Hers sets. To get a bundle ready now, contact us directly and we'll hand-select the perfect pair for you.
          </p>
          <p className="text-ink/40 text-xs mb-8">
            (WooCommerce: assign products to the <code className="bg-beige px-1 py-0.5 rounded-sm">couple-bundle</code> category to display them here.)
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="btn-outline">Browse All Shawls</Link>
            <a
              href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Assalam o Alaikum! I would like a couple bundle — please help me choose a matching His & Hers set.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-6 py-3"
            >
              Request via WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* ─── BOTTOM ASSURANCE STRIP ─── */}
      {!isLoading && bundleProducts.length > 0 && (
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
