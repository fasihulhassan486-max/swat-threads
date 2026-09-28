import { site } from '../config/site'
// Meta (Facebook + Instagram) Pixel — lets Meta Ads track visitors, add-to-carts and purchases on this site.
export function initMeta() {
  const w = window as any, id = site.metaPixelId
  if (!id || w.fbq) return
  const n: any = (w.fbq = function (...a: any[]) { n.callMethod ? n.callMethod(...a) : n.queue.push(a) })
  if (!w._fbq) w._fbq = n
  n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []
  const s = document.createElement('script'); s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(s); n('init', id)
}
export const track = (event: string, data?: object) => (window as any).fbq?.('track', event, data)
