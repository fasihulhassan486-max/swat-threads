import type { Category, Product } from '../types'

const categoryAliases: Record<string, string[]> = {
  men: ['men', 'mens', 'men-shawls', 'mens-shawls'],
  women: ['women', 'womens', 'women-shawls', 'womens-shawls'],
  'couple-bundle': ['couple', 'couples', 'couple-set', 'couple-bundle', 'couples-bundle', 'his-and-hers'],
  gifting: ['gift', 'gifts', 'gifting', 'gift-card', 'gift-cards', 'gift-packaging', 'packaging'],
}

type WooCategory = { id?: number | string; name?: string; slug?: string }

function categoryValues(rawCategories: unknown): string[] {
  if (!Array.isArray(rawCategories)) return []
  return rawCategories.flatMap((item: unknown) => {
    if (typeof item === 'string') return [item.trim().toLowerCase()].filter(Boolean)
    if (!item || typeof item !== 'object') return []
    const category = item as WooCategory
    return [category.slug, category.name, category.id?.toString()]
      .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
      .map(value => value.trim().toLowerCase())
  })
}

export function parseWooCategories(
  rawCategories: unknown,
  _productName = ''
): { category: Category; categories: string[] } {
  const categories = Array.from(new Set(categoryValues(rawCategories)))
  const slugs = new Set(categories)
  const primaryCategory = (['couple-bundle', 'women', 'gifting', 'men'] as const)
    .find(category => categoryAliases[category].some(alias => slugs.has(alias)))

  return {
    category: primaryCategory || categories.find(value => !/^\d+$/.test(value)) || 'uncategorized',
    categories,
  }
}

export function matchesCategory(product: Product, targetCategory: string | null): boolean {
  if (!targetCategory || targetCategory.toLowerCase() === 'all') return true

  const target = targetCategory.trim().toLowerCase()
  const categories = new Set([
    (product.category || '').toLowerCase().trim(),
    ...(product.categories || []).map(category => category.toLowerCase().trim()),
  ])
  const isCouple = categories.has('couple-bundle') ||
    categoryAliases['couple-bundle'].some(alias => categories.has(alias))

  if (/^\d+$/.test(target)) return categories.has(target)

  const canonicalTarget = Object.keys(categoryAliases).find(category =>
    categoryAliases[category].includes(target)
  )
  if (!canonicalTarget) return categories.has(target)
  if (canonicalTarget === 'couple-bundle') return isCouple
  if ((canonicalTarget === 'men' || canonicalTarget === 'women') && isCouple) return false
  return categoryAliases[canonicalTarget].some(alias => categories.has(alias))
}
