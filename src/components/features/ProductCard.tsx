import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import type { Product } from '@/types/shop';
import { ASSETS } from '@/constants/products';
interface Props {product:Product;compact?:boolean;deal?:boolean;}
export default function ProductCard({product,compact=false,deal=false}:Props){const {t,money,addCart}=useShop();return <article className={`product-card ${compact?'compact':''} ${deal?'deal-product':''}`}><Link to={`/product/${product.id}`} className="product-image"><img loading="lazy" src={product.image} alt={product.name}/>{!compact&&<span className="discount">−{Math.round((1-product.price/product.original)*100)}%</span>}</Link>{!compact&&<><span className="product-tag">{product.tag}</span><Link className="product-name" to={`/product/${product.id}`}>{product.name}</Link></>}<div className="price-row"><div><strong>{money(product.price)}</strong>{!compact&&<del>{money(product.original)}</del>}</div>{!compact&&<button className="quick-add" aria-label={`${t('Add to bag')}: ${product.name}`} onClick={()=>addCart(product.id)}><img src={ASSETS.addCart} alt=""/></button>}</div>{compact?<p className="compact-note">{deal?'−38%':product.tag}</p>:<div className="product-rating"><Star size={12} fill="currentColor"/> 4.8 <span>· 200+ sold</span></div>}</article>;}
