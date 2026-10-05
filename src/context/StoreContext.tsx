import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Category, GiftDetails, Line, Product } from '../types'
import { products as mock } from '../data/products'
import { track } from '../lib/analytics'
interface Store {
  products: Product[]; loading: boolean; lines: Line[]; wishlist: string[]
  inStock: (p: Product) => boolean; inCart: (id: string) => boolean
  addProduct: (p: Product, gift?: boolean, note?: string, packing?: string, giftDetails?: GiftDetails) => void
  addBundle: (m: Product, w: Product, colorNote: string) => void
  addCustom: (l: Omit<Line, 'id'>) => void
  remove: (id: string) => void; toggleWish: (id: string) => void; setGift: (id: string, gift: boolean, note: string, packing: string) => void
  completeOrder: () => void
}
const Ctx = createContext<Store>(null as unknown as Store)
export const useStore = () => useContext(Ctx)
const load = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || '') as T } catch { return d } }
const stripHtml = (html: string) =>
  (html || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, '’')
    .trim()

export function parseWooCategories(
  rawCategories: any,
  productName = ''
): { category: Category; categories: string[] } {
  const catsArray = Array.isArray(rawCategories) ? rawCategories : []

  const slugs: string[] = []
  const names: string[] = []

  for (const c of catsArray) {
    if (typeof c === 'string' && c.trim()) {
      slugs.push(c.trim().toLowerCase())
    } else if (c && typeof c === 'object') {
      if (typeof c.slug === 'string' && c.slug.trim()) {
        slugs.push(c.slug.trim().toLowerCase())
      }
      if (typeof c.name === 'string' && c.name.trim()) {
        names.push(c.name.trim().toLowerCase())
      }
    }
  }

  const allTokens = [...slugs, ...names]
  const cleanName = (productName || '').toLowerCase()

  const hasToken = (regex: RegExp, directSlugs: string[]) =>
    allTokens.some(t => directSlugs.includes(t) || regex.test(t)) || regex.test(cleanName)

  const isCouple = hasToken(
    /(?:^|[\s_-])couples?(?:[\s_-]|$)|couple-bundle|his-and-hers/i,
    ['couple-bundle', 'couple', 'couples', 'couple-set', 'couples-bundle']
  )

  const isWomen = hasToken(
    /(?:^|[\s_-])womens?(?:[\s_'-]|$)/i,
    ['women', 'womens', 'women-shawls', 'womens-shawls']
  )

  const isMen = hasToken(
    /(?:^|[\s_-])mens?(?:[\s_'-]|$)/i,
    ['men', 'mens', 'men-shawls', 'mens-shawls']
  )

  const isGifting = hasToken(
    /(?:^|[\s_-])gifts?(?:ing)?(?:[\s_-]|$)/i,
    ['gifting', 'gift', 'gifts']
  )

  let primaryCategory: Category = 'men'
  if (isCouple) {
    primaryCategory = 'couple-bundle'
  } else if (isWomen) {
    primaryCategory = 'women'
  } else if (isGifting) {
    primaryCategory = 'gifting'
  } else if (isMen) {
    primaryCategory = 'men'
  } else if (slugs[0]) {
    primaryCategory = slugs[0] as Category
  }

  const uniqueCategories = Array.from(
    new Set([...slugs, primaryCategory].filter(Boolean))
  )

  return { category: primaryCategory, categories: uniqueCategories }
}

export function matchesCategory(product: Product, targetCategory: string | null): boolean {
  if (!targetCategory || targetCategory === 'all') return true

  const target = targetCategory.toLowerCase().trim()
  const primary = (product.category || '').toLowerCase().trim()
  const allCats = Array.from(
    new Set([primary, ...(product.categories || []).map(c => c.toLowerCase().trim())])
  ).filter(Boolean)

  if (target === 'men' || target === 'mens') {
    if (primary === 'men') return true
    if (primary !== 'couple-bundle' && allCats.some(c => c === 'men' || c === 'mens' || /(?:^|[\s_-])mens?(?:[\s_'-]|$)/i.test(c))) {
      return true
    }
    return false
  }

  if (target === 'women' || target === 'womens') {
    if (primary === 'women') return true
    if (primary !== 'couple-bundle' && allCats.some(c => c === 'women' || c === 'womens' || /(?:^|[\s_-])womens?(?:[\s_'-]|$)/i.test(c))) {
      return true
    }
    return false
  }

  if (target === 'couple-bundle' || target === 'couple' || target === 'couples') {
    if (primary === 'couple-bundle' || primary === 'couple') return true
    return allCats.some(
      c =>
        c === 'couple-bundle' ||
        c === 'couple' ||
        c === 'couples' ||
        /(?:^|[\s_-])couples?(?:[\s_-]|$)|couple-bundle|his-and-hers/i.test(c)
    )
  }

  if (target === 'gifting' || target === 'gift') {
    if (primary === 'gifting') return true
    return allCats.some(c => c === 'gifting' || /(?:^|[\s_-])gifts?(?:ing)?(?:[\s_-]|$)/i.test(c))
  }

  return (
    primary === target ||
    allCats.includes(target) ||
    allCats.some(c => c.includes(target) || target.includes(c))
  )
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const isWooConfigured = Boolean(import.meta.env.VITE_WORDPRESS_URL)
  const [products, setProducts] = useState<Product[]>(isWooConfigured ? [] : mock)
  const [loading, setLoading] = useState(isWooConfigured)
  const [lines, setLines] = useState<Line[]>(() => load('st-lines', []))
  const [wishlist, setWish] = useState<string[]>(() => load('st-wish', []))
  const [sold, setSold] = useState<string[]>(() => load('st-sold', []))
  useEffect(() => {
    const wpUrl = import.meta.env.VITE_WORDPRESS_URL

    if (!wpUrl) {
      setLoading(false)
      return
    }

    const baseUrl = wpUrl.replace(/\/$/, '')
    const storeEndpoint = `${baseUrl}/wp-json/wc/store/v1/products?per_page=100`
    const consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY || ''
    const consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET || ''
    const v3Endpoint = `${baseUrl}/wp-json/wc/v3/products?per_page=100&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`

    const mapItem = (item: any, isV3 = false): Product => {
      const div = isV3 ? 1 : 10 ** (item.prices?.currency_minor_unit ?? 0)
      const price = isV3
        ? (parseFloat(item.price || item.regular_price || '0') || 0)
        : (item.prices?.price ? Number(item.prices.price) / div : (parseFloat(item.price || item.regular_price || '0') || 0))
      const regularPrice = isV3
        ? (item.regular_price ? parseFloat(item.regular_price) : 0)
        : (item.prices?.regular_price ? Number(item.prices.regular_price) / div : (item.regular_price ? parseFloat(item.regular_price) : 0))
      const originalPrice = regularPrice > price ? regularPrice : undefined

      const allImages: string[] = (item.images || [])
        .map((img: any) => (typeof img === 'string' ? img : img?.src || img?.src))
        .filter(Boolean)
      const firstImage = allImages[0] || ''

      const name = stripHtml(item.name || '')
      const { category, categories } = parseWooCategories(item.categories, name)

      const stockQuantity = item.is_in_stock !== undefined
        ? (item.is_in_stock ? 10 : 0)
        : (item.stock_status === 'outofstock' ? 0 : (item.stock_quantity ?? 1))

      return {
        id: String(item.id),
        sku: item.sku || `ST-${item.id}`,
        name,
        price,
        originalPrice,
        category,
        categories,
        badge: item.tags?.[0]?.name || (item.featured ? 'Featured' : undefined),
        description: stripHtml(item.short_description || item.description || ''),
        tone: '#8a8478',
        stockQuantity,
        image: firstImage,
        images: allImages.length > 0 ? allImages : (firstImage ? [firstImage] : []),
      }
    }

    const loadProducts = async () => {
      setLoading(true)
      try {
        // ── Primary: WooCommerce Store API (no auth needed) ──────────────
        let usedFallback = false
        let rawData: any[] = []

        try {
          const res = await fetch(storeEndpoint)
          if (res.ok) {
            const json = await res.json()
            if (Array.isArray(json) && json.length > 0) {
              rawData = json
            } else {
              console.warn('[StoreContext] Store API returned empty array — trying v3 fallback.')
              usedFallback = true
            }
          } else {
            console.warn(`[StoreContext] Store API HTTP ${res.status} — trying v3 fallback.`)
            usedFallback = true
          }
        } catch (storeErr) {
          console.warn('[StoreContext] Store API fetch error — trying v3 fallback.', storeErr)
          usedFallback = true
        }

        // ── Fallback: wc/v3 REST API with consumer keys ──────────────────
        if (usedFallback && consumerKey) {
          try {
            const res = await fetch(v3Endpoint)
            if (res.ok) {
              const json = await res.json()
              if (Array.isArray(json)) {
                rawData = json
              }
            } else {
              console.error(`[StoreContext] v3 fallback also failed with HTTP ${res.status}.`)
            }
          } catch (v3Err) {
            console.error('[StoreContext] v3 fallback fetch error:', v3Err)
          }
        }

        const mappedProducts: Product[] = rawData.map(item => mapItem(item, usedFallback))
        setProducts(mappedProducts)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])
  useEffect(() => { localStorage.setItem('st-lines', JSON.stringify(lines)); localStorage.setItem('st-wish', JSON.stringify(wishlist)); localStorage.setItem('st-sold', JSON.stringify(sold)) }, [lines, wishlist, sold])
  const inStock = (p: Product) => p.stockQuantity > 0 && !sold.includes(p.id)
  const inCart = (id: string) => lines.some(l => l.productId === id)
  const mk = (p: Product, gift = false, note = '', packing = '', colorNote = '', giftDetails?: GiftDetails): Line => ({ id: p.id, productId: p.id, category: p.category, name: p.name, unit: p.price, gift, note, packing, colorNote, giftDetails })
  const value: Store = {
    products, loading, lines, wishlist, inStock, inCart,
    addProduct: (p, gift, note, packing, giftDetails) => {
      if (!inStock(p)) return
      setLines(ls => {
        const exists = ls.find(l => l.productId === p.id)
        if (exists) {
          return ls.map(l => l.productId === p.id ? mk(p, gift, note, packing, '', giftDetails) : l)
        }
        return [...ls, mk(p, gift, note, packing, '', giftDetails)]
      })
      track('AddToCart', { content_ids: [p.id], value: p.price, currency: 'PKR' })
    },
    addBundle: (m, w, colorNote) => { const add = [m, w].filter(p => inStock(p) && !inCart(p.id)); setLines(ls => [...ls, ...add.map(p => mk(p, false, '', '', colorNote))]); track('AddToCart', { content_ids: [m.id, w.id], value: m.price + w.price, currency: 'PKR' }) },
    addCustom: l => { setLines(ls => [...ls, { ...l, id: 'c' + Date.now() }]); track('AddToCart', { value: l.unit, currency: 'PKR' }) },
    remove: id => setLines(ls => ls.filter(l => l.id !== id)),
    toggleWish: id => setWish(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]),
    setGift: (id, gift, note, packing) => setLines(ls => ls.map(l => l.id === id ? { ...l, gift, note, packing } : l)),
    completeOrder: () => { setSold(s => [...s, ...lines.filter(l => l.productId).map(l => l.productId!)]); setLines([]) },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
