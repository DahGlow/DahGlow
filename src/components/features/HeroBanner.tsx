import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import banner from '@/assets/glow-banner.jpg';
import { useCatalog } from '@/hooks/useCatalog';
import { formatMoney } from '@/lib/shopify';

export default function HeroBanner(){const {products}=useCatalog({sort:'CREATED_AT',reverse:true,first:12});return <section className="hero-banner" style={{backgroundImage:`url(${banner})`}}><Link className="hero-inner" to="/black-Friday-2026-November-dah-glow" aria-label="Explore Dah Glow Black Friday"><div className="hero-copy"><span className="eyebrow">THE NOVEMBER EDIT</span><h1>Find your<br/>everyday glow.</h1><p>Fresh arrivals. Your next favorites.</p><span className="primary-button">Explore Black Friday <ArrowUpRight size={18}/></span></div><div className="hero-products">{products.slice(0,2).map((p,i)=><div key={p.id} className={`hero-product hero-product-${i}`}>{p.image&&<img src={p.image} alt={p.name}/>}<span className="hero-price">{formatMoney(p.price,p.currency)}</span></div>)}</div></Link></section>;}
