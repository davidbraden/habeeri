import { ImageSourcePropType } from 'react-native';

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
