import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import TrendsHero from '@/components/features/TrendsHero';
import ProductGrid from '@/components/features/ProductGrid';
import StoreCard from '@/components/features/StoreCard';
import { SHUFFLED_PRODUCTS } from '@/constants/products';
import { useFollows } from '@/hooks/useFollows';
import { useShop } from '@/hooks/useShop';
export default function Trends(){const {t}=useShop();const [params,setParams]=useSearchParams();const stores=params.get('tab')==='stores';const [tag,setTag]=useState('For You');const {follows,toggle,busy}=useFollows();return <main className="trends-page"><TrendsHero/><section className="trends-content"><div className="segmented-tabs"><button className={!stores?'active':''} onClick={()=>setParams({})}>{t('Trending Picks')}</button><button className={stores?'active':''} onClick={()=>setParams({tab:'stores'})}>{t('Trends Store')}</button></div>{stores?<div className="stores-list">{[{id:'dawinestore',name:'Dawinestore'},{id:'dawenstore',name:'DawenStore'}].map((s,i)=><StoreCard name={s.name} index={i} key={s.id} following={follows.includes(s.id)} busy={busy===s.id} onToggle={()=>void toggle(s.id)}/>)}</div>:<><div className="filter-chips">{['For You','#SoftLayers','#QuietLuxury','#MemorableWedding'].map(x=><button className={tag===x?'active':''} onClick={()=>setTag(x)} key={x}>{t(x)}</button>)}</div><ProductGrid products={SHUFFLED_PRODUCTS.filter(p=>tag==='For You'||p.tag===tag)}/></>}</section></main>;}
