export type Category = 'men' | 'women'
export interface Product { id: string; sku: string; name: string; price: number; originalPrice?: number; category: Category; badge?: string; description: string; tone: string; stockQuantity: number; images: string[] }
export interface CustomSpec { baseId: string; color: string; size: string; pattern: string; notes: string }
export interface Line { id: string; productId?: string; category?: Category; name: string; unit: number; gift: boolean; note: string; packing?: string; colorNote?: string; custom?: CustomSpec }
