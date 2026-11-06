import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import seoPages from '@/data/seo-pages.json';

const SITE_ORIGIN = 'https://us.dahglow.com';
const BRAND_IMAGE = `${SITE_ORIGIN}/logo.jpeg`;
const PRIVATE_ROUTE = /^\/(?:private-control|account|settings|wallet|login|affiliate|us\/user|checkout|cart|me|wishlist|messages|scan-product|auth|oauth|integration|support|r|search|shopify\/callback)(?:\/|$)/;

export interface PageMetaOptions {
  canonicalPath?: string;
  image?: string;
  noindex?: boolean;
  type?: string;
}

interface PageMetaValue {
  title: string;
  description?: string;
  options?: PageMetaOptions;
}

interface RegisteredPageMeta {
  pathname: string;
  value: PageMetaValue | null;
}

const PageMetaContext = createContext<(entry: RegisteredPageMeta) => void>(() => undefined);
const staticPages = new Map(seoPages.map(page => [page.path, page]));

export function isPrivateSeoRoute(pathname: string) {
  return PRIVATE_ROUTE.test(pathname);
}

export function resolveRouteMeta(pathname: string): PageMetaValue {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const staticPage = staticPages.get(normalizedPath);
  if (staticPage) return { title: staticPage.title, description: staticPage.description };

  if (/^\/products\/[^/]+$/.test(normalizedPath) || /^\/product\/[^/]+$/.test(normalizedPath)) {
    return {
      title: 'Product Details | Dah Glow',
      description: 'Explore product details, availability, and secure checkout at Dah Glow.',
    };
  }
  if (/^\/collections\/[^/]+$/.test(normalizedPath)) {
    return {
      title: 'Shop Collections | Dah Glow',
      description: 'Browse beauty, skincare, makeup, and other products in the Dah Glow collection.',
    };
  }
  if (/^\/inspiration\/[^/]+$/.test(normalizedPath)) {
    return {
      title: 'Style Inspiration | Dah Glow',
      description: 'Explore beauty, skincare, hair, personal style, and self-care inspiration from Dah Glow.',
    };
  }
  if (/^\/stores\/[^/]+$/.test(normalizedPath)) {
    return {
      title: 'Dah Glow Store',
      description: 'Explore independent stores and products available through Dah Glow.',
    };
  }

  const slug = normalizedPath.split('/').filter(Boolean).pop();
  if (!slug) {
    return {
      title: 'Dah Glow Official Store | Beauty, Skincare & Selfcare',
      description: 'Discover beauty, skincare, lip gloss and self-care essentials at Dah Glow. Explore your beauty favorites and glow with confidence.',
    };
  }
  const readablePath = slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, character => character.toUpperCase());
  return {
    title: `${readablePath} | Dah Glow`,
    description: `Explore ${readablePath.toLowerCase()} at Dah Glow, with beauty, skincare, and self-care favorites.`,
    options: { noindex: true },
  };
}

function upsertMeta(attribute: 'name' | 'property', key: string, value: string) {
  const matching = [...document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${key}"]`)];
  const meta = matching.shift() || document.createElement('meta');
  meta.setAttribute(attribute, key);
  meta.content = value;
  if (!meta.isConnected) document.head.appendChild(meta);
  matching.forEach(duplicate => duplicate.remove());
}

function upsertCanonical(href: string) {
  const matching = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')];
  const canonical = matching.shift() || document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = href;
  if (!canonical.isConnected) document.head.appendChild(canonical);
  matching.forEach(duplicate => duplicate.remove());
}

export function PageMetaProvider({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const [registeredMeta, setRegisteredMeta] = useState<RegisteredPageMeta | null>(null);
  const registerPageMeta = useCallback((entry: RegisteredPageMeta) => setRegisteredMeta(entry), []);
  const pageMeta = registeredMeta?.pathname === pathname ? registeredMeta.value : null;
  const fallbackMeta = resolveRouteMeta(pathname);
  const title = pageMeta?.title || fallbackMeta.title;
  const description = pageMeta?.description || fallbackMeta.description || '';
  const options = pageMeta?.options || {};
  const { noindex, type } = options;
  const canonicalPath = options.canonicalPath || pathname;
  const canonicalUrl = useMemo(() => {
    const url = new URL(canonicalPath, SITE_ORIGIN);
    return `${SITE_ORIGIN}${url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '')}`;
  }, [canonicalPath]);
  const image = useMemo(() => new URL(options.image || BRAND_IMAGE, SITE_ORIGIN).href, [options.image]);
  const privateRoute = isPrivateSeoRoute(pathname);

  useEffect(() => {
    const boundedDescription = description.slice(0, 160);
    const robots = privateRoute || noindex ? 'noindex,nofollow' : 'index,follow';
    const openGraphType = type || 'website';

    document.title = title;
    upsertMeta('name', 'description', boundedDescription);
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:type', openGraphType);
    upsertMeta('property', 'og:site_name', 'Dah Glow');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', boundedDescription);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:image:alt', 'Dah Glow beauty, self-care, and confidence');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', boundedDescription);
    upsertMeta('name', 'twitter:image', image);
    upsertCanonical(canonicalUrl);
  }, [canonicalUrl, description, image, noindex, privateRoute, title, type]);

  return createElement(PageMetaContext.Provider, { value: registerPageMeta }, children);
}

export function usePageMeta(title: string, description?: string, options: PageMetaOptions = {}) {
  const registerPageMeta = useContext(PageMetaContext);
  const { pathname } = useLocation();
  const { canonicalPath, image, noindex, type } = options;

  useEffect(() => {
    registerPageMeta({ pathname, value: { title, description, options: { canonicalPath, image, noindex, type } } });
    return () => registerPageMeta({ pathname, value: null });
  }, [canonicalPath, description, image, noindex, pathname, registerPageMeta, title, type]);
}
