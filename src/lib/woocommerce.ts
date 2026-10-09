import { site } from '../config/site'
import type { Line, Product } from '../types'
import { parseWooCategories } from './categories'
import { stripHtml } from './html'
import type { totals } from './pricing'

const base = site.wc.url.replace(/\/$/, '')
export const wooEnabled = !!base

export function mapWooProduct(d: any): Product {
  const div = d.prices ? 10 ** (d.prices.currency_minor_unit ?? 0) : 1
  const price = d.prices?.price != null
    ? Number(d.prices.price) / div
    : (parseFloat(d.price || d.regular_price || '0') || 0)
  const reg = d.prices?.regular_price != null
    ? Number(d.prices.regular_price) / div
    : (parseFloat(d.regular_price || '0') || 0)
  const name = stripHtml(d.name || '')
  const { category, categories } = parseWooCategories(d.categories, name)
  const images = (d.images || []).map((i: any, idx: number) => ({
    id: i?.id || i?.src || idx,
    src: typeof i === 'string' ? i : i?.src || '',
    alt: typeof i === 'object' ? (i?.alt || i?.name || name) : name,
  })).filter((i: any) => Boolean(i.src))
  const inStock = d.is_in_stock !== undefined
    ? Boolean(d.is_in_stock)
    : d.stock_status !== 'outofstock'
  return {
    id: String(d.id),
    sku: d.sku || `ST-${d.id}`,
    name,
    price,
    originalPrice: reg > price ? reg : undefined,
    category,
    categories,
    badge: d.tags?.[0]?.name || (d.featured ? 'Featured' : undefined),
    featured: Boolean(d.featured ?? d.is_featured),
    description: d.description || '',
    short_description: d.short_description || '',
    tone: '#8a8478',
    stockQuantity: inStock ? (d.stock_quantity ?? 1) : 0,
    image: images[0]?.src || '',
    images,
  }
}

async function fetchStorePage(page: number): Promise<any[]> {
  const params = new URLSearchParams({ per_page: '100', page: String(page) })
  const res = await fetch(`${base}/wp-json/wc/store/v1/products?${params}`)
  if (!res.ok) throw new Error('WooCommerce products request failed')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function fetchProducts(): Promise<Product[]> {
  if (!wooEnabled) return []
  const seen = new Set<string>()
  const products: Product[] = []
  for (let page = 1; page <= 10; page++) {
    const rows = await fetchStorePage(page)
    if (!rows.length) break
    for (const row of rows) {
      const product = mapWooProduct(row)
      if (seen.has(product.id)) continue
      seen.add(product.id)
      products.push(product)
    }
    if (rows.length < 100) break
  }
  return products
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!wooEnabled || !id) return null
  const res = await fetch(`${base}/wp-json/wc/store/v1/products/${id}`)
  if (!res.ok) return null
  const item = await res.json()
  return item?.id ? mapWooProduct(item) : null
}
export type Customer = {
  name: string
  phone: string
  email: string
  address: string
  city: string
  deliveryInstructions?: string
}

// Creates the order in WooCommerce. WooCommerce reduces stock automatically, so the piece shows as sold.
// SECURITY: wc/v3 needs API keys. For production point VITE_ORDER_PROXY_URL at a tiny server/function that adds the keys.
export async function createOrder(lines: Line[], c: Customer, method: string, t: ReturnType<typeof totals>) {
  if (!wooEnabled) return null
  const [first, ...rest] = c.name.trim().split(' ')
  const addr = {
    first_name: first,
    last_name: rest.join(' ') || first,
    address_1: c.address,
    city: c.city,
    country: 'PK',
    phone: c.phone,
    email: c.email,
  }
  const meta = (o: Record<string, string | undefined>) => Object.entries(o).filter(([, v]) => v).map(([key, value]) => ({ key, value }))
  const fee = (name: string, total: number, m: Record<string, string | undefined> = {}) => ({ name, total: String(total), tax_status: 'none', meta_data: meta(m) })
  const fees = [
    ...lines.filter(l => l.custom).map(l => {
      const c = l.custom!
      const isEmbroidery = c.style === 'Embroidered' || c.pattern === 'Embroidered' || c.womensDesign === 'Embroidered' || c.styleFinish === 'Embroidered'
      return fee(l.name, l.unit, {
        'Customization Type': c.customizationType === 'women' ? "Women's Shawl Customization" : c.customizationType === 'men' ? "Men's Shawl Customization" : "Couple Bundle Customization",
        Fabric: c.fabric || c.womensFabric,
        Color: c.customColor ? `Custom: ${c.customColor}` : c.color,
        'Custom Color': c.customColor,
        Size: c.customDimensions ? `Custom Dimensions: ${c.customDimensions}` : c.size,
        'Custom Dimensions': c.customDimensions,
        'Style / Finish': c.styleFinish || c.style || c.pattern,
        'Embroidery Option': isEmbroidery ? 'Hand Embroidery Selected (+PKR 1,000)' : 'None',
        'Special Instructions': c.specialInstructions || c.notes,
        'Reference Image': c.referenceImage,
        "Men's Color": c.mensCustomColor ? `Custom: ${c.mensCustomColor}` : c.mensColor,
        "Men's Design": c.mensDesign,
        "Men's Request": c.mensSpecialRequest,
        "Women's Fabric": c.womensFabric,
        "Women's Color": c.womensCustomColor ? `Custom: ${c.womensCustomColor}` : c.womensColor,
        "Women's Design": c.womensDesign,
        "Women's Request": c.womensSpecialRequest,
        'Shared Couple Customization': c.sharedCoupleCustomization,
      })
    }),
    ...lines.filter(l => l.gift).map(l => fee(l.giftDetails?.packaging || site.giftPackagingLabel, l.giftDetails?.packagingPrice ?? site.giftBoxPrice, { 'Recipient': l.giftDetails?.recipientName, 'Sender': l.giftDetails?.senderName, 'Gift message': l.giftDetails?.message || l.note, 'Packaging': l.giftDetails?.packaging || l.packing, 'Occasion': l.giftDetails?.occasion, For: l.name })),
    ...(t.discount > 0 ? [fee('Couple bundle discount (10%)', -t.discount)] : []),
  ]

  let paymentMethodTitle = method.toUpperCase()
  if (method === 'easypaisa') {
    paymentMethodTitle = 'EasyPaisa (0309 6424489 - Fasih Ul Hassan)'
  } else if (method === 'cod') {
    paymentMethodTitle = 'Cash on Delivery (COD)'
  } else if (method === 'card') {
    paymentMethodTitle = 'Credit / Debit Card'
  }

  const shippingLines = t.shipping > 0 ? [
    {
      method_id: 'flat_rate',
      method_title: `Standard Delivery (${site.deliveryTime})`,
      total: String(t.shipping),
    }
  ] : []

  const notesList = [
    t.hasCustom ? `Custom order. Advance due now: PKR ${t.dueNow}. Balance on delivery: PKR ${t.balanceCOD}.` : '',
    c.deliveryInstructions ? `Delivery Instructions: ${c.deliveryInstructions}` : '',
    method === 'easypaisa' ? 'Payment via EasyPaisa (0309 6424489 - Fasih Ul Hassan)' : '',
  ].filter(Boolean).join(' | ')

  const body = {
    payment_method: site.wc.paymentIds[method] ?? method,
    payment_method_title: paymentMethodTitle,
    set_paid: false,
    billing: addr,
    shipping: addr,
    line_items: lines.filter(l => l.productId).map(l => ({
      product_id: Number(l.productId),
      quantity: 1,
      meta_data: meta({
        'Color suggestion': l.colorNote,
        ...(l.giftDetails ? {
          'Gift Recipient': l.giftDetails.recipientName,
          'Gift Sender': l.giftDetails.senderName,
          'Gift Message': l.giftDetails.message,
          'Gift Packaging': l.giftDetails.packaging,
          'Gift Occasion': l.giftDetails.occasion,
        } : {}),
      }),
    })),
    fee_lines: fees,
    shipping_lines: shippingLines,
    customer_note: notesList,
    meta_data: meta({
      advance_due_now: String(t.dueNow),
      cod_balance: String(t.balanceCOD),
      delivery_instructions: c.deliveryInstructions,
      estimated_delivery: site.deliveryTime,
      easypaisa_account: method === 'easypaisa' ? '0309 6424489 (Fasih Ul Hassan)' : undefined,
    }),
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  let url = site.wc.orderProxy
  if (!url) { url = `${base}/wp-json/wc/v3/orders`; if (site.wc.key) headers.Authorization = 'Basic ' + btoa(`${site.wc.key}:${site.wc.secret}`) }
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) throw new Error('Order failed')
  return res.json()
}
