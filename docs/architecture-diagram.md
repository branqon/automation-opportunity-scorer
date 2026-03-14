# Architecture Diagram

```mermaid
flowchart TD
    Browser[Browser]

    subgraph BuildTime[Build time]
      Prisma[Prisma client]
      SQLite[(SQLite seeded dataset)]
      Seed[Seed script]
      Export[Static Next.js export]
    end

    subgraph Runtime[Static app in the browser]
      Dashboard[Dashboard route]
      Detail[Opportunity detail route]
      UI[Typed UI components + charts]
      Scoring[Deterministic scoring engine]
      WhatIf[What-if weight scenario]
    end

    Seed --> SQLite
    Prisma --> SQLite
    Export --> Prisma

    Browser --> Dashboard
    Browser --> Detail
    Dashboard --> UI
    Detail --> UI
    Dashboard --> Scoring
    Detail --> Scoring
    Dashboard --> WhatIf
    WhatIf --> Scoring
```

## Notes

- Prisma and SQLite are used at build time to produce the static export.
- The browser consumes a static app and runs dashboard/detail scoring against the seeded data payload.
- What-if weights are client-side only and travel through the URL so linked detail pages stay aligned with the dashboard scenario.
