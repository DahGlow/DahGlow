import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'dist');
const sitemap = readFileSync(path.join(outputDirectory, 'sitemap.xml'), 'utf8');
const seoPages = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'seo-pages.json'), 'utf8'));
const vercelConfig = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url);
const expectedPaths = new Set(seoPages.map(page => page.path));
const routeRewrites = new Map(vercelConfig.rewrites.map(rewrite => [rewrite.source, rewrite.destination]));
const titles = new Set();
const descriptions = new Set();

function getMeta(html, attribute, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const matches = tags.filter(tag => new RegExp(`\\b${attribute}="${key}"`, 'i').test(tag));
  assert.equal(matches.length, 1, `Expected one ${attribute}=${key} tag`);
  return matches[0].match(/\bcontent="([^"]*)"/i)?.[1]?.replaceAll('&amp;', '&') || '';
}

function getCanonical(html) {
  const tags = html.match(/<link\b[^>]*rel="canonical"[^>]*>/gi) || [];
  assert.equal(tags.length, 1, 'Expected exactly one canonical link');
  return tags[0].match(/\bhref="([^"]*)"/i)?.[1] || '';
}

assert.equal(sitemapUrls.length, expectedPaths.size, 'Sitemap and public SEO route registry have the same size');
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'Sitemap URLs are unique');
assert.ok(
  vercelConfig.headers.some(header =>
    header.source.startsWith('/(private-control|') &&
    header.headers.some(item => item.key === 'X-Robots-Tag' && item.value === 'noindex, nofollow'),
  ),
  'Vercel sends noindex headers for private routes',
);

for (const page of seoPages.filter(page => page.path !== '/' && !page.path.endsWith('.html'))) {
  const expectedDestination = `${page.path}/index.html`;
  assert.equal(routeRewrites.get(page.path), expectedDestination, `${page.path} rewrites to its prerendered HTML`);
  assert.ok(existsSync(path.join(outputDirectory, expectedDestination.slice(1))), `${page.path} has a prerendered HTML file`);
}

for (const url of sitemapUrls) {
  const parsedUrl = new URL(url);
  assert.equal(parsedUrl.origin, 'https://us.dahglow.com', `${url} uses the US storefront`);
  assert.equal(parsedUrl.search, '', `${url} has no query string`);
  assert.equal(parsedUrl.hash, '', `${url} has no fragment`);
  assert.ok(expectedPaths.has(parsedUrl.pathname), `${url} is a registered public route`);
  assert.ok(!/^\/(private-control|account|settings|wallet|login|affiliate|us\/user|checkout|cart|me|wishlist|messages|scan-product|auth|oauth|integration|support|r|search)(\/|$)/.test(parsedUrl.pathname), `${url} is indexable`);

  const outputPath = path.join(
    outputDirectory,
    parsedUrl.pathname.endsWith('.html') ? parsedUrl.pathname.slice(1) : path.join(parsedUrl.pathname.slice(1), 'index.html'),
  );
  assert.ok(existsSync(outputPath), `${url} has a generated HTML file`);
  const html = readFileSync(outputPath, 'utf8');
  assert.equal(getCanonical(html), url, `${url} has a self-referencing canonical`);
  assert.equal(getMeta(html, 'name', 'robots'), 'index,follow', `${url} is indexable`);
  assert.ok(getMeta(html, 'name', 'description'), `${url} has a description`);
  assert.ok(getMeta(html, 'property', 'og:title'), `${url} has an Open Graph title`);
  assert.ok(getMeta(html, 'property', 'og:description'), `${url} has an Open Graph description`);
  assert.equal(getMeta(html, 'property', 'og:url'), url, `${url} has a matching Open Graph URL`);
  assert.equal(getMeta(html, 'property', 'og:image'), 'https://us.dahglow.com/logo.jpeg', `${url} uses Dah Glow branding`);
  assert.ok(getMeta(html, 'name', 'twitter:image'), `${url} has a social image`);
  assert.doesNotMatch(html, /<meta\b[^>]*\bname="keywords"/i, `${url} has no keywords metadata`);

  const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || '';
  assert.ok(title, `${url} has a title`);
  assert.ok(!titles.has(title), `${url} has a unique title`);
  titles.add(title);
  const description = getMeta(html, 'name', 'description');
  assert.ok(!descriptions.has(description), `${url} has a unique description`);
  descriptions.add(description);

  const schemaScripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  if (parsedUrl.pathname !== '/') {
    assert.ok(schemaScripts.some(([, json]) => JSON.parse(json)['@type'] === 'BreadcrumbList'), `${url} has a breadcrumb schema`);
  }
}

assert.deepEqual(new Set(sitemapUrls.map(url => new URL(url).pathname)), expectedPaths, 'Sitemap contains all registered public routes');
const homeHtml = readFileSync(path.join(outputDirectory, 'index.html'), 'utf8');
assert.ok(!homeHtml.includes('path-to-dah-glow-image'), 'Placeholder image reference is removed');
assert.ok(homeHtml.includes('sa0vgmQSzW2jzO2BoVYCpf6QPuM9Mp15G1zWAtLJrjE'), 'Google Search Console verification is preserved');
const rootSchema = [...homeHtml.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(([, json]) => JSON.parse(json));
assert.ok(rootSchema.some(schema => schema['@graph']?.some(entry => entry['@type'] === 'Organization')), 'Organization JSON-LD is present');
assert.ok(rootSchema.some(schema => schema['@graph']?.some(entry => entry['@type'] === 'WebSite')), 'WebSite JSON-LD is present');

console.log(`Validated ${sitemapUrls.length} sitemap URLs, canonical/head metadata, robots directives, branding image, and structured data.`);
