import { useSearchParams } from 'react-router-dom';
import { Zap } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import CatalogResults from '@/components/features/CatalogResults';
import ProductCard from '@/components/features/ProductCard';
import banner from '@/assets/black-friday.jpg';
import { useCatalog } from '@/hooks/useCatalog';

export default function SuperDeals(){const [params,setParams]=useSearchParams();const category=params.get('category')||'All';const catalog=useCatalog({category});const deals=catalog.products.filter(p=>p.original>p.price);return <main className="deals-page"><section className="deals-hero" style={{backgroundImage:`url(${banner})`}}><PageHeader title="Super Deals" heart/><div className="deals-glass"><h2><Zap size={24}/>Current price drops</h2><div className="flash-carousel">{deals.slice(0,8).map(p=><ProductCard key={p.id} product={p} compact deal/>)}</div>{!deals.length&&<p>No sale products in this selection yet.</p>}</div></section><section className="deals-content"><div className="filter-chips">{['All','Women','Kids','Home','Shoes','Beauty'].map(c=><button className={category===c?'active':''} onClick={()=>setParams({category:c})} key={c}>{c}</button>)}</div><CatalogResults deal products={deals} loading={catalog.isLoading} error={catalog.error} hasMore={catalog.hasNextPage} fetching={catalog.isFetchingNextPage} onMore={()=>void catalog.fetchNextPage()}/></section></main>;}
