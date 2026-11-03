import { Link } from 'react-router-dom';
import { Plus,Check,ExternalLink } from 'lucide-react';
import StoreAvatar from '@/components/features/StoreAvatar';
import ProductCard from '@/components/features/ProductCard';
import { useCatalog } from '@/hooks/useCatalog';
import { useShop } from '@/hooks/useShop';
import type { Vendor } from '@/types/shop';

interface Props {vendor:Vendor;following:boolean;busy:boolean;onToggle:()=>void;}
export default function StoreCard({vendor,following,busy,onToggle}:Props){const {t}=useShop();const {products}=useCatalog({vendor:vendor.name,first:4});return <article className="store-card"><div className="store-title"><Link to={`/stores/${vendor.id}`} className="store-avatar"><StoreAvatar url={vendor.avatar} name={vendor.name}/></Link><Link to={`/stores/${vendor.id}`}><h2>{vendor.displayName||vendor.name}</h2><span className="store-tag">View collection ›</span></Link><button className={`follow-button ${following?'following':''}`} disabled={busy} onClick={onToggle}>{following?<Check size={17}/>:<Plus size={17}/>} {t(following?'Following':'Follow')}</button></div>{(vendor.description||vendor.profileUrl)&&<div className="store-card-profile">{vendor.description&&<p>{vendor.description}</p>}{vendor.profileUrl&&<a href={vendor.profileUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/>Vendor profile</a>}</div>}<div className="store-products">{products.map(p=><ProductCard product={p} key={p.id} compact/>)}</div></article>;}
