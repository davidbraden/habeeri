import catalog from './catalog/zeroBeersCatalog.json';
import { retailerByName, retailerForSourceUrl } from './retailers';
import type { Beer } from '../types/beer';

type CatalogBeerRecord = {
  id: number;
  name: string;
  brand: string;
  style: string;
  abv: string;
  package: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  retailer: string;
  availability: string;
  imageFile: string;
};

const imageModules = import.meta.glob('../../assets/beer-images/*.{png,jpg,jpeg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const beerImages = new Map<string, string>(
  Object.entries(imageModules).map(([filePath, imageUrl]) => [filePath.split('/').pop() ?? filePath, imageUrl]),
);

const starterLogs: Record<string, Beer['log']> = {
  '25-guinness-0-0-pint': {
    drunk: true,
    rating: 5,
    comment: 'Closest thing to a proper Guinness pour so far.',
    triedOn: '2026-08-20',
  },
  '40-lucky-saint-alcohol-free-lager': {
    drunk: true,
    rating: 4,
    comment: 'Really solid lager choice for the pub fridge.',
    triedOn: '2026-08-26',
  },
  '26-heineken-0-0': {
    drunk: true,
    rating: 3,
    comment: 'Easy drinking, better ice cold.',
    triedOn: '2026-08-28',
  },
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const sampleBeers: Beer[] = (catalog as CatalogBeerRecord[]).map((beer) => {
  const id = `${beer.id}-${slugify(beer.imageFile.replace(/\.(png|jpe?g)$/i, ''))}`;

  return {
    id,
    numericId: beer.id,
    name: beer.name,
    brewery: beer.brand,
    style: beer.style,
    abv: beer.abv,
    package: beer.package,
    description: beer.description,
    imageUrl: beer.imageUrl,
    localImage: beerImages.get(beer.imageFile) ?? null,
    sourceUrl: beer.sourceUrl,
    retailer: beer.retailer,
    retailerId:
      (retailerForSourceUrl(beer.sourceUrl) ?? retailerByName(beer.retailer))?.id ?? '',
    availability: beer.availability,
    imageFile: beer.imageFile,
    log: starterLogs[id] ?? {
      drunk: false,
      rating: 0,
      comment: '',
    },
  };
});
