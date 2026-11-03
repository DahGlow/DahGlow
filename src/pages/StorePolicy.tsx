import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { shopify } from '@/lib/shopify';
import PageHeader from '@/components/layout/PageHeader';

interface Policy { title: string; body: string; }
interface PolicyResponse {
  shop: {
    shippingPolicy: Policy | null;
    refundPolicy: Policy | null;
  };
}
type PolicyKey = keyof PolicyResponse['shop'];

const POLICY_PAGES: Record<PolicyKey, { title: string; missing: string }> = {
  shippingPolicy: {
    title: 'Shipping information',
    missing: 'The store has not published shipping information yet. Shipping options and rates are shown at Shopify checkout.',
  },
  refundPolicy: {
    title: 'Returns & refunds',
    missing: 'The store has not published a returns or refund policy yet. Contact our team for assistance.',
  },
};

export default function StorePolicy({ policyKey }: { policyKey: PolicyKey }) {
  const config = POLICY_PAGES[policyKey];
  const query = useQuery({
    queryKey: ['shopify', 'policies'],
    queryFn: () => shopify<PolicyResponse>({ op: 'policies' }),
    staleTime: 300000,
    retry: 1,
  });
  const policy = query.data?.shop?.[policyKey];

  return (
    <main className="store-policy-page">
      <PageHeader title={policy?.title || config.title} />
      {query.isLoading ? (
        <p className="store-policy-state" role="status">Loading the current store policy from Shopify…</p>
      ) : query.isError ? (
        <section className="store-policy-state" role="alert">
          <p>We couldn’t load this policy from Shopify.</p>
          <button className="order-secondary-button" onClick={() => void query.refetch()} disabled={query.isFetching}>
            {query.isFetching ? 'Retrying…' : 'Try again'}
          </button>
        </section>
      ) : policy?.body ? (
        <article className="store-policy-content rich-description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(policy.body) }} />
      ) : (
        <section className="store-policy-state">
          <p>{config.missing}</p>
          <Link to="/contact" className="order-secondary-button">Contact customer support</Link>
        </section>
      )}
    </main>
  );
}
