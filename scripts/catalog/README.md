# Catalog generation

Regenerates `src/data/catalog/` from live UK retailer listings. Two stages, run
separately so a slow or failed fetch never corrupts the catalog:

```sh
pnpm catalog:pull      # fetch each retailer -> scripts/catalog/snapshots/<id>.json
pnpm catalog:merge     # snapshots + existing catalog -> src/data/catalog/
pnpm catalog:build     # both, in order
```

`pnpm catalog:merge --dry-run` reports what would change without writing.

Useful flags on `pull`: `--list` to print the source ids, `--only=tesco,ocado` to
refresh a subset.

## Retailers

| id | how it is read |
| --- | --- |
| `the-alcohol-free-co`, `wise-bartender`, `dry-drinker` | Shopify `products.json` |
| `ocado`, `morrisons` | shared storefront platform; `__INITIAL_STATE__` on category pages |
| `tesco` | server-rendered search results (HTTP/2 only, so fetched via `curl`) |
| `sainsburys` | server-rendered browse pages |
| `asda`, `waitrose` | **saved page only** — see below |

Asda and Waitrose reject every non-browser client outright, and Asda's
`robots.txt` disallows automated agents. To include them, open the retailer's
alcohol-free beer listing in a browser, save the page, and drop the HTML at
`scripts/catalog/manual/asda.html` (or `waitrose.html`). Those files are
gitignored. Without them the pull reports the two as failed and carries on.

## What merge guarantees

- **Ids and image filenames never change.** They key the app's require map and
  its stored tasting logs, so existing records keep theirs and new beers get
  `max(id) + 1`.
- **A retailer with no snapshot keeps what we already knew.** A failed pull
  degrades coverage for that run, it does not erase data.
- **Beers found nowhere are kept**, with availability set to
  `Not seen in latest check`, because their images are already bundled.
- Each record carries a `retailers[]` array of every shop stocking it. The
  scalar `retailer` / `sourceUrl` / `availability` fields mirror `retailers[0]`,
  ordered by the preference in `sources/index.mjs`.

Merge also rewrites the generated `beerImages` map in `src/data/sampleBeers.ts`;
Metro cannot build `require` paths at runtime, so that map has to be literal.

## Deduplication

The same beer is titled differently at every shop, so matching happens in
layers: source URL, exact normalised token key, brand-aware subset match,
similarity score, then an md5 hash of the downloaded image. It deliberately
under-merges — accepting the odd duplicate pair is safer than collapsing two
distinct beers, which would lose one of them permanently.
