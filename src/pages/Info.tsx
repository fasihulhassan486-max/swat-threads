import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { site } from '../config/site'
import { pkr } from '../lib/format'

const pages: Record<string, [string, string[]]> = {
  '/our-story': ['Our Story', ['Swat Threads brings handwoven wool shawls from the valleys of Swat to your wardrobe. Each shawl is sourced directly from local artisans, hand-selected, and quality checked.', 'We keep our collection small on purpose — most pieces are one of one.']],
  '/contact': ['Contact', ['Reach us on WhatsApp, email or social media for orders, custom requests, and questions.']],
  '/shipping': ['Shipping Policy', ['We deliver nationwide across Pakistan. Ready pieces ship within 1–3 working days; custom orders take 8–10 days.']],
  '/returns': ['Returns & Refunds', ['Contact us within 7 days of delivery if there is a problem with your piece. Custom orders are made to your specification and are non-refundable except for defects.']],
  '/privacy': ['Privacy Policy', ['We only collect the details needed to deliver your order and never sell your data.', 'We use the Meta Pixel (Facebook and Instagram) to measure our advertising and show relevant ads to people who visited the site.']],
  '/terms': ['Terms', ['By ordering you agree that each piece is single-inventory and available while stock lasts.']],
}

export default function Info() {
  const { pathname } = useLocation(), [t, body] = pages[pathname] ?? ['Not found', []]

  return (
    <div className="container-x max-w-2xl py-10 sm:py-16 text-center">
      <h1 className="text-3xl sm:text-4xl text-ink mb-2">{t}</h1>
      <div className="w-12 h-px bg-brass mx-auto mb-6 sm:mb-8" />
      {body.map((b, i) => (
        <p key={i} className="text-ink/75 mb-4 text-sm sm:text-base leading-relaxed">
          {b}
        </p>
      ))}
      {pathname === '/our-story' && <StoryVideo />}
      {pathname === '/our-story' && <ConnectSection />}
      {pathname === '/contact' && <ContactCards />}
      {!body.length && (
        <div className="mt-6">
          <Link to="/" className="btn-outline">
            Return Home
          </Link>
        </div>
      )}
    </div>
  )
}

export const Confirmation = () => {
  const { state } = useLocation() as { state?: { dueNow: number; bal: number } }
  return (
    <div className="container-x max-w-xl py-12 sm:py-20 text-center">
      <h1 className="text-3xl sm:text-4xl text-ink mb-4">Thank you</h1>
      <p className="text-ink/70 mb-4 text-sm sm:text-base leading-relaxed">
        Your order is placed. We will follow up on WhatsApp shortly to confirm details and delivery.
      </p>
      {state && (
        <p className="text-xs sm:text-sm text-walnut font-medium">
          Paid now: {pkr(state.dueNow)}{state.bal > 0 && ` · Due on delivery: ${pkr(state.bal)}`}
        </p>
      )}
      <Link to="/shop" className="btn-outline mt-6 inline-block">
        Continue shopping
      </Link>
    </div>
  )
}

function StoryVideo() {
  const [bad, setBad] = useState(false)
  return (
    <div className="mt-6 sm:mt-8 aspect-video bg-beige border border-beige grid place-items-center overflow-hidden">
      {bad ? (
        <p className="text-ink/70 text-sm px-6">Documentary video coming soon.</p>
      ) : (
        <video
          src={site.storyVideo}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          onError={() => setBad(true)}
        />
      )}
    </div>
  )
}

/** Rich contact action cards shown on /contact */
function ContactCards() {
  return (
    <div className="mt-8 space-y-4 text-left">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`}
        target="_blank" rel="noreferrer"
        className="flex items-center gap-4 rounded-xl border border-beige bg-ivory px-5 py-4 shadow-sm hover:shadow-md hover:border-brass transition-all group"
      >
        <span className="w-11 h-11 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#25D366]" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm4.6 13.3c-.2.6-1.2 1.1-1.7 1.2-.5.1-1.1.1-3.5-.9-2.5-1.1-4-3.7-4.2-3.9-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .5.4l.7 1.8c.1.2.1.3 0 .5l-.4.5c-.1.1-.3.3-.1.5.7 1.1 1.5 1.8 2.5 2.3.3.1.4.1.6-.1l.7-.9c.2-.2.3-.2.5-.1l1.7.8c.2.1.3.2.4.3 0 .2 0 .7-.1 1.1z"/>
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.15em] text-ink/50 font-mono mb-0.5">WhatsApp &amp; Phone</p>
          <p className="text-ink font-medium text-sm sm:text-base">{site.phone}</p>
          <p className="text-xs text-ink/50 mt-0.5">Tap to open chat →</p>
        </div>
      </a>

      {/* Email */}
      <a
        href={`mailto:${site.email}`}
        className="flex items-center gap-4 rounded-xl border border-beige bg-ivory px-5 py-4 shadow-sm hover:shadow-md hover:border-brass transition-all group"
      >
        <span className="w-11 h-11 rounded-full bg-brass/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-walnut" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M2 7l10 7 10-7"/>
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.15em] text-ink/50 font-mono mb-0.5">Support Email</p>
          <p className="text-ink font-medium text-sm sm:text-base break-all">{site.email}</p>
          <p className="text-xs text-ink/50 mt-0.5">We reply within 24 hours →</p>
        </div>
      </a>

      {/* Social row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Facebook */}
        <a
          href={site.social.facebook}
          target="_blank" rel="noreferrer"
          className="flex flex-col items-center gap-2 rounded-xl border border-beige bg-ivory px-3 py-4 shadow-sm hover:shadow-md hover:border-[#1877F2] transition-all group"
        >
          <span className="w-10 h-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center group-hover:bg-[#1877F2] transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </span>
          <div className="text-center">
            <p className="text-[10px] text-ink/50 uppercase tracking-widest font-mono">Facebook</p>
            <p className="text-xs text-ink font-medium">VIRAS</p>
          </div>
        </a>
        {/* Instagram */}
        <a
          href={site.social.instagram}
          target="_blank" rel="noreferrer"
          className="flex flex-col items-center gap-2 rounded-xl border border-beige bg-ivory px-3 py-4 shadow-sm hover:shadow-md hover:border-[#ee2a7b] transition-all group"
        >
          <span className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#f9ce34] group-hover:via-[#ee2a7b] group-hover:to-[#6228d7] transition-all">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#ee2a7b] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </span>
          <div className="text-center">
            <p className="text-[10px] text-ink/50 uppercase tracking-widest font-mono">Instagram</p>
            <p className="text-xs text-ink font-medium">@virasstore486</p>
          </div>
        </a>
        {/* TikTok */}
        <a
          href={site.social.tiktok}
          target="_blank" rel="noreferrer"
          className="flex flex-col items-center gap-2 rounded-xl border border-beige bg-ivory px-3 py-4 shadow-sm hover:shadow-md hover:border-ink transition-all group"
        >
          <span className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center group-hover:bg-ink transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-ink group-hover:text-white transition-colors" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.02-.08z"/>
            </svg>
          </span>
          <div className="text-center">
            <p className="text-[10px] text-ink/50 uppercase tracking-widest font-mono">TikTok</p>
            <p className="text-xs text-ink font-medium">@virasstore486</p>
          </div>
        </a>
      </div>
    </div>
  )
}

/** "Connect with VIRAS" section appended to /our-story */
function ConnectSection() {
  return (
    <div className="mt-10 sm:mt-14 border-t border-beige pt-8 sm:pt-10 text-center">
      <p className="text-[10px] uppercase tracking-[0.35em] text-brass font-mono mb-1">Stay Connected</p>
      <h2 className="text-xl sm:text-2xl text-ink mb-2">Connect with VIRAS</h2>
      <div className="w-8 h-px bg-brass mx-auto mb-5" />
      <p className="text-sm text-ink/65 mb-6 leading-relaxed max-w-md mx-auto">
        Follow our journey, see new arrivals first, and reach us directly on WhatsApp or email.
      </p>

      {/* Contact info */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 text-sm">
        <a
          href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#25D366]/30 hover:border-[#25D366] bg-[#25D366]/5 hover:bg-[#25D366]/10 text-ink transition-all group"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#25D366]" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm4.6 13.3c-.2.6-1.2 1.1-1.7 1.2-.5.1-1.1.1-3.5-.9-2.5-1.1-4-3.7-4.2-3.9-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .5.4l.7 1.8c.1.2.1.3 0 .5l-.4.5c-.1.1-.3.3-.1.5.7 1.1 1.5 1.8 2.5 2.3.3.1.4.1.6-.1l.7-.9c.2-.2.3-.2.5-.1l1.7.8c.2.1.3.2.4.3 0 .2 0 .7-.1 1.1z"/>
          </svg>
          {site.phone}
        </a>
        <a
          href={`mailto:${site.email}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brass/30 hover:border-brass bg-brass/5 hover:bg-brass/10 text-ink transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-walnut" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M2 7l10 7 10-7"/>
          </svg>
          {site.email}
        </a>
      </div>

      {/* Social icon row */}
      <div className="flex items-center justify-center gap-3">
        <a href={site.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
          className="w-9 h-9 rounded-full border border-beige hover:border-[#1877F2] bg-ivory hover:bg-[#1877F2] flex items-center justify-center transition-all group">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#1877F2] group-hover:text-white transition-colors" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
        <a href={site.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
          className="w-9 h-9 rounded-full border border-beige hover:border-[#ee2a7b] bg-ivory flex items-center justify-center transition-all group hover:bg-gradient-to-br hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7]">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#ee2a7b] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </a>
        <a href={site.social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"
          className="w-9 h-9 rounded-full border border-beige hover:border-ink bg-ivory hover:bg-ink flex items-center justify-center transition-all group">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-ink group-hover:text-white transition-colors" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.02-.08z"/>
          </svg>
        </a>
      </div>
    </div>
  )
}
