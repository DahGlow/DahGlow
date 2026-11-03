import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { productUrl } from '@/lib/shopify';
export default function AffiliateBoostPreview(){const catalog=useCatalog({first:4,sort:'BEST_SELLING'});return <section className="affiliate-boost-preview"><Link className="affiliate-row" to="/affiliate/boost"><div><h2>Commission Boost</h2><p>Discover products for returning customers</p></div><ChevronRight/></Link><div className="affiliate-boost-products">{catalog.products.slice(0,4).map(product=><Link to={productUrl(product)} key={product.id}><img src={product.image} alt={product.name} loading="lazy"/><span>Discover & share</span></Link>)}</div></section>;}
