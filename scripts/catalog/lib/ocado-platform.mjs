import { fetchText, sleep } from './http.mjs';
import { normalisedProduct } from './snapshots.mjs';
import {
  cleanName,
  guessStyle,
  looksAlcoholFree,
  looksLikeBeer,
  makeDescription,
  parseAbv,
  parsePackage,
  slugify,
} from './normalise.mjs';

// Ocado and Morrisons run the same storefront platform: their category pages are
// server-rendered with the full product list in a `window.__INITIAL_STATE__`
// blob, so both retailers share this adapter.

const readInitialState = (html) => {
  const marker = html.indexOf('__INITIAL_STATE__');
  if (marker === -1) throw new Error('No __INITIAL_STATE__ in page — the storefront layout may have changed');
  const start = html.indexOf('{', marker);
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < html.length; i += 1) {
    const character = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '{') depth += 1;
    else if (character === '}') {
      depth -= 1;
      if (depth === 0) return JSON.parse(html.slice(start, i + 1));
    }
  }
  throw new Error('Unbalanced __INITIAL_STATE__ blob');
};

const imageOf = (entity) => {
  const candidates = [entity.image?.src, ...(entity.images || []).map((image) => image?.src)];
  const found = candidates.find(Boolean);
  // The platform serves square renditions by path; ask for a larger one.
  return found ? found.replace(/\/\d+x\d+\.(jpg|jpeg|png|webp)$/i, '/500x500.jpg') : null;
};

const sizeOf = (entity) =>
  entity.size?.value ?? (typeof entity.size === 'string' ? entity.size : null);

export const fetchOcadoPlatformProducts = async ({
  website,
  rootCategoryUrl,
  categoryPattern = /beer|lager|ale|stout|alcohol free|low alcohol|no alcohol/i,
  maxCategories = 10,
  requestDelayMs = 1200,
}) => {
  const entities = new Map();
  const notes = [];
  const visited = new Set();
  const queue = [rootCategoryUrl];

  // A category page renders only its first ~48 products and offers no paging
  // parameter, so coverage comes from walking into the child categories the
  // page itself advertises rather than from paginating.
  while (queue.length && visited.size < maxCategories) {
    const categoryUrl = queue.shift();
    if (visited.has(categoryUrl)) continue;
    visited.add(categoryUrl);
    if (visited.size > 1) await sleep(requestDelayMs);

    let state;
    try {
      const { text } = await fetchText(categoryUrl, { timeoutMs: 45000 });
      state = readInitialState(text);
    } catch (error) {
      notes.push(`${categoryUrl.split('/').slice(3).join('/')}: skipped (${error.message})`);
      continue;
    }

    const catalogue = state?.data?.products?.catalogue?.data ?? {};
    const found = state?.data?.products?.productEntities ?? {};
    for (const [id, entity] of Object.entries(found)) {
      if (!entities.has(id)) entities.set(id, entity);
    }
    notes.push(`${(catalogue.currentCategory?.name ?? categoryUrl.split('/').pop())}: ${Object.keys(found).length} of ${catalogue.totalProducts ?? '?'}`);

    for (const child of catalogue.categories ?? []) {
      if (!child.fullURLPath || !child.id) continue;
      if (!categoryPattern.test(child.name ?? '')) continue;
      queue.push(`${website}/categories/${child.fullURLPath.toLowerCase()}/${child.id}`);
    }
  }

  const products = [];
  for (const entity of entities.values()) {
    const title = entity.name || '';
    const categories = entity.categoryPath || [];
    if (entity.available === false) continue;
    if (!looksLikeBeer({ title, tags: categories })) continue;
    if (!looksAlcoholFree({ title, tags: categories })) continue;
    const imageUrl = imageOf(entity);
    if (!imageUrl) continue;
    if (!entity.retailerProductId) continue;

    // The platform files own-label and unlabelled products under "Unbranded",
    // which would otherwise be prefixed onto the name.
    const brand = /^unbranded$/i.test((entity.brand || '').trim()) ? '' : (entity.brand || '').trim();
    const name = cleanName(title, brand);
    if (!name) continue;
    const style = guessStyle(title, categories.join(' '));
    const size = sizeOf(entity);

    products.push(normalisedProduct({
      name,
      brand: brand || name.split(/\s+/)[0],
      // Supermarket listings carry no ABV field; what is in the title is all we get.
      abv: parseAbv(title),
      style,
      packaging: parsePackage(title, size ? [size] : []),
      description: makeDescription(entity.description || '', name, brand || name, style),
      imageUrl,
      sourceUrl: `${website}/products/${slugify(title, 90)}/${entity.retailerProductId}`,
    }));
  }

  return { products, notes, rawCount: entities.size };
};
