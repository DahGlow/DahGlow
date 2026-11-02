import { Plus,Check } from 'lucide-react';
import ProductCard from '@/components/features/ProductCard';
import { SHUFFLED_PRODUCTS } from '@/constants/products';
import { useShop } from '@/hooks/useShop';
interface Props {name:string;index:number;following:boolean;busy:boolean;onToggle:()=>void;}
export default function StoreCard({name,index,following,busy,onToggle}:Props){const {t}=useShop();return <article className="store-card"><div className="store-title"><div className="store-avatar">{index===0?'DW':'DG'}<span>Trends</span></div><div><h2>{name}</h2><span className="store-tag">{index===0?'#EverydayMuse':'#QuietLuxury'}</span></div><button className={`follow-button ${following?'following':''}`} disabled={busy} onClick={onToggle}>{following?<Check size={17}/>:<Plus size={17}/>} {t(following?'Following':'Follow')}</button></div><div className="store-products">{SHUFFLED_PRODUCTS.slice(index*4,index*4+4).map(p=><ProductCard product={p} key={p.id} compact/>)}</div><p className="store-quote">“ {t('Your style, your way.')} ”</p></article>;}
