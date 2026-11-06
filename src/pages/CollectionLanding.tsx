import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import CatalogResults from '@/components/features/CatalogResults';
import StructuredData from '@/components/seo/StructuredData';
import { useCatalog } from '@/hooks/useCatalog';
import { usePageMeta } from '@/hooks/usePageMeta';
import { productUrl } from '@/lib/shopify';

const COLLECTIONS = {
  'lip-gloss': {
    name: 'Lip Gloss',
    title: 'Shop Lip Gloss | Dah Glow Beauty',
    description: 'Shop lip gloss at Dah Glow. Browse available lip gloss products from our live catalog and find your next beauty favorite.',
    query: 'lip gloss',
  },
  skincare: {
    name: 'Skincare',
    title: 'Shop Skincare | Dah Glow Beauty',
    description: 'Explore skincare products available at Dah Glow. Browse current catalog results and discover skincare essentials.',
    query: 'skincare',
  },
  'beauty-makeup': {
    name: 'Beauty & Makeup',
    title: 'Beauty & Makeup | Dah Glow Official Store',
    description: 'Explore beauty and makeup products in the Dah Glow catalog, including current beauty favorites and self-care essentials.',
    category: 'Beauty',
  },
  'new-arrivals': {
    name: 'New Arrivals',
    title: 'New Arrivals | Latest Products at Dah Glow',
    description: 'Discover the latest products added to the Dah Glow catalog, with new styles and beauty finds to explore.',
    sort: 'CREATED_AT',
    reverse: true,
  },
  all: {
    name: 'Shop All Products',
    title: 'Shop All Products | Dah Glow Official Store',
    description: 'Browse products currently available in the Dah Glow catalog, including beauty, fashion, accessories, and home finds.',
    sort: 'BEST_SELLING',
  },
} as const;

type CollectionSlug = keyof typeof COLLECTIONS;

const SITE_ORIGIN = 'https://us.dahglow.com';

export default function CollectionLanding() {
  const { slug = '' } = useParams();
  const collection = COLLECTIONS[slug as CollectionSlug];
  const catalog = useCatalog(collection ? {
    query: 'query' in collection ? collection.query : undefined,
    category: 'category' in collection ? collection.category : undefined,
    sort: 'sort' in collection ? collection.sort : undefined,
    reverse: 'reverse' in collection ? collection.reverse : undefined,
    first: 48,
  } : { query: '__unknown_collection__', first: 1 });
  const products = catalog.products;
  const canonicalPath = `/collections/${slug}`;
  const noindex = !collection;

  usePageMeta(
    collection?.title || 'Collection Not Found | Dah Glow',
    collection?.description,
    { canonicalPath, noindex },
  );

  const structuredData = useMemo(() => {
    if (!collection) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection.name,
      description: collection.description,
      url: `${SITE_ORIGIN}${canonicalPath}`,
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Shop All Products', item: `${SITE_ORIGIN}/collections/all` },
          { '@type': 'ListItem', position: 3, name: collection.name, item: `${SITE_ORIGIN}${canonicalPath}` },
        ],
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: products.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_ORIGIN}${productUrl(product)}`,
          name: product.name,
        })),
      },
    };
  }, [collection, canonicalPath, products]);

  if (!collection) {
    return (
      <main className="standard-page">
        <h1>Collection not found</h1>
        <p>Browse <Link to="/collections/all">all Dah Glow products</Link>.</p>
      </main>
    );
  }

  return (
    <main className="standard-page collection-landing">
      <StructuredData data={structuredData} />
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true"> / </span>
        <Link to="/collections/all">Shop All Products</Link><span aria-hidden="true"> / </span>
        <span aria-current="page">{collection.name}</span>
      </nav>
      <header className="collection-intro">
        <span className="eyebrow">DAH GLOW · SHOP THE COLLECTION</span>
        <h1>{collection.name}</h1>
        <p>{collection.description}</p>
      </header>
      <nav className="collection-links" aria-label="Shop more collections">
        {Object.entries(COLLECTIONS).filter(([key]) => key !== slug).map(([key, item]) => (
          <Link key={key} to={`/collections/${key}`}>{item.name}</Link>
        ))}
        <Link to="/gift-cards">Gift Cards</Link>
        <Link to="/help-center">Customer Service</Link>
      </nav>
      <CatalogResults
        products={products}
        loading={catalog.isLoading}
        error={catalog.error}
        hasMore={catalog.hasNextPage}
        fetching={catalog.isFetchingNextPage}
        onMore={() => void catalog.fetchNextPage()}
      />
    </main>
  );
}
