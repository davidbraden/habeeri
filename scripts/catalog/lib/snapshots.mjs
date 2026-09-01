import fs from 'node:fs/promises';
import path from 'node:path';
import { paths } from './paths.mjs';

export const SNAPSHOT_VERSION = 1;

const snapshotPath = (retailerId) => path.join(paths.snapshots, `${retailerId}.json`);

export const writeSnapshot = async (source, products, { mode, notes = [] }) => {
  await fs.mkdir(paths.snapshots, { recursive: true });
  const snapshot = {
    version: SNAPSHOT_VERSION,
    retailer: source.retailer,
    mode,
    fetchedAt: new Date().toISOString(),
    productCount: products.length,
    notes,
    products,
  };
  await fs.writeFile(snapshotPath(source.id), `${JSON.stringify(snapshot, null, 2)}\n`);
  return snapshot;
};

export const readSnapshot = async (retailerId) => {
  try {
    return JSON.parse(await fs.readFile(snapshotPath(retailerId), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

export const readAllSnapshots = async () => {
  let files;
  try {
    files = await fs.readdir(paths.snapshots);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const snapshots = [];
  for (const file of files.filter((name) => name.endsWith('.json')).sort()) {
    snapshots.push(JSON.parse(await fs.readFile(path.join(paths.snapshots, file), 'utf8')));
  }
  return snapshots;
};

// Products are stored in a retailer-independent shape so the merge step never
// has to know which shop a listing came from.
export const normalisedProduct = ({
  name,
  brand,
  style,
  abv,
  packaging,
  description,
  imageUrl,
  sourceUrl,
  availability = 'In stock when checked',
}) => ({
  name,
  brand,
  style,
  abv,
  package: packaging,
  description,
  imageUrl,
  sourceUrl,
  availability,
});
