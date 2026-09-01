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

const website = 'https://www.tesco.com';

// Tesco server-renders its product grid, so the listing is read from the markup.
// The hashed CSS class names are unusable, but the product tile's data-testid and
// its /products/<id> link are stable enough to key on.
const TILE_SPLIT = /<li\b(?=[^>]*data-testid="\d+")/;

const SEARCH_TERMS = ['alcohol free beer', 'alcohol free lager', '0.0 beer'];
const MAX_PAGES = 4;

const parseTiles = (html) => {
  const products = [];
  for (const tile of html.split(TILE_SPLIT).slice(1)) {
    const id = tile.match(/data-testid="(\d+)"/)?.[1];
    const link = tile.match(/href="([^"]*\/products\/\d+)"[^>]*>([^<]{4,})</);
    const image = tile.match(/<img[^>]*\bsrc="([^"]+)"/)?.[1];
    if (!id || !link || !image) continue;
    if (!/data-auto-available="true"/.test(tile)) continue;
    products.push({
      id,
      title: unescapeHtml(link[2]).trim(),
      sourceUrl: link[1],
      imageUrl: unescapeHtml(image),
    });
  }
  return products;
};

export default {
  id: 'tesco',
  retailer: {
    id: 'tesco',
    name: 'Tesco',
    website,
    host: 'www.tesco.com',
    country: 'UK',
    description: 'UK supermarket with a mainstream alcohol-free beer range.',
  },
  fetch: async () => {
    const byId = new Map();
    const notes = [];

    for (const term of SEARCH_TERMS) {
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        await sleep(1500);
        const url = `${website}/groceries/en-GB/search?query=${encodeURIComponent(term)}&page=${page}`;
        let text;
        try {
          // Tesco's edge rejects HTTP/1.1, which is all Node's fetch can speak.
          ({ text } = await fetchText(url, { timeoutMs: 45000, http2: true }));
        } catch (error) {
          // Paging past the last page of results 404s.
          if (error instanceof HttpError && error.status === 404) break;
          throw error;
        }
        const tiles = parseTiles(text);
        for (const tile of tiles) {
          if (!byId.has(tile.id)) byId.set(tile.id, tile);
        }
        if (tiles.length === 0) break;
      }
      notes.push(`"${term}": ${byId.size} cumulative`);
    }

    const products = [];
    for (const tile of byId.values()) {
      if (!looksLikeBeer({ title: tile.title })) continue;
      if (!looksAlcoholFree({ title: tile.title })) continue;
      const name = cleanName(tile.title, '');
      if (!name) continue;
      const brand = name.split(/\s+/)[0];
      const style = guessStyle(tile.title);
      products.push(normalisedProduct({
        name,
        brand,
        // Tesco listings carry no ABV field; only what the title states.
        abv: parseAbv(tile.title),
        style,
        packaging: parsePackage(tile.title),
        description: makeDescription('', name, brand, style),
        imageUrl: tile.imageUrl,
        sourceUrl: tile.sourceUrl,
      }));
    }

    return { products, mode: 'http', notes: [...notes, `${byId.size} listings scanned`] };
  },
};
