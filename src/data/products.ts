import type { Product } from '../types'
// MOCK DATA — replace with WooCommerce REST (GET /wp-json/wc/v3/products). Map stock_quantity -> stockQuantity, categories -> category.
export const products: Product[] = [
  { id: 'p1', sku: 'ST-M-001', name: 'Karakoram Ash Shawl', price: 9500, category: 'men', badge: 'Best seller', tone: '#8a8478', stockQuantity: 1, images: [], description: 'Handwoven from high-altitude Swat wool in a quiet ash-grey herringbone. Warm, substantial, and made to be inherited.' },
  { id: 'p2', sku: 'ST-M-002', name: 'Pine Forest Wrap', price: 11000, originalPrice: 12500, category: 'men', badge: 'Premium', tone: '#3b5a47', stockQuantity: 1, images: [], description: 'Deep forest tones with a fine border, woven on a traditional wooden loom.' },
  { id: 'p3', sku: 'ST-M-003', name: 'Walnut Valley Shawl', price: 8500, category: 'men', tone: '#6b4f3a', stockQuantity: 1, images: [], description: 'A walnut-brown everyday shawl with a soft, dense hand-feel.' },
  { id: 'p4', sku: 'ST-W-001', name: 'Saffron Meadow Shawl', price: 10500, category: 'women', badge: 'Heritage', tone: '#b98a3e', stockQuantity: 1, images: [], description: 'Warm saffron wool with hand-finished tassels, inspired by Swat spring meadows.' },
  { id: 'p5', sku: 'ST-W-002', name: 'Rosewood Dusk Wrap', price: 12000, category: 'women', badge: 'Premium', tone: '#9a5b55', stockQuantity: 1, images: [], description: 'A muted rosewood wrap with fine embroidered edges.' },
  { id: 'p6', sku: 'ST-W-003', name: 'Ivory Snowline Shawl', price: 9800, category: 'women', badge: 'Best seller', tone: '#d9cfbb', stockQuantity: 1, images: [], description: 'Natural undyed ivory wool, light yet warm.' },
  { id: 'p7', sku: 'ST-M-004', name: 'Charcoal Summit Shawl', price: 9000, category: 'men', badge: 'Heritage', tone: '#4a4c49', stockQuantity: 1, images: [], description: 'A timeless charcoal shawl for anyone, anywhere.' },
  { id: 'p8', sku: 'ST-W-004', name: 'Indigo Stream Wrap', price: 10200, category: 'women', tone: '#33465e', stockQuantity: 0, images: [], description: 'Indigo wool with a subtle stream-like weave. This one-of-one has found its home.' },
]
