import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import heroImage from '@/assets/affiliate-commission-boost.webp';
import AffiliateProductRow from '@/components/features/AffiliateProductRow';
import { useProduct } from '@/hooks/useCatalog';
import { useShop } from '@/hooks/useShop';
import { affiliateApi, affiliateVisitorKey } from '@/lib/affiliate';

interface Referral {
  name: string;
  target: string;
  handles: string[];
  visitId: string | null;
  expiresAt: string | null;
}

function ReferralProduct({ handle }: { handle: string }) {
  const query = useProduct(handle);
  if (query.isLoading) return <p className="affiliate-loading">Loading product…</p>;
  if (query.error) return <p className="affiliate-error" role="alert">{query.error.message}</p>;
  if (!query.data) return null;
  return <AffiliateProductRow product={query.data} />;
}

export default function AffiliateReferral() {
  const { code = '', linkId } = useParams();
  const { language } = useShop();
  const query = useQuery({
    queryKey: ['affiliate-referral', code, linkId],
    queryFn: () => affiliateApi<Referral>({
      op: 'resolve',
      code,
      linkId: linkId || undefined,
      visitorKey: affiliateVisitorKey(),
    }),
    enabled: !!code,
    retry: false,
  });

  useEffect(() => {
    const referral = query.data;
    if (!referral?.visitId || !referral.expiresAt || Date.parse(referral.expiresAt) <= Date.now()) return;
    localStorage.setItem('dg-affiliate-attribution', JSON.stringify({
      visitId: referral.visitId,
      expiresAt: referral.expiresAt,
    }));
  }, [query.data]);

  if (query.isLoading) {
    return <main className="affiliate-referral-page"><p className="affiliate-loading" role="status">Opening this creator’s Dah Glow picks…</p></main>;
  }
  if (query.error || !query.data) {
    return (
      <main className="affiliate-referral-page">
        <header><Link to="/">DAH GLOW</Link></header>
        <section className="affiliate-empty" role={query.error ? 'alert' : undefined}>
          <h1>This creator link is unavailable</h1>
          <p>{query.error?.message || 'The referral link could not be resolved.'}</p>
          <Link className="affiliate-primary" to="/">Continue shopping</Link>
        </section>
      </main>
    );
  }

  const referral = query.data;
  return (
    <main className="affiliate-referral-page" lang={language}>
      <header><Link to="/">DAH GLOW</Link><Link to={referral.target}>Shop Dah Glow <ArrowRight size={18} /></Link></header>
      <section className="affiliate-referral-hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <span className="affiliate-eyebrow">CURATED FOR YOU</span>
        <h1>{referral.name}’s Dah Glow Picks</h1>
        <p>Discover products selected by this Dah Glow creator.</p>
        <Link className="affiliate-primary" to={referral.target}>Explore the collection <ArrowRight size={18} /></Link>
      </section>
      <section className="affiliate-referral-products">
        <h2>Featured picks</h2>
        {referral.handles.length
          ? referral.handles.map(handle => <ReferralProduct key={handle} handle={handle} />)
          : <p>This creator hasn’t added products yet. Explore the store to find something you love.</p>}
      </section>
      <p className="affiliate-referral-disclosure">This creator may earn a commission on qualifying purchases. Purchases and commissions follow the published Dah Glow Affiliate Program rules.</p>
    </main>
  );
}
