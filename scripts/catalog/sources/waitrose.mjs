import { fetchFromSavedPage } from '../lib/manual.mjs';

const website = 'https://www.waitrose.com';

// Waitrose drops the connection for every non-browser client — HTTP/2 resets the
// stream, HTTP/1.1 times out, and even robots.txt is unreachable. The block is on
// the client fingerprint rather than the path, so this retailer is only ever read
// from a saved page.
export default {
  id: 'waitrose',
  retailer: {
    id: 'waitrose',
    name: 'Waitrose',
    website,
    host: 'www.waitrose.com',
    country: 'UK',
    description: 'UK supermarket with a low and no alcohol beer range.',
  },
  listingUrl: `${website}/ecom/shop/browse/groceries/beer_wine_and_spirits/low_and_no_alcohol`,
  fetch: () => fetchFromSavedPage({ retailerId: 'waitrose', website }),
};
