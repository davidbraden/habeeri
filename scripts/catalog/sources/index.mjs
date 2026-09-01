// Ordered list of catalog sources. The order is also the preference order used
// by the merge step when retailers disagree about a beer's name or description.
const SOURCE_ORDER = [
  'the-alcohol-free-co',
  'wise-bartender',
  'dry-drinker',
  'ocado',
  'tesco',
  'sainsburys',
  'asda',
  'morrisons',
  'waitrose',
];

export const sourceIds = () => [...SOURCE_ORDER];

export const loadSources = async (only = null) => {
  const wanted = only ?? SOURCE_ORDER;
  const unknown = wanted.filter((id) => !SOURCE_ORDER.includes(id));
  if (unknown.length) {
    throw new Error(`Unknown source(s): ${unknown.join(', ')}. Known: ${SOURCE_ORDER.join(', ')}`);
  }
  const ordered = SOURCE_ORDER.filter((id) => wanted.includes(id));
  const sources = [];
  for (const id of ordered) {
    const module = await import(`./${id}.mjs`);
    sources.push(module.default);
  }
  return sources;
};

export const retailerPreference = (retailerId) => {
  const index = SOURCE_ORDER.indexOf(retailerId);
  return index === -1 ? SOURCE_ORDER.length : index;
};
