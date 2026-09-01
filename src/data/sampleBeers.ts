import { ImageSourcePropType } from 'react-native';
import catalog from './catalog/zeroBeersCatalog.json';
import manifest from './catalog/zeroBeersImageManifest.json';
import { Beer } from '../types/beer';

type CatalogBeerRecord = {
  id: number;
  name: string;
  brand: string;
  style: string;
  abv: string;
  package: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  retailer: string;
  availability: string;
  imageFile: string;
};

type ImageManifestRecord = {
  id: number;
  name: string;
  imageFile: string;
  bundledImage: string | null;
};

const beerImages: Record<string, ImageSourcePropType> = {
  '01-aigua-de-moritz-0-0.png': require('../../assets/beer-images/01-aigua-de-moritz-0-0.png'),
  '02-asahi-super-dry-0-0.png': require('../../assets/beer-images/02-asahi-super-dry-0-0.png'),
  '03-athletic-brewing-co-alcohol-free-lager.png': require('../../assets/beer-images/03-athletic-brewing-co-alcohol-free-lager.png'),
  '04-athletic-brewing-co-free-wave-hazy-ipa-alcohol-free.png': require('../../assets/beer-images/04-athletic-brewing-co-free-wave-hazy-ipa-alcohol-free.png'),
  '05-athletic-brewing-co-run-wild-ipa-alcohol-free.png': require('../../assets/beer-images/05-athletic-brewing-co-run-wild-ipa-alcohol-free.png'),
  '06-athletic-brewing-co-upside-dawn-pale-ale-alcohol-free.png': require('../../assets/beer-images/06-athletic-brewing-co-upside-dawn-pale-ale-alcohol-free.png'),
  '07-beavertown-lazer-crush-0-3.png': require('../../assets/beer-images/07-beavertown-lazer-crush-0-3.png'),
  '08-becks-blue.png': require('../../assets/beer-images/08-becks-blue.png'),
  '09-birra-moretti-zero-alcohol-free-beer-bottles.png': require('../../assets/beer-images/09-birra-moretti-zero-alcohol-free-beer-bottles.png'),
  '10-bitburger-drive-0-0.png': require('../../assets/beer-images/10-bitburger-drive-0-0.png'),
  '11-brewdog-mixed-alcohol-free-cans-0-5.png': require('../../assets/beer-images/11-brewdog-mixed-alcohol-free-cans-0-5.png'),
  '12-brinkhoff-s-zer0.png': require('../../assets/beer-images/12-brinkhoff-s-zer0.png'),
  '13-budweiser-zero.png': require('../../assets/beer-images/13-budweiser-zero.png'),
  '14-cobra-zero.png': require('../../assets/beer-images/14-cobra-zero.png'),
  '15-corona-cero.png': require('../../assets/beer-images/15-corona-cero.png'),
  '16-daura-damm-0-0-gluten-free.png': require('../../assets/beer-images/16-daura-damm-0-0-gluten-free.png'),
  '17-days-0-0-alcohol-free-beer-lager-cans.png': require('../../assets/beer-images/17-days-0-0-alcohol-free-beer-lager-cans.png'),
  '18-days-0-0-alcohol-free-beer-pale-ale-cans.png': require('../../assets/beer-images/18-days-0-0-alcohol-free-beer-pale-ale-cans.png'),
  '19-desperados-lemon-0-0.png': require('../../assets/beer-images/19-desperados-lemon-0-0.png'),
  '20-drop-bear-bonfire-stout-0-5.png': require('../../assets/beer-images/20-drop-bear-bonfire-stout-0-5.png'),
  '21-drop-bear-tropical-ipa-0-5.png': require('../../assets/beer-images/21-drop-bear-tropical-ipa-0-5.png'),
  '22-drop-bear-yuzu-pale-ale-0-5.png': require('../../assets/beer-images/22-drop-bear-yuzu-pale-ale-0-5.png'),
  '23-estrella-damm-0-0.png': require('../../assets/beer-images/23-estrella-damm-0-0.png'),
  '24-estrella-galicia-0-0-spanish-lager-12-x-330ml-beer-bottles.png': require('../../assets/beer-images/24-estrella-galicia-0-0-spanish-lager-12-x-330ml-beer-bottles.png'),
  '25-guinness-0-0-pint.png': require('../../assets/beer-images/25-guinness-0-0-pint.png'),
  '26-heineken-0-0.png': require('../../assets/beer-images/26-heineken-0-0.png'),
  '27-huyghe-paranoia-rouge-0-0.png': require('../../assets/beer-images/27-huyghe-paranoia-rouge-0-0.png'),
  '28-impossibrew-enhanced-hazy-pale.png': require('../../assets/beer-images/28-impossibrew-enhanced-hazy-pale.png'),
  '29-impossibrew-enhanced-lager.png': require('../../assets/beer-images/29-impossibrew-enhanced-lager.png'),
  '30-jiddler-s-tipple-all-day.png': require('../../assets/beer-images/30-jiddler-s-tipple-all-day.png'),
  '31-jupiler-0-0.png': require('../../assets/beer-images/31-jupiler-0-0.png'),
  '32-kaiserdom-lemon-0-0.png': require('../../assets/beer-images/32-kaiserdom-lemon-0-0.png'),
  '33-kaiserdom-pink-grapefruit-0-0.png': require('../../assets/beer-images/33-kaiserdom-pink-grapefruit-0-0.png'),
  '34-kasteel-rouge-0-0.png': require('../../assets/beer-images/34-kasteel-rouge-0-0.png'),
  '35-kasteel-tropical-0-0.png': require('../../assets/beer-images/35-kasteel-tropical-0-0.png'),
  '36-kingfisher-zero-lager-0-0.png': require('../../assets/beer-images/36-kingfisher-zero-lager-0-0.png'),
  '37-kronenbourg-1664-0-0.png': require('../../assets/beer-images/37-kronenbourg-1664-0-0.png'),
  '38-la-trappe-nillis-0-0.png': require('../../assets/beer-images/38-la-trappe-nillis-0-0.png'),
  '39-leffe-blonde-belgian-alcohol-free-lager-beer-bottles.png': require('../../assets/beer-images/39-leffe-blonde-belgian-alcohol-free-lager-beer-bottles.png'),
  '40-lucky-saint-alcohol-free-lager.png': require('../../assets/beer-images/40-lucky-saint-alcohol-free-lager.png'),
  '41-lucky-saint-lime-sea-salt-lager.png': require('../../assets/beer-images/41-lucky-saint-lime-sea-salt-lager.png'),
  '42-lucky-saint-weissbier.png': require('../../assets/beer-images/42-lucky-saint-weissbier.png'),
  '43-madri-excepcional-0-0.png': require('../../assets/beer-images/43-madri-excepcional-0-0.png'),
  '44-mello-lime-mint-alcohol-free-0-0-4x330ml.png': require('../../assets/beer-images/44-mello-lime-mint-alcohol-free-0-0-4x330ml.png'),
  '45-mello-peach-passionfruit-alcohol-free-0-0-4x330ml.png': require('../../assets/beer-images/45-mello-peach-passionfruit-alcohol-free-0-0-4x330ml.png'),
  '46-nirvana-classic-ipa.png': require('../../assets/beer-images/46-nirvana-classic-ipa.png'),
  '47-nirvana-helles-lager.png': require('../../assets/beer-images/47-nirvana-helles-lager.png'),
  '48-outdoor-hydration-0-0-lager.png': require('../../assets/beer-images/48-outdoor-hydration-0-0-lager.png'),
  '49-peroni-0-0-blood-orange.png': require('../../assets/beer-images/49-peroni-0-0-blood-orange.png'),
  '50-peroni-0-0-lemon.png': require('../../assets/beer-images/50-peroni-0-0-lemon.png'),
  '51-peroni-nastro-azzurro-0-0.png': require('../../assets/beer-images/51-peroni-nastro-azzurro-0-0.png'),
  '52-sharp-s-doom-bar-0-0.png': require('../../assets/beer-images/52-sharp-s-doom-bar-0-0.png'),
  '53-staropramen-0-0.png': require('../../assets/beer-images/53-staropramen-0-0.png'),
  '54-stella-artois-0-0-alcohol-free-lager-beer-cans.png': require('../../assets/beer-images/54-stella-artois-0-0-alcohol-free-lager-beer-cans.png'),
  '55-super-bock-0-0-pilsner.png': require('../../assets/beer-images/55-super-bock-0-0-pilsner.png'),
  '56-veltins-0-0-pilsner.png': require('../../assets/beer-images/56-veltins-0-0-pilsner.png'),
  '57-warsteiner-premium-fresh-0-0.png': require('../../assets/beer-images/57-warsteiner-premium-fresh-0-0.png'),
};

const starterLogs: Record<string, Beer['log']> = {
  '25-guinness-0-0-pint': {
    drunk: true,
    rating: 5,
    comment: 'Closest thing to a proper Guinness pour so far.',
    triedOn: '2026-08-20',
  },
  '40-lucky-saint-alcohol-free-lager': {
    drunk: true,
    rating: 4,
    comment: 'Really solid lager choice for the pub fridge.',
    triedOn: '2026-08-26',
  },
  '26-heineken-0-0': {
    drunk: true,
    rating: 3,
    comment: 'Easy drinking, better ice cold.',
    triedOn: '2026-08-28',
  },
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const localImages = new Map(
  (manifest as ImageManifestRecord[]).map((item) => [item.imageFile, beerImages[item.imageFile] ?? null]),
);

export const sampleBeers: Beer[] = (catalog as CatalogBeerRecord[]).map((beer) => {
  const id = `${beer.id}-${slugify(beer.imageFile.replace(/\.png$/i, ''))}`;

  return {
    id,
    numericId: beer.id,
    name: beer.name,
    brewery: beer.brand,
    style: beer.style,
    abv: beer.abv,
    package: beer.package,
    description: beer.description,
    imageUrl: beer.imageUrl,
    localImage: localImages.get(beer.imageFile) ?? beerImages[beer.imageFile],
    sourceUrl: beer.sourceUrl,
    retailer: beer.retailer,
    availability: beer.availability,
    imageFile: beer.imageFile,
    log: starterLogs[id] ?? {
      drunk: false,
      rating: 0,
      comment: '',
    },
  };
});
