# حاسبة ماء بسماية

A mobile-first Arabic RTL Progressive Web App for estimating water consumption and billing costs in Basmaya residential complex (Iraq).

## Run & Operate

- `pnpm --filter @workspace/water-calc run dev` — run the app (port assigned by workflow)
- `pnpm --filter @workspace/water-calc run typecheck` — typecheck the app
- `pnpm --filter @workspace/water-calc run build` — production build to `artifacts/water-calc/dist/public`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7
- Routing: wouter
- Styling: Tailwind CSS v4 + Cairo Arabic font (Google Fonts)
- PWA: vite-plugin-pwa (Workbox) — offline caching, installable
- State: React `useState` / `localStorage` only — no backend, no external DB

## Where things live

```
artifacts/water-calc/
├── src/
│   ├── App.tsx                  # Root — router + InstallBanner
│   ├── index.css                # Theme (blue/white), RTL, mobile touch CSS
│   ├── pages/
│   │   ├── Calculator.tsx       # Main screen: input readings, history
│   │   └── Dashboard.tsx        # Results: bill breakdown, share feature
│   ├── components/
│   │   └── InstallBanner.tsx    # PWA install prompt (Android + iOS)
│   └── lib/
│       ├── calculator.ts        # Tiered billing logic (5 tiers)
│       └── storage.ts           # localStorage CRUD for history records
├── public/
│   ├── icons/                   # PNG icons (96–512px, any + maskable)
│   ├── splash/                  # iOS apple-touch-startup-image (11 sizes)
│   └── favicon.svg
├── index.html                   # PWA meta tags, iOS tags, splash links
└── vite.config.ts               # Vite + VitePWA plugin config
```

## Architecture decisions

- **Frontend-only**: No login, no backend, no external database. All data stored in `localStorage`.
- **Tiered billing**: Five progressive tiers (30 m³ each) at 100/120/140/160/180 IQD per m³. Sewer cost always equals water cost. Logic isolated in `calculator.ts`.
- **PWA via vite-plugin-pwa**: Workbox handles service worker generation, precaching, and runtime caching. Manual `sw.js` was replaced with the plugin.
- **Icon strategy**: Separate `any` and `maskable` purpose entries in manifest (combined `"any maskable"` string breaks Chrome installability check).
- **iOS install**: `beforeinstallprompt` doesn't fire on iOS; the `InstallBanner` detects iOS via UA and shows manual "Share → Add to Home Screen" guidance instead.
- **RTL + touch polish**: `touch-action: manipulation` eliminates 300 ms tap delay; `-webkit-tap-highlight-color: transparent` removes Android blue flash; `overscroll-behavior-y: none` prevents iOS bounce; `env(safe-area-inset-*)` handles notched devices.

## Product

Users enter a previous and current water meter reading. The app calculates consumption in m³, applies the five-tier tariff, doubles it for sewer costs, and shows a detailed Arabic breakdown. Results can be shared via native share sheet, WhatsApp, or clipboard. All readings are saved to localStorage and displayed as a history list with delete support. A PWA install banner appears automatically on mobile when eligible.

## User preferences

- Arabic interface only (RTL)
- No login, registration, or backend
- No AI, OCR, or camera features
- Keep app lightweight, fast, and stable
- No visible tariff tables

## Gotchas

- `vite-plugin-pwa` serves the manifest at `/manifest.webmanifest` (not `/manifest.json`) in dev mode
- PWA install prompt only appears on published HTTPS deployments, not in the Replit preview pane
- `start_url` and `scope` in the manifest must be hardcoded to `"/"` — do not use the dynamic `basePath` variable
- Icon `purpose` must be separate entries (`"any"` and `"maskable"`) — never combined as `"any maskable"`
