export type Category = 'men' | 'women' | string
export interface Product { id: string; sku: string; name: string; price: number; originalPrice?: number; category: Category; badge?: string; description: string; tone: string; stockQuantity: number; images: string[]; image?: string }
export interface CustomSpec {
  baseId: string
  color: string
  size: string
  pattern: string
  notes: string
  customizationType?: 'men' | 'women' | 'couple' | string
  customColor?: string
  styleFinish?: string
  customDimensions?: string
  specialInstructions?: string
  referenceImage?: string
  fabric?: string
  style?: string
  mensColor?: string
  mensCustomColor?: string
  mensDesign?: string
  mensSpecialRequest?: string
  womensFabric?: string
  womensColor?: string
  womensCustomColor?: string
  womensDesign?: string
  womensSpecialRequest?: string
  sharedCoupleCustomization?: string
}
export interface GiftDetails { recipientName?: string; senderName?: string; message?: string; packaging?: string; packagingPrice?: number; occasion?: string }
export interface Line { id: string; productId?: string; category?: Category; name: string; unit: number; gift: boolean; note: string; packing?: string; colorNote?: string; custom?: CustomSpec; giftDetails?: GiftDetails }
