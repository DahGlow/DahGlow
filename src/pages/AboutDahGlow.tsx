import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import beautyDuo from '@/assets/about/images/community/women-beauty-editorial.jpg';
import lipstickEditorial from '@/assets/about/images/beauty/lipstick-on-blush-background.jpg';
import lipCollection from '@/assets/about/images/beauty/luxury-lip-product-collection.jpg';
import makeupPalette from '@/assets/about/images/beauty/makeup-palette-editorial.jpg';
import roseSerum from '@/assets/about/images/beauty/rose-serum-product-editorial.jpg';
import beautyProducts from '@/assets/about/images/brand-story/beauty-products-with-roses.jpg';
import deepSkinPortrait from '@/assets/about/images/confidence/confident-deep-skin-portrait.jpg';
import naturalBeauty from '@/assets/about/images/confidence/natural-beauty-closeup.jpg';
import softGlam from '@/assets/about/images/confidence/soft-glam-portrait.jpg';
import glowingSkin from '@/assets/about/images/confidence/glowing-skin-body-editorial.jpg';
import minimalistPortrait from '@/assets/about/images/confidence/minimalist-beauty-portrait.jpg';
import floralSkincare from '@/assets/about/images/selfcare/floral-skincare-ritual.jpg';
import gentleSkincare from '@/assets/about/images/selfcare/gentle-skincare-moment.jpg';
import morningSelfcare from '@/assets/about/images/selfcare/morning-selfcare-ritual.jpg';
import roseProducts from '@/assets/about/images/selfcare/rose-infused-beauty-products.jpg';
import pinkCreams from '@/assets/about/images/skincare/pink-skincare-cream-collection.jpg';
import skincareRoutine from '@/assets/about/images/skincare/pink-skincare-routine.jpg';
import botanicalCollection from '@/assets/about/images/vision/botanical-skincare-collection.jpg';

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      element.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('is-visible');
        observer.unobserve(element);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`about-reveal ${className}`}>{children}</div>;
}

function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`about-glass-panel ${className}`}>{children}</div>;
}

function StoryPhoto({ src, alt, className = '', loading = 'lazy' }: {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}) {
  return <figure className={`about-photo ${className}`}><img src={src} alt={alt} loading={loading} decoding="async" fetchPriority={loading === 'eager' ? 'high' : 'auto'} /></figure>;
}

const categoryLinks = [
  { title: 'Beauty & makeup', query: 'makeup', note: 'Color, tools, and finishing touches' },
  { title: 'Skincare', query: 'skincare', note: 'Explore skincare in the live catalog' },
  { title: 'Haircare', query: 'hair', note: 'Find something for your routine' },
  { title: 'Body care', query: 'body care', note: 'Everyday care and feel-good finds' },
  { title: 'Selfcare', query: 'self care', note: 'Small rituals, chosen by you' },
  { title: 'Beauty accessories', query: 'beauty accessories', note: 'Details that make a look your own' },
];

export default function AboutDahGlow() {
  const heroRef = useRef<HTMLElement>(null);

  usePageMeta(
    'About Dah Glow | Beauty, Selfcare & Confidence',
    'Discover Dah Glow, a beauty and selfcare destination created to inspire women through beauty, personal style, selfcare, and confidence.',
  );

  useEffect(() => {
    const descriptors = [
      { attribute: 'property', name: 'og:image', content: deepSkinPortrait },
      { attribute: 'property', name: 'og:image:alt', content: 'Dah Glow beauty, selfcare, and confidence editorial' },
      { attribute: 'name', name: 'twitter:image', content: deepSkinPortrait },
    ];
    const previous = descriptors.map(({ attribute, name, content }) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
      const created = !element;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      const oldContent = element.content;
      element.content = content;
      return { element, created, oldContent };
    });

    return () => previous.forEach(({ element, created, oldContent }) => {
      if (created) element.remove();
      else element.content = oldContent;
    });
  }, []);

  const handleHeroPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty('--hero-x', `${x * 12}px`);
    event.currentTarget.style.setProperty('--hero-y', `${y * 12}px`);
  };

  const resetHeroPointer = () => {
    heroRef.current?.style.setProperty('--hero-x', '0px');
    heroRef.current?.style.setProperty('--hero-y', '0px');
  };

  return (
    <main className="about-dah-glow">
      <section ref={heroRef} className="about-hero" onPointerMove={handleHeroPointerMove} onPointerLeave={resetHeroPointer}>
        <div className="about-hero-atmosphere" aria-hidden="true" />
        <div className="about-hero-layout">
          <div className="about-hero-copy">
            <span className="about-eyebrow"><Sparkles size={14} /> BEAUTY. SELFCARE. CONFIDENCE.</span>
            <h1>More Than Beauty.<br/><em>A Feeling. A Lifestyle.</em></h1>
            <p>Discover the story behind Dah Glow — a destination inspired by beauty, selfcare, confidence, and the power of embracing your individuality.</p>
            <div className="about-hero-actions">
              <Link className="about-button dark" to="/search?q=beauty">Explore Dah Glow <ArrowRight size={16}/></Link>
              <Link className="about-button glass" to="/inspiration">Find inspiration <ArrowUpRight size={16}/></Link>
            </div>
          </div>
          <div className="about-hero-art" aria-label="Beauty editorial portrait">
            <div className="about-hero-halo" aria-hidden="true" />
            <StoryPhoto src={deepSkinPortrait} alt="Editorial portrait celebrating deep skin and individual beauty" className="about-hero-portrait" loading="eager"/>
            <GlassPanel className="about-hero-note"><span>THE DAH GLOW STORY</span><strong>Beauty, on your own terms.</strong></GlassPanel>
            <span className="about-hero-orbit" aria-hidden="true">BEAUTY · SELFCARE · CONFIDENCE ·</span>
          </div>
        </div>
        <a className="about-scroll-cue" href="#about-introduction"><span>SCROLL TO EXPLORE</span><ArrowDown size={16}/></a>
        <span className="about-hero-index" aria-hidden="true">01 / 13</span>
      </section>

      <section id="about-introduction" className="about-introduction about-section">
        <Reveal className="about-intro-copy">
          <span className="about-eyebrow">01 — A PLACE TO BEGIN</span>
          <h2>Welcome to <em>Dah Glow</em></h2>
          <p>Dah Glow is a beauty and selfcare destination created to inspire women to embrace their individuality, express their personal style, and feel confident in their everyday lives.</p>
          <p>We believe discovering beauty should feel personal, welcoming, and full of possibility. Here, you can explore products, find fresh ideas, and make each choice your own.</p>
          <Link className="about-text-link" to="/search?q=beauty">Discover what feels like you <ArrowRight size={16}/></Link>
        </Reveal>
        <Reveal className="about-intro-visual">
          <StoryPhoto src={roseSerum} alt="A rose-toned beauty serum presented in a soft editorial setting"/>
          <span className="about-photo-caption">A LITTLE SPACE FOR YOURSELF</span>
          <span className="about-photo-number">01</span>
        </Reveal>
      </section>

      <section className="about-story about-section">
        <Reveal className="about-story-visual">
          <StoryPhoto src={beautyProducts} alt="Beauty and skincare products arranged with roses"/>
          <GlassPanel className="about-story-stamp"><span>DAH GLOW</span><strong>Growing from a vision.</strong></GlassPanel>
        </Reveal>
        <Reveal className="about-story-copy">
          <span className="about-eyebrow">02 — THE STORY BEHIND THE BRAND</span>
          <h2>Every Glow Begins <em>With a Vision</em></h2>
          <p>Dah Glow began with a brand vision: create a welcoming place where beauty, selfcare, and confidence could come together. A place that leaves room for every woman to discover what she loves and make it personal.</p>
          <p>This story is still unfolding. We are building a beauty and lifestyle destination around discovery, individuality, and the small details that make an everyday routine feel like your own.</p>
          <span className="about-inline-note">A brand story shaped by possibility—not by a single definition of beauty.</span>
        </Reveal>
      </section>

      <section className="about-brand-story">
        <div className="about-brand-story-heading">
          <Reveal><span className="about-eyebrow">03 — OUR BRAND STORY</span><h2>More Than a Store.<br/><em>A Growing Vision.</em></h2></Reveal>
          <Reveal><p>We want Dah Glow to be more than an online shopping destination: a place to discover products, explore inspiration, and express your individuality at your own pace.</p></Reveal>
        </div>
        <Reveal className="about-brand-story-image">
          <StoryPhoto src={beautyDuo} alt="Two women sharing a beauty editorial moment, celebrating different expressions of style"/>
          <GlassPanel className="about-brand-story-card"><span>BEAUTY HAS MANY EXPRESSIONS</span><strong>Make it your own.</strong></GlassPanel>
          <span className="about-brand-side-note">A destination for discovery, personal style, and everyday glow.</span>
        </Reveal>
      </section>

      <section className="about-mission about-section">
        <Reveal className="about-mission-heading">
          <span className="about-eyebrow">04 — OUR MISSION</span>
          <h2>Our Mission Is to<br/><em>Inspire Every Glow</em></h2>
          <p>We aim to make beauty discovery more enjoyable and welcoming—while celebrating individuality and making space for selfcare and confidence.</p>
        </Reveal>
        <div className="about-values-grid">
          {[
            ['01', 'Celebrate individuality', 'Beauty is personal. We make room for different styles, needs, and ways to glow.'],
            ['02', 'Encourage selfcare', 'Small moments of care can be meaningful when they are chosen for you.'],
            ['03', 'Inspire confidence', 'Explore ideas and products that help you feel comfortable expressing yourself.'],
            ['04', 'Make discovery joyful', 'A welcoming experience should invite curiosity, not pressure.'],
          ].map(([number, title, copy]) => (
            <Reveal key={number} className="about-value-card">
              <span>{number}</span><h3>{title}</h3><p>{copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="about-vision">
        <StoryPhoto src={botanicalCollection} alt="Botanical-inspired skincare collection representing a thoughtful vision for beauty" className="about-vision-image"/>
        <div className="about-vision-overlay" aria-hidden="true"/>
        <Reveal className="about-vision-copy">
          <span className="about-eyebrow">05 — OUR VISION</span>
          <h2>A Vision<br/><em>Beyond Today</em></h2>
          <p>Our long-term ambition is to grow Dah Glow into a broader beauty, fashion, and lifestyle destination—one that brings together products, editorial inspiration, selfcare guides, and community experiences over time.</p>
          <GlassPanel className="about-vision-note"><Sparkles size={17}/><span>An ambition for the future—not a claim about services already available.</span></GlassPanel>
        </Reveal>
        <span className="about-vision-word" aria-hidden="true">GLOW</span>
      </section>

      <section className="about-beauty about-section">
        <Reveal className="about-section-heading">
          <span className="about-eyebrow">06 — BEAUTY</span>
          <h2>Beauty Is <em>Personal</em></h2>
          <p>Soft or bold. Barely there or full of color. Beauty is an individual expression, and there is no one way to make it yours.</p>
        </Reveal>
        <div className="about-beauty-gallery">
          <Reveal className="about-gallery-item tall"><StoryPhoto src={minimalistPortrait} alt="Minimalist beauty portrait with a natural, understated look"/><span>Natural beauty</span></Reveal>
          <Reveal className="about-gallery-item"><StoryPhoto src={lipstickEditorial} alt="Lip color and beauty products on a warm pink background"/><span>Color, your way</span></Reveal>
          <Reveal className="about-gallery-item offset"><StoryPhoto src={lipCollection} alt="A curated collection of lip products in a soft pink setting"/><span>Everyday expression</span></Reveal>
          <Reveal className="about-gallery-item wide"><StoryPhoto src={makeupPalette} alt="Makeup palette and beauty essentials arranged as an editorial still life"/><span>Make room to explore</span></Reveal>
        </div>
      </section>

      <section className="about-selfcare">
        <div className="about-selfcare-heading about-section">
          <Reveal><span className="about-eyebrow">07 — SELFCARE</span><h2>Make Time<br/><em>for Yourself</em></h2></Reveal>
          <Reveal><p>Selfcare does not have to be complicated. It can be a familiar skincare step, a quiet pause, or choosing a small ritual that feels right for you.</p><Link className="about-text-link" to="/search?q=skincare">Explore skincare in the catalog <ArrowRight size={16}/></Link></Reveal>
        </div>
        <div className="about-selfcare-gallery">
          <StoryPhoto src={pinkCreams} alt="Pink skincare creams arranged in a calm, minimal composition"/>
          <StoryPhoto src={skincareRoutine} alt="A collection of skincare products for a personal daily routine"/>
          <StoryPhoto src={floralSkincare} alt="Skincare and flowers arranged for a gentle selfcare ritual"/>
          <StoryPhoto src={roseProducts} alt="Rose-inspired beauty products presented as a selfcare collection"/>
          <StoryPhoto src={morningSelfcare} alt="A woman enjoying a quiet morning skincare moment"/>
          <StoryPhoto src={gentleSkincare} alt="A woman applying skincare in a gentle personal care moment"/>
        </div>
      </section>

      <section className="about-confidence about-section">
        <Reveal className="about-confidence-copy">
          <span className="about-eyebrow">08 — CONFIDENCE</span>
          <h2>Confidence Is<br/><em>Your Glow</em></h2>
          <p>Confidence is not a look to copy. It is the freedom to show up as yourself, to try something new, or to love the way you already feel.</p>
          <Link className="about-text-link" to="/inspiration">Find your own inspiration <ArrowRight size={16}/></Link>
        </Reveal>
        <div className="about-confidence-portraits">
          <Reveal><StoryPhoto src={glowingSkin} alt="Confident beauty portrait highlighting glowing skin and natural individuality"/></Reveal>
          <Reveal><StoryPhoto src={softGlam} alt="Soft glam portrait with a confident, expressive beauty look"/></Reveal>
          <span className="about-confidence-caption">YOUR GLOW IS YOURS.</span>
        </div>
      </section>

      <section className="about-offer about-section">
        <Reveal className="about-section-heading">
          <span className="about-eyebrow">09 — WHAT WE OFFER</span>
          <h2>Discover Your<br/><em>Everyday Essentials</em></h2>
          <p>Explore the live Dah Glow catalog for what is available today. Search results reflect the current store catalog and may change.</p>
        </Reveal>
        <div className="about-category-grid">
          {categoryLinks.map((item, index) => (
            <Link to={`/search?q=${encodeURIComponent(item.query)}`} className="about-category-link" key={item.title}>
              <span className="about-category-number">0{index + 1}</span><span className="about-category-content"><strong>{item.title}</strong><small>{item.note}</small></span><ArrowUpRight size={18}/>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-experience">
        <Reveal className="about-experience-panel">
          <div><span className="about-eyebrow">10 — THE DAH GLOW EXPERIENCE</span><h2>An Experience<br/><em>Designed Around You</em></h2></div>
          <div className="about-experience-copy"><p>We want every visit to feel easy to explore and personal to you. Discover products in the store, browse style inspiration, and reach out when you need support.</p><div className="about-experience-links"><Link to="/search?q=beauty">Explore products <ArrowRight size={16}/></Link><Link to="/contact">Contact our team <ArrowRight size={16}/></Link><Link to="/inspiration">Browse inspiration <ArrowRight size={16}/></Link></div></div>
        </Reveal>
      </section>

      <section className="about-community about-section">
        <Reveal className="about-community-image"><StoryPhoto src={naturalBeauty} alt="Close-up portrait celebrating natural beauty and self-confidence"/></Reveal>
        <Reveal className="about-community-copy">
          <span className="about-eyebrow">11 — OUR COMMUNITY</span>
          <h2>Together,<br/><em>We Glow</em></h2>
          <p>Women and their many ways of expressing beauty are at the heart of the Dah Glow vision. We want to keep creating a welcoming space where individuality is celebrated and everyone can find inspiration that feels personal.</p>
          <Link className="about-text-link" to="/inspiration">Explore the inspiration edit <ArrowRight size={16}/></Link>
        </Reveal>
      </section>

      <section className="about-future">
        <div className="about-future-light" aria-hidden="true"/>
        <Reveal className="about-future-copy">
          <span className="about-eyebrow">12 — OUR FUTURE</span>
          <h2>The Future<br/><em>Is Glowing</em></h2>
          <p>We imagine a future with more ways to discover beauty and style: thoughtful collections, editorial stories, selfcare guides, and experiences that bring people together. These are aspirations we hope to build—not promises of features already available.</p>
          <Link className="about-button dark" to="/inspiration">Explore what is here today <ArrowRight size={16}/></Link>
        </Reveal>
      </section>

      <section className="about-cta">
        <div className="about-cta-shade" aria-hidden="true"/>
        <Reveal className="about-cta-copy">
          <span className="about-eyebrow">13 — YOUR STORY STARTS HERE</span>
          <h2>Your Glow.<br/>Your Story.<br/><em>Your Dah Glow.</em></h2>
          <p>Explore a world of beauty, selfcare, and inspiration. Discover something that makes you feel confident, beautiful, and uniquely you.</p>
          <div className="about-hero-actions"><Link className="about-button dark" to="/search?q=beauty">Shop now <ArrowRight size={16}/></Link><Link className="about-button glass" to="/inspiration">Explore style inspiration <ArrowUpRight size={16}/></Link></div>
        </Reveal>
      </section>
    </main>
  );
}
