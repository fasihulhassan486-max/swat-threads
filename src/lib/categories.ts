import type { Category, Product } from '../types'

export function parseWooCategories(
  rawCategories: any,
  productName = ''
): { category: Category; categories: string[] } {
  const catsArray = Array.isArray(rawCategories) ? rawCategories : []

  const slugs: string[] = []
  const names: string[] = []

  for (const c of catsArray) {
    if (typeof c === 'string' && c.trim()) {
      slugs.push(c.trim().toLowerCase())
    } else if (c && typeof c === 'object') {
      if (typeof c.slug === 'string' && c.slug.trim()) {
        slugs.push(c.slug.trim().toLowerCase())
      }
      if (typeof c.name === 'string' && c.name.trim()) {
        names.push(c.name.trim().toLowerCase())
      }
    }
  }

  const allTokens = [...slugs, ...names]
  const cleanName = (productName || '').toLowerCase()

  const hasToken = (regex: RegExp, directSlugs: string[]) =>
    allTokens.some(t => directSlugs.includes(t) || regex.test(t)) || regex.test(cleanName)

  const isCouple = hasToken(
    /(?:^|[\s_-])couples?(?:[\s_-]|$)|couple-bundle|his-and-hers/i,
    ['couple-bundle', 'couple', 'couples', 'couple-set', 'couples-bundle']
  )

  const isWomen = hasToken(
    /(?:^|[\s_-])womens?(?:[\s_'-]|$)/i,
    ['women', 'womens', 'women-shawls', 'womens-shawls']
  )

  const isMen = hasToken(
    /(?:^|[\s_-])mens?(?:[\s_'-]|$)/i,
    ['men', 'mens', 'men-shawls', 'mens-shawls']
  )

  const isGifting = hasToken(
    /(?:^|[\s_-])gifts?(?:ing)?(?:[\s_-]|$)/i,
    ['gifting', 'gift', 'gifts']
  )

  let primaryCategory: Category = 'men'
  if (isCouple) {
    primaryCategory = 'couple-bundle'
  } else if (isWomen) {
    primaryCategory = 'women'
  } else if (isGifting) {
    primaryCategory = 'gifting'
  } else if (isMen) {
    primaryCategory = 'men'
  } else if (slugs[0]) {
    primaryCategory = slugs[0] as Category
  }

  const uniqueCategories = Array.from(
    new Set([...slugs, primaryCategory].filter(Boolean))
  )

  return { category: primaryCategory, categories: uniqueCategories }
}

export function matchesCategory(product: Product, targetCategory: string | null): boolean {
  if (!targetCategory || targetCategory === 'all') return true

  const target = targetCategory.toLowerCase().trim()
  const primary = (product.category || '').toLowerCase().trim()
  const allCats = Array.from(
    new Set([primary, ...(product.categories || []).map(c => c.toLowerCase().trim())])
  ).filter(Boolean)

  if (target === 'men' || target === 'mens') {
    if (primary === 'men') return true
    if (primary !== 'couple-bundle' && allCats.some(c => c === 'men' || c === 'mens' || /(?:^|[\s_-])mens?(?:[\s_'-]|$)/i.test(c))) {
      return true
    }
    return false
  }

  if (target === 'women' || target === 'womens') {
    if (primary === 'women') return true
    if (primary !== 'couple-bundle' && allCats.some(c => c === 'women' || c === 'womens' || /(?:^|[\s_-])womens?(?:[\s_'-]|$)/i.test(c))) {
      return true
    }
    return false
  }

  if (target === 'couple-bundle' || target === 'couple' || target === 'couples') {
    if (primary === 'couple-bundle' || primary === 'couple') return true
    return allCats.some(
      c =>
        c === 'couple-bundle' ||
        c === 'couple' ||
        c === 'couples' ||
        /(?:^|[\s_-])couples?(?:[\s_-]|$)|couple-bundle|his-and-hers/i.test(c)
    )
  }

  if (target === 'gifting' || target === 'gift') {
    if (primary === 'gifting') return true
    return allCats.some(c => c === 'gifting' || /(?:^|[\s_-])gifts?(?:ing)?(?:[\s_-]|$)/i.test(c))
  }

  return (
    primary === target ||
    allCats.includes(target) ||
    allCats.some(c => c.includes(target) || target.includes(c))
  )
}
