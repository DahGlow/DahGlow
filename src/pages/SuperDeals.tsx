import { useState } from 'react';
import { Zap } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import ProductGrid from '@/components/features/ProductGrid';
import ProductCard from '@/components/features/ProductCard';
import banner from '@/assets/glow-banner.jpg';
import { SHUFFLED_PRODUCTS } from '@/constants/products';
import { useShop } from '@/hooks/useShop';
export default function SuperDeals(){const {t}=useShop();const [category,setCategory]=useState('For You');return <main className="deals-page"><section className="deals-hero" style={{backgroundImage:`url(${banner})`}}><PageHeader title="Super Deals" heart/><div className="deals-glass"><h2><Zap fill="currentColor" size={24}/>{t('Flash Sale')}<span>DAH GLOW EXCLUSIVES</span></h2><div className="flash-carousel">{SHUFFLED_PRODUCTS.slice(0,8).map(p=><ProductCard key={p.id} product={p} compact deal/>)}</div></div></section><section className="deals-content"><div className="filter-chips">{['For You','Women','Kids','Home','Shoes','Beauty'].map(c=><button className={category===c?'active':''} onClick={()=>setCategory(c)} key={c}>{t(c)}</button>)}</div><ProductGrid deal products={SHUFFLED_PRODUCTS.filter(p=>category==='For You'||p.category===category||(category==='Beauty'&&p.category==='Lips'))}/></section></main>;}
