// Supermarket sites render their listings client-side, so their product data
// arrives as JSON embedded in the page (JSON-LD, __NEXT_DATA__, Redux preload
// state) rather than as markup. This harvests product-shaped objects out of any
// such page without needing to know each site's internal schema.

const SCRIPT_BLOCK = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

const NAME_KEYS = ['name', 'title', 'itemName', 'productName', 'item_name', 'displayName', 'longDescription'];
const IMAGE_KEYS = ['image', 'imageUrl', 'imageURL', 'images', 'thumbnail', 'thumbnailUrl', 'defaultImageUrl', 'imagePath', 'src'];
const URL_KEYS = ['url', 'productUrl', 'link', 'href', 'canonicalUrl', 'slug', 'seoUrl'];
const BRAND_KEYS = ['brand', 'brandName', 'vendor', 'manufacturer'];
const SIZE_KEYS = ['size', 'packSize', 'unitOfMeasure', 'quantity', 'volume', 'weight'];

const firstString = (node, keys) => {
  for (const key of keys) {
    const value = node[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string' && item.trim()) return item.trim();
          if (item && typeof item === 'object') {
            const nested = firstString(item, ['url', 'src', 'name', 'value']);
            if (nested) return nested;
          }
        }
      } else {
        const nested = firstString(value, ['url', 'src', 'name', 'value']);
        if (nested) return nested;
      }
    }
  }
  return null;
};

const looksLikeUrl = (value) => typeof value === 'string' && /^(https?:)?\/\//.test(value);

const parseLoose = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// Pulls the largest balanced `{...}` starting at the first brace, which is how
// `window.__PRELOADED_STATE__ = {...};` assignments are laid out.
const braceSlice = (text, from) => {
  const start = text.indexOf('{', from);
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const character = text[i];
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
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
};

export const extractJsonBlobs = (html) => {
  const blobs = [];
  for (const match of html.matchAll(SCRIPT_BLOCK)) {
    const attributes = match[1] || '';
    const body = match[2] || '';
    if (/application\/(ld\+)?json/i.test(attributes)) {
      const parsed = parseLoose(body.trim());
      if (parsed) blobs.push(parsed);
      continue;
    }
    for (const marker of ['__PRELOADED_STATE__', '__NEXT_DATA__', '__APOLLO_STATE__', '__INITIAL_STATE__', '__NUXT__']) {
      const at = body.indexOf(marker);
      if (at === -1) continue;
      const slice = braceSlice(body, at);
      const parsed = slice && parseLoose(slice);
      if (parsed) blobs.push(parsed);
    }
  }
  return blobs;
};

const isProductLike = (node) => {
  if (typeof node !== 'object' || node === null || Array.isArray(node)) return false;
  const type = node['@type'] ?? node.type ?? node.__typename ?? '';
  if (typeof type === 'string' && /product/i.test(type)) return true;
  const name = firstString(node, NAME_KEYS);
  if (!name || name.length < 4) return false;
  const image = firstString(node, IMAGE_KEYS);
  if (!looksLikeUrl(image)) return false;
  return Boolean(node.id ?? node.sku ?? node.productId ?? node.itemId ?? firstString(node, URL_KEYS));
};

export const findProducts = (root, limit = 5000) => {
  const found = [];
  const seen = new Set();
  const queue = [root];
  while (queue.length && found.length < limit) {
    const node = queue.shift();
    if (!node || typeof node !== 'object') continue;
    if (seen.has(node)) continue;
    seen.add(node);
    if (isProductLike(node)) found.push(node);
    for (const value of Array.isArray(node) ? node : Object.values(node)) {
      if (value && typeof value === 'object') queue.push(value);
    }
  }
  return found;
};

export const harvestProducts = (html) => {
  const products = [];
  for (const blob of extractJsonBlobs(html)) products.push(...findProducts(blob));
  return products;
};

export const readHarvested = (node, { website }) => {
  const name = firstString(node, NAME_KEYS);
  const image = firstString(node, IMAGE_KEYS);
  let url = firstString(node, URL_KEYS);
  if (url && !/^https?:/i.test(url)) url = `${website}${url.startsWith('/') ? '' : '/'}${url}`;
  return {
    name,
    imageUrl: looksLikeUrl(image) ? (image.startsWith('//') ? `https:${image}` : image) : null,
    sourceUrl: url,
    brand: firstString(node, BRAND_KEYS),
    size: firstString(node, SIZE_KEYS),
    description: firstString(node, ['description', 'shortDescription', 'productDescription']) ?? '',
  };
};
