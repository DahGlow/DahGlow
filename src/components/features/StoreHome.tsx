
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CatalogResults from '@/components/features/CatalogResults';
import { formatMoney,productUrl } from '@/lib/shopify';
import type { Product,Vendor } from '@/types/shop';
interface Props {vendor:Vendor;products:Product[];onItems:()=>void;}
export default function StoreHome({vendor,products,onItems}:Props){const featured=products.find(p=>p.image);return <section className="store-home">{featured&&<div className="store-home-feature"><Link to={productUrl(featured)} className="store-home-photo"><img src={featured.image} alt={featured.name}/></Link><div className="store-home-feature-copy"><span className="eyebrow">THE {vendor.displayName||vendor.name} EDIT</span><h2>Find something<br/>that feels like you.</h2><p>{featured.name}</p><strong>{formatMoney(featured.price,featured.currency)}</strong><Link to={productUrl(featured)}>Explore this find<ArrowRight size={16}/></Link></div></div>}<div className="store-section-heading"><div><h2>From this store</h2><p>{vendor.description||`The ${vendor.displayName||vendor.name} collection.`}</p></div><button onClick={onItems}>View all<ArrowRight size={16}/></button></div><CatalogResults products={products.slice(0,8)} loading={false} error={null}/></section>;}
