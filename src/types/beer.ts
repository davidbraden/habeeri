import { ImageSourcePropType } from 'react-native';

export type Retailer = {
  id: string;
  name: string;
  website: string;
  host: string;
  country: string;
  description: string;
};

export type BeerCatalogItem = {
  id: string;
  numericId: number;
  name: string;
  brewery: string;
  style: string;
  abv: string;
  package: string;
  description: string;
  imageUrl: string;
  localImage: ImageSourcePropType;
  sourceUrl: string;
  retailer: string;
  retailerId: string;
  availability: string;
  imageFile: string;
};

export type BeerLog = {
  drunk: boolean;
  rating: number;
  comment: string;
  triedOn?: string;
};

export type Beer = BeerCatalogItem & {
  log: BeerLog;
};
