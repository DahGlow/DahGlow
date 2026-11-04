import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import ProductCard from '@/components/features/ProductCard';
import { STYLE_INSPIRATION } from '@/data/styleInspiration';
import { useCatalog } from '@/hooks/useCatalog';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSavedInspiration } from '@/hooks/useSavedInspiration';

export default function InspirationDetail() {
  const { slug } = useParams();
  const item = STYLE_INSPIRATION.find(entry => entry.slug === slug);
  const { savedSlugs, toggleSaved } = useSavedInspiration();
  const products = useCatalog({ query: item?.productSearch || '__no_inspiration__', first: 12 });

  usePageMeta(
    item ? `${item.title} | Style Inspiration | Dah Glow` : 'Inspiration not found | Dah Glow',
    item?.description || 'Explore beauty, skincare, hair, personal style, and self-care inspiration from Dah Glow.',
  );

  useEffect(() => {
    if (!item) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: item.title,
      description: item.description,
      image: item.image,
      articleSection: item.category,
      publisher: { '@type': 'Organization', name: 'Dah Glow', url: 'https://us.dahglow.com/' },
      mainEntityOfPage: `https://us.dahglow.com/inspiration/${item.slug}`,
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [item]);

  if (!item) {
    return <main className="inspiration-not-found"><h1>This inspiration could not be found</h1><p>It may have moved. Explore the latest Dah Glow style inspiration instead.</p><Link className="inspiration-button dark" to="/inspiration">Explore Inspiration <ArrowRight size={16}/></Link></main>;
  }

  const related = STYLE_INSPIRATION.filter(entry => entry.slug !== item.slug && (entry.category === item.category || entry.mood === item.mood)).slice(0, 3);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: item.title, text: item.description, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Inspiration link copied.');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') toast.error('This inspiration link could not be shared.');
    }
  };

  return (
    <main className="inspiration-detail-page">
      <nav className="inspiration-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span>/</span><Link to="/inspiration">Style Inspiration</Link><span>/</span><span>{item.title}</span>
      </nav>
      <article>
        <header className="inspiration-detail-heading">
          <Link className="inspiration-back-link" to="/inspiration"><ArrowLeft size={17}/> All inspiration</Link>
          <span className="inspiration-kicker">{item.label} · {item.category}</span>
          <h1>{item.title}</h1>
          <p>{item.description}</p>
          <div className="inspiration-detail-actions">
            <button type="button" onClick={() => toggleSaved(item.slug)} aria-pressed={savedSlugs.includes(item.slug)}>
              <Bookmark size={18} fill={savedSlugs.includes(item.slug) ? 'currentColor' : 'none'}/>{savedSlugs.includes(item.slug) ? 'Saved' : 'Save inspiration'}
            </button>
            <button type="button" onClick={() => void share()}><Share2 size={18}/>Share</button>
          </div>
        </header>
        <figure className="inspiration-detail-cover">
          <img src={item.image} alt={item.imageAlt} fetchPriority="high"/>
          <figcaption>{item.mood} · A Dah Glow inspiration guide</figcaption>
        </figure>
        <div className="inspiration-article-layout">
          <section className="inspiration-guide-copy">
            <span className="inspiration-kicker">MAKE IT YOUR OWN</span>
            <h2>How to get the look</h2>
            <p>{item.guide.introduction}</p>
            <ol>{item.guide.steps.map(step => <li key={step}>{step}</li>)}</ol>
            <p className="inspiration-guide-disclaimer">These are general inspiration ideas, not medical or professional advice. Follow each product’s directions and choose what feels right for you.</p>
          </section>
          <aside className="inspiration-detail-aside">
            <span className="inspiration-kicker">THE MOOD</span>
            <h2>{item.mood}</h2>
            <p>Explore this idea at your own pace. Personal style is yours to shape.</p>
            <Link to={`/inspiration?saved=1`}>Browse saved inspiration <ArrowRight size={16}/></Link>
          </aside>
        </div>
      </article>

      <section className="inspiration-shop-look" aria-labelledby="shop-look-heading">
        <div className="inspiration-section-heading split">
          <div><span className="inspiration-kicker">DISCOVER FROM THE LIVE CATALOG</span><h2 id="shop-look-heading">Shop This Look</h2><p>Products below are retrieved from Dah Glow’s current Shopify catalog.</p></div>
          <Link className="inspiration-text-link" to={`/search?q=${encodeURIComponent(item.productSearch)}`}>See catalog results <ArrowRight size={17}/></Link>
        </div>
        {products.isLoading ? <p className="inspiration-products-state" role="status">Finding related products…</p>
          : products.error ? <p className="inspiration-products-state" role="alert">Products could not be loaded from Shopify. <Link to={`/search?q=${encodeURIComponent(item.productSearch)}`}>Try the catalog search</Link>.</p>
            : products.products.length ? <div className="inspiration-product-grid">{products.products.slice(0, 4).map(product => <ProductCard key={product.id} product={product}/>)}</div>
              : <p className="inspiration-products-state">No matching products are currently available in the catalog. Explore the <Link to={`/search?q=${encodeURIComponent(item.productSearch)}`}>Shopify catalog</Link> for more options.</p>}
      </section>

      {related.length > 0 && <section className="inspiration-related-section">
        <div className="inspiration-section-heading"><span className="inspiration-kicker">KEEP EXPLORING</span><h2>More inspiration for you</h2></div>
        <div className="inspiration-related-grid">{related.map(entry => <Link className="inspiration-related-card" to={`/inspiration/${entry.slug}`} key={entry.slug}><img src={entry.image} alt={entry.imageAlt} loading="lazy"/><span className="inspiration-kicker">{entry.category}</span><h3>{entry.title}</h3><span>Discover look <ArrowRight size={15}/></span></Link>)}</div>
      </section>}
    </main>
  );
}
