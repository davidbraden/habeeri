import { fetchFromSavedPage } from '../lib/manual.mjs';

const website = 'https://groceries.asda.com';

// Asda's storefront sits behind a Cloudflare managed challenge that returns 403
// to every non-browser client, and its robots.txt disallows automated agents
// outright, so this retailer is only ever read from a saved page.
export default {
  id: 'asda',
  retailer: {
    id: 'asda',
    name: 'Asda',
    website,
    host: 'groceries.asda.com',
    country: 'UK',
    description: 'UK supermarket with a low and no alcohol beer range.',
  },
  listingUrl: `${website}/cat/beer-wine-spirits/low-no-alcohol`,
  fetch: () => fetchFromSavedPage({ retailerId: 'asda', website }),
};
