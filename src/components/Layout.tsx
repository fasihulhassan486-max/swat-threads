import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { site } from '../config/site'
import { useStore } from '../context/StoreContext'
import { Icon } from './ui'
import { initAnalytics, track } from '../lib/analytics'
const nav = [['Men', '/shop?category=men'], ['Women', '/shop?category=women'], ['Couple Bundle', '/couple-bundle'], ['Customize', '/customize'], ['Gifting', '/gifting'], ['Our Story', '/our-story'], ['Contact', '/contact']]
export default function Layout() {
  const { lines, wishlist } = useStore(), [open, setOpen] = useState(false), { pathname } = useLocation()
  useEffect(() => { initAnalytics() }, [])
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); track('PageView') }, [pathname])
  const info = [['Our Story', '/our-story'], ['Contact', '/contact'], ['Shipping', '/shipping'], ['Returns', '/returns'], ['Privacy', '/privacy'], ['Terms', '/terms']]
  return (<div className="min-h-screen flex flex-col">
    {/* ─── ANNOUNCEMENT BAR: FREE SHIPPING ─── */}
    <div className="bg-[#1C1F1D] text-white/90 text-[11px] text-center py-2.5 px-3 flex items-center justify-center gap-2 tracking-wide font-sans">
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-brass" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a1.5 1.5 0 1 0 0-3M17 19a1.5 1.5 0 1 0 0-3" />
      </svg>
      <span>
        <span className="text-brass font-medium">Complimentary Express Shipping</span>
        {' '}on all orders above{' '}
        <span className="text-brass font-medium">PKR 5,000</span>
        {' '}across Pakistan
      </span>
    </div>
    {/* ─── ANNOUNCEMENT BAR: GIFTING ─── */}
    <div className="bg-walnut text-white/90 text-xs text-center py-2 px-3"><Link to="/gifting" className="hover:text-white transition-colors">Gifting a shawl? Add heirloom packaging with your own handwritten card →</Link></div>
    <header className="sticky top-0 z-40 bg-ivory border-b border-beige">
      <div className="container-x h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-ink"><svg viewBox="0 0 40 24" className="w-9 h-6" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M2 22 14 6l8 10 5-6 11 12" /></svg><span className="leading-none"><span className="block font-serif text-2xl tracking-[0.3em]">SWAT THREADS</span><span className="block text-[9px] tracking-[0.35em] text-ink/70 mt-1">HANDWOVEN SHAWLS</span></span></Link>
        <nav className="hidden lg:flex gap-7 text-[11px] uppercase tracking-[0.18em] text-ink">{nav.map(([l, t]) => <NavLink key={l} to={t} className="hover:text-brass">{l}</NavLink>)}</nav>
        <div className="flex items-center gap-4 text-ink">
          <Link to="/shop?wishlist=1" aria-label="Wishlist" className="relative"><Icon n="heart" />{wishlist.length > 0 && <span className="absolute -top-2 -right-2 text-[10px] bg-brass text-coal rounded-full w-4 h-4 grid place-items-center">{wishlist.length}</span>}</Link>
          <Link to="/cart" aria-label="Cart" className="relative"><Icon n="bag" /><span className="absolute -top-2 -right-2 text-[10px] bg-coal text-white rounded-full w-4 h-4 grid place-items-center">{lines.length}</span></Link>
          <button className="lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}><Icon n="menu" /></button></div></div>
      {open && <nav className="lg:hidden bg-ivory border-t border-beige px-5 py-3 flex flex-col gap-3 text-ink">{nav.map(([l, t]) => <Link key={l} to={t}>{l}</Link>)}</nav>}
    </header>
    <main className="flex-1"><Outlet /></main>
    <footer className="bg-coal text-white/70 text-sm">
      <div className="container-x py-14 grid md:grid-cols-3 gap-10">
        <div><h4 className="text-white text-xl tracking-[0.25em] mb-3">Swat Threads</h4><p>Handwoven wool shawls from Swat Valley, Pakistan — one of one, made to be kept.</p></div>
        <div><h5 className="text-brass text-xs uppercase tracking-[0.25em] mb-3">Shop</h5><ul className="space-y-2">{nav.slice(0, 4).map(([l, t]) => <li key={l}><Link to={t} className="hover:text-white">{l}</Link></li>)}</ul></div>
        <div><h5 className="text-brass text-xs uppercase tracking-[0.25em] mb-3">Information</h5><ul className="space-y-2">{info.map(([l, t]) => <li key={l}><Link to={t} className="hover:text-white">{l}</Link></li>)}</ul></div></div>
      <div className="container-x pb-6 flex flex-wrap gap-4 text-xs">{Object.entries(site.social).filter(([, u]) => u).map(([k, u]) => <a key={k} href={u} target="_blank" rel="noreferrer" className="capitalize hover:text-white">{k}</a>)}<a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></div>
      <div className="border-t border-white/10 py-4 container-x flex flex-col md:flex-row justify-between gap-1 text-xs"><span>© {new Date().getFullYear()} Swat Threads</span><span>Cash on Delivery &amp; Online Payment</span></div>
    </footer>
    <a aria-label="WhatsApp" href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`} target="_blank" rel="noreferrer"
      className="fixed bottom-5 left-5 z-50 w-14 h-14 rounded-full bg-whatsapp grid place-items-center shadow-lg">
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm4.600 13.300c-.2.6-1.200 1.100-1.700 1.200-.5.100-1.100.1-3.500-.9-2.500-1.100-4-3.700-4.200-3.900-.1-.2-1-1.300-1-2.500s.6-1.800.9-2c.2-.2.5-.3.700-.3h.5c.2 0 .4 0 .5.4l.7 1.800c.1.200.1.300 0 .5l-.4.5c-.1.100-.3.300-.1.500.7 1.100 1.500 1.800 2.500 2.300.3.100.4.100.6-.1l.7-.9c.2-.2.300-.2.500-.1l1.700.8c.2.100.3.200.4.300 0 .2 0 .7-.1 1.100z" /></svg></a>
  </div>)
}
