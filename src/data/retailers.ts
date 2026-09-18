import retailers from './catalog/retailers.json';
import { Retailer } from '../types/beer';

export const beerRetailers: Retailer[] = retailers as Retailer[];
export const supermarketRetailers = beerRetailers.filter((retailer) => retailer.kind === 'supermarket');

const byHost = new Map(beerRetailers.map((retailer) => [retailer.host, retailer]));
const byName = new Map(beerRetailers.map((retailer) => [retailer.name.toLowerCase(), retailer]));
const byId = new Map(beerRetailers.map((retailer) => [retailer.id, retailer]));

export const retailerForSourceUrl = (sourceUrl: string): Retailer | undefined => {
  const host = sourceUrl.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
  return byHost.get(host);
};

export const retailerByName = (name: string): Retailer | undefined => byName.get(name.toLowerCase());

export const retailerById = (id: string): Retailer | undefined => byId.get(id);

export const isSupermarketRetailer = (id: string): boolean => retailerById(id)?.kind === 'supermarket';
