import { site } from '../config/site'
import type { Line, Product } from '../types'
import type { totals } from './pricing'
const base = site.wc.url.replace(/\/$/, '')
export const wooEnabled = !!base
const strip = (h: string) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#8217;/g, '’').trim()
// Reads products through the PUBLIC WooCommerce Store API — no keys needed. Create categories with slugs "men" and "women".
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${base}/wp-json/wc/store/v1/products?per_page=100`)
  if (!res.ok) throw new Error('WooCommerce products request failed')
  const data = await res.json()
  return data.map((d: any): Product => {
    const div = 10 ** (d.prices?.currency_minor_unit ?? 0), price = Number(d.prices?.price) / div, reg = Number(d.prices?.regular_price) / div
    const cats: string[] = (d.categories || []).map((c: any) => c.slug)
    return { id: String(d.id), sku: d.sku || `ST-${d.id}`, name: strip(d.name), price, originalPrice: reg > price ? reg : undefined,
      category: cats.includes('women') ? 'women' : 'men', badge: d.tags?.[0]?.name, description: strip(d.short_description || d.description || ''),
      tone: '#8a8478', stockQuantity: d.is_in_stock ? 1 : 0, images: (d.images || []).map((i: any) => i.src) }
  })
}
type Customer = { name: string; phone: string; address: string; city: string }
// Creates the order in WooCommerce. WooCommerce reduces stock automatically, so the piece shows as sold.
// SECURITY: wc/v3 needs API keys. For production point VITE_ORDER_PROXY_URL at a tiny server/function that adds the keys.
export async function createOrder(lines: Line[], c: Customer, method: string, t: ReturnType<typeof totals>) {
  if (!wooEnabled) return null
  const [first, ...rest] = c.name.trim().split(' ')
  const addr = { first_name: first, last_name: rest.join(' '), address_1: c.address, city: c.city, country: 'PK', phone: c.phone }
  const meta = (o: Record<string, string | undefined>) => Object.entries(o).filter(([, v]) => v).map(([key, value]) => ({ key, value }))
  const fee = (name: string, total: number, m: Record<string, string | undefined> = {}) => ({ name, total: String(total), tax_status: 'none', meta_data: meta(m) })
  const fees = [
    ...lines.filter(l => l.custom).map(l => {
      const c = l.custom!
      return fee(l.name, l.unit, {
        'Customization Type': c.customizationType,
        Color: c.customColor ? `Custom: ${c.customColor}` : c.color,
        'Custom Color': c.customColor,
        Size: c.customDimensions ? `Custom Dimensions: ${c.customDimensions}` : c.size,
        'Custom Dimensions': c.customDimensions,
        'Style / Finish': c.styleFinish || c.style || c.pattern,
        Fabric: c.fabric,
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
    ...lines.filter(l => l.gift).map(l => fee(l.giftDetails?.packaging || 'Heirloom gift box', l.giftDetails?.packagingPrice ?? site.giftBoxPrice, { 'Recipient': l.giftDetails?.recipientName, 'Sender': l.giftDetails?.senderName, 'Gift message': l.giftDetails?.message || l.note, 'Packaging': l.giftDetails?.packaging || l.packing, 'Occasion': l.giftDetails?.occasion, For: l.name })),
    ...(t.discount > 0 ? [fee('Couple bundle discount (10%)', -t.discount)] : []),
  ]
  const body = {
    payment_method: site.wc.paymentIds[method] ?? method, payment_method_title: method.toUpperCase(), set_paid: false,
    billing: addr, shipping: addr,
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
    customer_note: t.hasCustom ? `Custom order. Advance due now: PKR ${t.dueNow}. Balance on delivery: PKR ${t.balanceCOD}.` : '',
    meta_data: meta({ advance_due_now: String(t.dueNow), cod_balance: String(t.balanceCOD) }),
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  let url = site.wc.orderProxy
  if (!url) { url = `${base}/wp-json/wc/v3/orders`; if (site.wc.key) headers.Authorization = 'Basic ' + btoa(`${site.wc.key}:${site.wc.secret}`) }
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) throw new Error('Order failed')
  return res.json()
}
