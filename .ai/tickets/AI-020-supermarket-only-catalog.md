# AI-020 — Supermarket-only beer catalogue

## Asked

- Show only beers that can be bought from supermarkets, so they are straightforward to get.

## Decisions

- Retained the full source catalogue for future data refreshes, but filter the app catalogue to supermarket listings.
- When a beer has several listings, select its first supermarket listing for the purchase link and availability information.

## Changed

- Classified retailer records as either specialist or supermarket.
- Added supermarket retailer helpers and filtered the displayed beers to those listings.
- Updated purchase links and retailer descriptions to reference the selected supermarket only.
