import { useShop } from '@/hooks/useShop';
import { PRODUCTS } from '@/constants/products';
import PageHeader from '@/components/layout/PageHeader';
import ProductGrid from '@/components/features/ProductGrid';
import EmptyState from '@/components/features/EmptyState';
export default function Wishlist(){const {t,wishlist}=useShop();const products=wishlist.map(id=>PRODUCTS.find(p=>p.id===id)).filter((p):p is typeof PRODUCTS[number]=>!!p);return <main className="standard-page"><PageHeader title={`${t('Wishlist')} (${products.length})`}/>{products.length?<ProductGrid products={products}/>:<EmptyState heart title="Your wishlist is waiting" description="Save the things you love with a heart."/>}</main>;}
