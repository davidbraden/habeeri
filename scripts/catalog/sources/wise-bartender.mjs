import { fetchShopifyProducts } from '../lib/shopify.mjs';

const website = 'https://www.wisebartender.co.uk';

export default {
  id: 'wise-bartender',
  retailer: {
    id: 'wise-bartender',
    name: 'Wise Bartender',
    website,
    host: 'www.wisebartender.co.uk',
    country: 'UK',
    description: 'UK alcohol-free drinks retailer with a broad independent brewery range.',
  },
  fetch: async () => {
    const { products, rawCount } = await fetchShopifyProducts({
      website,
      vendorBlocklist: ['Wise Bartender'],
    });
    return { products, mode: 'http', notes: [`shopify products.json, ${rawCount} listings scanned`] };
  },
};
