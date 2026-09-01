import { fetchShopifyProducts } from '../lib/shopify.mjs';

const website = 'https://www.drydrinker.com';

export default {
  id: 'dry-drinker',
  retailer: {
    id: 'dry-drinker',
    name: 'Dry Drinker',
    website,
    host: 'www.drydrinker.com',
    country: 'UK',
    description: 'UK alcohol-free and low-alcohol drinks shop.',
  },
  fetch: async () => {
    const { products, rawCount } = await fetchShopifyProducts({
      website,
      vendorBlocklist: ['Dry Drinker'],
    });
    return { products, mode: 'http', notes: [`shopify products.json, ${rawCount} listings scanned`] };
  },
};
