import { useSearchParams } from 'react-router-dom';
import { Zap } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import CatalogResults from '@/components/features/CatalogResults';
import ProductCard from '@/components/features/ProductCard';
import campaignBanner from '@/assets/black-friday.jpg';
import { useCatalog } from '@/hooks/useCatalog';

const CATEGORIES = [
  'All',
  'Shoes',
  'Women',
  'Bags & Luggage',
  'Home',
  'Sports & Outdoor',
  'Kids',
  'Men',
  'Underwear & Sleepwear',
  'Beauty',
  'Baby',
  'Jewelry & Watches',
];

const SORT_OPTIONS = [
  { value: 'BEST_SELLING', label: 'Recommended' },
  { value: 'CREATED_AT', label: 'Newest arrivals', reverse: true },
  { value: 'PRICE', label: 'Price: low to high' },
  { value: 'PRICE_DESC', label: 'Price: high to low' },
];

export default function SuperDeals() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'All';
  const sort = params.get('sort') || 'BEST_SELLING';
  const selectedSort = SORT_OPTIONS.find(option => option.value === sort) || SORT_OPTIONS[0];
  const catalog = useCatalog({
    category,
    sort: sort === 'PRICE_DESC' ? 'PRICE' : sort,
    reverse: selectedSort.reverse || sort === 'PRICE_DESC',
    first: 48,
  });
  const deals = catalog.products.filter(product => product.original > product.price);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(updates)) {
      if (value === 'All' || !value) next.delete(key);
      else next.set(key, value);
    }
    setParams(next);
  };

  const filters = (
    <div className="filter-chips">
      {CATEGORIES.map(item => (
        <button
          aria-pressed={category === item}
          className={category === item ? 'active' : ''}
          key={item}
          onClick={() => updateParams({ category: item })}
        >
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <main className="deals-page">
      <section className="deals-hero" style={{ backgroundImage: `url(${campaignBanner})` }}>
        <PageHeader title="Super Deals" heart />
        <h1 className="deals-desktop-title"><Zap size={20} /> Super Deals</h1>
        <div className="deals-glass">
          <h2><Zap size={24} /> Current price drops</h2>
          <div className="flash-carousel">
            {deals.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} compact deal />
            ))}
          </div>
          {!deals.length && <p>No sale products in this selection yet.</p>}
        </div>
      </section>
      <section className="deals-content">
        <aside className="deals-sidebar" aria-label="Filter deals by category">
          <h2>Category</h2>
          {filters}
        </aside>
        <div className="deals-results">
          <div className="deals-toolbar">
            <label htmlFor="deals-sort">Sort by</label>
            <select
              id="deals-sort"
              value={sort}
              onChange={event => updateParams({ sort: event.target.value })}
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <CatalogResults
            deal
            products={deals}
            loading={catalog.isLoading}
            error={catalog.error}
            hasMore={catalog.hasNextPage}
            fetching={catalog.isFetchingNextPage}
            onMore={() => void catalog.fetchNextPage()}
          />
        </div>
        <div className="deals-mobile-filters">{filters}</div>
      </section>
    </main>
  );
}
