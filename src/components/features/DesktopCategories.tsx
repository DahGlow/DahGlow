
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { CATEGORY_VISUALS } from '@/constants/categoryVisuals';
import { useCatalog } from '@/hooks/useCatalog';
const CATEGORIES=[{name:'Women',q:'Women'},{name:'Curve',q:'Curve'},{name:'Kids',q:'Kids'},{name:'Men',q:'Men'},{name:'Fall & Winter',q:'Winter'},{name:'Jewelry & Accessories',q:'Jewelry'},{name:'Baby & Maternity',q:'Baby'},{name:'Phone Accessories',q:'Phone'},{name:'Shoes',q:'Shoes'},{name:'Home & Living',q:'Home'},{name:'Beauty & Health',q:'Beauty'},{name:'Underwear & Sleepwear',q:'Sleepwear'},{name:'Sports & Outdoor',q:'Sports'},{name:'Tops',q:'Tops'},{name:'Dresses',q:'Dress'},{name:'Bags & Luggage',q:'Bag'},{name:'Toys & Games',q:'Toys'}];
export default function DesktopCategories(){const catalog=useCatalog({first:48});return <section className="desktop-categories" aria-label="Shop by category">{CATEGORIES.map(c=>{const visual=CATEGORY_VISUALS.find(v=>v.name===c.q)?.image;const p=catalog.products.find(p=>p.image&&`${p.category} ${p.name} ${p.tags.join(' ')}`.toLowerCase().includes(c.q.toLowerCase()));const image=visual||p?.image;return <Link key={c.name} to={`/search?q=${encodeURIComponent(c.q)}`}><span>{image?<img src={image} alt={c.name} loading="lazy"/>:<Package size={32}/>}</span><p>{c.name}</p></Link>;})}</section>;}
