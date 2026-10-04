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
      {pathname === '/contact' && (
        <ul className="mb-6 space-y-2 text-ink text-sm sm:text-base">
          <li>
            <a className="underline hover:text-walnut" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </li>
          {Object.entries(site.social).filter(([, u]) => u).map(([k, u]) => (
            <li key={k}>
              <a className="capitalize underline hover:text-walnut" href={u} target="_blank" rel="noreferrer">
                {k}
              </a>
            </li>
          ))}
        </ul>
      )}
      {pathname === '/contact' && (
        <div className="mt-4">
          <a
            className="btn-primary py-3.5 px-6 inline-block"
            href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`}
            target="_blank"
            rel="noreferrer"
          >
            Chat on WhatsApp
          </a>
        </div>
      )}
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
