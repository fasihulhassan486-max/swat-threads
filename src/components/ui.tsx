import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { useStore } from '../context/StoreContext'
import { pkr } from '../lib/format'
import { site } from '../config/site'
const P: Record<string, string> = {
  heart: 'M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6c-2.3 4.4-9.3 9-9.3 9z',
  bag: 'M6 7h12l1 13H5L6 7zM9 7a3 3 0 0 1 6 0',
  menu: 'M4 6h16M4 12h16M4 18h16',
  check: 'M5 12l5 5 9-10', pin: 'M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4', truck: 'M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a1.5 1.5 0 1 0 0-3M17 19a1.5 1.5 0 1 0 0-3',
  cash: 'M3 7h18v10H3zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4', box: 'M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8', leaf: 'M5 19c0-9 5-14 14-14 0 9-5 14-14 14zM5 19l8-8',
}
export const Icon = ({ n, className = 'w-5 h-5', fill = false }: { n: string; className?: string; fill?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={P[n]} /></svg>)
export const Swatch = ({ tone, v = 0, className = '' }: { tone: string; v?: number; className?: string }) => (
  <div className={`w-full h-full ${className}`} style={{ background: `repeating-linear-gradient(${45 + v * 30}deg, ${tone} 0 6px, ${tone}dd 6px 7px), ${tone}` }} />)
export const Media = ({ p, v = 0 }: { p: Product; v?: number }) => {
  const src = p.images?.[v] || (v === 0 ? p.image : undefined)
  return src ? <img src={src} alt={p.name} className="w-full h-full object-cover" /> : <Swatch tone={p.tone} v={v} />
}
export function GiftFields({ gift, note, packing, onChange }: { gift: boolean; note: string; packing: string; onChange: (g: boolean, n: string, pk: string) => void }) {
  return (<div className="space-y-2 text-sm">
    <label className="flex items-center gap-2"><input type="checkbox" checked={gift} onChange={e => onChange(e.target.checked, note, packing)} /> Heirloom pine wooden gift box — +{pkr(site.giftBoxPrice)}</label>
    {gift && <><textarea className="field" rows={3} placeholder="Gift message — write exactly what you want on the card" value={note} onChange={e => onChange(true, e.target.value, packing)} />
      <textarea className="field" rows={2} placeholder="Packing preferences (wrapping, ribbon colour, occasion…)" value={packing} onChange={e => onChange(true, note, e.target.value)} /></>}</div>)
}
export function ProductCard({ p }: { p: Product }) {
  const { inStock, wishlist, toggleWish } = useStore()
  const sold = !inStock(p), liked = wishlist.includes(p.id)
  return (
    <div className="group">
      <Link to={`/product/${p.id}`} className="block relative aspect-[4/5] bg-beige overflow-hidden">
        <Media p={p} />
        {p.badge && <span className="absolute top-3 left-3 bg-brass text-coal text-[10px] uppercase tracking-widest px-2 py-1">{p.badge}</span>}
        {sold && <div className="absolute inset-0 bg-coal/60 flex items-center justify-center text-white font-serif tracking-widest text-sm text-center px-4">SOLD OUT</div>}
      </Link>
      <div className="mt-3 flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-widest text-ink/70">Artisan Piece · {p.sku}</p>
          <Link to={`/product/${p.id}`} className="font-serif text-lg text-ink block truncate">{p.name}</Link>
          <p className="text-sm text-ink font-medium">
            {p.price > 0 ? pkr(p.price) : <span className="text-ink/60 font-normal">Coming Soon</span>}
          </p>
        </div>
        <button aria-label="Wishlist" onClick={() => toggleWish(p.id)} className={`p-2 -mr-1.5 transition-colors ${liked ? 'text-brass' : 'text-ink/70 hover:text-ink'}`}>
          <Icon n="heart" fill={liked} />
        </button>
      </div>
    </div>
  )
}
export const Grid = ({ items }: { items: Product[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-5 gap-y-8 sm:gap-y-10">{items.map(p => <ProductCard key={p.id} p={p} />)}</div>
)
