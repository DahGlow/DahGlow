import { Link, useSearchParams } from 'react-router-dom';
import AffiliateLayout from '@/components/layout/AffiliateLayout';
import AffiliateBalance from '@/components/features/AffiliateBalance';
import AffiliateBoostPreview from '@/components/features/AffiliateBoostPreview';
import AffiliateCampaigns from '@/components/features/AffiliateCampaigns';
import AffiliateCatalog from '@/components/features/AffiliateCatalog';
import AffiliateShortcuts from '@/components/features/AffiliateShortcuts';
import { useAffiliate } from '@/hooks/useAffiliate';

export default function Affiliate() {
  const affiliate = useAffiliate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'campaigns' ? 'campaigns' : 'catalog';
  const selectTab = (next: string) => {
    const updated = new URLSearchParams(params);
    if (next === 'catalog') updated.delete('tab');
    else updated.set('tab', next);
    setParams(updated, { replace: true });
  };

  return (
    <AffiliateLayout title="Creator Space" hero>
      <section className="affiliate-overview">
        <div className="affiliate-overview-title">
          <span className="affiliate-eyebrow">YOUR DAH GLOW CREATOR SPACE</span>
          <h1>Share your style.</h1>
          <p>Curate picks, share tracked links, and follow verified program activity.</p>
          <Link className="affiliate-secondary" to="/affiliate/account">Manage my account</Link>
        </div>
        <div className="affiliate-authorization">
          <div>
            <strong>{affiliate.data?.profile.display_name || 'Your creator profile'}</strong>
            <p>Share public profile links from Social Profiles. They are not platform authorization or verification.</p>
          </div>
          <Link className="affiliate-secondary" to="/affiliate/social">Social profiles</Link>
        </div>
      </section>
      <div className="affiliate-overview-grid">
        <AffiliateBalance data={affiliate.data} />
        <div className="affiliate-tools">
          <AffiliateShortcuts />
          <AffiliateBoostPreview />
        </div>
      </div>
      <section className="affiliate-products-panel">
        <nav className="affiliate-content-tabs" aria-label="Affiliate discovery">
          <button type="button" className={tab === 'catalog' ? 'active' : ''} onClick={() => selectTab('catalog')}>Discover products</button>
          <button type="button" className={tab === 'campaigns' ? 'active' : ''} onClick={() => selectTab('campaigns')}>Campaigns</button>
          <Link to="/affiliate/items">My Picks</Link>
        </nav>
        {tab === 'campaigns' ? <AffiliateCampaigns /> : <AffiliateCatalog />}
      </section>
    </AffiliateLayout>
  );
}
