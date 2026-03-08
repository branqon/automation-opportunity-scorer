# Engineering Decisions

## Why Next.js

Next.js with the App Router keeps the project small while still feeling production-style.

- Server components can read directly from Prisma without adding API route boilerplate.
- Route-level loading, error, and not-found states are straightforward.
- The app stays easy to explain and easy to run locally.

## Why Prisma + SQLite

The goal is zero-friction local setup for a public portfolio project.

- SQLite keeps the project self-contained.
- Prisma provides a typed schema, seed workflow, and maintainable data access.
- The seeded database makes the repo usable immediately after install.

## Why a seeded aggregated dataset instead of raw ticket ingestion

Ticket ingestion would have expanded the scope into ETL, normalization, mapping, and data-cleaning concerns.

That is a different product.

This v1 is intentionally focused on prioritization, so the seeded dataset models recurring categories directly and keeps the product story clear.

## Why the scoring model is deterministic

The point of the project is credibility and explainability.

- Hidden or fake machine learning would weaken trust.
- Fixed weights make the ranking inspectable.
- The detail page can show exactly why an item ranked where it did.

## Why the scoring model is not configurable in the UI

User-configurable scoring would create a larger product surface than the portfolio needs.

For this repo, keeping the assumptions visible in code is the better tradeoff:

- easier to review
- easier to document
- harder to misuse
- faster to ship as a tight v1

## Why there is no auth

Authentication would add setup overhead without strengthening the portfolio story. The app behaves like an internal prototype or decision-support tool shared in a controlled environment.

## Why there is no workflow execution layer

Execution is intentionally out of scope.

This project is about:

- identifying good automation targets
- comparing ROI
- framing the implementation path

It is not about:

- running automations
- routing tickets
- simulating approvals
- acting as an orchestration platform

## UI direction

Visual direction: `Operational editorial`

The interface uses restrained neutrals, a single teal accent, and internal-tool density rather than glossy AI branding. The layout is designed to read well in screenshots for public GitHub and interview walkthroughs.

## Tradeoffs accepted in v1

- Data is seeded, not imported.
- Scoring caps are fixed benchmarks, not team-specific calibrations.
- Savings are labor-based estimates, not full financial models.
- Charts focus on clarity over configurability.

## Future extensions

Reasonable follow-on work after v1:

- historical trend views
- confidence notes by opportunity
- side-by-side comparison mode
- exportable summary snapshots
- ingesting categorized operational data from a source system
