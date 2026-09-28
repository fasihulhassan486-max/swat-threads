# Swat Threads
`npm install` then `npm run dev`.
- Config: src/config/site.ts (WhatsApp, email, social links). Secrets/IDs: copy .env.example to .env.
- WooCommerce: set VITE_WC_URL. Create categories with slugs `men` and `women`, set stock 1 per product. Products load from the public Store API; orders POST to /wc/v3/orders (use VITE_ORDER_PROXY_URL in production so keys stay secret).
- Analytics: set VITE_GA4_ID (Google Analytics 4) and VITE_META_PIXEL_ID (Meta). Both get the same events. Events sent: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase.
- Our Story video: save as public/videos/our-story.mp4.
- Hosting: enable SPA rewrite (all routes -> index.html) so shared/ad links open correctly.
