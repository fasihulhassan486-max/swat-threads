import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { site } from '../config/site'
import { useStore } from '../context/StoreContext'
import { Icon } from './ui'
import { initAnalytics, track } from '../lib/analytics'

const nav = [
  ['Men', '/shop?category=men'],
  ['Women', '/shop?category=women'],
  ['Couple Bundle', '/couple-bundle'],
  ['Customize', '/customize'],
  ['Gifting', '/gifting'],
  ['Our Story', '/our-story'],
  ['Contact', '/contact']
]

const info = [
  ['Our Story', '/our-story'],
  ['Contact', '/contact'],
  ['Shipping', '/shipping'],
  ['Returns', '/returns'],
  ['Privacy', '/privacy'],
  ['Terms', '/terms']
]

export default function Layout() {
  const { lines, wishlist } = useStore()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => { initAnalytics() }, [])
  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
    track('PageView')
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {/* ─── ANNOUNCEMENT BAR: FREE SHIPPING ─── */}
      <div className="bg-[#1C1F1D] text-white/90 text-[12px] py-2 px-4 sm:px-6 lg:px-12 flex items-center justify-center gap-2 tracking-wide font-sans">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 text-brass" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a1.5 1.5 0 1 0 0-3M17 19a1.5 1.5 0 1 0 0-3" />
        </svg>
        <span className="leading-none text-center sm:whitespace-nowrap">
          <span className="text-brass font-semibold">Complimentary Express Shipping</span>
          {' '}on all orders above{' '}
          <span className="text-brass font-semibold">PKR 5,000</span>
          {' '}across Pakistan
        </span>
      </div>

      {/* ─── ANNOUNCEMENT BAR: GIFTING ─── */}
      <div className="bg-walnut text-white/90 text-[12px] text-center py-2 px-4 sm:px-6 lg:px-12 flex items-center justify-center">
        <Link to="/gifting" className="hover:text-white transition-colors inline-flex items-center gap-1.5 sm:whitespace-nowrap leading-none">
          <span>Gifting a shawl? Add heirloom packaging with your own handwritten card</span>
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {/* ─── MAIN HEADER ─── */}
      <header className="sticky top-0 z-40 bg-ivory border-b border-beige">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 py-4 md:py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 text-ink shrink-0 group">
            <svg viewBox="0 0 40 24" className="w-8 h-5 sm:w-10 sm:h-6 shrink-0 group-hover:text-brass transition-colors" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M2 22 14 6l8 10 5-6 11 12" />
            </svg>
            <span className="leading-none">
              <span className="block font-serif text-[22px] tracking-[0.3em]">VIRAS</span>
              <span className="block text-[9px] tracking-[0.35em] text-ink/70 mt-1 whitespace-nowrap">SWAT VALLEY · HERITAGE SHAWLS</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[13px] uppercase tracking-[0.15em] font-medium text-ink">
            {nav.map(([l, t]) => (
              <NavLink
                key={l}
                to={t}
                className={({ isActive }) =>
                  `hover:text-brass py-1.5 whitespace-nowrap transition-colors ${
                    isActive ? 'text-brass font-semibold' : ''
                  }`
                }
              >
                {l}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 text-ink shrink-0">
            <Link
              to="/shop?wishlist=1"
              aria-label="Wishlist"
              className="relative p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center hover:text-brass transition-colors"
            >
              <Icon n="heart" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 text-[10px] bg-brass text-coal rounded-full w-4 h-4 grid place-items-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center hover:text-brass transition-colors"
            >
              <Icon n="bag" />
              <span className="absolute top-1 right-1 text-[10px] bg-coal text-white rounded-full w-4 h-4 grid place-items-center font-bold">
                {lines.length}
              </span>
            </Link>
            <button
              className="lg:hidden p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center text-ink hover:text-brass transition-colors"
              aria-label={open ? 'Close Menu' : 'Open Menu'}
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <Icon n="menu" className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* ─── MOBILE DRAWER MENU ─── */}
        {open && (
          <div className="lg:hidden bg-ivory border-t border-beige shadow-lg transition-all animate-fade-in">
            <nav className="container-x py-4 flex flex-col divide-y divide-beige/50 text-ink">
              {nav.map(([l, t]) => (
                <Link
                  key={l}
                  to={t}
                  onClick={() => setOpen(false)}
                  className="py-3.5 text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-between hover:text-brass transition-colors"
                >
                  <span>{l}</span>
                  <span className="text-ink/40 text-sm">→</span>
                </Link>
              ))}
              <div className="pt-4 pb-2 flex gap-4 text-xs">
                <Link
                  to="/shop?wishlist=1"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-2 text-ink/80 hover:text-brass"
                >
                  <Icon n="heart" className="w-4 h-4 text-brass" />
                  <span>Wishlist ({wishlist.length})</span>
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-2 text-ink/80 hover:text-brass"
                >
                  <Icon n="bag" className="w-4 h-4 text-walnut" />
                  <span>Cart ({lines.length})</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-coal text-white/70 text-sm">
        <div className="container-x py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className="text-white text-xl tracking-[0.25em] mb-3">VIRAS</h4>
            <p className="max-w-sm text-sm leading-relaxed">
              Handcrafted shawls rooted in the heritage of Swat Valley, Pakistan, made for modern wardrobes and meant to be kept.
            </p>
          </div>
          <div>
            <h5 className="text-brass text-xs uppercase tracking-[0.25em] mb-3 font-mono">Shop</h5>
            <ul className="space-y-2">
              {nav.slice(0, 4).map(([l, t]) => (
                <li key={l}>
                  <Link to={t} className="hover:text-white py-1 inline-block">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-brass text-xs uppercase tracking-[0.25em] mb-3 font-mono">Information</h5>
            <ul className="space-y-2">
              {info.map(([l, t]) => (
                <li key={l}>
                  <Link to={t} className="hover:text-white py-1 inline-block">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="container-x pb-6 flex flex-wrap gap-4 text-xs items-center">
          {Object.entries(site.social).filter(([, u]) => u).map(([k, u]) => (
            <a key={k} href={u} target="_blank" rel="noreferrer" className="capitalize hover:text-white py-1">
              {k}
            </a>
          ))}
          <a href={`mailto:${site.email}`} className="hover:text-white py-1">
            {site.email}
          </a>
        </div>

        <div className="border-t border-white/10 py-4 container-x flex flex-col sm:flex-row justify-between gap-2 text-xs text-white/50">
          <span>© {new Date().getFullYear()} VIRAS</span>
          <span>Cash on Delivery &amp; Online Payment</span>
        </div>
      </footer>

      {/* WHATSAPP FLOAT BUTTON */}
      <a
        aria-label="WhatsApp"
        href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 left-5 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-whatsapp grid place-items-center shadow-lg active:scale-95 transition-transform"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="white">
          <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm4.600 13.300c-.2.6-1.200 1.100-1.700 1.200-.5.100-1.100.1-3.500-.9-2.500-1.100-4-3.700-4.200-3.900-.1-.2-1-1.300-1-2.500s.6-1.800.9-2c.2-.2.5-.3.700-.3h.5c.2 0 .4 0 .5.4l.7 1.800c.1.200.1.300 0 .5l-.4.5c-.1.100-.3.300-.1.500.7 1.100 1.500 1.800 2.500 2.300.3.100.4.100.6-.1l.7-.9c.2-.2.300-.2.500-.1l1.700.8c.2.100.3.200.4.300 0 .2 0 .7-.1 1.100z" />
        </svg>
      </a>
    </div>
  )
}
