import { Beer } from '../types/beer';

export const sampleBeers: Beer[] = [
  {
    id: 'lucky-saint',
    name: 'Lucky Saint Unfiltered Lager',
    brewery: 'Lucky Saint',
    style: 'Lager',
    abv: '0.5%',
    tastingNotes: ['crisp', 'bready', 'clean finish'],
    initialRating: 4,
    initialComment: 'Feels closest to a proper pub lager.',
  },
  {
    id: 'erdinger-alkoholfrei',
    name: 'Alkoholfrei',
    brewery: 'Erdinger',
    style: 'Wheat Beer',
    abv: '0.5%',
    tastingNotes: ['banana', 'malty', 'soft mouthfeel'],
    initialRating: 3,
    initialComment: 'Refreshing, but a bit sweet for me.',
  },
  {
    id: 'guinness-0',
    name: 'Guinness 0.0',
    brewery: 'Guinness',
    style: 'Stout',
    abv: '0.0%',
    tastingNotes: ['roasted', 'smooth', 'coffee notes'],
    initialRating: 5,
    initialComment: 'Very convincing alcohol-free stout.',
  },
];
