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
const trust = [['pin', 'Sourced in Swat'], ['check', 'Quality Checked'], ['cash', 'Cash on Delivery'], ['truck', 'Nationwide Delivery']]
const feats = [['Authentic sourcing', 'leaf'], ['Carefully selected', 'check'], ['Quality checked', 'check'], ['Secure packaging', 'box']]
export default function Home() {
  const { products } = useStore()
  return (<>
    <section className="relative min-h-[88vh] flex items-center overflow-hidden text-white bg-coal">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs><radialGradient id="glow" cx="75%" cy="30%" r="45%"><stop offset="0" stopColor="#B08D57" stopOpacity=".35" /><stop offset="1" stopColor="#B08D57" stopOpacity="0" /></radialGradient>
          <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F8F5EF" stopOpacity="0" /><stop offset="1" stopColor="#F8F5EF" stopOpacity=".12" /></linearGradient></defs>
        <rect width="1440" height="800" fill="url(#glow)" />
        <path d="M0 800V430l140-70 110 60 170-130 190 140 150-100 200 150 160-110 240 130 80-40V800z" fill="#F8F5EF" opacity=".08" />
        <path d="M0 800V500l180-90 140 80 200-150 230 170 170-110 250 160 270-120V800z" fill="#E8DCC8" opacity=".12" />
        <path d="M0 800V580l200-80 180 90 240-120 260 150 200-90 360 130V800z" fill="#6F503B" opacity=".45" />
        <rect y="500" width="1440" height="300" fill="url(#haze)" />
        <path d="M0 800V650l160-50 200 60 220-70 240 70 220-60 400 70V800z" fill="#171A18" />
        <path d="M30 668l16-80 16 80zM95 668l16-80 16 80zM170 668l16-80 16 80zM240 668l16-80 16 80zM1180 668l16-80 16 80zM1255 668l16-80 16 80zM1330 668l16-80 16 80zM1400 668l16-80 16 80z" fill="#171A18" /></svg>
      {site.heroVideo && <video src={site.heroVideo} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />}
      <Img src={site.heroImage} alt="Misty mountains of Swat Valley" className="absolute inset-0 w-full h-full object-cover" />
      <Img src={site.heroModels} alt="A man and a woman, faces not shown, wearing handwoven Swat shawls" className="absolute right-0 bottom-0 h-full w-full md:w-[55%] object-cover md:object-contain object-right-bottom opacity-40 md:opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-r from-coal/85 via-coal/45 to-transparent" />
      <div className="relative container-x w-full py-24"><div className="max-w-xl">
        <p className="eyebrow !text-brass">Swat Shawls · Pakistan</p>
        <h1 className="text-5xl md:text-7xl font-light leading-[1.05] my-6">Woven in Swat.<br />Made for Today.</h1>
        <p className="text-white/85 mb-9">Authentic handwoven shawls from the heritage of Swat, presented for modern everyday style.</p>
        <div className="flex gap-3 flex-wrap"><Link to="/shop" className="btn-dark-fill">Shop Collection</Link><Link to="/our-story" className="btn-dark-outline">Our Story</Link></div></div></div></section>
    <section className="bg-beige"><div className="container-x py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-ink text-sm">
      {trust.map(([i, l]) => <div key={l} className="flex items-center gap-2 justify-center"><Icon n={i} className="w-5 h-5 text-brass" />{l}</div>)}</div></section>
    <section className="container-x py-16">
      <div className="flex justify-between items-end mb-8"><div><p className="eyebrow">Featured</p><h2 className="text-4xl text-ink">The Selected Shawls</h2><span className="block w-10 h-px bg-brass mt-3" /></div><Link to="/shop" className="text-ink text-sm hover:text-brass">View all →</Link></div>
      <Grid items={products.slice(0, 4)} /></section>
    <section className="container-x grid md:grid-cols-3 gap-5 pb-16">
      <Link to="/shop?category=men" className="bg-coal text-white p-12 min-h-[240px] flex flex-col justify-end"><h3 className="text-3xl">Shop Men</h3><p className="text-white/80 mt-1">Earthy, substantial wraps.</p></Link>
      <Link to="/shop?category=women" className="bg-brass text-coal p-12 min-h-[240px] flex flex-col justify-end"><h3 className="text-3xl">Shop Women</h3><p className="text-coal/80 mt-1">Soft, refined heirlooms.</p></Link>
      <Link to="/couple-bundle" className="bg-beige text-ink p-12 min-h-[240px] flex flex-col justify-end border border-brass"><h3 className="text-3xl">Couple Bundle</h3><p className="text-ink/70 mt-1">His &amp; hers — save 10%.</p></Link></section>
    <section className="bg-beige"><div className="container-x py-16 text-center max-w-2xl">
      <h2 className="text-3xl text-ink mb-4">Customize Your Own Shawl</h2>
      <p className="text-ink/70 mb-6">Choose your color, size and border. Pay 50% advance online and the balance on delivery. Made and delivered in 8–10 days.</p>
      <Link to="/customize" className="btn-primary">Start a custom order</Link></div></section>
    <section className="bg-coal text-white"><div className="container-x py-16">
      <h2 className="text-3xl text-center">Heritage in Every Thread</h2>
      <p className="text-white/80 max-w-2xl mx-auto text-center mt-4 mb-10">Each shawl is sourced directly from Swat artisans, chosen by hand, inspected, and packed with care.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{feats.map(([l, i]) => <div key={l} className="border border-white/15 p-6 text-center"><Icon n={i} className="w-7 h-7 text-brass mx-auto mb-3" /><p className="font-serif">{l}</p></div>)}</div></div></section>
    <section className="container-x py-20 text-center max-w-xl">
      <h2 className="text-4xl text-ink mb-3">Find Your Shawl</h2><p className="text-ink/70 mb-6">A small, considered collection — every piece is one of one.</p>
      <div className="flex gap-3 justify-center flex-wrap"><Link to="/shop" className="btn-primary">Explore Collection</Link><Link to="/contact" className="btn-outline">Talk to us</Link></div></section>
  </>)
}
