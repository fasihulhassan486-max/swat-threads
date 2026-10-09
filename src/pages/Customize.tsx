import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { matchesCategory, useStore } from '../context/StoreContext'
import { Media, Icon } from '../components/ui'
import { customPrice, CUSTOMIZATION_OPTION_PRICE, WOMEN_EMBROIDERY_PRICE } from '../lib/pricing'
import { pkr } from '../lib/format'
import { site } from '../config/site'
import type { Product, CustomSpec } from '../types'

// ─── COLOR PALETTES ──────────────────────────────────────────────────────────

interface ColorOption {
  name: string
  hex: string
  border?: boolean
}

const MENS_COLORS: ColorOption[] = [
  { name: 'Cream', hex: '#F7F4EB', border: true },
  { name: 'Black', hex: '#1C1E1D' },
  { name: 'Maroon', hex: '#581825' },
  { name: 'Brown', hex: '#4A3525' },
  { name: 'Navy', hex: '#1D263B' },
]

const WOMENS_COLORS: ColorOption[] = [
  { name: 'Ivory / Cream', hex: '#F7F4EB', border: true },
  { name: 'Saffron', hex: '#C88C32' },
  { name: 'Rosewood', hex: '#935359' },
  { name: 'Emerald Green', hex: '#284E3A' },
  { name: 'Charcoal', hex: '#333735' },
  { name: 'Walnut Brown', hex: '#4A3525' },
]

// ─── STYLES & SIZES ──────────────────────────────────────────────────────────

const MENS_STYLES = ['Plain', 'Border', 'Traditional Pattern', 'Custom'] as const
const MENS_SIZES = ['Standard Size', 'Custom Dimensions'] as const

const WOMENS_FABRICS = ['Wool', 'Swiss Lawn'] as const
const WOMENS_STYLES = ['Plain', 'Embroidered', 'Handwoven Border', 'Custom'] as const

const COUPLE_MENS_DESIGNS = ['Plain', 'Border'] as const
const COUPLE_WOMENS_DESIGNS = ['Plain', 'Embroidered'] as const

export default function Customize() {
  const { addCustom, products, loading, productsError, reloadProducts } = useStore()
  const nav = useNavigate()
  const [searchParams] = useSearchParams()

  // Selected base product
  const [base, setBase] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'men' | 'women' | 'couple'>('all')

  // Auto-open modal if ?id= is in query
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      const found = products.find(p => p.id === id)
      if (found) setBase(found)
    }
  }, [searchParams, products])

  // Determine context
  const context = useMemo<'men' | 'women' | 'couple'>(() => {
    if (!base) return 'men'
    if (base.category === 'couple-bundle' || base.category === 'couple' || base.name.toLowerCase().includes('couple')) {
      return 'couple'
    }
    if (base.category === 'women' || base.name.toLowerCase().includes('women')) {
      return 'women'
    }
    return 'men'
  }, [base])

  // ─── FORM STATES ───────────────────────────────────────────────────────────

  // Shared
  const [refFile, setRefFile] = useState<{ name: string; size: number; preview?: string } | null>(null)

  // Men's state
  const [mensColor, setMensColor] = useState<string>('Cream')
  const [mensCustomColor, setMensCustomColor] = useState<string>('')
  const [mensStyle, setMensStyle] = useState<string>('Plain')
  const [mensSize, setMensSize] = useState<string>('Standard Size')
  const [mensCustomDimensions, setMensCustomDimensions] = useState<string>('')
  const [mensInstructions, setMensInstructions] = useState<string>('')

  // Women's state
  const [womensFabric, setWomensFabric] = useState<string>('Wool')
  const [womensColor, setWomensColor] = useState<string>('Ivory / Cream')
  const [womensCustomColor, setWomensCustomColor] = useState<string>('')
  const [womensStyle, setWomensStyle] = useState<string>('Plain')
  const [womensInstructions, setWomensInstructions] = useState<string>('')

  // Couple Bundle state
  const [coupleMensColor, setCoupleMensColor] = useState<string>('Cream')
  const [coupleMensCustomColor, setCoupleMensCustomColor] = useState<string>('')
  const [coupleMensDesign, setCoupleMensDesign] = useState<string>('Plain')
  const [coupleMensRequest, setCoupleMensRequest] = useState<string>('')

  const [coupleWomensFabric, setCoupleWomensFabric] = useState<string>('Wool')
  const [coupleWomensColor, setCoupleWomensColor] = useState<string>('Ivory / Cream')
  const [coupleWomensCustomColor, setCoupleWomensCustomColor] = useState<string>('')
  const [coupleWomensDesign, setCoupleWomensDesign] = useState<string>('Plain')
  const [coupleWomensRequest, setCoupleWomensRequest] = useState<string>('')

  const [coupleSharedRequest, setCoupleSharedRequest] = useState<string>('')

  // Reset form when base changes
  const openCustomization = (p: Product) => {
    setBase(p)
    setRefFile(null)
    setMensColor('Cream')
    setMensCustomColor('')
    setMensStyle('Plain')
    setMensSize('Standard Size')
    setMensCustomDimensions('')
    setMensInstructions('')
    setWomensFabric('Wool')
    setWomensColor('Ivory / Cream')
    setWomensCustomColor('')
    setWomensStyle('Plain')
    setWomensInstructions('')
    setCoupleMensColor('Cream')
    setCoupleMensCustomColor('')
    setCoupleMensDesign('Plain')
    setCoupleMensRequest('')
    setCoupleWomensFabric('Wool')
    setCoupleWomensColor('Ivory / Cream')
    setCoupleWomensCustomColor('')
    setCoupleWomensDesign('Plain')
    setCoupleWomensRequest('')
    setCoupleSharedRequest('')
  }

  // Handle optional image upload
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (e.g. JPG, PNG, WEBP).')
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('The selected reference image exceeds the 5MB file size limit. Please choose a smaller image.')
      e.target.value = ''
      return
    }

    const preview = URL.createObjectURL(file)
    setRefFile({ name: file.name, size: file.size, preview })
  }

  const clearFile = () => {
    if (refFile?.preview) URL.revokeObjectURL(refFile.preview)
    setRefFile(null)
  }

  // ─── DYNAMIC TITLE & PRICING ───────────────────────────────────────────────

  const modalTitle = useMemo(() => {
    if (context === 'couple') return 'Customize Your Couple Bundle'
    if (context === 'women') return "Customize Your Women's Shawl"
    return "Customize Your Men's Shawl"
  }, [context])

  const total = useMemo(() => {
    if (!base) return 0
    if (context === 'men') {
      return customPrice(base.price, mensSize, mensStyle)
    }
    if (context === 'women') {
      return customPrice(base.price, 'Standard Size', womensStyle)
    }
    // Couple bundle: use base bundle price plus any design add-ons
    const menExtra = coupleMensDesign === 'Border' ? CUSTOMIZATION_OPTION_PRICE : 0
    const womenExtra = coupleWomensDesign === 'Embroidered' ? WOMEN_EMBROIDERY_PRICE : 0
    return base.price + menExtra + womenExtra
  }, [base, context, mensSize, mensStyle, womensStyle, coupleMensDesign, coupleWomensDesign])

  const advance = Math.round(total * site.advanceRate)
  const codBalance = total - advance

  // ─── VALIDATION ────────────────────────────────────────────────────────────

  const isValid = useMemo(() => {
    if (!base) return false
    if (context === 'men') {
      if (mensColor === 'Custom' && !mensCustomColor.trim()) return false
      if (mensSize === 'Custom Dimensions' && !mensCustomDimensions.trim()) return false
      return true
    }
    if (context === 'women') {
      if (womensColor === 'Custom' && !womensCustomColor.trim()) return false
      return true
    }
    if (context === 'couple') {
      if (coupleMensColor === 'Custom' && !coupleMensCustomColor.trim()) return false
      if (coupleWomensColor === 'Custom' && !coupleWomensCustomColor.trim()) return false
      return true
    }
    return true
  }, [
    base,
    context,
    mensColor,
    mensCustomColor,
    mensSize,
    mensCustomDimensions,
    womensColor,
    womensCustomColor,
    coupleMensColor,
    coupleMensCustomColor,
    coupleWomensColor,
    coupleWomensCustomColor,
  ])

  // ─── CART SUBMISSION ───────────────────────────────────────────────────────

  const handleAddToCart = () => {
    if (!base || !isValid) return

    const refString = refFile ? `${refFile.name} (${Math.round(refFile.size / 1024)} KB)` : undefined

    let customPayload: CustomSpec

    if (context === 'men') {
      const chosenColor = mensColor === 'Custom' ? `Custom: ${mensCustomColor.trim()}` : mensColor
      const chosenSize = mensSize === 'Custom Dimensions' ? `Custom: ${mensCustomDimensions.trim()}` : mensSize
      customPayload = {
        baseId: base.id,
        color: chosenColor,
        size: chosenSize,
        pattern: mensStyle,
        notes: mensInstructions.trim(),
        customizationType: 'men',
        customColor: mensColor === 'Custom' ? mensCustomColor.trim() : undefined,
        styleFinish: mensStyle,
        customDimensions: mensSize === 'Custom Dimensions' ? mensCustomDimensions.trim() : undefined,
        specialInstructions: mensInstructions.trim(),
        referenceImage: refString,
      }
    } else if (context === 'women') {
      const chosenColor = womensColor === 'Custom' ? `Custom: ${womensCustomColor.trim()}` : womensColor
      customPayload = {
        baseId: base.id,
        color: chosenColor,
        size: 'Standard Size',
        pattern: womensStyle,
        notes: womensInstructions.trim(),
        customizationType: 'women',
        fabric: womensFabric,
        customColor: womensColor === 'Custom' ? womensCustomColor.trim() : undefined,
        style: womensStyle,
        styleFinish: womensStyle,
        specialInstructions: womensInstructions.trim(),
        referenceImage: refString,
      }
    } else {
      // Couple bundle
      const mColor = coupleMensColor === 'Custom' ? `Custom: ${coupleMensCustomColor.trim()}` : coupleMensColor
      const wColor = coupleWomensColor === 'Custom' ? `Custom: ${coupleWomensCustomColor.trim()}` : coupleWomensColor
      const combinedNotes = [
        coupleMensRequest.trim() && `Men's: ${coupleMensRequest.trim()}`,
        coupleWomensRequest.trim() && `Women's: ${coupleWomensRequest.trim()}`,
        coupleSharedRequest.trim() && `Couple Coordination: ${coupleSharedRequest.trim()}`,
      ]
        .filter(Boolean)
        .join(' | ')

      customPayload = {
        baseId: base.id,
        color: `His: ${mColor} / Hers: ${wColor}`,
        size: 'Coordinated Couple Set',
        pattern: `His: ${coupleMensDesign} / Hers: ${coupleWomensDesign}`,
        notes: combinedNotes,
        customizationType: 'couple',
        mensColor: coupleMensColor,
        mensCustomColor: coupleMensColor === 'Custom' ? coupleMensCustomColor.trim() : undefined,
        mensDesign: coupleMensDesign,
        mensSpecialRequest: coupleMensRequest.trim() || undefined,
        womensFabric: coupleWomensFabric,
        womensColor: coupleWomensColor,
        womensCustomColor: coupleWomensColor === 'Custom' ? coupleWomensCustomColor.trim() : undefined,
        womensDesign: coupleWomensDesign,
        womensSpecialRequest: coupleWomensRequest.trim() || undefined,
        sharedCoupleCustomization: coupleSharedRequest.trim() || undefined,
        referenceImage: refString,
      }
    }

    addCustom({
      name: `Custom · ${base.name}`,
      unit: total,
      gift: false,
      note: '',
      custom: customPayload,
    })

    setBase(null)
    nav('/cart')
  }

  // ─── FILTERED PRODUCTS LIST ────────────────────────────────────────────────

  const coupleProducts = useMemo(() => {
    return products.filter(p => matchesCategory(p, 'couple-bundle'))
  }, [products])

  const displayedProducts = useMemo(() => {
    if (activeTab === 'men') return products.filter(p => matchesCategory(p, 'men'))
    if (activeTab === 'women') return products.filter(p => matchesCategory(p, 'women'))
    if (activeTab === 'couple') return coupleProducts
    return products.filter(p =>
      matchesCategory(p, 'men') || matchesCategory(p, 'women') || matchesCategory(p, 'couple-bundle')
    )
  }, [products, activeTab, coupleProducts])

  return (
    <div className="container-x py-8 sm:py-12">
      {/* HEADER */}
      <div className="max-w-2xl mb-8 sm:mb-10">
        <p className="eyebrow mb-2">Bespoke Artisan Workshop</p>
        <h1 className="text-3xl sm:text-4xl text-ink font-light mb-3">Customize Your Shawl</h1>
        <p className="text-ink/70 text-sm sm:text-base leading-relaxed">
          Select a base design from our artisan collection. Tailor the color, finish, dimensions, or fabric to your exact taste. Handwoven on traditional wooden looms in Swat Valley and delivered in 3 to 4 working days.
        </p>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-beige">
        {[
          ['all', 'All Designs'],
          ['men', "Men's Shawls"],
          ['women', "Women's Shawls"],
          ['couple', 'Couple Bundles'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as any)}
            className={`px-3.5 py-2 text-xs uppercase tracking-[0.16em] transition-colors border ${
              activeTab === key
                ? 'bg-walnut text-white border-walnut'
                : 'bg-ivory text-ink/75 border-beige hover:border-walnut/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* PRODUCTS GRID */}
      {loading ? (
        <p className="py-16 text-center text-ink/70 font-serif">Loading customization options…</p>
      ) : productsError ? (
        <div className="py-16 text-center">
          <p className="text-ink/70 font-serif mb-3">{productsError}</p>
          <button type="button" className="btn-outline" onClick={reloadProducts}>Try again</button>
        </div>
      ) : displayedProducts.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayedProducts.map(p => (
          <div
            key={p.id}
            onClick={() => openCustomization(p)}
            className="group cursor-pointer bg-white border border-beige/70 p-3 hover:border-walnut/60 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[4/5] bg-beige/40 overflow-hidden relative mb-3">
                <Media p={p} />
                <span className="absolute top-2 left-2 bg-coal/80 text-white text-[9px] uppercase tracking-widest px-2 py-0.5">
                  {p.category === 'couple-bundle' ? 'Couple Set' : p.category === 'women' ? "Women's" : "Men's"}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-ink/50">{p.sku}</p>
              <h3 className="font-serif text-base text-ink group-hover:text-walnut transition-colors line-clamp-1 mt-0.5">
                {p.name}
              </h3>
              <p className="text-xs text-ink/70 mt-1">From {pkr(p.price)}</p>
            </div>
            <button
              type="button"
              className="btn-outline w-full py-2.5 mt-3 text-[11px] tracking-[0.16em]"
            >
              Customize Design →
            </button>
          </div>
        ))}
        </div>
      ) : (
        <p className="py-16 text-center text-ink/70 font-serif">No customizable shawls are available in this category right now.</p>
      )}

      {/* ─── DYNAMIC CUSTOMIZATION MODAL ─────────────────────────────────────── */}
      {base && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setBase(null)}
        >
          <div
            className="bg-ivory max-w-2xl w-full p-5 sm:p-8 max-h-[92vh] overflow-y-auto border border-beige/90 shadow-2xl space-y-6"
            onClick={e => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex justify-between items-start gap-4 pb-4 border-b border-beige">
              <div>
                <p className="eyebrow !text-brass text-[11px] mb-1">
                  {base.category === 'couple-bundle' ? 'His & Hers Edition' : `Base Design: ${base.name}`}
                </p>
                <h2 className="text-2xl sm:text-3xl text-ink font-serif">{modalTitle}</h2>
              </div>
              <button
                type="button"
                onClick={() => setBase(null)}
                className="p-1.5 text-ink/50 hover:text-ink text-xl transition-colors shrink-0"
                aria-label="Close customization modal"
              >
                ✕
              </button>
            </div>

            {/* ─── CONTEXT 1: MEN'S SHAWL FORM ─────────────────────────────── */}
            {context === 'men' && (
              <div className="space-y-6">
                {/* 1. COLOR SELECTION */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-2 font-medium">
                    Select Color *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {MENS_COLORS.map(c => {
                      const isSel = mensColor === c.name
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setMensColor(c.name)}
                          className={`flex flex-col items-center p-2.5 border rounded-sm transition-all ${
                            isSel
                              ? 'border-walnut ring-1 ring-walnut bg-beige/30'
                              : 'border-beige hover:border-walnut/40 bg-white'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full mb-1.5 block shadow-xs ${c.border ? 'border border-ink/20' : ''}`}
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-[11px] text-ink font-medium leading-none">{c.name}</span>
                        </button>
                      )
                    })}
                    {/* CUSTOM COLOR BUTTON */}
                    <button
                      type="button"
                      onClick={() => setMensColor('Custom')}
                      className={`flex flex-col items-center p-2.5 border rounded-sm transition-all ${
                        mensColor === 'Custom'
                          ? 'border-walnut ring-1 ring-walnut bg-beige/30'
                          : 'border-beige hover:border-walnut/40 bg-white'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full mb-1.5 block shadow-xs border border-dashed border-walnut"
                        style={{ background: 'linear-gradient(135deg, #fce4ec, #c8e6c9, #bbdefb)' }}
                      />
                      <span className="text-[11px] text-ink font-medium leading-none">Custom</span>
                    </button>
                  </div>

                  {mensColor === 'Custom' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        className="field"
                        placeholder="Enter your desired color / shade (e.g. Olive Green, Deep Camel, Charcoal Grey) *"
                        value={mensCustomColor}
                        onChange={e => setMensCustomColor(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* 2. STYLE / FINISH */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-2 font-medium">
                    Style / Finish
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {MENS_STYLES.map(s => {
                      const isSel = mensStyle === s
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setMensStyle(s)}
                          className={`p-3 text-xs border rounded-sm text-center transition-all ${
                            isSel
                              ? 'border-walnut bg-walnut text-white font-medium'
                              : 'border-beige bg-white text-ink hover:border-walnut/50'
                          }`}
                        >
                          <span>{s}</span>
                          {s === 'Border' && <span className="block text-[10px] opacity-80 mt-0.5">+PKR 1,000</span>}
                          {s === 'Traditional Pattern' && <span className="block text-[10px] opacity-80 mt-0.5">+PKR 1,000</span>}
                          {s === 'Custom' && <span className="block text-[10px] opacity-80 mt-0.5">+PKR 1,000</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. SIZE */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-2 font-medium">
                    Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MENS_SIZES.map(sz => {
                      const isSel = mensSize === sz
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setMensSize(sz)}
                          className={`p-3 text-xs border rounded-sm text-center transition-all ${
                            isSel
                              ? 'border-walnut bg-walnut text-white font-medium'
                              : 'border-beige bg-white text-ink hover:border-walnut/50'
                          }`}
                        >
                          <span>{sz}</span>
                          {sz === 'Standard Size' ? (
                            <span className="block text-[10px] opacity-80 mt-0.5">Approx 52" × 104"</span>
                          ) : (
                            <span className="block text-[10px] opacity-80 mt-0.5">+PKR 1,000</span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {mensSize === 'Custom Dimensions' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        className="field"
                        placeholder="Specify dimensions (e.g. 56 inches width × 110 inches length) *"
                        value={mensCustomDimensions}
                        onChange={e => setMensCustomDimensions(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* 4. SPECIAL INSTRUCTIONS */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1 font-medium">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    className="field"
                    rows={3}
                    placeholder="Tell our artisans what you'd like, including any border, embroidery, motif, fringe, or finishing preferences."
                    value={mensInstructions}
                    onChange={e => setMensInstructions(e.target.value)}
                  />
                </div>

                {/* 5. REFERENCE UPLOAD */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1 font-medium">
                    Reference Image (Optional)
                  </label>
                  {!refFile ? (
                    <label className="border border-dashed border-beige hover:border-walnut/60 bg-white p-3.5 rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-ink/70">
                      <Icon n="box" className="w-4 h-4 text-walnut" />
                      <span>Upload design or pattern photo (JPG, PNG)</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 bg-white border border-beige rounded-sm text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {refFile.preview && (
                          <img src={refFile.preview} alt="Reference" className="w-9 h-9 object-cover rounded-sm border" />
                        )}
                        <span className="truncate text-ink font-medium">{refFile.name}</span>
                        <span className="text-ink/40 text-[11px]">({Math.round(refFile.size / 1024)} KB)</span>
                      </div>
                      <button type="button" onClick={clearFile} className="text-ink/60 hover:text-red-700 p-1 underline">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── CONTEXT 2: WOMEN'S SHAWL FORM ───────────────────────────── */}
            {context === 'women' && (
              <div className="space-y-6">
                {/* 1. FABRIC */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-2 font-medium">
                    Fabric
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {WOMENS_FABRICS.map(f => {
                      const isSel = womensFabric === f
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setWomensFabric(f)}
                          className={`p-3 text-xs border rounded-sm text-center transition-all ${
                            isSel
                              ? 'border-walnut bg-walnut text-white font-medium'
                              : 'border-beige bg-white text-ink hover:border-walnut/50'
                          }`}
                        >
                          <span className="font-serif text-sm block">{f}</span>
                          <span className="text-[10px] opacity-80 mt-0.5 block">
                            {f === 'Wool' ? 'Pure High-Altitude Swat Wool' : 'Lightweight Fine Breathable Lawn'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. COLOR SELECTION */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-2 font-medium">
                    Select Color *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {WOMENS_COLORS.map(c => {
                      const isSel = womensColor === c.name
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setWomensColor(c.name)}
                          className={`flex flex-col items-center p-2.5 border rounded-sm transition-all ${
                            isSel
                              ? 'border-walnut ring-1 ring-walnut bg-beige/30'
                              : 'border-beige hover:border-walnut/40 bg-white'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full mb-1.5 block shadow-xs ${c.border ? 'border border-ink/20' : ''}`}
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-[11px] text-ink font-medium leading-none text-center">{c.name}</span>
                        </button>
                      )
                    })}
                    {/* CUSTOM COLOR BUTTON */}
                    <button
                      type="button"
                      onClick={() => setWomensColor('Custom')}
                      className={`flex flex-col items-center p-2.5 border rounded-sm transition-all ${
                        womensColor === 'Custom'
                          ? 'border-walnut ring-1 ring-walnut bg-beige/30'
                          : 'border-beige hover:border-walnut/40 bg-white'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full mb-1.5 block shadow-xs border border-dashed border-walnut"
                        style={{ background: 'linear-gradient(135deg, #fce4ec, #c8e6c9, #bbdefb)' }}
                      />
                      <span className="text-[11px] text-ink font-medium leading-none">Custom Shade</span>
                    </button>
                  </div>

                  {womensColor === 'Custom' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        className="field"
                        placeholder="Enter your preferred color or shade (e.g. Dusty Rose, Peach, Teal) *"
                        value={womensCustomColor}
                        onChange={e => setWomensCustomColor(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* 3. STYLE */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-2 font-medium">
                    Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {WOMENS_STYLES.map(s => {
                      const isSel = womensStyle === s
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setWomensStyle(s)}
                          className={`p-3 text-xs border rounded-sm text-center transition-all ${
                            isSel
                              ? 'border-walnut bg-walnut text-white font-medium'
                              : 'border-beige bg-white text-ink hover:border-walnut/50'
                          }`}
                        >
                          <span>{s}</span>
                          {s === 'Handwoven Border' && <span className="block text-[10px] opacity-80 mt-0.5">+PKR 1,000</span>}
                          {s === 'Embroidered' && <span className="block text-[10px] opacity-80 mt-0.5">+PKR 1,000</span>}
                          {s === 'Custom' && <span className="block text-[10px] opacity-80 mt-0.5">+PKR 1,000</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 4. SPECIAL INSTRUCTIONS */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1 font-medium">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    className="field"
                    rows={3}
                    placeholder="Tell our artisans about any specific color, border, embroidery, finishing, or fitting requirements."
                    value={womensInstructions}
                    onChange={e => setWomensInstructions(e.target.value)}
                  />
                </div>

                {/* 5. REFERENCE UPLOAD */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1 font-medium">
                    Reference Image (Optional)
                  </label>
                  {!refFile ? (
                    <label className="border border-dashed border-beige hover:border-walnut/60 bg-white p-3.5 rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-ink/70">
                      <Icon n="box" className="w-4 h-4 text-walnut" />
                      <span>Upload reference image or inspiration photo (JPG, PNG)</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 bg-white border border-beige rounded-sm text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {refFile.preview && (
                          <img src={refFile.preview} alt="Reference" className="w-9 h-9 object-cover rounded-sm border" />
                        )}
                        <span className="truncate text-ink font-medium">{refFile.name}</span>
                        <span className="text-ink/40 text-[11px]">({Math.round(refFile.size / 1024)} KB)</span>
                      </div>
                      <button type="button" onClick={clearFile} className="text-ink/60 hover:text-red-700 p-1 underline">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── CONTEXT 3: COUPLE BUNDLE FORM (3 DISTINCT SECTIONS) ──────── */}
            {context === 'couple' && (
              <div className="space-y-6">
                {/* SECTION A: MEN'S SHAWL */}
                <div className="bg-white border border-beige/80 p-4 sm:p-5 rounded-sm space-y-4">
                  <div className="border-b border-beige/60 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brass block">Section A</span>
                    <h3 className="font-serif text-lg text-ink">Men's Shawl</h3>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink/70 mb-2">Color *</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {MENS_COLORS.map(c => {
                        const isSel = coupleMensColor === c.name
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setCoupleMensColor(c.name)}
                            className={`flex flex-col items-center p-2 border rounded-sm transition-all ${
                              isSel ? 'border-walnut ring-1 ring-walnut bg-beige/30' : 'border-beige bg-white'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full mb-1 block ${c.border ? 'border border-ink/20' : ''}`}
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="text-[10px] text-ink font-medium">{c.name}</span>
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => setCoupleMensColor('Custom')}
                        className={`flex flex-col items-center p-2 border rounded-sm transition-all ${
                          coupleMensColor === 'Custom' ? 'border-walnut ring-1 ring-walnut bg-beige/30' : 'border-beige bg-white'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full mb-1 block border border-dashed border-walnut"
                          style={{ background: 'linear-gradient(135deg, #fce4ec, #c8e6c9, #bbdefb)' }}
                        />
                        <span className="text-[10px] text-ink font-medium">Custom</span>
                      </button>
                    </div>

                    {coupleMensColor === 'Custom' && (
                      <input
                        type="text"
                        className="field mt-2.5"
                        placeholder="Specify Men's desired color *"
                        value={coupleMensCustomColor}
                        onChange={e => setCoupleMensCustomColor(e.target.value)}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1.5">Design</label>
                    <div className="grid grid-cols-2 gap-2">
                      {COUPLE_MENS_DESIGNS.map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setCoupleMensDesign(d)}
                          className={`p-2.5 text-xs border rounded-sm text-center ${
                            coupleMensDesign === d ? 'border-walnut bg-walnut text-white' : 'border-beige bg-white text-ink'
                          }`}
                        >
                          {d} {d === 'Border' && '(+PKR 1,000)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1">
                      Special Request (Optional)
                    </label>
                    <textarea
                      className="field"
                      rows={2}
                      placeholder="Artisan notes for the Men's piece..."
                      value={coupleMensRequest}
                      onChange={e => setCoupleMensRequest(e.target.value)}
                    />
                  </div>
                </div>

                {/* SECTION B: WOMEN'S SHAWL */}
                <div className="bg-white border border-beige/80 p-4 sm:p-5 rounded-sm space-y-4">
                  <div className="border-b border-beige/60 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brass block">Section B</span>
                    <h3 className="font-serif text-lg text-ink">Women's Shawl</h3>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1.5">Fabric</label>
                    <div className="grid grid-cols-2 gap-2">
                      {WOMENS_FABRICS.map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setCoupleWomensFabric(f)}
                          className={`p-2.5 text-xs border rounded-sm text-center ${
                            coupleWomensFabric === f ? 'border-walnut bg-walnut text-white' : 'border-beige bg-white text-ink'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink/70 mb-2">Color *</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {WOMENS_COLORS.map(c => {
                        const isSel = coupleWomensColor === c.name
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setCoupleWomensColor(c.name)}
                            className={`flex flex-col items-center p-2 border rounded-sm transition-all ${
                              isSel ? 'border-walnut ring-1 ring-walnut bg-beige/30' : 'border-beige bg-white'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full mb-1 block ${c.border ? 'border border-ink/20' : ''}`}
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="text-[10px] text-ink font-medium text-center">{c.name}</span>
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => setCoupleWomensColor('Custom')}
                        className={`flex flex-col items-center p-2 border rounded-sm transition-all ${
                          coupleWomensColor === 'Custom' ? 'border-walnut ring-1 ring-walnut bg-beige/30' : 'border-beige bg-white'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full mb-1 block border border-dashed border-walnut"
                          style={{ background: 'linear-gradient(135deg, #fce4ec, #c8e6c9, #bbdefb)' }}
                        />
                        <span className="text-[10px] text-ink font-medium">Custom</span>
                      </button>
                    </div>

                    {coupleWomensColor === 'Custom' && (
                      <input
                        type="text"
                        className="field mt-2.5"
                        placeholder="Specify Women's desired shade *"
                        value={coupleWomensCustomColor}
                        onChange={e => setCoupleWomensCustomColor(e.target.value)}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1.5">Design</label>
                    <div className="grid grid-cols-2 gap-2">
                      {COUPLE_WOMENS_DESIGNS.map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setCoupleWomensDesign(d)}
                          className={`p-2.5 text-xs border rounded-sm text-center ${
                            coupleWomensDesign === d ? 'border-walnut bg-walnut text-white' : 'border-beige bg-white text-ink'
                          }`}
                        >
                          {d} {d === 'Embroidered' && '(+PKR 1,000)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1">
                      Special Request (Optional)
                    </label>
                    <textarea
                      className="field"
                      rows={2}
                      placeholder="Artisan notes for the Women's piece..."
                      value={coupleWomensRequest}
                      onChange={e => setCoupleWomensRequest(e.target.value)}
                    />
                  </div>
                </div>

                {/* SECTION C: SHARED COUPLE CUSTOMIZATION */}
                <div className="bg-[#FAF7F2] border border-walnut/30 p-4 sm:p-5 rounded-sm space-y-3">
                  <div className="border-b border-beige/80 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brass block">Section C</span>
                    <h3 className="font-serif text-lg text-ink">Couple Customization</h3>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1">
                      Shared Coordination &amp; Preferences (Optional)
                    </label>
                    <textarea
                      className="field"
                      rows={3}
                      placeholder="Matching theme, initials, or border coordination requests."
                      value={coupleSharedRequest}
                      onChange={e => setCoupleSharedRequest(e.target.value)}
                    />
                  </div>

                  {/* OPTIONAL REFERENCE FILE */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink/70 mb-1">
                      Reference Image (Optional)
                    </label>
                    {!refFile ? (
                      <label className="border border-dashed border-beige hover:border-walnut/60 bg-white p-3 rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-ink/70">
                        <Icon n="box" className="w-4 h-4 text-walnut" />
                        <span>Upload couple inspiration or fabric reference</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 bg-white border border-beige rounded-sm text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          {refFile.preview && (
                            <img src={refFile.preview} alt="Reference" className="w-9 h-9 object-cover rounded-sm border" />
                          )}
                          <span className="truncate text-ink font-medium">{refFile.name}</span>
                          <span className="text-ink/40 text-[11px]">({Math.round(refFile.size / 1024)} KB)</span>
                        </div>
                        <button type="button" onClick={clearFile} className="text-ink/60 hover:text-red-700 p-1 underline">
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── PRICING SUMMARY (STEP 7) ─────────────────────────────────── */}
            <div className="bg-beige/60 border border-beige p-4 sm:p-5 rounded-sm space-y-2 text-sm">
              <div className="flex justify-between items-baseline font-serif">
                <span className="text-ink text-base">Total Order Price:</span>
                <span className="text-xl sm:text-2xl text-walnut font-semibold">{pkr(total)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-ink/80 pt-1 border-t border-beige/80">
                <span>Advance Payment Required (50%):</span>
                <span className="font-semibold text-ink">{pkr(advance)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-ink/80">
                <span>Balance Payable on Delivery (COD 50%):</span>
                <span className="font-semibold text-ink">{pkr(codBalance)}</span>
              </div>
              <p className="text-[11px] text-ink/60 pt-1 leading-tight">
                * Handcrafted upon advance deposit. Remaining 50% collected safely via Cash on Delivery across Pakistan.
              </p>
            </div>

            {/* MODAL ACTION BUTTON */}
            <button
              type="button"
              disabled={!isValid}
              onClick={handleAddToCart}
              className="btn-primary w-full py-4 text-xs tracking-[0.2em] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Add Custom Order to Cart</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
