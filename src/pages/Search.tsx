import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Search as SearchIcon,Camera } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { SHUFFLED_PRODUCTS } from '@/constants/products';
import PageHeader from '@/components/layout/PageHeader';
import ProductGrid from '@/components/features/ProductGrid';
import EmptyState from '@/components/features/EmptyState';
interface SearchFields {query:string;}
export default function Search(){const {t}=useShop();const [params,setParams]=useSearchParams();const query=params.get('q')||'';const {register,handleSubmit,setValue}=useForm<SearchFields>({defaultValues:{query}});const products=SHUFFLED_PRODUCTS.filter(p=>`${p.name} ${p.category} ${p.tag} ${t(p.category)}`.toLowerCase().includes(query.toLowerCase()));return <main className="standard-page search-page"><PageHeader title={t('Search')} heart/><form className="search-form" onSubmit={handleSubmit(v=>setParams({q:v.query}))}><label className="sr-only" htmlFor="product-search">{t('Search')}</label><input id="product-search" placeholder={t('Search your next favorite')} {...register('query')}/><Camera size={22} aria-hidden="true"/><button type="submit" aria-label={t('Search')}><SearchIcon size={23}/></button></form><div className="filter-chips">{['Women','Tops','Shoes','Home'].map(c=><button key={c} onClick={()=>{setValue('query',t(c));setParams({q:t(c)});}}>{t(c)}</button>)}</div><div className="section-title"><h2>{query?`“${query}”`:t('Just for you')}</h2><span className="fine-print">{products.length} {t('Everyday favorites')}</span></div>{products.length?<ProductGrid products={products}/>:<EmptyState title="No matches yet" description="Search your next favorite"/>}</main>;}
