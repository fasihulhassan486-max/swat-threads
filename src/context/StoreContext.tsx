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

export function StoreProvider({ children }: { children: ReactNode }) {
  const isWooConfigured = Boolean(import.meta.env.VITE_WORDPRESS_URL)
  const [products, setProducts] = useState<Product[]>(isWooConfigured ? [] : mock)
  const [loading, setLoading] = useState(isWooConfigured)
  const [lines, setLines] = useState<Line[]>(() => load('st-lines', []))
  const [wishlist, setWish] = useState<string[]>(() => load('st-wish', []))
  const [sold, setSold] = useState<string[]>(() => load('st-sold', []))
  useEffect(() => {
    const wpUrl = import.meta.env.VITE_WORDPRESS_URL
    const consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY
    const consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET

    if (!wpUrl) {
      setLoading(false)
      return
    }

    const baseUrl = wpUrl.replace(/\/$/, '')
    const endpoint = `${baseUrl}/wp-json/wc/v3/products?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`

    const loadProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`WooCommerce API responded with status ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()

        const mappedProducts: Product[] = (Array.isArray(data) ? data : []).map((item: any): Product => {
          const price = parseFloat(item.price || item.regular_price || '0') || 0
          const regularPrice = item.regular_price ? parseFloat(item.regular_price) : 0
          const originalPrice = regularPrice > price ? regularPrice : undefined
          const firstImage = item.images?.[0]?.src || ''
          const allImages = (item.images || []).map((img: any) => img.src).filter(Boolean)

          return {
            id: String(item.id),
            sku: item.sku || `ST-${item.id}`,
            name: stripHtml(item.name || ''),
            price,
            originalPrice,
            category: (item.categories?.[0]?.slug || 'men') as Category,
            badge: item.tags?.[0]?.name || (item.featured ? 'Featured' : undefined),
            description: stripHtml(item.short_description || item.description || ''),
            tone: '#8a8478',
            stockQuantity: item.stock_status === 'outofstock' ? 0 : (item.stock_quantity ?? 1),
            image: firstImage,
            images: allImages.length > 0 ? allImages : (firstImage ? [firstImage] : []),
          }
        })

        setProducts(mappedProducts)
      } catch (err) {
        console.error('Failed to fetch WooCommerce products:', err)
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
