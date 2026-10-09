import { useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { site } from '../config/site'
import { useStore } from '../context/StoreContext'
import { stripHtml } from '../lib/html'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function setJsonLd(id: string, data: object | null) {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

const origin = site.url.replace(/\/$/, '')

export default function Seo() {
  const { pathname, search } = useLocation()
  const id = pathname.match(/^\/product\/([^/]+)/)?.[1]
  const [q] = useSearchParams()
  const { products, featuredProducts } = useStore()
  const product = pathname.startsWith('/product/')
    ? products.find(p => p.id === id) || featuredProducts.find(p => p.id === id)
    : undefined

  useEffect(() => {
    const cat = (q.get('category') || '').toLowerCase()
    const wishlist = Boolean(q.get('wishlist'))
    const privateRoute = ['/cart', '/checkout', '/order-confirmation'].includes(pathname) || wishlist

    let title = 'Viras | Premium Wool Shawls from Swat, Pakistan'
    let description = 'Discover premium Swati wool shawls at Viras, combining traditional craftsmanship with timeless style. Explore men\'s and women\'s shawls and custom designs.'
    let canonicalPath = pathname === '/' ? '/' : pathname
    let ogImage = `${origin}/images/swat-mountains.jpg`

    if (pathname === '/shop' && cat === 'men') {
      title = "Men's Wool Shawls from Swat | Viras"
      description = "Shop men's wool shawls from Swat Valley at Viras. Traditional Swati craftsmanship in a considered collection of one-of-one pieces."
      canonicalPath = '/shop?category=men'
    } else if (pathname === '/shop' && cat === 'women') {
      title = "Women's Wool Shawls from Swat | Viras"
      description = "Shop women's wool shawls from Swat at Viras, including wool and Swiss Lawn options for everyday wear, evenings, and gifting."
      canonicalPath = '/shop?category=women'
    } else if (pathname === '/shop' && wishlist) {
      title = 'Your Wishlist | Viras'
      description = 'Saved shawls from the Viras collection of Swati wool wraps.'
    } else if (pathname === '/shop') {
      title = 'Shop Premium Wool Shawls | Viras'
      description = 'Browse the Viras collection of premium wool shawls from Swat, Pakistan, including men\'s, women\'s, and custom designs.'
    } else if (pathname === '/couple-bundle') {
      title = 'Couple Shawl Bundles | Viras'
      description = 'His and hers shawl bundles from Swat Valley, with coordinated Viras pieces made for sharing and gifting.'
    } else if (pathname === '/gifting') {
      title = 'Wool Shawl Gift Packaging | Viras'
      description = 'Gift a Swati wool shawl from Viras with signature packaging, a handwritten card, and nationwide delivery across Pakistan.'
    } else if (pathname === '/customize') {
      title = 'Custom Shawls in Pakistan | Viras'
      description = 'Design a custom shawl with Viras. Choose colour, finish, embroidery, and dimensions — handcrafted in Swat Valley.'
    } else if (pathname === '/our-story') {
      title = 'Our Story | Viras Swat Heritage Shawls'
      description = 'Viras sources handcrafted shawls from Swat Valley, Pakistan, connecting traditional craftsmanship with modern wardrobes.'
    } else if (pathname === '/contact') {
      title = 'Contact Viras | Swat Wool Shawls'
      description = 'Contact Viras on WhatsApp or email for orders, custom shawls, and questions about Swati wool shawls.'
    } else if (pathname === '/shipping') {
      title = 'Shipping Policy | Viras'
      description = 'Nationwide delivery across Pakistan. Estimated delivery is 3 to 4 working days. Standard shipping is PKR 250 per order.'
    } else if (pathname === '/returns') {
      title = 'Returns & Refunds | Viras'
      description = 'Read the Viras returns policy for ready shawls and custom orders made in Swat Valley.'
    } else if (pathname === '/privacy') {
      title = 'Privacy Policy | Viras'
      description = 'How Viras collects and uses the details needed to deliver your shawl order.'
    } else if (pathname === '/terms') {
      title = 'Terms | Viras'
      description = 'Terms for ordering one-of-one shawls from the Viras collection.'
    } else if (pathname === '/cart') {
      title = 'Cart | Viras'
      description = 'Review the shawls in your Viras cart before checkout.'
    } else if (pathname === '/checkout') {
      title = 'Checkout | Viras'
      description = 'Complete your Viras order with nationwide delivery across Pakistan.'
    } else if (pathname === '/order-confirmation') {
      title = 'Order Confirmed | Viras'
      description = 'Thank you for your Viras order.'
    } else if (product) {
      const short = stripHtml(product.short_description || product.description || '')
      title = `${product.name} | Viras`
      description = short
        ? short.slice(0, 155)
        : `${product.name} — a premium wool shawl from Swat, available at Viras.`
      ogImage = product.image || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.src) || ogImage
    }

    const canonical = `${origin}${canonicalPath}`
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', privateRoute ? 'noindex, nofollow' : 'index, follow')
    upsertMeta('property', 'og:type', product ? 'product' : 'website')
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:site_name', 'Viras')
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertLink('canonical', canonical)

    const org = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Viras',
      url: origin,
      email: site.email,
      telephone: site.phone,
      sameAs: [site.social.facebook, site.social.instagram, site.social.tiktok].filter(Boolean),
    }
    const website = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Viras',
      url: origin,
    }
    setJsonLd('viras-org-jsonld', pathname === '/' ? { '@context': 'https://schema.org', '@graph': [org, website] } : org)

    if (product) {
      const image = product.image || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.src)
      const inStock = product.stockQuantity > 0
      const productLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: image ? [image] : undefined,
        description: stripHtml(product.description || product.short_description || ''),
        sku: product.sku || undefined,
        brand: { '@type': 'Brand', name: 'Viras' },
        offers: {
          '@type': 'Offer',
          url: canonical,
          priceCurrency: 'PKR',
          price: Number(product.price).toFixed(2),
          availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      }
      const crumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: product.category === 'women' ? "Women's Shawls" : product.category === 'couple-bundle' ? 'Couple Bundles' : "Men's Shawls",
            item: `${origin}/shop?category=${product.category === 'couple-bundle' ? 'couple-bundle' : product.category === 'women' ? 'women' : 'men'}`,
          },
          { '@type': 'ListItem', position: 3, name: product.name, item: canonical },
        ],
      }
      setJsonLd('viras-product-jsonld', productLd)
      setJsonLd('viras-breadcrumb-jsonld', crumbs)
    } else {
      setJsonLd('viras-product-jsonld', null)
      setJsonLd('viras-breadcrumb-jsonld', null)
    }
  }, [pathname, search, product])

  return null
}
