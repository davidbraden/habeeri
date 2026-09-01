import { fetchOcadoPlatformProducts } from '../lib/ocado-platform.mjs';

const website = 'https://groceries.morrisons.com';

const rootCategoryUrl =
  `${website}/categories/beer-wines-spirits/beer-cider/low-no-alcohol-beer-cider/5f0aa847-3d8e-46d5-98d9-3b606b825015`;

export default {
  id: 'morrisons',
  retailer: {
    id: 'morrisons',
    name: 'Morrisons',
    website,
    host: 'groceries.morrisons.com',
    country: 'UK',
    description: 'UK supermarket with a low and no alcohol beer range.',
  },
  fetch: async () => {
    const { products, notes, rawCount } = await fetchOcadoPlatformProducts({ website, rootCategoryUrl });
    return { products, mode: 'http', notes: [...notes, `${rawCount} listings scanned`] };
  },
};
