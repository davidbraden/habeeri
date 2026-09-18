import { useEffect, useMemo, useState } from 'react';
import { BeerCard } from './components/BeerCard';
import { sampleBeers } from './data/sampleBeers';
import type { Beer } from './types/beer';

type FilterMode = 'all' | 'tried' | 'untried';

const ratingStars = [1, 2, 3, 4, 5];
const storageKey = 'habeeri-beer-logs';
const legacyStorageKey = ['null', 'pint', 'beer', 'logs'].join('-');

const selectedBeerIdFromLocation = (): string | null => {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('beer');
};

const updateBeerHistory = (beerId: string | null, mode: 'push' | 'replace') => {
  const url = new URL(window.location.href);

  if (beerId) {
    url.searchParams.set('beer', beerId);
  } else {
    url.searchParams.delete('beer');
  }

  window.history[`${mode}State`]({ habeeri: true, beerId }, '', `${url.pathname}${url.search}${url.hash}`);
};

const loadBeers = (): Beer[] => {
  if (typeof window === 'undefined') {
    return sampleBeers;
  }

  try {
    const rawValue =
      window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey);

    if (!rawValue) {
      return sampleBeers;
    }

    const savedLogs = JSON.parse(rawValue) as Record<string, Beer['log']>;

    return sampleBeers.map((beer) => ({
      ...beer,
      log: savedLogs[beer.id] ? { ...beer.log, ...savedLogs[beer.id] } : beer.log,
    }));
  } catch {
    return sampleBeers;
  }
};

export default function App() {
  const [beers, setBeers] = useState<Beer[]>(() => loadBeers());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selectedBeerId, setSelectedBeerId] = useState<string | null>(() => selectedBeerIdFromLocation());
  const [onlyRated, setOnlyRated] = useState(false);

  const selectedBeer = beers.find((beer) => beer.id === selectedBeerId) ?? null;

  useEffect(() => {
    const logs = Object.fromEntries(beers.map((beer) => [beer.id, beer.log]));
    window.localStorage.setItem(storageKey, JSON.stringify(logs));
    window.localStorage.removeItem(legacyStorageKey);
  }, [beers]);

  useEffect(() => {
    const handlePopState = () => setSelectedBeerId(selectedBeerIdFromLocation());

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const filteredBeers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return beers.filter((beer) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [beer.name, beer.brewery, beer.style, beer.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === 'all' || (filter === 'tried' ? beer.log.drunk : !beer.log.drunk);

      const matchesRated = !onlyRated || beer.log.rating > 0;

      return matchesQuery && matchesFilter && matchesRated;
    });
  }, [beers, filter, onlyRated, query]);

  const updateBeer = (updatedBeer: Beer) => {
    setBeers((currentBeers) =>
      currentBeers.map((beer) => (beer.id === updatedBeer.id ? updatedBeer : beer)),
    );
  };

  const selectBeer = (beerId: string) => {
    updateBeerHistory(beerId, 'push');
    setSelectedBeerId(beerId);
  };

  const returnToBeers = () => {
    if (window.history.state?.habeeri && window.history.state.beerId) {
      window.history.back();
      return;
    }

    updateBeerHistory(null, 'push');
    setSelectedBeerId(null);
  };

  if (selectedBeer) {
    return (
      <main className="app-shell">
        <section className="page page--detail">
          <button type="button" className="back-button" onClick={returnToBeers}>
            ← Back to beers
          </button>

          <article className="detail-card">
            <div className="detail-card__media">
              <img
                className="detail-card__image"
                src={selectedBeer.localImage ?? selectedBeer.imageUrl}
                alt={selectedBeer.name}
              />
            </div>

            <div className="detail-card__body">
              <div className="detail-card__header">
                <div>
                  <h1 className="detail-card__title">{selectedBeer.name}</h1>
                  <p className="detail-card__meta">
                    {selectedBeer.brewery} · {selectedBeer.style} · {selectedBeer.abv}
                  </p>
                </div>
                <span className={`status-pill ${selectedBeer.log.drunk ? 'status-pill--done' : 'status-pill--todo'}`}>
                  {selectedBeer.log.drunk ? 'Tried' : 'Not tried yet'}
                </span>
              </div>

              <p className="detail-card__description">{selectedBeer.description}</p>

              <div className="chip-row">
                <span className="info-chip">{selectedBeer.package}</span>
                <span className="info-chip">{selectedBeer.availability}</span>
              </div>

              <a
                className="source-link"
                href={selectedBeer.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span>View on {selectedBeer.retailer} ↗</span>
                <span className="source-link__url">{selectedBeer.sourceUrl}</span>
              </a>
            </div>
          </article>

          <section className="editor-card">
            <div className="toggle-row">
              <div>
                <h2 className="section-title">Mark as tried</h2>
                <p className="section-hint">Flip this on once you’ve tried it.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedBeer.log.drunk}
                  onChange={(event) =>
                    updateBeer({
                      ...selectedBeer,
                      log: {
                        ...selectedBeer.log,
                        drunk: event.target.checked,
                        triedOn: event.target.checked
                          ? selectedBeer.log.triedOn ?? new Date().toISOString().slice(0, 10)
                          : undefined,
                      },
                    })
                  }
                />
                <span>Tried</span>
              </label>
            </div>

            <div className="section-block">
              <h2 className="section-title">Your rating</h2>
              <div className="star-row">
                {ratingStars.map((star) => {
                  const active = star <= selectedBeer.log.rating;

                  return (
                    <button
                      key={star}
                      type="button"
                      className={`star-button ${active ? 'star-button--active' : ''}`}
                      aria-label={`Rate ${selectedBeer.name} ${star} star${star === 1 ? '' : 's'}`}
                      onClick={() =>
                        updateBeer({
                          ...selectedBeer,
                          log: {
                            ...selectedBeer.log,
                            rating: star,
                          },
                        })
                      }
                    >
                      {active ? '★' : '☆'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="section-block">
              <h2 className="section-title">Comment</h2>
              <textarea
                className="text-area"
                rows={5}
                placeholder="Taste, texture, what you'd order again…"
                value={selectedBeer.log.comment}
                onChange={(event) =>
                  updateBeer({
                    ...selectedBeer,
                    log: {
                      ...selectedBeer.log,
                      comment: event.target.value,
                    },
                  })
                }
              />
            </div>

            <div className="section-block">
              <h2 className="section-title">Tried on</h2>
              <input
                className="text-input"
                type="date"
                value={selectedBeer.log.triedOn ?? ''}
                onChange={(event) =>
                  updateBeer({
                    ...selectedBeer,
                    log: {
                      ...selectedBeer.log,
                      triedOn: event.target.value,
                    },
                  })
                }
              />
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="page">
        <header className="top-bar">
          <div>
            <p className="eyebrow">Alcohol-free tracker</p>
            <h1 className="page-title">Habeeri</h1>
          </div>
          <p className="results-text">
            {filteredBeers.length} beer{filteredBeers.length === 1 ? '' : 's'}
          </p>
        </header>

        <section className="controls-card">
          <label className="field-label" htmlFor="beer-search">
            Search beers
          </label>
          <input
            id="beer-search"
            className="text-input"
            placeholder="Search beers, breweries, or styles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="filter-row" role="group" aria-label="Filter beers">
            {(['all', 'tried', 'untried'] as FilterMode[]).map((option) => {
              const active = option === filter;
              const label = option === 'all' ? 'All' : option === 'tried' ? 'Tried' : 'To try';

              return (
                <button
                  key={option}
                  type="button"
                  className={`filter-chip ${active ? 'filter-chip--active' : ''}`}
                  aria-pressed={active}
                  onClick={() => setFilter(option)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <label className="switch switch--inline">
            <input
              type="checkbox"
              checked={onlyRated}
              onChange={(event) => setOnlyRated(event.target.checked)}
            />
            <span>Only rated</span>
          </label>
        </section>

        {filteredBeers.length > 0 ? (
          <section className="beer-grid">
            {filteredBeers.map((beer) => (
              <BeerCard key={beer.id} beer={beer} onSelect={() => selectBeer(beer.id)} />
            ))}
          </section>
        ) : (
          <section className="empty-state">
            <h2 className="section-title">No beers match right now</h2>
            <p className="section-hint">Try clearing the search or relaxing the filters.</p>
          </section>
        )}
      </section>
    </main>
  );
}
