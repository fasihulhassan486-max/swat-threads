import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import type { GiftDetails, Line, Product } from '../types'
import { track } from '../lib/analytics'
import { fetchFeaturedProducts, fetchProducts } from '../lib/woocommerce'

export { matchesCategory, parseWooCategories } from '../lib/categories'

interface Store {
  products: Product[]
  featuredProducts: Product[]
  loading: boolean
  productsError: string | null
  reloadProducts: () => void
  lines: Line[]
  wishlist: string[]
  inStock: (p: Product) => boolean
  inCart: (id: string) => boolean
  addProduct: (p: Product, gift?: boolean, note?: string, packing?: string, giftDetails?: GiftDetails) => void
  addBundle: (m: Product, w: Product, colorNote: string) => void
  addCustom: (l: Omit<Line, 'id'>) => void
  remove: (id: string) => void
  toggleWish: (id: string) => void
  setGift: (id: string, gift: boolean, note: string, packing: string) => void
  completeOrder: () => void
}

const Ctx = createContext<Store>(null as unknown as Store)
export const useStore = () => useContext(Ctx)
const load = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || '') as T } catch { return d } }

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [lines, setLines] = useState<Line[]>(() => load('st-lines', []))
  const [wishlist, setWish] = useState<string[]>(() => load('st-wish', []))
  const [sold, setSold] = useState<string[]>(() => load('st-sold', []))

  const reloadProducts = useCallback(() => setReloadKey(k => k + 1), [])

  useEffect(() => {
    let cancelled = false
    const loadCatalog = async () => {
      setLoading(true)
      setProductsError(null)
      try {
        const [catalog, featured] = await Promise.all([fetchProducts(), fetchFeaturedProducts()])
        if (cancelled) return
        setProducts(catalog)
        setFeaturedProducts(featured)
      } catch (error) {
        if (!cancelled) {
          setProducts([])
          setFeaturedProducts([])
          setProductsError(error instanceof Error
            ? `${error.message} Please check the store configuration and try again.`
            : 'We could not load the collection due to an unexpected error. Please try again.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCatalog()
    return () => { cancelled = true }
  }, [reloadKey])

  useEffect(() => {
    localStorage.setItem('st-lines', JSON.stringify(lines))
    localStorage.setItem('st-wish', JSON.stringify(wishlist))
    localStorage.setItem('st-sold', JSON.stringify(sold))
  }, [lines, wishlist, sold])

  const inStock = (p: Product) => p.stockQuantity > 0 && !sold.includes(p.id)
  const inCart = (id: string) => lines.some(l => l.productId === id)
  const mk = (p: Product, gift = false, note = '', packing = '', colorNote = '', giftDetails?: GiftDetails): Line => ({
    id: p.id, productId: p.id, category: p.category, name: p.name, unit: p.price, gift, note, packing, colorNote, giftDetails,
  })

  const value: Store = {
    products, featuredProducts, loading, productsError, reloadProducts, lines, wishlist, inStock, inCart,
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
    addBundle: (m, w, colorNote) => {
      const add = [m, w].filter(p => inStock(p) && !inCart(p.id))
      setLines(ls => [...ls, ...add.map(p => mk(p, false, '', '', colorNote))])
      track('AddToCart', { content_ids: [m.id, w.id], value: m.price + w.price, currency: 'PKR' })
    },
    addCustom: l => { setLines(ls => [...ls, { ...l, id: 'c' + Date.now() }]); track('AddToCart', { value: l.unit, currency: 'PKR' }) },
    remove: id => setLines(ls => ls.filter(l => l.id !== id)),
    toggleWish: id => setWish(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]),
    setGift: (id, gift, note, packing) => setLines(ls => ls.map(l => l.id === id ? { ...l, gift, note, packing } : l)),
    completeOrder: () => { setSold(s => [...s, ...lines.filter(l => l.productId).map(l => l.productId!)]); setLines([]) },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
