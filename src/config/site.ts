const env = import.meta.env
export const site = {
  name: 'Swat Threads',
  whatsapp: '923000000000', // country code + number, no "+"
  whatsappMessage: 'Assalam o Alaikum! I have an inquiry about a Swat Threads shawl.',
  email: 'yourbrand@gmail.com',
  social: { instagram: 'https://instagram.com/yourhandle', facebook: 'https://facebook.com/yourpage', tiktok: 'https://tiktok.com/@yourhandle', youtube: '' } as Record<string, string>, // empty = hidden
  heroImage: '/images/swat-mountains.jpg', // or paste a full URL, e.g. from your WordPress Media Library
  heroModels: '/images/hero-models.png',
  heroVideo: '', // optional looping .mp4 for the home hero
  storyVideo: '/videos/our-story.mp4', // drop your file at public/videos/our-story.mp4
  ga4Id: (env.VITE_GA4_ID as string) ?? '', // Google Analytics 4 (G-XXXXXXX)
  metaPixelId: (env.VITE_META_PIXEL_ID as string) ?? '', // Meta (Facebook/Instagram) Pixel
  giftBoxPrice: 500, coupleDiscount: 0.1, advanceRate: 0.5,
  wc: { // WooCommerce — set these in .env (see .env.example)
    url: (env.VITE_WC_URL as string) ?? '', key: (env.VITE_WC_KEY as string) ?? '', secret: (env.VITE_WC_SECRET as string) ?? '',
    orderProxy: (env.VITE_ORDER_PROXY_URL as string) ?? '',
    paymentIds: { card: 'card', jazzcash: 'jazzcash', cod: 'cod' } as Record<string, string>, // your WooCommerce gateway IDs
  },
}
