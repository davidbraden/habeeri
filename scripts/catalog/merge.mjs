import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { paths } from './lib/paths.mjs';
import { readAllSnapshots } from './lib/snapshots.mjs';
import { dedupeKey, keyString, similar, slugify, tokens } from './lib/normalise.mjs';
import { loadSources, retailerPreference } from './sources/index.mjs';

const FIELD_ORDER = [
  'name', 'brand', 'abv', 'style', 'package', 'description',
  'imageUrl', 'sourceUrl', 'retailer', 'availability', 'id', 'imageFile', 'retailers',
];

const NOT_SEEN = 'Not seen in latest check';

const parseArgs = (argv) => {
  const options = { dryRun: false };
  for (const arg of argv) {
    if (arg === '--dry-run') options.dryRun = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
};

const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
const writeJson = (file, value) => fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);

const extensionFor = (url) => {
  const extension = path.extname(url.split('?')[0]).toLowerCase();
  return ['.png', '.jpg', '.jpeg'].includes(extension) ? extension : '.jpg';
};

const digestOf = (buffer) => crypto.createHash('md5').update(buffer).digest('hex');

const downloadImage = async (url) => {
  // Shopify and most CDNs honour a width hint, which keeps the bundled assets small.
  const params = extensionFor(url) === '.jpg' && !/\.(jpg|jpeg)$/i.test(url.split('?')[0])
    ? 'width=500&format=jpg'
    : 'width=500';
  const source = `${url}${url.includes('?') ? '&' : '?'}${params}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(source, { redirect: 'follow', signal: controller.signal });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.length < 1500 ? null : buffer;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const retailerEntry = (snapshot, product) => ({
  retailerId: snapshot.retailer.id,
  retailer: snapshot.retailer.name,
  sourceUrl: product.sourceUrl,
  availability: product.availability,
  package: product.package,
});

const sortRetailers = (entries) =>
  [...entries].sort((a, b) => retailerPreference(a.retailerId) - retailerPreference(b.retailerId)
    || a.retailer.localeCompare(b.retailer));

// Existing records predate multi-retailer availability, so promote their scalar
// retailer fields into the array shape before merging anything new in.
const upgradeLegacyRecord = (record, retailerIdByHost, retailerIdByName) => {
  if (Array.isArray(record.retailers) && record.retailers.length) return record.retailers;
  const host = (record.sourceUrl || '').replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
  const retailerId = retailerIdByHost.get(host)
    ?? retailerIdByName.get((record.retailer || '').toLowerCase())
    ?? slugify(record.retailer || 'unknown');
  return [{
    retailerId,
    retailer: record.retailer,
    sourceUrl: record.sourceUrl,
    availability: record.availability,
    package: record.package,
  }];
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const snapshots = await readAllSnapshots();
  if (!snapshots.length) {
    throw new Error('No snapshots found. Run `pnpm catalog:pull` first.');
  }

  const sources = await loadSources();
  const retailerIdByHost = new Map(sources.map((source) => [source.retailer.host, source.retailer.id]));
  const retailerIdByName = new Map(sources.map((source) => [source.retailer.name.toLowerCase(), source.retailer.id]));
  const refreshedRetailers = new Set(snapshots.map((snapshot) => snapshot.retailer.id));

  const existing = await readJson(paths.catalog);
  const beers = existing.map((record) => {
    const legacy = upgradeLegacyRecord(record, retailerIdByHost, retailerIdByName);
    return {
      record,
      key: dedupeKey(record.brand, record.name),
      brandTokens: tokens(record.brand),
      // Retailers we have no snapshot for keep whatever we already knew.
      keptRetailers: legacy.filter((entry) => !refreshedRetailers.has(entry.retailerId)),
      foundRetailers: [],
      previousRetailers: legacy,
    };
  });

  const byExactKey = new Map();
  for (const beer of beers) {
    const key = keyString(beer.key);
    if (!byExactKey.has(key)) byExactKey.set(key, beer);
  }
  const bySourceUrl = new Map();
  for (const beer of beers) {
    for (const entry of beer.previousRetailers) {
      if (entry.sourceUrl) bySourceUrl.set(entry.sourceUrl, beer);
    }
  }

  const findExisting = (key, brandTokens, sourceUrl) => {
    const byUrl = bySourceUrl.get(sourceUrl);
    if (byUrl) return byUrl;
    const exact = byExactKey.get(keyString(key));
    if (exact) return exact;
    return beers.find((beer) => similar(key, beer.key, brandTokens, beer.brandTokens)) ?? null;
  };

  const candidates = [];
  let listingCount = 0;

  for (const snapshot of snapshots) {
    for (const product of snapshot.products) {
      listingCount += 1;
      const key = dedupeKey(product.brand, product.name);
      if (!key.size) continue;
      const brandTokens = tokens(product.brand);
      const match = findExisting(key, brandTokens, product.sourceUrl);
      const entry = retailerEntry(snapshot, product);
      if (match) {
        // One retailer can list the same beer in several pack sizes; keep the first.
        if (!match.foundRetailers.some((found) => found.retailerId === entry.retailerId)) {
          match.foundRetailers.push(entry);
        }
        continue;
      }
      candidates.push({ key, brandTokens, product, entry });
    }
  }

  // Group the leftovers among themselves so a beer new to us but stocked by
  // three retailers becomes one catalog entry with three retailers.
  const fresh = [];
  for (const candidate of candidates.sort((a, b) => a.key.size - b.key.size)) {
    const match = fresh.find((beer) =>
      similar(candidate.key, beer.key, candidate.brandTokens, beer.brandTokens));
    if (match) {
      if (!match.retailers.some((entry) => entry.retailerId === candidate.entry.retailerId)) {
        match.retailers.push(candidate.entry);
      }
      if (candidate.product.description.length > match.product.description.length) {
        match.product = candidate.product;
      }
      continue;
    }
    fresh.push({
      key: candidate.key,
      brandTokens: candidate.brandTokens,
      product: candidate.product,
      retailers: [candidate.entry],
    });
  }

  // Refresh availability on the beers we already had.
  let delisted = 0;
  for (const beer of beers) {
    const merged = sortRetailers([...beer.keptRetailers, ...beer.foundRetailers]);
    if (merged.length) {
      beer.record.retailers = merged;
      beer.record.retailer = merged[0].retailer;
      beer.record.sourceUrl = merged[0].sourceUrl;
      beer.record.availability = merged[0].availability;
    } else {
      // Keep the beer and its bundled image; only its availability is stale.
      delisted += 1;
      beer.record.retailers = sortRetailers(beer.previousRetailers)
        .map((entry) => ({ ...entry, availability: NOT_SEEN }));
      beer.record.availability = NOT_SEEN;
    }
  }

  const catalog = beers.map((beer) => beer.record);

  if (options.dryRun) {
    reportDryRun({ catalog, fresh, snapshots, listingCount, delisted });
    return;
  }

  // Add the genuinely new beers, skipping any whose image we already bundle
  // under a different name — a strong signal it is the same product.
  const seenImages = new Map();
  for (const record of catalog) {
    const file = path.join(paths.imageDir, record.imageFile);
    try {
      seenImages.set(digestOf(await fs.readFile(file)), record.name);
    } catch { /* image not bundled */ }
  }

  const staged = [];
  const noImage = [];
  const duplicateImage = [];
  // Longest name first, so the more specific product name wins a duplicate pair.
  for (const beer of [...fresh].sort((a, b) => b.product.name.length - a.product.name.length)) {
    const buffer = await downloadImage(beer.product.imageUrl);
    if (!buffer) {
      noImage.push(beer.product.name);
      continue;
    }
    const digest = digestOf(buffer);
    const clash = seenImages.get(digest);
    if (clash) {
      duplicateImage.push(`${beer.product.name} (same image as ${clash})`);
      continue;
    }
    seenImages.set(digest, beer.product.name);
    staged.push({ beer, buffer });
  }

  staged.sort((a, b) => a.beer.product.brand.toLowerCase().localeCompare(b.beer.product.brand.toLowerCase())
    || a.beer.product.name.toLowerCase().localeCompare(b.beer.product.name.toLowerCase()));

  await fs.mkdir(paths.imageDir, { recursive: true });
  let nextId = catalog.reduce((max, record) => Math.max(max, record.id), 0) + 1;
  for (const { beer, buffer } of staged) {
    const id = nextId;
    nextId += 1;
    const extension = extensionFor(beer.product.imageUrl);
    const imageFile = `${String(id).padStart(3, '0')}-${slugify(beer.product.name)}${extension}`;
    await fs.writeFile(path.join(paths.imageDir, imageFile), buffer);
    const retailers = sortRetailers(beer.retailers);
    catalog.push({
      ...beer.product,
      id,
      imageFile,
      retailer: retailers[0].retailer,
      sourceUrl: retailers[0].sourceUrl,
      availability: retailers[0].availability,
      retailers,
    });
  }

  const ordered = catalog.map((record) =>
    Object.fromEntries(FIELD_ORDER.filter((field) => record[field] !== undefined)
      .map((field) => [field, record[field]])));

  await writeJson(paths.catalog, ordered);
  await writeJson(paths.imageManifest, await buildManifest(ordered));
  await writeJson(paths.retailers, sources.map((source) => source.retailer));
  await rewriteRequireMap(ordered);

  const coverage = new Map();
  for (const record of ordered) {
    for (const entry of record.retailers) {
      coverage.set(entry.retailer, (coverage.get(entry.retailer) ?? 0) + 1);
    }
  }
  const multi = ordered.filter((record) => record.retailers.length > 1).length;

  console.log(`snapshots=${snapshots.length} listings=${listingCount}`);
  console.log(`added=${staged.length} delisted=${delisted} total=${ordered.length}`);
  console.log(`beers stocked by more than one retailer: ${multi}`);
  console.log('per-retailer coverage:');
  for (const [retailer, count] of [...coverage].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${retailer}: ${count}`);
  }
  if (noImage.length) console.log(`skipped, no image (${noImage.length}): ${noImage.slice(0, 8).join(', ')}`);
  if (duplicateImage.length) console.log(`skipped, duplicate image (${duplicateImage.length})`);
};

const buildManifest = async (catalog) => {
  const manifest = [];
  for (const record of catalog) {
    const relative = `${paths.imageDirRelative}/${record.imageFile}`;
    let bundled = null;
    try {
      await fs.access(path.join(paths.imageDir, record.imageFile));
      bundled = relative;
    } catch { /* not bundled */ }
    manifest.push({
      id: record.id,
      name: record.name,
      imageFile: record.imageFile,
      bundledImage: bundled,
    });
  }
  return manifest;
};

// Metro cannot build require paths at runtime, so the map in sampleBeers.ts has
// to be regenerated whenever the catalog gains images.
const rewriteRequireMap = async (catalog) => {
  const lines = catalog.map((record) =>
    `  '${record.imageFile}': require('../../${paths.imageDirRelative}/${record.imageFile}'),`);
  const source = await fs.readFile(paths.sampleBeers, 'utf8');
  const pattern = /const beerImages: Record<string, ImageSourcePropType> = \{[\s\S]*?\n\};/;
  if (!pattern.test(source)) {
    throw new Error(`Could not find the beerImages map in ${paths.sampleBeers}`);
  }
  const replacement = `const beerImages: Record<string, ImageSourcePropType> = {\n${lines.join('\n')}\n};`;
  await fs.writeFile(paths.sampleBeers, source.replace(pattern, replacement));
};

const reportDryRun = ({ catalog, fresh, snapshots, listingCount, delisted }) => {
  console.log('dry run — nothing written\n');
  console.log(`snapshots=${snapshots.length} listings=${listingCount} existing=${catalog.length}`);
  console.log(`would add=${fresh.length} would mark delisted=${delisted}`);
  const multi = catalog.filter((record) => record.retailers.length > 1);
  console.log(`existing beers gaining multiple retailers: ${multi.length}`);
  for (const record of multi.slice(0, 10)) {
    console.log(`  ${record.name}: ${record.retailers.map((entry) => entry.retailer).join(', ')}`);
  }
  for (const beer of fresh.slice(0, 10)) {
    console.log(`  + ${beer.product.name} (${beer.retailers.map((entry) => entry.retailer).join(', ')})`);
  }
};

await main();
