import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AffiliateLayout from '@/components/layout/AffiliateLayout';
import AffiliateDataChart from '@/components/features/AffiliateDataChart';
import { affiliateApi } from '@/lib/affiliate';
import { useAffiliate } from '@/hooks/affiliateWorkspace';
import type { AffiliateStats } from '@/types/affiliate';

const periods = [1, 7, 30];

export default function AffiliateData() {
  const [days, setDays] = useState(7);
  const affiliate = useAffiliate();
  const query = useQuery({
    queryKey: ['affiliate-analytics', affiliate.user?.id, days],
    queryFn: () => affiliateApi<AffiliateStats>({ op: 'analytics', days }),
    enabled: !!affiliate.user,
    retry: false,
  });

  return (
    <AffiliateLayout title="Data Center">
      <div className="affiliate-section-heading"><h1>Data Center</h1><span>Verified affiliate activity</span></div>
      <section className="affiliate-data-panel">
        <div className="affiliate-row"><h2>Referral performance</h2><span>Pacific Time</span></div>
        <div className="affiliate-period-tabs" aria-label="Analytics period">
          {periods.map(period => (
            <button type="button" key={period} className={days === period ? 'active' : ''} onClick={() => setDays(period)}>
              {period === 1 ? 'Today' : `Last ${period} days`}
            </button>
          ))}
        </div>
        {query.isLoading && <p className="affiliate-loading" role="status">Loading verified activity…</p>}
        {query.error && <p className="affiliate-error" role="alert">{query.error.message}</p>}
        {query.data && (
          <>
            <div className="affiliate-data-metrics">
              <div className="featured"><span>Tracked visits</span><strong>{query.data.visits}</strong></div>
              <div><span>Qualifying orders</span><strong>{query.data.orders}</strong></div>
              <div><span>Tracked revenue</span><strong>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(query.data.revenue)}</strong></div>
              <div><span>Commission</span><strong>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(query.data.commission)}</strong></div>
            </div>
            <AffiliateDataChart data={query.data.daily} />
          </>
        )}
        {!query.isLoading && !query.error && !query.data && <p className="affiliate-empty">No activity data is available for this period.</p>}
      </section>
    </AffiliateLayout>
  );
}
