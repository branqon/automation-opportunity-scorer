# Architecture Diagram

```mermaid
flowchart TD
    Browser[Browser]

    subgraph NextApp[Next.js App Router]
      Dashboard[Dashboard route]
      Detail[Opportunity detail route]
      UI[Typed UI components + charts]
      Scoring[Deterministic scoring engine]
    end

    subgraph DataLayer[Local data layer]
      Prisma[Prisma client]
      SQLite[(SQLite seeded dataset)]
      Seed[Seed script]
    end

    Browser --> Dashboard
    Browser --> Detail
    Dashboard --> UI
    Detail --> UI
    Dashboard --> Scoring
    Detail --> Scoring
    Scoring --> Prisma
    Prisma --> SQLite
    Seed --> SQLite
```

## Notes

- The browser only consumes rendered analytics views.
- The scoring engine runs on the server and transforms seeded opportunity records into ranked portfolio outputs.
- Prisma provides the typed boundary between the app and the local SQLite database.
