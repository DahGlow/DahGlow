import ProductCard from '@/components/features/ProductCard';
import type { Product } from '@/types/shop';
interface Props {products:Product[];deal?:boolean;}
export default function ProductGrid({products,deal}:Props){return <div className="product-grid">{products.map(product=><ProductCard key={product.id} product={product} deal={deal}/>)}</div>;}
