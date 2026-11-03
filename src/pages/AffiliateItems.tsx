import { Link } from 'react-router-dom';
import { useAffiliate } from '@/hooks/affiliateWorkspace';
import { useProduct } from '@/hooks/useCatalog';
import AffiliateLayout from '@/components/layout/AffiliateLayout';
import AffiliateProductRow from '@/components/features/AffiliateProductRow';

function PickedProduct({ handle }: { handle: string }) {
  const query = useProduct(handle);
  if (query.isLoading) return <p className="affiliate-loading">Loading saved product…</p>;
  if (query.error) return <p className="affiliate-error" role="alert">{query.error.message}</p>;
  if (!query.data) return <p className="affiliate-error">This saved product is no longer available.</p>;
  return <AffiliateProductRow product={query.data} editable />;
}

export default function AffiliateItems() {
  const affiliate = useAffiliate();
  const picks = affiliate.data?.picks || [];
  return (
    <AffiliateLayout title="My Picks">
      <div className="affiliate-section-heading"><h1>My Picks</h1><span>{picks.length} saved products</span></div>
      {picks.length ? (
        <div className="affiliate-product-list">{picks.map(handle => <PickedProduct key={handle} handle={handle} />)}</div>
      ) : (
        <section className="affiliate-empty">
          <h2>Your picks will live here</h2>
          <p>Save Dah Glow products to curate a shareable collection.</p>
          <Link className="affiliate-primary" to="/affiliate">Discover products</Link>
        </section>
      )}
    </AffiliateLayout>
  );
}
