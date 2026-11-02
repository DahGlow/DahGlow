import { useSearchParams } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import HeroBanner from '@/components/features/HeroBanner';
import ShippingBenefits from '@/components/features/ShippingBenefits';
import CategoryCircles from '@/components/features/CategoryCircles';
import FeatureRail from '@/components/features/FeatureRail';
import ProductGrid from '@/components/features/ProductGrid';
import { ASSETS,SHUFFLED_PRODUCTS } from '@/constants/products';
import { useShop } from '@/hooks/useShop';
export default function Shop(){const {t}=useShop();const [params]=useSearchParams();const category=params.get('category')||'All';const products=SHUFFLED_PRODUCTS.filter(p=>category==='All'||p.category===category||(category==='Beauty'&&p.category==='Lips'));return <main className="shop-page"><HeroBanner/><div className="shop-content"><ShippingBenefits/><CategoryCircles/><FeatureRail name="Super Deals" image={ASSETS.deals} to="/deals" products={SHUFFLED_PRODUCTS.slice(4,8)} deal/><div className="feature-pair"><FeatureRail name="Trends" image={ASSETS.trends} to="/trends" products={SHUFFLED_PRODUCTS.slice(8,10)}/><FeatureRail name="Brand Zone" image={ASSETS.brands} to="/trends?tab=stores" products={SHUFFLED_PRODUCTS.slice(10,12)} deal/></div><section className="recommendations"><div className="section-title"><div><span className="eyebrow">{t('Fresh finds, every day')}</span><h2>{category==='All'?t('Just for you'):t(category)}</h2></div><span className="collection-label">{t('Demo collection')} <ArrowDown size={14}/></span></div><ProductGrid products={products}/></section><footer className="shop-footer"><span className="brand">DAH GLOW.</span><p>{t('Your style, your way.')}</p><small>{t('Demo collection')} · © 2026 Dah Glow</small></footer></div></main>;}
