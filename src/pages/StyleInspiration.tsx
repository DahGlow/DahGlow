import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowRight, Bookmark, Heart, Search, Sparkles } from 'lucide-react';
import FooterNewsletterForm from '@/components/forms/FooterNewsletterForm';
import { GLOW_MOODS, INSPIRATION_CATEGORIES, STYLE_INSPIRATION, type InspirationCategory, type InspirationItem } from '@/data/styleInspiration';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSavedInspiration } from '@/hooks/useSavedInspiration';
const heroImage = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1800&q=85';

function InspirationCard({ item, saved, onToggleSave, featured = false }: {
  item: InspirationItem;
  saved: boolean;
  onToggleSave: (slug: string) => void;
  featured?: boolean;
}) {
  return (
    <article className={`inspiration-card${featured ? ' is-featured' : ''}`}>
      <Link className="inspiration-card-image" to={`/inspiration/${item.slug}`}>
        <img src={item.image} alt={item.imageAlt} loading="lazy" />
        <span className="inspiration-image-label">{item.label}</span>
      </Link>
      <div className="inspiration-card-copy">
        <div className="inspiration-card-meta"><span>{item.category}</span><span>{item.mood}</span></div>
        <h3><Link to={`/inspiration/${item.slug}`}>{item.title}</Link></h3>
        <p>{item.description}</p>
        <div className="inspiration-card-actions">
          <Link to={`/inspiration/${item.slug}`}>Discover look <ArrowRight size={16}/></Link>
          <button type="button" className={saved ? 'is-saved' : ''} onClick={() => onToggleSave(item.slug)} aria-label={`${saved ? 'Remove' : 'Save'} ${item.title}`} aria-pressed={saved}>
            {saved ? <Bookmark size={18} fill="currentColor"/> : <Heart size={18}/>}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function StyleInspiration() {
  const [params, setParams] = useSearchParams();
  const { savedSlugs, toggleSaved } = useSavedInspiration();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<InspirationCategory | 'All'>('All');
  const [mood, setMood] = useState('');
  const savedOnly = params.get('saved') === '1';

  usePageMeta(
    'Style Inspiration | Beauty, Skincare & Self-Care | Dah Glow',
    'Explore beauty looks, skincare rituals, hair ideas, personal style, and self-care inspiration curated by Dah Glow.',
  );

  useEffect(() => {
    const scriptId = 'dah-glow-inspiration-schema';
    const existing = document.getElementById(scriptId);
    const script = existing instanceof HTMLScriptElement ? existing : document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Style Inspiration | Dah Glow',
      description: 'Beauty, skincare, hair, style, and self-care inspiration from Dah Glow.',
      url: 'https://us.dahglow.com/inspiration',
      isPartOf: { '@type': 'WebSite', name: 'Dah Glow', url: 'https://us.dahglow.com/' },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: STYLE_INSPIRATION.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `https://us.dahglow.com/inspiration/${item.slug}`,
          name: item.title,
        })),
      },
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  const filtered = useMemo(() => STYLE_INSPIRATION.filter(item => {
    const text = `${item.title} ${item.description} ${item.category} ${item.mood} ${item.label}`.toLowerCase();
    return (!search.trim() || text.includes(search.trim().toLowerCase()))
      && (category === 'All' || item.category === category)
      && (!mood || item.mood === mood)
      && (!savedOnly || savedSlugs.includes(item.slug));
  }), [category, mood, savedOnly, savedSlugs, search]);
  const scrollToGallery = () => document.getElementById('inspiration-gallery')?.scrollIntoView({ behavior: 'smooth' });
  const selectCategory = (next: InspirationCategory) => {
    setCategory(next);
    setMood('');
    setParams(savedOnly ? { saved: '1' } : {});
    window.setTimeout(scrollToGallery, 0);
  };

  return (
    <main className="style-inspiration-page">
      <section className="inspiration-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(32,19,21,.58),rgba(32,19,21,.06)),url("${heroImage}")` }}>
        <div className="inspiration-hero-copy">
          <span className="inspiration-kicker"><Sparkles size={15}/> BEAUTY. SELFCARE. CONFIDENCE.</span>
          <h1>Find Your Glow.<br/><em>Discover Your Style.</em></h1>
          <p>Explore beauty inspiration, discover new trends, and find the looks and products that express your unique style.</p>
          <div className="inspiration-hero-actions">
            <button type="button" className="inspiration-button dark" onClick={scrollToGallery}>Explore Inspiration <ArrowDown size={16}/></button>
            <Link className="inspiration-button light" to="/search?q=beauty">Shop the Collection</Link>
          </div>
        </div>
        <span className="inspiration-hero-caption">YOUR EVERYDAY, IN A NEW LIGHT</span>
      </section>

      <section className="inspiration-category-section" aria-labelledby="inspiration-categories-heading">
        <div className="inspiration-section-heading">
          <span className="inspiration-kicker">A LITTLE INSPIRATION GOES A LONG WAY</span>
          <h2 id="inspiration-categories-heading">Explore your way</h2>
          <p>Beauty, personal style, and small rituals—follow whatever feels like you.</p>
        </div>
        <div className="inspiration-category-grid">
          {INSPIRATION_CATEGORIES.map(item => (
            <button className="inspiration-category-tile" key={item.name} onClick={() => selectCategory(item.name)}>
              <img src={item.image} alt="" loading="lazy"/>
              <span className="inspiration-category-copy"><strong>{item.title}</strong><small>{item.description}</small><span>Explore <ArrowRight size={14}/></span></span>
            </button>
          ))}
        </div>
      </section>

      <section className="inspiration-featured-section" aria-labelledby="trending-heading">
        <div className="inspiration-section-heading split">
          <div><span className="inspiration-kicker">THE DAH GLOW EDIT</span><h2 id="trending-heading">Trending Now</h2><p>Ideas our editors are loving. A curated edit—not live trend statistics.</p></div>
          <button type="button" className="inspiration-text-link" onClick={scrollToGallery}>Explore all inspiration <ArrowRight size={17}/></button>
        </div>
        <div className="inspiration-featured-grid">
          {STYLE_INSPIRATION.filter(item => item.featured).slice(0, 3).map((item, index) => (
            <InspirationCard key={item.slug} item={item} saved={savedSlugs.includes(item.slug)} onToggleSave={toggleSaved} featured={index === 0}/>
          ))}
        </div>
      </section>

      <section className="glow-mood-section" aria-labelledby="glow-mood-heading">
        <div className="inspiration-section-heading">
          <span className="inspiration-kicker">HOW ARE YOU FEELING TODAY?</span>
          <h2 id="glow-mood-heading">Find Your Glow Mood</h2>
          <p>Choose a mood to explore a more personal edit.</p>
        </div>
        <div className="glow-mood-list">
          {GLOW_MOODS.map((item, index) => {
            const image = STYLE_INSPIRATION.find(entry => entry.mood === item)?.image || INSPIRATION_CATEGORIES[index % INSPIRATION_CATEGORIES.length].image;
            return <button key={item} className={mood === item ? 'active' : ''} aria-pressed={mood === item} onClick={() => { setMood(mood === item ? '' : item); setCategory('All'); setParams(savedOnly ? { saved: '1' } : {}); window.setTimeout(scrollToGallery, 0); }}>
              <img src={image} alt="" loading="lazy"/><span>{item}</span>
            </button>;
          })}
        </div>
      </section>

      <section className="inspiration-gallery-section" id="inspiration-gallery" aria-labelledby="inspiration-gallery-heading">
        <div className="inspiration-section-heading split">
          <div><span className="inspiration-kicker">BEAUTY, STYLE & LITTLE RITUALS</span><h2 id="inspiration-gallery-heading">{savedOnly ? 'Your saved inspiration' : 'The Inspiration Gallery'}</h2><p>Save a look for later, or open it to explore the full guide and related Dah Glow products.</p></div>
          <button type="button" className={`inspiration-text-link ${savedOnly ? 'active' : ''}`} onClick={() => { setParams(savedOnly ? {} : { saved: '1' }); setCategory('All'); setMood(''); }}>
            <Bookmark size={16}/>{savedOnly ? 'Show all looks' : `Saved looks (${savedSlugs.length})`}
          </button>
        </div>
        <div className="inspiration-filters">
          <label className="inspiration-search"><Search size={18}/><span className="sr-only">Search inspiration</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search beauty, skincare, hair, style…"/></label>
          <div className="inspiration-filter-chips" aria-label="Filter by category">
            {(['All', ...INSPIRATION_CATEGORIES.map(item => item.name)] as const).map(item => (
              <button key={item} className={category === item ? 'active' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
          {mood && <button className="inspiration-active-filter" onClick={() => setMood('')}>Mood: {mood} <span aria-hidden="true">×</span></button>}
        </div>
        {filtered.length ? <div className="inspiration-masonry">
          {filtered.map((item, index) => <InspirationCard key={item.slug} item={item} saved={savedSlugs.includes(item.slug)} onToggleSave={toggleSaved} featured={index % 4 === 1}/>)}
        </div> : <div className="inspiration-empty"><Search size={26}/><h3>No inspiration found</h3><p>Try another search or clear a filter to explore more of the edit.</p><button className="inspiration-button dark" onClick={() => { setSearch(''); setMood(''); setCategory('All'); setParams({}); }}>Clear filters</button></div>}
      </section>

      <section className="how-to-section" aria-labelledby="how-to-heading">
        <div className="inspiration-section-heading split">
          <div><span className="inspiration-kicker">A FEW IDEAS TO GET YOU STARTED</span><h2 id="how-to-heading">How to Get the Look</h2><p>Simple, flexible guides to make inspiration your own.</p></div>
          <Link className="inspiration-text-link" to="/search?q=beauty">Browse Dah Glow products <ArrowRight size={17}/></Link>
        </div>
        <div className="inspiration-guides">
          {STYLE_INSPIRATION.filter(item => item.featured).slice(0, 3).map((item, index) => (
            <Link className="inspiration-guide" key={item.slug} to={`/inspiration/${item.slug}`}>
              <span className="guide-number">0{index + 1}</span><span className="inspiration-kicker">{item.category} GUIDE</span><h3>{item.title}</h3><p>{item.guide.introduction}</p><span className="inspiration-text-link">Read the guide <ArrowRight size={16}/></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="inspiration-newsletter" aria-labelledby="inspiration-newsletter-heading">
        <div><span className="inspiration-kicker">A NOTE FROM DAH GLOW</span><h2 id="inspiration-newsletter-heading">Your Daily Dose of Glow</h2><p>Get beauty inspiration, skincare tips, fresh trends, and Dah Glow updates delivered to your inbox.</p></div>
        <FooterNewsletterForm id="inspiration-email"/>
        <small>Subscriptions are saved to your account preferences. Email delivery depends on the store’s configured service.</small>
      </section>
    </main>
  );
}
