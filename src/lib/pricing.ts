import type { Line } from '../types'
import { site } from '../config/site'

export const SIZE_EXTRA: Record<string, number> = {
  Standard: 0,
  'Standard Size': 0,
  Large: 1500,
  'Custom Dimensions': 1500,
}

export const WOMEN_EMBROIDERY_PRICE = 1000
export const DELIVERY_TIME = site.deliveryTime || '3 to 4 Working Days'
export const EASYPAISA_NUMBER = site.easypaisa.number || '0329 6424489'
export const EASYPAISA_ACCOUNT_NAME = site.easypaisa.accountName || 'Fasih Ul Hassan'

export const PATTERN_EXTRA: Record<string, number> = {
  Plain: 0,
  'Plain Finish': 0,
  Border: 1000,
  'Border stripe': 1000,
  'Handwoven Border': 1000,
  'Traditional Pattern': 1500,
  Embroidered: WOMEN_EMBROIDERY_PRICE,
  'Embroidered Finish': WOMEN_EMBROIDERY_PRICE,
  'Hand embroidery': WOMEN_EMBROIDERY_PRICE,
  Custom: 1500,
}

export const customPrice = (base: number, size: string = 'Standard Size', pattern: string = 'Plain') =>
  base + (SIZE_EXTRA[size] ?? 0) + (PATTERN_EXTRA[pattern] ?? 0)

export const SHIPPING_FEE = site.shippingFee ?? 250
export const FREE_SHIPPING_THRESHOLD = 5000
export const calcShipping = (subtotal: number = 0) => subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

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
  const shipping = lines.length > 0 ? calcShipping(subtotal - discount) : 0
  const total = orderValue + shipping
  const customTotal = lines.filter(l => l.custom).reduce((a, l) => a + l.unit, 0)
  const balanceCOD = Math.round(customTotal * (1 - site.advanceRate))
  return { subtotal, discount, gift, shipping, total, hasCustom: customTotal > 0, customTotal, balanceCOD, dueNow: total - balanceCOD }
}
