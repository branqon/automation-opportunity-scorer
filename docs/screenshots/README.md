# Screenshot Notes

## Current assets

- `dashboard-overview.png`
- `opportunity-detail.png`
- `score-breakdown.png`
- `dashboard-mobile.png`

## Capture context

- Captured locally on March 8, 2026
- App route: dashboard and `password-reset` detail page
- Tooling: Playwright CLI against the local Next.js dev server

## Recommended refresh workflow

1. Start the app with `npm run dev`
2. Open the dashboard in Playwright CLI
3. Set the viewport before capturing:
   - desktop: `1440 x 1700`
   - mobile: `390 x 844`
4. Capture the dashboard and a representative detail page
5. Replace the files in this folder and confirm the README still renders them correctly

## Suggested screenshot subjects

- Dashboard overview with filters and top candidates
- Opportunity detail with score breakdown visible
- Mobile dashboard with responsive filter controls
