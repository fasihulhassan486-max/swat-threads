export const site = {
  name: 'VIRAS | Swat Shawls',
  url: 'https://www.virasstore.com',
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
  ga4Id: import.meta.env.VITE_GA4_ID ?? '', // Google Analytics 4 (G-XXXXXXX)
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID ?? '', // Meta (Facebook/Instagram) Pixel
  giftBoxPrice: 390,
  giftPackagingLabel: 'Signature Gift Packaging, Satin Ribbon & Handwritten Card',
  coupleDiscount: 0.1, advanceRate: 0.5,
  shippingFee: 250,
  deliveryTime: '3 to 4 working days',
  easypaisa: {
    number: '0309 6424489',
    accountName: 'Fasih Ul Hassan',
  },
  wc: { // Public WooCommerce Store API and trusted order endpoint
    url: import.meta.env.VITE_WORDPRESS_URL ?? import.meta.env.VITE_WC_URL ?? '',
    orderProxy: import.meta.env.VITE_ORDER_PROXY_URL ?? '',
    paymentIds: { easypaisa: 'easypaisa', cod: 'cod', card: 'card' } as Record<string, string>,
  },
}
