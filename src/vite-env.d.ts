/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORDPRESS_URL?: string
  readonly VITE_WC_URL?: string
  readonly VITE_ORDER_PROXY_URL?: string
  readonly VITE_GA4_ID?: string
  readonly VITE_META_PIXEL_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
