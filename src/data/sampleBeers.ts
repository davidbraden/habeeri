import catalog from './catalog/zeroBeersCatalog.json';
import { isSupermarketRetailer, retailerById, retailerByName, retailerForSourceUrl } from './retailers';
import type { Beer, BeerRetailerListing } from '../types/beer';

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
  retailers?: BeerRetailerListing[];
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

const supermarketDescription = (description: string) =>
  description.replace(
    / is listed by .+? as an alcohol-free or no\/low beer available in the UK\.$/,
    ' is an alcohol-free or low-alcohol beer available from UK supermarkets.',
  );

export const sampleBeers: Beer[] = (catalog as CatalogBeerRecord[])
  .map((beer): Beer | null => {
    const primaryRetailer = retailerForSourceUrl(beer.sourceUrl) ?? retailerByName(beer.retailer);
    const retailerListings = beer.retailers ?? (primaryRetailer ? [{
      retailerId: primaryRetailer.id,
      retailer: beer.retailer,
      sourceUrl: beer.sourceUrl,
      availability: beer.availability,
      package: beer.package,
    }] : []);
    const supermarketListing = retailerListings.find((listing) => isSupermarketRetailer(listing.retailerId));

    if (!supermarketListing) return null;

    const supermarket = retailerById(supermarketListing.retailerId);
    if (!supermarket) return null;

    const id = `${beer.id}-${slugify(beer.imageFile.replace(/\.(png|jpe?g)$/i, ''))}`;

    return {
      id,
      numericId: beer.id,
      name: beer.name,
      brewery: beer.brand,
      style: beer.style,
      abv: beer.abv,
      package: supermarketListing.package || beer.package,
      description: supermarketDescription(beer.description),
      imageUrl: beer.imageUrl,
      localImage: beerImages.get(beer.imageFile) ?? null,
      sourceUrl: supermarketListing.sourceUrl,
      retailer: supermarket.name,
      retailerId: supermarket.id,
      availability: supermarketListing.availability || beer.availability,
      imageFile: beer.imageFile,
      log: starterLogs[id] ?? {
        drunk: false,
        rating: 0,
        comment: '',
      },
    };
  })
  .filter((beer): beer is Beer => beer !== null);
