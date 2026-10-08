const env = import.meta.env
export const site = {
  name: 'VIRAS | Swat Shawls',
  url: 'https://virasstore.com',
  whatsapp: '923096424489', // country code + number, no "+"
  whatsappMessage: 'Assalam o Alaikum! I have an inquiry about a VIRAS shawl.',
  email: 'virasstore486@gmail.com',
  phone: '+92 309 6424489',
  social: {
    facebook: 'https://facebook.com/people/VIRAS/61594853384047/',
    instagram: 'https://instagram.com/virasstore486/',
    tiktok: 'https://tiktok.com/@virasstore486',
    youtube: '',
  } as Record<string, string>, // empty = hidden
  heroImage: '/images/swat-mountains.jpg', // or paste a full URL, e.g. from your WordPress Media Library
  heroModels: '/images/hero-models.png',
  heroVideo: '', // optional looping .mp4 for the home hero
  storyVideo: '/videos/our-story.mp4', // drop your file at public/videos/our-story.mp4
  ga4Id: (env.VITE_GA4_ID as string) ?? '', // Google Analytics 4 (G-XXXXXXX)
  metaPixelId: (env.VITE_META_PIXEL_ID as string) ?? '', // Meta (Facebook/Instagram) Pixel
  giftBoxPrice: 390, coupleDiscount: 0.1, advanceRate: 0.5,
  shippingFee: 250,
  deliveryTime: '3 to 4 Working Days',
  easypaisa: {
    number: '0329 6424489',
    accountName: 'Fasih Ul Hassan',
  },
  wc: { // WooCommerce — set these in .env (see .env.example)
    url: (env.VITE_WORDPRESS_URL as string) ?? (env.VITE_WC_URL as string) ?? '',
    key: (env.VITE_WC_CONSUMER_KEY as string) ?? (env.VITE_WC_KEY as string) ?? '',
    secret: (env.VITE_WC_CONSUMER_SECRET as string) ?? (env.VITE_WC_SECRET as string) ?? '',
    orderProxy: (env.VITE_ORDER_PROXY_URL as string) ?? '',
    paymentIds: { easypaisa: 'easypaisa', cod: 'cod', card: 'card', jazzcash: 'jazzcash' } as Record<string, string>, // your WooCommerce gateway IDs
  },
}
