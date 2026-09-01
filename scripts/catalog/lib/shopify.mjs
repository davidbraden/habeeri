import { fetchJson, sleep } from './http.mjs';
import { normalisedProduct } from './snapshots.mjs';
import {
  cleanName,
  guessStyle,
  looksAlcoholFree,
  looksLikeBeer,
  makeDescription,
  parseAbv,
  parsePackage,
  stripHtml,
} from './normalise.mjs';

const PAGE_SIZE = 250;

const firstImage = (product) => {
  for (const image of product.images || []) {
    if (image.src) return image.src.split('?')[0];
  }
  return null;
};

// Shopify shops expose their whole catalog as JSON, so every specialist
// retailer shares this adapter and only differs by base URL and collection.
export const fetchShopifyProducts = async ({
  website,
  collection = 'all',
  maxPages = 12,
  requestDelayMs = 700,
  vendorBlocklist = [],
}) => {
  const blocked = new Set(vendorBlocklist.map((vendor) => vendor.toLowerCase()));
  const raw = [];
  for (let page = 1; page <= maxPages; page += 1) {
    if (page > 1) await sleep(requestDelayMs);
    const url = `${website}/collections/${collection}/products.json?limit=${PAGE_SIZE}&page=${page}`;
    const payload = await fetchJson(url);
    const products = payload.products || [];
    raw.push(...products);
    if (products.length < PAGE_SIZE) break;
  }

  const products = [];
  for (const product of raw) {
    const title = product.title || '';
    const tags = product.tags || [];
    const productType = product.product_type || '';
    const bodyText = stripHtml(product.body_html);

    if (!looksLikeBeer({ title, productType, tags })) continue;
    if (!looksAlcoholFree({ title, productType, tags, description: bodyText })) continue;
    const imageUrl = firstImage(product);
    if (!imageUrl) continue;
    const variants = product.variants || [];
    if (variants.length && !variants.some((variant) => variant.available)) continue;

    let brand = (product.vendor || '').trim();
    if (blocked.has(brand.toLowerCase())) brand = '';
    const name = cleanName(title, brand);
    if (!name) continue;
    const style = guessStyle(title, productType, tags.join(' '));

    products.push(normalisedProduct({
      name,
      brand: brand || name.split(/\s+/)[0],
      style,
      abv: parseAbv(title, bodyText),
      packaging: parsePackage(title, variants.map((variant) => variant.title)),
      description: makeDescription(product.body_html, name, brand || name, style),
      imageUrl,
      sourceUrl: `${website}/products/${product.handle}`,
    }));
  }
  return { products, rawCount: raw.length };
};
