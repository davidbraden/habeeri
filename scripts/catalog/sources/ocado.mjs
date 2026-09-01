import { fetchOcadoPlatformProducts } from '../lib/ocado-platform.mjs';

const website = 'https://www.ocado.com';

// The low/no-alcohol root; the adapter walks into the beer-related children.
const rootCategoryUrl =
  `${website}/categories/beer-wine-spirits/low-alcohol-alcohol-free/c0dcd96b-d76c-4d0c-91ae-8554278daee2`;

export default {
  id: 'ocado',
  retailer: {
    id: 'ocado',
    name: 'Ocado',
    website,
    host: 'www.ocado.com',
    country: 'UK',
    description: 'UK online supermarket stocking mainstream alcohol-free beers.',
  },
  fetch: async () => {
    const { products, notes, rawCount } = await fetchOcadoPlatformProducts({ website, rootCategoryUrl });
    return { products, mode: 'http', notes: [...notes, `${rawCount} listings scanned`] };
  },
};
