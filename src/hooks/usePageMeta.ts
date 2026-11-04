import { useEffect } from 'react';

const SITE_ORIGIN = 'https://us.dahglow.com';

interface PageMetaOptions {
  canonicalPath?: string;
  image?: string;
  noindex?: boolean;
  type?: string;
}

export function usePageMeta(
  title: string,
  description?: string,
  options: PageMetaOptions = {},
) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const previousMeta = new Map<HTMLMetaElement, string>();
    const createdMeta: HTMLMetaElement[] = [];
    const setMeta = (selector: string, attribute: 'name' | 'property', key: string, value: string) => {
      let meta = document.head.querySelector<HTMLMetaElement>(selector);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, key);
        document.head.appendChild(meta);
        createdMeta.push(meta);
      } else {
        previousMeta.set(meta, meta.content);
      }
      meta.content = value;
    };

    if (description) {
      const boundedDescription = description.slice(0, 160);
      setMeta('meta[name="description"]', 'name', 'description', boundedDescription);
      setMeta('meta[property="og:description"]', 'property', 'og:description', boundedDescription);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', boundedDescription);
    }

    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[property="og:url"]', 'property', 'og:url', `${SITE_ORIGIN}${options.canonicalPath || window.location.pathname}`);
    if (options.image) {
      setMeta('meta[property="og:image"]', 'property', 'og:image', options.image);
      setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', options.image);
    }
    if (options.type) setMeta('meta[property="og:type"]', 'property', 'og:type', options.type);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const createdCanonical = !canonical;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const previousCanonical = canonical.href;
    canonical.href = `${SITE_ORIGIN}${options.canonicalPath || window.location.pathname}`;

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const createdRobots = !robots && !!options.noindex;
    if (!robots && options.noindex) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    const previousRobots = robots?.content;
    if (robots && options.noindex) robots.content = 'noindex,follow';

    return () => {
      document.title = previousTitle;
      previousMeta.forEach((content, meta) => { meta.content = content; });
      createdMeta.forEach(meta => meta.remove());
      if (createdCanonical) canonical?.remove();
      else if (canonical) canonical.href = previousCanonical;
      if (createdRobots) robots?.remove();
      else if (robots && previousRobots !== undefined) robots.content = previousRobots;
    };
  }, [title, description, options.canonicalPath, options.image, options.noindex, options.type]);
}
