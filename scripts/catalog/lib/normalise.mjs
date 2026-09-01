// Shared text normalisation for retailer product listings: turns messy shop
// titles into comparable beer names, styles, ABVs and pack sizes, and provides
// the fuzzy key used to recognise the same beer across different retailers.

const BEER_TYPES = new Set([
  'beer', 'ipa', 'lager', 'ale', 'wheat beer', 'pilsner', 'stout & porter',
  'fruit beer & sours', 'blondes', 'pale ale', 'stout', 'sour', 'lager & pilsner',
  'alcohol free beer', 'low alcohol beer', 'no alcohol beer', 'beer & cider',
]);

const EXCLUDED_TYPES = new Set([
  'wine', 'spirit', 'mixed pack', 'mixed case', 'snack', 'mocktail', 'functional',
  'cider', 'gin', 'sparkling wine', 'white wine', 'red wine', 'rose wine',
  'aperitifs and bitters', 'tonic', 'soft drink', 'gift', 'kombucha', 'hard seltzer',
]);

const EXCLUDED_TITLE = new RegExp(
  'mixed\\s*(case|pack|selection)|selection box|gift (box|set|pack)|bundle|' +
  'taster (pack|case)|advent|hamper|voucher|glassware|glass\\b|merch|t-shirt|' +
  'subscription|cider|wine|gin|vodka|rum|whisk|tequila|spritz|aperitif|' +
  'kombucha|tonic water|soft drink|snack|crisps|nuts\\b|case of|mystery|' +
  'damaged|box of|\\bbbf\\b|\\bmixed\\b|selection|collection|soda|cactus water|' +
  '\\d{1,2}\\s*(x|-)?\\s*pack\\b|gift card|\\bcola\\b|\\d+\\s*or\\s*\\d+|water\\b|' +
  'free sample',
  'i',
);

// Only terms that are beer and nothing else. Words like "pale" or "amber" also
// describe wine and spirits, and supermarket low-and-no aisles carry plenty of
// both, so they are deliberately absent.
const BEER_WORDS = /\b(beers?|lagers?|ales?|ipa|apa|neipa|stout|porter|pilsner|pils|pilsener|radler|shandy|weiss|weisse|weizen|witbier|wheat|helles|dunkel|bock|saison|tripel|dubbel|gose)\b/i;

// Ordered: the first pattern that matches the title wins.
const STYLE_RULES = [
  ['Radler', /radler|shandy/i],
  ['Stout', /stout|porter|nitro/i],
  ['Wheat beer', /wheat|weiss|weisse|weizen|witbier|\bwit\b|blanche|hefe/i],
  ['Hazy IPA', /hazy ipa|neipa|new england ipa|hazy pale/i],
  ['IPA', /\bipa\b|india pale/i],
  ['Pale ale', /pale ale|\bpale\b|\bapa\b/i],
  ['Pilsner', /pilsner|\bpils\b|pilsener/i],
  ['Sour', /sour|gose|berliner/i],
  ['Amber ale', /amber|red ale|dunkel|\bbock\b/i],
  ['Brown ale', /brown ale|\bmild\b/i],
  ['Belgian ale', /belgian|tripel|dubbel|abbey|trappist|blonde ale|saison/i],
  ['Fruit beer', /grapefruit|lemon|lime|peach|mango|passion ?fruit|cherry|raspberry|rhubarb|tropical|orange|yuzu|apricot|watermelon|fruit/i],
  ['Ale', /\bale\b|\bbitter\b|\besb\b|golden/i],
  ['Lager', /lager|helles|\bdry\b|cerveza|birra|bier|beer/i],
];

const STOPWORDS = new Set([
  'alcohol', 'alcoholfree', 'free', 'non', 'nonalcoholic', 'alcoholic', 'beer', 'beers',
  'abv', 'ml', 'cl', 'litre', 'l', 'can', 'cans', 'bottle', 'bottles', 'pack', 'x',
  'the', 'and', 'a', 'de', 'co', 'brewing', 'brewery', 'brew', 'brewco',
  'craft', 'new', 'style', 'draught', 'draft', 'gluten', 'low', 'no', 'zero', 'alkoholfrei',
  'alcoholfrei', 'af', 'na', '0', '00', '05', '03', '02', '01',
]);

// Dropped when building dedupe keys so "Adnams Ghost Ship" and "Adnams Ghost
// Ship Pale Ale" collapse, but kept when the remainder is only a brand.
const STYLE_WORDS = new Set([
  'ipa', 'apa', 'lager', 'pilsner', 'pils', 'pilsener', 'pale', 'ale', 'ales',
  'stout', 'porter', 'bier', 'biere', 'cerveza', 'birra', 'unfiltered',
  'premium', 'session', 'nitro', 'lite', 'wheat', 'dark', 'best',
  'british', 'english', 'scottish', 'welsh', 'irish', 'german', 'bavarian',
  'belgian', 'czech', 'spanish', 'italian', 'japanese', 'mexican', 'french',
  'american', 'dutch', 'danish', 'austrian', 'estonian', 'norwegian', 'swedish',
]);

const HTML_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–',
  mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '"', rdquo: '"',
  hellip: '…', deg: '°', reg: '', trade: '', eacute: 'é', egrave: 'è',
  uuml: 'ü', ouml: 'ö', auml: 'ä', szlig: 'ß', ccedil: 'ç', oacute: 'ó',
};

export const unescapeHtml = (value) =>
  (value || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const code = entity[1] === 'x' || entity[1] === 'X'
        ? parseInt(entity.slice(2), 16)
        : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    const named = HTML_ENTITIES[entity.toLowerCase()];
    return named === undefined ? match : named;
  });

export const stripHtml = (raw) => {
  let text = (raw || '').replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  text = text.replace(/<br\s*\/?>|<\/p>|<\/li>|<\/div>/gi, ' ');
  text = text.replace(/<[^>]+>/g, ' ');
  text = unescapeHtml(text).replace(/ /g, ' ');
  return text.replace(/\s+/g, ' ').trim();
};

const sentences = (text) =>
  text.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);

export const makeDescription = (bodyHtml, name, brand, style) => {
  let text = stripHtml(bodyHtml).replace(/^\s*(tasting notes?|description)\s*:?\s*/i, '');
  const picked = [];
  let length = 0;
  for (const sentence of sentences(text)) {
    if (sentence.length < 25) continue;
    if (/delivery|shipping|subscribe|discount|£|add to (cart|basket)/i.test(sentence)) continue;
    picked.push(sentence);
    length += sentence.length;
    if (length > 260) break;
  }
  let description = picked.join(' ').trim();
  if (description.length < 40) {
    description = `${name} is an alcohol-free ${style.toLowerCase()} from ${brand}, listed for sale in the UK.`;
  }
  if (description.length > 520) {
    const cut = description.slice(0, 520);
    description = `${cut.slice(0, cut.lastIndexOf(' '))}…`;
  }
  return description;
};

// Retailers describe zero-alcohol beers inconsistently, so only trust a parsed
// figure when it is plausibly alcohol-free; otherwise fall back to the legal cap.
export const parseAbv = (...texts) => {
  for (const text of texts) {
    if (!text) continue;
    const match = text.match(/(?:<\s*)?(\d[.,]\d|\d)\s*%\s*(?:abv)?/i);
    if (!match) continue;
    const number = Number.parseFloat(match[1].replace(',', '.'));
    if (!Number.isFinite(number)) continue;
    if (number <= 1.2) return number ? `${number.toFixed(1)}%` : '0.0%';
  }
  return '<=0.5%';
};

export const parsePackage = (title, variantTitles = []) => {
  const text = [title, ...variantTitles].filter(Boolean).join(' ');
  const multi = text.match(/(\d{1,2})\s*[x×]\s*(\d{3})\s*ml/i)
    ?? text.match(/(\d{1,2})\s*[x×]\s*(\d{2})\s*cl/i);
  const size = text.match(/(\d{3})\s*ml|(\d(?:\.\d)?)\s*l\b/i);
  const container = /\bcans?\b/i.test(text) ? 'can' : (/\bbottles?\b/i.test(text) ? 'bottle' : 'pack');
  if (multi) {
    const millilitres = multi[2].length === 2 ? Number(multi[2]) * 10 : Number(multi[2]);
    return `${multi[1]} x ${millilitres}ml ${container}s`;
  }
  if (size) return size[1] ? `${size[1]}ml ${container}` : `${size[2]}L ${container}`;
  return container === 'pack' ? 'single' : container;
};

export const guessStyle = (title, ...fallbacks) => {
  for (const [style, pattern] of STYLE_RULES) {
    if (pattern.test(title || '')) return style;
  }
  const fallback = fallbacks.filter(Boolean).join(' ');
  for (const [style, pattern] of STYLE_RULES) {
    if (pattern.test(fallback)) return style;
  }
  return 'Beer';
};

const collapseRepeats = (name) => {
  let words = name.split(/\s+/);
  const plainOf = (word) => word.toLowerCase().replace(/[^a-z0-9]/g, '');
  const squashed = plainOf(words.slice(1, 3).join(''));
  if (words.length > 2 && plainOf(words[0]) === squashed && squashed) {
    words = words.slice(1);
  }
  const out = [];
  for (const word of words) {
    const plain = plainOf(word);
    if (plain && plain.length > 2 && out.some((seen) => plainOf(seen) === plain)) continue;
    out.push(word);
  }
  return out.join(' ');
};

export const cleanName = (title, brand) => {
  let name = unescapeHtml(title);
  name = name.replace(/[‑–—]/g, '-').replace(/[®™]/g, '');
  name = name.replace(/\(\s*\)/g, ' ');
  name = name.replace(/<\s*(?=\d)/g, '');
  // Supermarkets write the strength as "0.0% vol"; the unit is never part of a name.
  name = name.replace(/\b\d[.,]?\d?\s*%\s*(?:abv\s*)?vol(?:ume)?\b\.?/gi, ' ');
  // "0.0% Alcohol Free Lager" is the supermarket idiom, so the strength and the
  // alcohol-free phrase have to go before the trailing-marketing rule below —
  // that rule matches from the percentage to end of line and would take the
  // style words with it, leaving nothing but the brand.
  name = name.replace(/\b(?:zero|low|no)[\s-]alcohol\b/gi, ' ');
  name = name.replace(/\b(alcohol[\s-]?free|non[\s-]?alcoholic|alkoholfrei|de-?alcoholised)\b/gi, ' ');
  name = name.replace(/\b\d[.,]?\d?\s*%\s*(abv\b|alcohol|vegan|gluten|low\b).*$/i, ' ');
  name = name.replace(/\b\d[.,]?\d?\s*%\s*,?\s+(?=\S)/g, ' ');
  name = name.replace(/\(\s*<?\s*\d[.,]?\d?\s*%\s*abv\s*\)/gi, ' ');
  name = name.replace(/\b\d[.,]?\d?\s*%\s*$/, ' ');
  // Pack sizes appear with or without a unit ("4 x 330ml", "4 x 44cl", "4 x 330")
  // and sometimes as a bare trailing count ("Ghost Ship Pale Ale x4").
  name = name.replace(/\b\d{1,2}\s*[x×]\s*\d{2,4}\s*(?:ml|cl|l)?\b/gi, ' ');
  name = name.replace(/\b\d{3}\s*ml\b|\b\d{2,3}\s*cl\b|\b\d(?:\.\d)?\s*l\b/gi, ' ');
  name = name.replace(/\s[x×]\s*\d{1,2}\s*$/i, ' ');
  name = name.replace(/\b(cans?|bottles?|multipack|case)\b/gi, ' ');
  name = name.replace(/\s*[–—|]\s*/g, ' - ');

  let parts = name.split(' - ').map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1) {
    const tail = [...tokens(parts[parts.length - 1])].filter((word) => !STYLE_WORDS.has(word));
    if (tail.length === 0) parts = parts.slice(0, -1);
  }
  name = parts.join(' ');
  name = name.replace(/\s*[-–—|,:]\s*$/, '');
  name = name.replace(/\s{2,}/g, ' ').replace(/^[\s\-–—|,:]+|[\s\-–—|,:]+$/g, '');
  if (!name) name = unescapeHtml(title);
  name = name.replace(/\bbeer\b\s*$/i, '').trim();
  if (countOf(name, '(') > countOf(name, ')')) name = name.slice(0, name.lastIndexOf('(')).trim();
  name = trimEdges(name);

  const firstBrandWord = (brand || '').split(/\s+/)[0];
  if (firstBrandWord && !new RegExp(`^${escapeRegExp(firstBrandWord)}`, 'i').test(name)) {
    name = `${brand} ${name}`;
  }
  name = collapseRepeats(name);
  name = name.replace(/\(\s*\)/g, ' ');
  if (countOf(name, '(') > countOf(name, ')')) name = name.slice(0, name.lastIndexOf('('));
  return trimEdges(name.replace(/\s{2,}/g, ' '));
};

const countOf = (value, character) => value.split(character).length - 1;
const trimEdges = (value) => value.replace(/^[\s\-,:;(]+|[\s\-,:;(]+$/g, '');
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const foldAccents = (value) =>
  value.normalize('NFKD').replace(/\p{M}/gu, '');

export const tokens = (...parts) => {
  let text = parts.filter(Boolean).join(' ').toLowerCase().replace(/ß/g, 'ss');
  text = foldAccents(text).replace(/[^a-z0-9]+/g, ' ');
  const out = new Set();
  for (let word of text.split(' ')) {
    if (word.length > 3 && word.endsWith('s')) word = word.slice(0, -1);
    if (!word || word.length < 2 || STOPWORDS.has(word)) continue;
    out.add(word);
  }
  return out;
};

// "lucky" + "saint" also appearing as "luckysaint" would otherwise inflate the
// token set and stop two spellings of the same beer from matching.
const dropConcatenations = (words) => {
  const out = new Set(words);
  for (const word of [...out]) {
    for (const left of out) {
      if (left === word || !word.startsWith(left)) continue;
      if (out.has(word.slice(left.length))) {
        out.delete(word);
        break;
      }
    }
  }
  return out;
};

export const dedupeKey = (brand, name) => {
  const full = dropConcatenations(tokens(brand, name));
  const trimmed = new Set([...full].filter((word) => !STYLE_WORDS.has(word)));
  return trimmed.size ? trimmed : full;
};

export const keyString = (words) => [...words].sort().join(' ');

const signature = (words) => [...words].join('').split('').sort().join('');

const isSubset = (a, b) => [...a].every((word) => b.has(word));
const difference = (a, b) => new Set([...a].filter((word) => !b.has(word)));
const intersection = (a, b) => new Set([...a].filter((word) => b.has(word)));

const ratio = (a, b) => {
  // Cheap stand-in for difflib.SequenceMatcher on the sorted-token strings:
  // longest common subsequence length over the combined length.
  if (!a.length || !b.length) return 0;
  let previous = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i += 1) {
    const current = new Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = a[i - 1] === b[j - 1]
        ? previous[j - 1] + 1
        : Math.max(previous[j], current[j - 1]);
    }
    previous = current;
  }
  return (2 * previous[b.length]) / (a.length + b.length);
};

export const similar = (a, b, brandA = new Set(), brandB = new Set()) => {
  if (!a.size || !b.size) return false;
  const keyA = keyString(a);
  const keyB = keyString(b);
  if (keyA === keyB) return true;
  // A subset only counts as the same drink when the extra words are brand words,
  // so "Trail Pass IPA" merges into "Sierra Nevada Trail Pass IPA" while
  // "Lucky Saint Hazy" stays separate from "Lucky Saint".
  if (a.size < b.size && isSubset(a, b) && isSubset(difference(b, a), brandB)) return true;
  if (b.size < a.size && isSubset(b, a) && isSubset(difference(a, b), brandA)) return true;
  if (signature(a) === signature(b)) return true;
  const shared = intersection(a, b);
  const union = new Set([...a, ...b]);
  if (shared.size >= 3 && shared.size / union.size >= 0.55) return true;
  return ratio([...a].sort().join(''), [...b].sort().join('')) >= 0.9;
};

export const slugify = (value, maxLength = 70) => {
  let slug = foldAccents(value.toLowerCase().replace(/ß/g, 'ss'));
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  return slug.replace(/^-+|-+$/g, '').slice(0, maxLength).replace(/-+$/g, '');
};

// Retailer listings are full of things that are not a single zero-alcohol beer:
// mixed cases, wine, glassware. Cheap keyword filtering keeps those out.
export const looksLikeBeer = ({ title, productType = '', tags = [] }) => {
  const type = (productType || '').trim().toLowerCase();
  const lowerTags = tags.map((tag) => String(tag).toLowerCase());
  if (EXCLUDED_TYPES.has(type)) return false;
  if (EXCLUDED_TITLE.test(title || '')) return false;
  if (lowerTags.some((tag) => ['cider', 'mixed case', 'mixed', 'wine', 'spirits'].includes(tag))) return false;
  if (BEER_TYPES.has(type)) return true;
  if (lowerTags.some((tag) => ['tafc-beer', 'oc-beer', 'mc-beer'].includes(tag))) return true;
  return BEER_WORDS.test(title || '');
};

// A zero-alcohol catalog should not pick up ordinary strength beer that merely
// mentions a low-alcohol range in its listing text.
export const looksAlcoholFree = ({ title = '', productType = '', tags = [], description = '' }) => {
  const haystack = [title, productType, tags.join(' '), description].join(' ');
  if (/\b(alcohol[\s-]?free|non[\s-]?alcoholic|alkoholfrei|de-?alcoholi[sz]ed|zero alcohol|low alcohol|no alcohol)\b/i.test(haystack)) {
    return true;
  }
  if (/\b0\.0\s*%|\b0\.5\s*%|\b0%|\bzero\b|\b0\.0\b/i.test(title)) return true;
  const abv = title.match(/(\d[.,]\d)\s*%/);
  return abv ? Number.parseFloat(abv[1].replace(',', '.')) <= 0.5 : false;
};

export { STYLE_WORDS };
