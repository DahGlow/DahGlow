import { useShop } from '@/hooks/useShop';
import { useSavedProducts } from '@/hooks/useSavedProducts';
import PageHeader from '@/components/layout/PageHeader';
import CatalogResults from '@/components/features/CatalogResults';
import EmptyState from '@/components/features/EmptyState';
export default function Wishlist(){const {t,wishlist}=useShop();const saved=useSavedProducts(wishlist);return <main className="standard-page"><PageHeader title={`${t('Wishlist')} (${wishlist.length})`}/>{wishlist.length?<CatalogResults products={saved.products} loading={saved.loading} error={saved.error}/>:<EmptyState heart title="Your wishlist is waiting" description="Save the things you love with a heart."/>}</main>;}
