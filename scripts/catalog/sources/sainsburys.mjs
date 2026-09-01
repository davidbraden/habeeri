import { fetchText, HttpError, sleep } from '../lib/http.mjs';
import { normalisedProduct } from '../lib/snapshots.mjs';
import {
  cleanName,
  guessStyle,
  looksAlcoholFree,
  looksLikeBeer,
  makeDescription,
  parseAbv,
  parsePackage,
  unescapeHtml,
} from '../lib/normalise.mjs';

const website = 'https://www.sainsburys.co.uk';

// Sainsbury's server-renders its product grid. Class names are hashed, but each
// tile is anchored by a `gw-product-image` test id, and the product name is the
// image alt text, which is the most stable handle on the page.
const TILE_SPLIT = 'data-testid="gw-product-image"';

const CATEGORY_PATHS = [
  '/groceries/browse/beer-wine-and-spirits/beer/low-and-no-alcohol-beer/c:1019280',
  '/groceries/browse/beer-wine-and-spirits/low-and-no-alcohol/no-alcohol/c:1019338',
];
const MAX_PAGES = 4;

const parseTiles = (html) => {
  const products = [];
  for (const tile of html.split(TILE_SPLIT).slice(1)) {
    const href = tile.match(/href="(\/groceries\/product\/[^"]+)"/)?.[1];
    const alt = tile.match(/<img[^>]*\balt="([^"]+)"/)?.[1];
    // Images are proxied through Next's optimiser; the real asset is the url param.
    const asset = tile.match(/url=(https%3A%2F%2F[^&"]+)/)?.[1];
    if (!href || !alt || !asset) continue;
    products.push({
      title: unescapeHtml(alt).trim(),
      sourceUrl: `${website}${href}`,
      imageUrl: decodeURIComponent(asset),
    });
  }
  return products;
};

export default {
  id: 'sainsburys',
  retailer: {
    id: 'sainsburys',
    name: "Sainsbury's",
    website,
    host: 'www.sainsburys.co.uk',
    country: 'UK',
    description: 'UK supermarket with a low and no alcohol beer range.',
  },
  fetch: async () => {
    const byUrl = new Map();
    const notes = [];

    for (const categoryPath of CATEGORY_PATHS) {
      let pageCount = 0;
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        await sleep(1500);
        const url = `${website}${categoryPath}${page > 1 ? `?pageNumber=${page}` : ''}`;
        let text;
        try {
          ({ text } = await fetchText(url, { timeoutMs: 45000 }));
        } catch (error) {
          if (error instanceof HttpError && error.status === 404) break;
          throw error;
        }
        const tiles = parseTiles(text);
        if (tiles.length === 0) break;
        const before = byUrl.size;
        for (const tile of tiles) {
          if (!byUrl.has(tile.sourceUrl)) byUrl.set(tile.sourceUrl, tile);
        }
        pageCount += tiles.length;
        // Paging past the end quietly repeats the last page rather than 404ing.
        if (byUrl.size === before) break;
      }
      notes.push(`${categoryPath.split('/').pop()}: ${pageCount} tiles`);
    }

    const products = [];
    for (const tile of byUrl.values()) {
      if (!looksLikeBeer({ title: tile.title })) continue;
      if (!looksAlcoholFree({ title: tile.title })) continue;
      const name = cleanName(tile.title, '');
      if (!name) continue;
      const brand = name.split(/\s+/)[0];
      const style = guessStyle(tile.title);
      products.push(normalisedProduct({
        name,
        brand,
        // Sainsbury's listings carry no ABV field; only what the title states.
        abv: parseAbv(tile.title),
        style,
        packaging: parsePackage(tile.title),
        description: makeDescription('', name, brand, style),
        imageUrl: tile.imageUrl,
        sourceUrl: tile.sourceUrl,
      }));
    }

    return { products, mode: 'http', notes: [...notes, `${byUrl.size} listings scanned`] };
  },
};
