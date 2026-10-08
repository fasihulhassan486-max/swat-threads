import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { Icon, Media } from '../components/ui'
import { pkr } from '../lib/format'
import { track } from '../lib/analytics'
import { site } from '../config/site'
import { DELIVERY_TIME, SHIPPING_FEE } from '../lib/pricing'
import type { Product, ProductImage } from '../types'

export function ProductDetail({ product: propProduct }: { product?: Product } = {}) {
  const { id } = useParams()
  const { products, featuredProducts, loading, inStock, inCart, addProduct, wishlist, toggleWish } = useStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [v, setV] = useState(0)

  // Find product from props, main catalog, or featured list
  const found = propProduct || products.find(x => x.id === id) || featuredProducts?.find(x => x.id === id)
  const [product, setProduct] = useState<Product | undefined>(found)

  useEffect(() => {
    if (found) {
      setProduct(found)
      track('ViewContent', { content_ids: [found.id], value: found.price, currency: 'PKR' })
    }
  }, [found?.id])

  // Direct fetch fallback if user visits /product/:id directly or on page reload
  useEffect(() => {
    if (!product && id && !loading) {
      const fetchSingleProduct = async () => {
        try {
          const wpUrl = import.meta.env.VITE_WORDPRESS_URL || site.wc.url
          if (!wpUrl) return
          const baseUrl = wpUrl.replace(/\/$/, '')
          const res = await fetch(`${baseUrl}/wp-json/wc/store/v1/products/${id}`)
          if (res.ok) {
            const item = await res.json()
            if (item && item.id) {
              const div = 10 ** (item.prices?.currency_minor_unit ?? 0)
              const price = item.prices?.price ? Number(item.prices.price) / div : (parseFloat(item.price || '0') || 0)
              const reg = item.prices?.regular_price ? Number(item.prices.regular_price) / div : (parseFloat(item.regular_price || '0') || 0)
              const rawImages = Array.isArray(item.images) ? item.images : []
              const imagesList: ProductImage[] = rawImages.map((img: any, idx: number) => ({
                id: img?.id || img?.src || idx,
                src: typeof img === 'string' ? img : img?.src || '',
                alt: typeof img === 'object' ? (img?.alt || img?.name || item.name || 'Product Image') : (item.name || 'Product Image'),
              })).filter((i: ProductImage) => Boolean(i.src))

              setProduct({
                id: String(item.id),
                sku: item.sku || `ST-${item.id}`,
                name: (item.name || '').replace(/<[^>]+>/g, '').trim(),
                price,
                originalPrice: reg > price ? reg : undefined,
                category: (item.categories?.[0]?.slug || 'men') as any,
                badge: item.tags?.[0]?.name || (item.featured ? 'Featured' : undefined),
                featured: Boolean(item.featured),
                description: item.description || item.short_description || '',
                short_description: item.short_description || '',
                tone: '#8a8478',
                stockQuantity: item.is_in_stock ? 10 : 0,
                image: imagesList[0]?.src || '',
                images: imagesList,
              })
            }
          }
        } catch (err) {
          console.warn('[ProductDetail] Single product direct fetch error:', err)
        }
      }
      fetchSingleProduct()
    }
  }, [id, product, loading])

  if (loading && !product) return <div className="container-x py-16 sm:py-20 text-ink/70 font-serif">Loading…</div>
  if (!product) return <div className="container-x py-16 sm:py-20 font-serif">Product not found. <Link to="/shop" className="underline">Back to shop</Link></div>

  const ok = inStock(product)
  const productImages: ProductImage[] = (product.images || []).map((img, idx) => {
    if (typeof img === 'string') {
      return { id: idx, src: img, alt: product.name || 'Product Image' }
    }
    return {
      id: img.id || img.src || idx,
      src: img.src,
      alt: img.alt || product.name || 'Product Image',
    }
  })
  const currentImg = productImages[v] || productImages[0]

  return (
    <div className="product-details-container container-x py-8 sm:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Product Image section with ALT tag */}
        <div className="product-gallery">
          <div className="aspect-[4/5] bg-beige overflow-hidden">
            {currentImg ? (
              <img
                key={currentImg.id || currentImg.src}
                src={currentImg.src}
                alt={currentImg.alt || product.name || "Product Image"}
                className="w-full h-auto object-cover"
              />
            ) : (
              <Media p={product} v={v} />
            )}
          </div>

          {productImages.length > 1 && (
            <div className="flex gap-2 sm:gap-3 mt-3 overflow-x-auto pb-2">
              {productImages.map((img, i) => (
                <button
                  key={img.id || img.src || i}
                  type="button"
                  onClick={() => setV(i)}
                  className={`w-16 sm:w-20 aspect-square border shrink-0 transition-colors overflow-hidden ${
                    v === i ? 'border-walnut ring-1 ring-walnut' : 'border-beige hover:border-walnut/50'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt || product.name || "Product Image"}
                    className="w-full h-auto object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS COLUMN */}
        <div>
          {product.badge && (
            <span className="text-[10px] uppercase tracking-widest text-walnut border border-walnut px-2.5 py-1 inline-block">
              {product.badge}
            </span>
          )}
          <p className="text-xs uppercase tracking-widest text-ink/70 mt-3">1 of 1 · {product.sku}</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-ink my-2">{product.name}</h1>
          <div className="flex items-baseline gap-2 mb-4">
            <p className="text-xl sm:text-2xl font-serif text-walnut font-medium">{pkr(product.price)}</p>
            {product.originalPrice && (
              <span className="text-ink/60 line-through text-sm sm:text-base">{pkr(product.originalPrice)}</span>
            )}
          </div>

          {/* Short Description & Add to Cart Area */}
          <div
            className="short-description text-ink/75 my-5 text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.short_description || '' }}
          />

          <p className={`text-xs sm:text-sm mb-2 ${ok ? 'text-emerald-700 font-medium' : 'text-ink/60'}`}>
            {ok ? '● In stock — only one piece available' : '○ Sold — one of one'}
          </p>

          <p className="text-xs text-ink/75 flex items-center gap-1.5 mb-5 font-sans">
            <Icon n="truck" className="w-3.5 h-3.5 text-brass shrink-0" />
            <span>Standard Delivery: <strong>{DELIVERY_TIME}</strong> · Shipping {pkr(SHIPPING_FEE)}</span>
          </p>

          <div className="flex gap-3">
            <button
              className="btn-primary flex-1 py-3.5 px-6 min-h-[48px]"
              disabled={!ok || inCart(product.id)}
              onClick={() => addProduct(product)}
            >
              {!ok ? 'Sold' : inCart(product.id) ? 'In your cart' : 'Add to Cart'}
            </button>
            <button
              className="btn-outline min-h-[48px] min-w-[48px] p-3 flex items-center justify-center"
              aria-label="Wishlist"
              onClick={() => toggleWish(product.id)}
            >
              <Icon n="heart" fill={wishlist.includes(product.id)} />
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-beige">
            <Link
              to={`/customize?id=${product.id}`}
              className="w-full border border-walnut/50 text-walnut hover:bg-walnut hover:text-white py-3 px-4 text-xs tracking-[0.18em] uppercase transition-colors flex items-center justify-center gap-2 rounded-sm"
            >
              <span>Customize This {product.category === 'women' ? "Women's" : product.category === 'couple-bundle' ? 'Couple' : "Men's"} Shawl</span>
              <span>→</span>
            </Link>
          </div>

          {/* Full Description Section with 2-line clamp & Read More toggle */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-bold mb-3">Product Description</h3>
            
            <div 
              className={`prose max-w-none transition-all duration-300 ${
                !isExpanded ? 'line-clamp-2 overflow-hidden' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {product.description && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-sm font-semibold underline text-black hover:text-gray-600 focus:outline-none"
              >
                {isExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
