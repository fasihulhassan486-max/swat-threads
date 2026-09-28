import { site } from '../config/site'
import { initMeta, track as fb } from './meta'
// One call sends the event to BOTH Meta Pixel and Google Analytics 4.
export function initAnalytics() {
  initMeta()
  const id = site.ga4Id, w = window as any
  if (!id || w.gtag) return
  w.dataLayer = w.dataLayer || []
  w.gtag = function () { w.dataLayer.push(arguments) }
  const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`; document.head.appendChild(s)
  w.gtag('js', new Date()); w.gtag('config', id, { send_page_view: false }) // page views are sent per route below
}
const map: Record<string, string> = { PageView: 'page_view', ViewContent: 'view_item', AddToCart: 'add_to_cart', InitiateCheckout: 'begin_checkout', Purchase: 'purchase' }
export function track(event: string, data: any = {}) {
  fb(event, data)
  const w = window as any
  if (!w.gtag || !map[event]) return
  const { content_ids, ...params } = data
  if (content_ids) params.items = content_ids.map((id: string) => ({ item_id: id }))
  if (event === 'PageView') { params.page_path = location.pathname + location.search; params.page_title = document.title }
  if (event === 'Purchase') params.transaction_id = 'ST-' + Date.now()
  w.gtag('event', map[event], params)
}
