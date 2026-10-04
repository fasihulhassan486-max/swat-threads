import { useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { useStore } from '../context/StoreContext'
import { Grid, Icon } from '../components/ui'

// Shows a photo if the file exists in /public/images; otherwise hides itself (no broken-image icon).
function Img({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [bad, setBad] = useState(false)
  return bad ? null : <img src={src} alt={alt} className={className} onError={() => setBad(true)} />
}

const trust = [
  ['pin', 'Sourced in Swat'],
  ['check', 'Quality Checked'],
  ['cash', 'Cash on Delivery'],
  ['truck', 'Nationwide Delivery']
]

const feats = [
  ['Authentic sourcing', 'leaf'],
  ['Carefully selected', 'check'],
  ['Quality checked', 'check'],
  ['Secure packaging', 'box']
]

const mountainTypes = [
  {
    id: 'kalam',
    name: 'Kalam Glacial Peaks',
    tag: 'High Alpine Summit',
    elevation: '3,500m+ Elevation',
    desc: 'Majestic snow-dusted Hindu Kush peaks. The bitter mountain cold nurtures sheep with thick, dense wool—the foundation of our warmest traditional wraps.',
    image: '/images/swat-kalam-peaks.jpg',
  },
  {
    id: 'ushu',
    name: 'Ushu Misty Valley',
    tag: 'Pine Forest & River Basin',
    elevation: '2,300m Elevation',
    desc: 'Dense cedar forests cradling emerald rivers. Humid valley breeze and artisan village looms where yarn is hand-spun and sun-dried.',
    image: '/images/swat-ushu-valley.jpg',
  },
  {
    id: 'malam-jabba',
    name: 'Malam Jabba Highlands',
    tag: 'Highland Ridge & Slopes',
    elevation: '2,800m Elevation',
    desc: 'Sunlit alpine ridges and terrace pastures that inspire our muted earthy color palette and geometric hand-woven border motifs.',
    image: '/images/swat-malam-jabba.jpg',
  },
]

export default function Home() {
  const { products } = useStore()
  const [activeMountain, setActiveMountain] = useState<typeof mountainTypes[0] | null>(null)

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-[80vh] sm:min-h-[88vh] flex items-center overflow-hidden text-white bg-coal">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <defs>
            <radialGradient id="glow" cx="75%" cy="30%" r="45%"><stop offset="0" stopColor="#B08D57" stopOpacity=".35" /><stop offset="1" stopColor="#B08D57" stopOpacity="0" /></radialGradient>
            <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F8F5EF" stopOpacity="0" /><stop offset="1" stopColor="#F8F5EF" stopOpacity=".12" /></linearGradient>
          </defs>
          <rect width="1440" height="800" fill="url(#glow)" />
          <path d="M0 800V430l140-70 110 60 170-130 190 140 150-100 200 150 160-110 240 130 80-40V800z" fill="#F8F5EF" opacity=".08" />
          <path d="M0 800V500l180-90 140 80 200-150 230 170 170-110 250 160 270-120V800z" fill="#E8DCC8" opacity=".12" />
          <path d="M0 800V580l200-80 180 90 240-120 260 150 200-90 360 130V800z" fill="#6F503B" opacity=".45" />
          <rect y="500" width="1440" height="300" fill="url(#haze)" />
          <path d="M0 800V650l160-50 200 60 220-70 240 70 220-60 400 70V800z" fill="#171A18" />
          <path d="M30 668l16-80 16 80zM95 668l16-80 16 80zM170 668l16-80 16 80zM240 668l16-80 16 80zM1180 668l16-80 16 80zM1255 668l16-80 16 80zM1330 668l16-80 16 80zM1400 668l16-80 16 80z" fill="#171A18" />
        </svg>
        {site.heroVideo && <video src={site.heroVideo} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />}
        <Img src={site.heroImage} alt="Misty mountains of Swat Valley" className="absolute inset-0 w-full h-full object-cover" />
        <Img src={site.heroModels} alt="A man and a woman wearing handwoven Swat shawls" className="absolute right-0 bottom-0 h-full w-full md:w-[55%] object-cover md:object-contain object-right-bottom opacity-35 md:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-r from-coal/95 via-coal/70 to-coal/40 md:to-transparent" />
        <div className="relative container-x w-full py-16 sm:py-24">
          <div className="max-w-xl">
            <p className="eyebrow !text-brass">Swat Shawls · Pakistan</p>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-light leading-[1.1] my-4 sm:my-6">
              Woven in Swat.<br />Made for Today.
            </h1>
            <p className="text-white/85 mb-6 sm:mb-9 text-base sm:text-lg leading-relaxed">
              Authentic handwoven shawls from the misty Himalayan &amp; Hindu Kush mountains of Swat Valley.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/shop" className="btn-dark-fill">Shop Collection</Link>
              <Link to="/our-story" className="btn-dark-outline">Our Story</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="bg-beige">
        <div className="container-x py-5 sm:py-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-ink text-xs sm:text-sm">
          {trust.map(([i, l]) => (
            <div key={l} className="flex items-center gap-2 justify-center py-1">
              <Icon n={i} className="w-4 h-4 sm:w-5 sm:h-5 text-brass shrink-0" />
              <span className="text-center font-medium sm:font-normal">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-x py-10 sm:py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-6 sm:mb-8">
          <div>
            <p className="eyebrow">Featured</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-ink">The Selected Shawls</h2>
            <span className="block w-10 h-px bg-brass mt-2 sm:mt-3" />
          </div>
          <Link to="/shop" className="text-ink text-xs sm:text-sm hover:text-brass py-1">View all →</Link>
        </div>
        <Grid items={products.slice(0, 4)} />
      </section>

      {/* CATEGORY BANNER GRID */}
      <section className="container-x grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 py-8 sm:py-16">
        <Link to="/shop?category=men" className="bg-coal text-white p-6 sm:p-8 md:p-12 min-h-[180px] sm:min-h-[240px] flex flex-col justify-end group hover:bg-[#232724] transition-colors relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-serif">Shop Men</h3>
            <p className="text-white/80 mt-1 text-sm">Earthy, substantial wraps.</p>
          </div>
        </Link>
        <Link to="/shop?category=women" className="bg-brass text-coal p-6 sm:p-8 md:p-12 min-h-[180px] sm:min-h-[240px] flex flex-col justify-end group hover:bg-[#c19d65] transition-colors relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-serif">Shop Women</h3>
            <p className="text-coal/80 mt-1 text-sm">Soft, refined heirlooms.</p>
          </div>
        </Link>
        <Link to="/couple-bundle" className="bg-beige text-ink p-6 sm:p-8 md:p-12 min-h-[180px] sm:min-h-[240px] flex flex-col justify-end border border-brass group hover:bg-[#f3ede3] transition-colors relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-serif">Couple Bundle</h3>
            <p className="text-ink/70 mt-1 text-sm">His &amp; hers — save 10%.</p>
          </div>
        </Link>
      </section>

      {/* CUSTOMIZATION CTA */}
      <section className="bg-beige">
        <div className="container-x py-10 sm:py-16 text-center max-w-2xl">
          <h2 className="text-2xl sm:text-3xl text-ink mb-3 sm:mb-4">Customize Your Own Shawl</h2>
          <p className="text-ink/70 mb-6 text-sm sm:text-base leading-relaxed">
            Choose your color, size and border. Pay 50% advance online and the balance on delivery. Made and delivered in 8–10 days.
          </p>
          <Link to="/customize" className="btn-primary">Start a custom order</Link>
        </div>
      </section>

      {/* CRAFTSMANSHIP & HERITAGE */}
      <section className="bg-coal text-white">
        <div className="container-x py-10 sm:py-16">
          <h2 className="text-2xl sm:text-3xl text-center font-serif">Heritage in Every Thread</h2>
          <p className="text-white/80 max-w-2xl mx-auto text-center mt-3 sm:mt-4 mb-8 sm:mb-10 text-sm sm:text-base">
            Each shawl is sourced directly from Swat artisans, chosen by hand, inspected, and packed with care.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {feats.map(([l, i]) => (
              <div key={l} className="border border-white/15 p-4 sm:p-6 text-center bg-white/5">
                <Icon n={i} className="w-6 h-6 sm:w-7 sm:h-7 text-brass mx-auto mb-2 sm:mb-3" />
                <p className="font-serif text-xs sm:text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="container-x py-12 sm:py-20 text-center max-w-xl">
        <h2 className="text-3xl sm:text-4xl text-ink mb-3 font-serif">Find Your Shawl</h2>
        <p className="text-ink/70 mb-6 text-sm sm:text-base">A small, considered collection — every piece is one of one.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/shop" className="btn-primary">Explore Collection</Link>
          <Link to="/contact" className="btn-outline">Talk to us</Link>
        </div>
      </section>

      {/* SWAT MOUNTAINS & ORIGINS GALLERY SECTION */}
      <section className="bg-coal text-white py-12 sm:py-20">
        <div className="container-x">
          <div className="max-w-2xl mb-8 sm:mb-12">
            <p className="eyebrow !text-brass">Heritage &amp; Origins</p>
            <h2 className="text-3xl sm:text-4xl font-light text-white mt-1 mb-3">The Mountains of Swat</h2>
            <p className="text-white/75 text-sm sm:text-base leading-relaxed">
              Nestled in the high Hindu Kush and Himalayan ranges of northern Pakistan, the serene valleys of Swat shape every thread we weave. Discover the landscapes behind our authentic shawls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mountainTypes.map((mt) => (
              <div 
                key={mt.id} 
                onClick={() => setActiveMountain(mt)}
                className="group cursor-pointer bg-[#202421] border border-white/10 hover:border-brass/50 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="relative h-56 sm:h-64 overflow-hidden bg-coal">
                  <Img src={mt.image} alt={mt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#202421] via-transparent to-black/20" />
                  <span className="absolute top-4 left-4 bg-coal/80 backdrop-blur text-brass text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 border border-brass/30 tracking-wider uppercase font-sans">
                    {mt.elevation}
                  </span>
                  <span className="absolute bottom-3 right-3 text-xs text-white/80 bg-black/50 px-2 py-1 rounded flex items-center gap-1 group-hover:text-brass transition-colors">
                    <Icon n="check" className="w-3 h-3 text-brass" /> Click to view
                  </span>
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-brass text-xs uppercase tracking-widest font-sans mb-1">{mt.tag}</p>
                    <h3 className="text-xl sm:text-2xl font-serif text-white mb-2 group-hover:text-brass transition-colors">{mt.name}</h3>
                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-4">{mt.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-white/10 text-xs text-brass flex items-center gap-1">
                    <span>Explore mountain landscape</span> →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOUNTAIN LIGHTBOX MODAL */}
      {activeMountain && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveMountain(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-coal border border-brass/40 text-white overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveMountain(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-coal/80 border border-white/20 text-white hover:text-brass flex items-center justify-center rounded-full text-lg"
              aria-label="Close modal"
            >
              ✕
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-56 sm:h-72 md:h-full min-h-[220px] relative bg-black">
                <img src={activeMountain.image} alt={activeMountain.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-brass/20 text-brass text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 border border-brass/30 uppercase tracking-widest mb-3">
                    {activeMountain.elevation}
                  </span>
                  <p className="text-brass text-xs uppercase tracking-widest mb-1 font-sans">{activeMountain.tag}</p>
                  <h3 className="text-2xl sm:text-3xl font-serif text-white mb-3">{activeMountain.name}</h3>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-5">{activeMountain.desc}</p>
                  <div className="bg-white/5 border border-white/10 p-3.5 sm:p-4 text-xs text-white/70 space-y-2">
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brass shrink-0"></span> Authentic Swat Valley Origin</p>
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brass shrink-0"></span> Sourced from Local Artisan Weavers</p>
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brass shrink-0"></span> Natural Pure Sheep Wool Climate</p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/10">
                  <Link 
                    to="/shop" 
                    onClick={() => setActiveMountain(null)}
                    className="btn-dark-fill text-center text-xs py-3 w-full"
                  >
                    Explore Shawls From Swat
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
