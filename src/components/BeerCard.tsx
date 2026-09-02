import type { Beer } from '../types/beer';

type BeerCardProps = {
  beer: Beer;
  onSelect: () => void;
};

export function BeerCard({ beer, onSelect }: BeerCardProps) {
  const imageSrc = beer.localImage ?? beer.imageUrl;

  return (
    <button
      type="button"
      className="beer-card"
      onClick={onSelect}
      aria-label={`Open ${beer.name}`}
    >
      <div className="beer-card__image-wrap">
        <img className="beer-card__image" src={imageSrc} alt={beer.name} loading="lazy" />
        <span
          className={`beer-card__status ${beer.log.drunk ? 'beer-card__status--done' : 'beer-card__status--todo'}`}
          aria-hidden="true"
        >
          {beer.log.rating > 0 ? beer.log.rating : ''}
        </span>
      </div>

      <div className="beer-card__body">
        <span className="beer-card__name">{beer.name}</span>
      </div>
    </button>
  );
}
