import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'dist');
const template = readFileSync(path.join(outputDirectory, 'index.html'), 'utf8');
const pages = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'seo-pages.json'), 'utf8'));
const origin = 'https://us.dahglow.com';
const image = `${origin}/logo.jpeg`;

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function setMeta(html, selector, attributes) {
  const tagPattern = /<meta\b[^>]*>/gi;
  const existing = html.match(tagPattern)?.find(selector);
  const replacement = `<meta ${attributes}>`;
  return existing ? html.replace(existing, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`);
}

for (const page of pages) {
  const routeFile = path.join(outputDirectory, page.path.slice(1));
  const isStandaloneHtml = page.path.endsWith('.html') && existsSync(routeFile);

  const canonical = `${origin}${page.path === '/' ? '/' : page.path.replace(/\/+$/, '')}`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description.slice(0, 160));
  const source = isStandaloneHtml ? readFileSync(routeFile, 'utf8') : template;
  let html = source.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = setMeta(html, tag => /\bname="description"/i.test(tag), `name="description" content="${description}"`);
  html = setMeta(html, tag => /\bname="robots"/i.test(tag), 'name="robots" content="index,follow"');
  html = setMeta(html, tag => /\bproperty="og:title"/i.test(tag), `property="og:title" content="${title}"`);
  html = setMeta(html, tag => /\bproperty="og:description"/i.test(tag), `property="og:description" content="${description}"`);
  html = setMeta(html, tag => /\bproperty="og:url"/i.test(tag), `property="og:url" content="${canonical}"`);
  html = setMeta(html, tag => /\bproperty="og:image"/i.test(tag), `property="og:image" content="${image}"`);
  html = setMeta(html, tag => /\bname="twitter:title"/i.test(tag), `name="twitter:title" content="${title}"`);
  html = setMeta(html, tag => /\bname="twitter:description"/i.test(tag), `name="twitter:description" content="${description}"`);
  html = setMeta(html, tag => /\bname="twitter:image"/i.test(tag), `name="twitter:image" content="${image}"`);

  const canonicalTag = `    <link rel="canonical" href="${canonical}" />`;
  if (/<link\b[^>]*rel="canonical"[^>]*>/i.test(html)) {
    html = html.replace(/<link\b[^>]*rel="canonical"[^>]*>/i, canonicalTag);
  } else {
    html = html.replace('</head>', `${canonicalTag}\n  </head>`);
  }

  if (page.path !== '/') {
    const name = page.title.split('|')[0].trim();
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name, item: canonical },
      ],
    };
    html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>\n  </head>`);
  }

  const destination = isStandaloneHtml ? routeFile : path.join(outputDirectory, page.path.slice(1), 'index.html');
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, html);
}

console.log(`Prerendered SEO metadata for ${pages.filter(page => !page.path.endsWith('.html')).length} React routes.`);
