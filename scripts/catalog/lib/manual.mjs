import fs from 'node:fs/promises';
import path from 'node:path';
import { paths } from './paths.mjs';
import { harvestProducts, readHarvested } from './harvest.mjs';
import { normalisedProduct } from './snapshots.mjs';
import {
  cleanName,
  guessStyle,
  looksAlcoholFree,
  looksLikeBeer,
  makeDescription,
  parseAbv,
  parsePackage,
  unescapeHtml,
} from './normalise.mjs';

// Some retailers block every non-browser client outright, so their listings can
// only be captured by saving the page from a real browser. This reads such a
// saved page and pulls products out of it, trying embedded JSON first and
// falling back to the image/link pairing that product grids universally use.

const IMG_TAG = /<img\b[^>]*>/gi;

const tilesFromMarkup = (html, website) => {
  const products = [];
  for (const match of html.matchAll(IMG_TAG)) {
    const tag = match[0];
    const alt = tag.match(/\balt="([^"]{6,})"/)?.[1];
    if (!alt) continue;
    let src = tag.match(/\bsrc="([^"]+)"/)?.[1]
      ?? tag.match(/\bsrcset="([^",\s]+)/)?.[1];
    if (src) {
      const proxied = src.match(/[?&]url=(https?%3A%2F%2F[^&"]+)/);
      if (proxied) src = decodeURIComponent(proxied[1]);
    }
    if (!src || /\.svg(\?|$)/i.test(src)) continue;
    // The product link is the anchor wrapping or immediately preceding the image.
    const before = html.slice(Math.max(0, match.index - 2500), match.index);
    const hrefs = [...before.matchAll(/href="([^"]+)"/g)].map((found) => found[1]);
    const href = hrefs.reverse().find((candidate) => /product|\/p\/|\/products\//i.test(candidate));
    if (!href) continue;
    const sourceUrl = /^https?:/i.test(href) ? href : `${website}${href.startsWith('/') ? '' : '/'}${href}`;
    products.push({
      title: unescapeHtml(alt).trim(),
      imageUrl: src.startsWith('//') ? `https:${src}` : src,
      sourceUrl,
    });
  }
  return products;
};

const manualPath = async (retailerId) => {
  for (const extension of ['html', 'htm', 'json']) {
    const file = path.join(paths.manual, `${retailerId}.${extension}`);
    try {
      await fs.access(file);
      return file;
    } catch { /* keep looking */ }
  }
  return null;
};

export const fetchFromSavedPage = async ({ retailerId, website }) => {
  const file = await manualPath(retailerId);
  if (!file) {
    throw new Error(
      `blocked to automated clients and no saved page at scripts/catalog/manual/${retailerId}.html — ` +
      'open the retailer\'s alcohol-free beer listing in a browser, save the page HTML there, then re-run',
    );
  }

  const raw = await fs.readFile(file, 'utf8');
  const tiles = new Map();

  if (file.endsWith('.json')) {
    for (const node of harvestProducts(`<script type="application/json">${raw}</script>`)) {
      const read = readHarvested(node, { website });
      if (read.name && read.imageUrl) tiles.set(read.sourceUrl ?? read.name, { title: read.name, ...read });
    }
  } else {
    for (const node of harvestProducts(raw)) {
      const read = readHarvested(node, { website });
      if (read.name && read.imageUrl) tiles.set(read.sourceUrl ?? read.name, { title: read.name, ...read });
    }
    for (const tile of tilesFromMarkup(raw, website)) {
      if (!tiles.has(tile.sourceUrl)) tiles.set(tile.sourceUrl, tile);
    }
  }

  const products = [];
  for (const tile of tiles.values()) {
    if (!looksLikeBeer({ title: tile.title })) continue;
    if (!looksAlcoholFree({ title: tile.title, description: tile.description ?? '' })) continue;
    const brandHint = tile.brand ?? '';
    const name = cleanName(tile.title, brandHint);
    if (!name) continue;
    const brand = brandHint || name.split(/\s+/)[0];
    const style = guessStyle(tile.title);
    products.push(normalisedProduct({
      name,
      brand,
      abv: parseAbv(tile.title, tile.description ?? ''),
      style,
      packaging: parsePackage(tile.title, tile.size ? [tile.size] : []),
      description: makeDescription(tile.description ?? '', name, brand, style),
      imageUrl: tile.imageUrl,
      sourceUrl: tile.sourceUrl ?? website,
    }));
  }

  return {
    products,
    mode: 'manual',
    notes: [`parsed saved page ${path.relative(paths.repoRoot, file)}, ${tiles.size} tiles`],
  };
};
