# Engineering Decisions

## Why Next.js

Next.js with the App Router keeps the project small while still feeling production-style.

- Server components can read directly from Prisma without adding API route boilerplate.
- Route-level loading, error, and not-found states are straightforward.
- The app stays easy to explain and easy to run locally.

## Why Prisma + SQLite

SQLite is the current database choice for this repo because it keeps the setup minimal and fits the portfolio goal better than a separate database service.

- SQLite keeps the project local-first and removes Docker or external database setup from the getting-started flow.
- Prisma provides a typed schema, seed workflow, and maintainable data access.
- The data model remains easy to port later if someone wants to swap in Postgres for a larger deployment.

## Why a seeded aggregated dataset instead of raw ticket ingestion

Ticket ingestion would have expanded the scope into ETL, normalization, mapping, and data-cleaning concerns.

That is a different product.

This v1 is intentionally focused on prioritization, so the seeded dataset models recurring categories directly and keeps the product story clear.

## Why the scoring model is deterministic

The point of the project is credibility and explainability.

- Hidden or fake machine learning would weaken trust.
- Fixed weights make the ranking inspectable.
- The detail page can show exactly why an item ranked where it did.

## Why the scoring model uses fixed weights with a what-if explorer

The base scoring model uses fixed weights in code so the ranking is deterministic and auditable. The dashboard includes a what-if weight slider for exploratory analysis — users can adjust factor importance and watch rankings shift in real time. This is framed as exploration, not configuration:

- The base case is always reproducible from code.
- Detail pages always show the fixed-weight score.
- Custom weights are not persisted or shared.
- The slider demonstrates interactive data thinking without creating a configuration surface.

## Why there is no auth

Authentication would add setup overhead without strengthening the portfolio story. The app behaves like an internal prototype or decision-support tool shared in a controlled environment.

The shipped app is intentionally read-only. That keeps the public deployment safe and the portfolio story focused on prioritization instead of CRUD.

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

The interface uses clinical white with a purple accent, tight spacing, and internal-tool density rather than glossy AI branding. The layout is designed to read well in screenshots for public GitHub and interview walkthroughs.

## Tradeoffs accepted in v1

- Data is seeded, not imported.
- Scoring caps are fixed benchmarks, not team-specific calibrations.
- Savings are labor-based estimates, not full financial models.
- Charts focus on clarity over configurability.
- The app does not expose public write paths.

## Future extensions

Reasonable follow-on work after v1:

- historical trend views
- confidence notes by opportunity
- exportable stakeholder snapshots
- ingesting categorized operational data from a source system
