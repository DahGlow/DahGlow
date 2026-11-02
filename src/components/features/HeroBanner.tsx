import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import banner from '@/assets/glow-banner.jpg';
import { useCatalog } from '@/hooks/useCatalog';
import { formatMoney } from '@/lib/shopify';
import './HeroBanner.css';

const featuredBanners = [
  {
    label: 'Featured collection',
    image: 'https://img.ltwebstatic.com/v4/j/ccc/2026/11/02/50/1793600854678041b05171bd6b4b896c8d26681eca_thumbnail_1479x.avif',
  },
  {
    label: 'New arrivals',
    image: 'https://img.ltwebstatic.com/v4/j/ccc/2026/10/26/2b/1792997531c5426df19ab974c3d0f9efa41bcc9bed_thumbnail_1479x.avif',
  },
  {
    label: 'November favorites',
    image: 'https://img.ltwebstatic.com/v4/j/ccc/2026/11/02/80/17935991757d103bfd70e7998dd79623f72968ce58_thumbnail_1479x.avif',
  },
];
const slides = ['November edit', ...featuredBanners.map(({ label }) => label)];

export default function HeroBanner(){
  const {products}=useCatalog({sort:'CREATED_AT',reverse:true,first:12});
  const [activeSlide,setActiveSlide]=useState(0);
  const selectSlide=(index:number)=>setActiveSlide((index+slides.length)%slides.length);

  const backgroundImage=activeSlide===0?banner:featuredBanners[activeSlide-1].image;

  return <section className="hero-banner" style={{backgroundImage:`url(${backgroundImage})`,backgroundPosition:'center bottom'}} aria-label="Featured banners">
    {activeSlide===0
      ? <Link className="hero-inner" to="/black-Friday-2026-November-dah-glow" aria-label="Explore Dah Glow Black Friday">
          <div className="hero-copy"><span className="eyebrow">THE NOVEMBER EDIT</span><h1>Find your<br/>everyday glow.</h1><p>Fresh arrivals. Your next favorites.</p><span className="primary-button">Explore Black Friday <ArrowUpRight size={18}/></span></div>
          <div className="hero-products">{products.slice(0,2).map((p,i)=><div key={p.id} className={`hero-product hero-product-${i}`}>{p.image&&<img src={p.image} alt={p.name}/>}<span className="hero-price">{formatMoney(p.price,p.currency)}</span></div>)}</div>
        </Link>
      : <div className="hero-inner hero-inner-featured" aria-label="Featured collection">
          <div className="hero-products">{products.slice(0,2).map((p,i)=><div key={p.id} className={`hero-product hero-product-${i}`}>{p.image&&<img src={p.image} alt={p.name}/>}<span className="hero-price">{formatMoney(p.price,p.currency)}</span></div>)}</div>
        </div>}
    <div className="hero-carousel-controls" aria-label="Banner navigation">
      <button type="button" aria-label="Previous banner" onClick={()=>selectSlide(activeSlide-1)}><ArrowLeft size={16}/></button>
      <div className="hero-dots" role="group" aria-label="Choose a banner">
        {slides.map((slide,index)=><button key={slide} type="button" className={index===activeSlide?'selected':''} aria-label={`Show ${slide}`} aria-pressed={index===activeSlide} onClick={()=>selectSlide(index)}/>)}
      </div>
      <button type="button" aria-label="Next banner" onClick={()=>selectSlide(activeSlide+1)}><ArrowRight size={16}/></button>
    </div>
  </section>;
}
