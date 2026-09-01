import { fetchShopifyProducts } from '../lib/shopify.mjs';

const website = 'https://thealcoholfreeco.co.uk';

export default {
  id: 'the-alcohol-free-co',
  retailer: {
    id: 'the-alcohol-free-co',
    name: 'The Alcohol Free Co',
    website,
    host: 'thealcoholfreeco.co.uk',
    country: 'UK',
    description: 'UK online specialist in alcohol-free beer, wine and spirits.',
  },
  fetch: async () => {
    const { products, rawCount } = await fetchShopifyProducts({
      website,
      vendorBlocklist: ['The Alcohol Free Co'],
    });
    return { products, mode: 'http', notes: [`shopify products.json, ${rawCount} listings scanned`] };
  },
};
