import { useSearchParams } from 'react-router-dom';
import StoreIdentity from '@/components/features/StoreIdentity';
import HomeShowcase from '@/components/features/HomeShowcase';
import DesktopCategories from '@/components/features/DesktopCategories';
import ShippingBenefits from '@/components/features/ShippingBenefits';
import CategoryCircles from '@/components/features/CategoryCircles';
import FeatureRail from '@/components/features/FeatureRail';
import CatalogResults from '@/components/features/CatalogResults';
import { ASSETS } from '@/constants/products';
import { useCatalog } from '@/hooks/useCatalog';
import { useShop } from '@/hooks/useShop';

export default function Shop(){const {t}=useShop();const [params]=useSearchParams();const category=params.get('category')||'All';const catalog=useCatalog({category});const fresh=useCatalog({sort:'CREATED_AT',reverse:true,first:12});const sale=catalog.products.filter(p=>p.original>p.price);return <main className="shop-page"><HomeShowcase/><div className="shop-content"><ShippingBenefits/><div className="mobile-category-circles"><CategoryCircles/></div><DesktopCategories/><div className="home-feature-layout"><FeatureRail name="Super Deals" image={ASSETS.deals} to="/deals" products={sale.slice(0,3)} deal/><div className="feature-pair"><FeatureRail name="Trends" image={ASSETS.trends} to="/trends" products={fresh.products.slice(0,2)}/><FeatureRail name="Brand Zone" image={ASSETS.brands} to="/trends?tab=stores" products={catalog.products.slice(0,2)}/></div></div><section className={category==='All'?'recommendations home-recommendations':'recommendations'}><div className="section-title"><div><span className="eyebrow">DAH GLOW · SHOPIFY COLLECTION</span><h2>{category==='All'?t('Just for you'):t(category)}</h2></div></div><CatalogResults products={catalog.products} loading={catalog.isLoading} error={catalog.error} hasMore={catalog.hasNextPage} fetching={catalog.isFetchingNextPage} onMore={()=>void catalog.fetchNextPage()}/></section><StoreIdentity/><footer className="shop-footer mobile-shop-footer"><span className="brand">DAH GLOW.</span><p>{t('Your style, your way.')}</p><small>© 2026 Dah Glow</small></footer></div></main>;}
