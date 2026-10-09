import type { Line } from '../types'
import { site } from '../config/site'
import { pkr } from './format'

export const CUSTOMIZATION_OPTION_PRICE = 1000

export const SIZE_EXTRA: Record<string, number> = {
  Standard: 0,
  'Standard Size': 0,
  Large: CUSTOMIZATION_OPTION_PRICE,
  'Custom Dimensions': CUSTOMIZATION_OPTION_PRICE,
}

export const WOMEN_EMBROIDERY_PRICE = CUSTOMIZATION_OPTION_PRICE
export const DELIVERY_TIME = site.deliveryTime || '3 to 4 working days'
export const EASYPAISA_NUMBER = site.easypaisa.number || '0309 6424489'
export const EASYPAISA_ACCOUNT_NAME = site.easypaisa.accountName || 'Fasih Ul Hassan'

export const PATTERN_EXTRA: Record<string, number> = {
  Plain: 0,
  'Plain Finish': 0,
  Border: CUSTOMIZATION_OPTION_PRICE,
  'Border stripe': CUSTOMIZATION_OPTION_PRICE,
  'Handwoven Border': CUSTOMIZATION_OPTION_PRICE,
  'Traditional Pattern': CUSTOMIZATION_OPTION_PRICE,
  Embroidered: WOMEN_EMBROIDERY_PRICE,
  'Embroidered Finish': WOMEN_EMBROIDERY_PRICE,
  'Hand embroidery': WOMEN_EMBROIDERY_PRICE,
  Custom: CUSTOMIZATION_OPTION_PRICE,
}

export const customPrice = (base: number, size: string = 'Standard Size', pattern: string = 'Plain') =>
  base + (SIZE_EXTRA[size] ?? 0) + (PATTERN_EXTRA[pattern] ?? 0)

export const SHIPPING_FEE = site.shippingFee ?? 250
export const FREE_SHIPPING_THRESHOLD = 5000
export const calcShipping = (amount: number = 0) =>
  amount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

export function shippingOfferMessage(amount: number, hasItems: boolean) {
  if (amount >= FREE_SHIPPING_THRESHOLD) return 'Free Shipping'
  if (!hasItems) return `Free Shipping on orders above ${pkr(FREE_SHIPPING_THRESHOLD)}`
  return `Add ${pkr(FREE_SHIPPING_THRESHOLD - amount)} more to get Free Shipping`
}

export function bundleDiscount(men: number[], women: number[]) {
  const n = Math.min(men.length, women.length)
  return [...men.slice(0, n), ...women.slice(0, n)].reduce((a, b) => a + b, 0) * site.coupleDiscount
}

export function totals(lines: Line[]) {
  const std = lines.filter(l => !l.custom)
  const discount = bundleDiscount(std.filter(l => l.category === 'men').map(l => l.unit), std.filter(l => l.category === 'women').map(l => l.unit))
  const subtotal = lines.reduce((a, l) => a + l.unit, 0)
  const gift = lines.filter(l => l.gift).reduce((sum, l) => sum + (l.giftDetails?.packagingPrice ?? site.giftBoxPrice), 0)
  const orderValue = subtotal - discount + gift
  const shipping = lines.length > 0 ? calcShipping(orderValue) : 0
  const total = orderValue + shipping
  const customTotal = lines.filter(l => l.custom).reduce((a, l) => a + l.unit, 0)
  const balanceCOD = Math.round(customTotal * (1 - site.advanceRate))
  return { subtotal, discount, gift, orderValue, shipping, total, hasCustom: customTotal > 0, customTotal, balanceCOD, dueNow: total - balanceCOD }
}
