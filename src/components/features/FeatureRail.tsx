import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/features/ProductCard';
import type { Product } from '@/types/shop';
interface Props {name:string;image:string;to:string;products:Product[];deal?:boolean;}
export default function FeatureRail({name,image,to,products,deal}:Props){return <section className={`feature-rail ${deal?'super-rail':''}`}><Link className="feature-heading" to={to}><img draggable={false} src={image} alt={name}/><ChevronRight size={20}/></Link><div className={`rail-products ${products.length===4?'four':'two'}`}>{products.map(p=><ProductCard key={p.id} product={p} compact deal={deal}/>)}</div></section>;}
