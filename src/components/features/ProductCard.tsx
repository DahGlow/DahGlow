import { Link,useNavigate } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { productUrl,formatMoney } from '@/lib/shopify';
import { optimizedImage } from '@/lib/images';
import type { Product } from '@/types/shop';
import { ASSETS } from '@/constants/products';
interface Props {product:Product;compact?:boolean;deal?:boolean;}
export default function ProductCard({product,compact=false,deal=false}:Props){
 const {t,addCart,cartBusy}=useShop();const navigate=useNavigate();const discount=product.original>product.price?Math.round((1-product.price/product.original)*100):0;
 const quickAdd=()=>{if(product.options.some(o=>o.optionValues.length>1)){navigate(productUrl(product));return;}const variant=product.variants.find(v=>v.availableForSale);if(variant)void addCart(variant.id).catch(()=>undefined);};
 return <article className={`product-card ${compact?'compact':''} ${deal?'deal-product':''}`}>
  <Link to={productUrl(product)} className="product-image" aria-label={product.name}>
   {product.image?<img loading="lazy" src={optimizedImage(product.image,compact?360:650)} alt={product.name}/>:<ImageOff className="missing-image"/>}
   {!compact&&discount>0&&<span className="discount">−{discount}%</span>}
  </Link>
  {!compact&&<><span className="product-tag">{product.vendor}</span><Link className="product-name" to={productUrl(product)}>{product.name}</Link></>}
  <div className="price-row"><div><strong>{formatMoney(product.price,product.currency)}</strong>{!compact&&discount>0&&<del>{formatMoney(product.original,product.currency)}</del>}</div>
   {!compact&&<button className="quick-add" disabled={!product.available||cartBusy} aria-label={`${t('Add to bag')}: ${product.name}`} onClick={quickAdd}><img src={ASSETS.addCart} alt=""/></button>}
  </div>
  {compact?<p className="compact-note">{discount>0?`−${discount}%`:product.vendor}</p>:<p className="product-rating">{product.available?product.category||'Available':'Sold out'}</p>}
 </article>;
}
