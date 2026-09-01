import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(here, '../../..');

export const paths = {
  repoRoot,
  snapshots: path.join(repoRoot, 'scripts/catalog/snapshots'),
  manual: path.join(repoRoot, 'scripts/catalog/manual'),
  catalog: path.join(repoRoot, 'src/data/catalog/zeroBeersCatalog.json'),
  imageManifest: path.join(repoRoot, 'src/data/catalog/zeroBeersImageManifest.json'),
  retailers: path.join(repoRoot, 'src/data/catalog/retailers.json'),
  sampleBeers: path.join(repoRoot, 'src/data/sampleBeers.ts'),
  imageDir: path.join(repoRoot, 'assets/beer-images'),
  imageDirRelative: 'assets/beer-images',
  staging: path.join(repoRoot, 'tmp/catalog-staging'),
};
