import { useEffect, useMemo, useRef, useState } from 'react';
import { BeerCard } from './components/BeerCard';
import { sampleBeers } from './data/sampleBeers';
import type { Beer } from './types/beer';

type FilterMode = 'all' | 'tried' | 'untried';
type CategoryFilter = 'all' | 'lager' | 'ipa' | 'fruit' | 'ale' | 'wheat' | 'stout';

const ratingStars = [1, 2, 3, 4, 5];
const storageKey = 'habeeri-beer-logs';
const legacyStorageKey = ['null', 'pint', 'beer', 'logs'].join('-');

const categoryFilters: ReadonlyArray<{
  id: CategoryFilter;
  label: string;
  styles: readonly string[];
}> = [
  { id: 'all', label: 'All categories', styles: [] },
  { id: 'lager', label: 'Lager', styles: ['Lager', 'Pilsner'] },
  { id: 'ipa', label: 'IPA', styles: ['IPA', 'Hazy IPA', 'Pale ale', 'Hazy pale ale'] },
  { id: 'fruit', label: 'Fruit & flavoured', styles: ['Flavoured beer', 'Fruit beer', 'Radler'] },
  { id: 'ale', label: 'Ale', styles: ['Ale'] },
  { id: 'wheat', label: 'Wheat beer', styles: ['Wheat beer'] },
  { id: 'stout', label: 'Stout', styles: ['Stout'] },
];

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
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedBeerId, setSelectedBeerId] = useState<string | null>(() => selectedBeerIdFromLocation());
  const [onlyRated, setOnlyRated] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const filterSheetRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (!filtersOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFiltersOpen(false);
        filterTriggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    filterSheetRef.current?.querySelector<HTMLButtonElement>('button')?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [filtersOpen]);

  const filteredBeers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const categoryStyles = categoryFilters.find(({ id }) => id === category)?.styles ?? [];

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
      const matchesCategory = category === 'all' || categoryStyles.includes(beer.style);

      return matchesQuery && matchesFilter && matchesRated && matchesCategory;
    });
  }, [beers, category, filter, onlyRated, query]);

  const activeFilterLabels = [
    ...(category === 'all'
      ? []
      : [categoryFilters.find(({ id }) => id === category)?.label ?? 'Category']),
    ...(onlyRated ? ['Rated'] : []),
  ];

  const resetFilters = () => {
    setCategory('all');
    setOnlyRated(false);
  };

  const closeFilters = () => {
    setFiltersOpen(false);
    filterTriggerRef.current?.focus();
  };

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
        <header className="top-bar top-bar--catalogue">
          <div className="app-brand">
            <span className="app-brand__mark" aria-hidden="true">H</span>
            <h1 className="page-title">Habeeri</h1>
          </div>
          <p className="results-text">
            {filteredBeers.length} beer{filteredBeers.length === 1 ? '' : 's'}
          </p>
        </header>

        <section className="controls-card">
          <label className="field-label visually-hidden" htmlFor="beer-search">
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

          <button
            ref={filterTriggerRef}
            type="button"
            className="filters-trigger"
            aria-expanded={filtersOpen}
            aria-haspopup="dialog"
            onClick={() => setFiltersOpen(true)}
          >
            <span className="filters-trigger__label">
              <span aria-hidden="true">☷</span>
              Filters
            </span>
            <span className="filters-trigger__summary">
              {activeFilterLabels.length > 0 ? (
                <>
                  <span className="filters-trigger__count">{activeFilterLabels.length}</span>
                  <span>{activeFilterLabels.join(' · ')}</span>
                </>
              ) : (
                'Any category'
              )}
              <span aria-hidden="true">›</span>
            </span>
          </button>
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

        {filtersOpen && (
          <div className="filter-sheet-backdrop" onMouseDown={closeFilters}>
            <section
              className="filter-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="filter-sheet-title"
              ref={filterSheetRef}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="filter-sheet__handle" aria-hidden="true" />
              <header className="filter-sheet__header">
                <h2 id="filter-sheet-title">Filters</h2>
                <div className="filter-sheet__actions">
                  {activeFilterLabels.length > 0 && (
                    <button type="button" className="text-button" onClick={resetFilters}>
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    className="close-button"
                    aria-label="Close filters"
                    onClick={closeFilters}
                  >
                    ×
                  </button>
                </div>
              </header>

              <div className="filter-sheet__content">
                <section className="filter-sheet__group" aria-labelledby="category-filter-title">
                  <h3 id="category-filter-title" className="filter-sheet__label">Category</h3>
                  <div className="filter-sheet__chips">
                    {categoryFilters.map((option) => {
                      const active = option.id === category;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`filter-chip ${active ? 'filter-chip--active' : ''}`}
                          aria-pressed={active}
                          onClick={() => setCategory(option.id)}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="filter-sheet__group" aria-labelledby="other-filter-title">
                  <h3 id="other-filter-title" className="filter-sheet__label">Other</h3>
                  <label className="filter-sheet__toggle">
                    <span>
                      <strong>Only rated</strong>
                      <small>Show beers you have rated</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={onlyRated}
                      onChange={(event) => setOnlyRated(event.target.checked)}
                    />
                  </label>
                </section>
              </div>

              <footer className="filter-sheet__footer">
                <button type="button" className="filter-sheet__apply" onClick={closeFilters}>
                  Show {filteredBeers.length} beer{filteredBeers.length === 1 ? '' : 's'}
                </button>
              </footer>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
