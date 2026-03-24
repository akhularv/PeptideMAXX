# CHAOS_REPORT.md

Date: 2026-03-24
Target: PeptideMaxx.AI GitHub Pages deployment
Verdict: PASS WITH ADVISORY

## Scope

This pass focused on the user-reported production failure where the GitHub Pages site loaded as a blank screen.

Primary goals:

- reproduce the blank deployment
- identify the root cause
- validate a production-safe fix locally under the same subpath Pages uses
- avoid pushing again until the built artifact is proven to render

## Critical Finding

### C-00 Blank GitHub Pages deployment reproduced
- Probe: browser load of `https://akhularv.github.io/PeptideMAXX/`
- Result: FAIL before fix
- Observed:
  - page rendered blank
  - browser console showed a 404 for `https://akhularv.github.io/src/main.tsx`
  - conclusion: GitHub Pages was serving the source-oriented root page rather than a built `dist/` artifact

## Tests Run

### C-01 Production build verification
- Command: `npm run build`
- Result: PASS
- Observed:
  - build completed successfully
  - generated assets referenced the correct Pages base path:
    - `/PeptideMAXX/assets/index-BHFNbaM9.js`
    - `/PeptideMAXX/assets/index-i60YjhHi.css`

### C-02 Static subpath hosting simulation
- Probe: served built output from `/tmp/peptidemaxx_pages/PeptideMAXX/`
- Result: PASS
- Observed:
  - local URL `http://127.0.0.1:8001/PeptideMAXX/` rendered normally
  - page title resolved correctly
  - landing page content loaded instead of a blank shell

### C-03 Pages router-entry verification
- Probe: direct navigation to `http://127.0.0.1:8001/PeptideMAXX/#/app/library`
- Result: PASS
- Observed:
  - routed directly into the library view
  - top navigation, filter rail, dossier list, and detail rail all rendered
  - no blank intermediate state

### C-04 Lazy route verification
- Probe: direct navigation to `http://127.0.0.1:8001/PeptideMAXX/#/app/metrics`
- Result: PASS
- Observed:
  - lazy-loaded metrics route resolved correctly under the Pages subpath
  - the metrics screen rendered after load
  - no console errors or warnings during the route test

### C-05 Network trace verification
- Probe: captured network requests from the simulated Pages host
- Result: PASS
- Observed:
  - metrics chunk loaded successfully with HTTP 200:
    - `GET /PeptideMAXX/assets/Metrics-DQVO4FAG.js => 200 OK`
  - no failed static asset requests were observed in the tested path

### C-06 Console sanity check
- Probe: captured browser console output during the simulated Pages run
- Result: PASS
- Observed:
  - total messages: `0`
  - errors: `0`
  - warnings: `0`

## Fixes Applied

### F-01 Correct Vite base path for GitHub Pages
- File: `vite.config.ts`
- Change:
  - production builds now use `base: '/PeptideMAXX/'`
  - development keeps the root base path `/`

### F-02 Router compatibility for static subpath hosting
- File: `src/App.tsx`
- Change:
  - app now uses `HashRouter` only when `import.meta.env.BASE_URL === '/PeptideMAXX/'`
  - local development continues to use `BrowserRouter`

### F-03 Real Pages deployment workflow
- File: `.github/workflows/deploy.yml`
- Change:
  - added GitHub Actions workflow to:
    - install dependencies
    - build the app
    - upload `dist/`
    - deploy with `actions/deploy-pages`

## Remaining Risks

- Build still reports a large JavaScript chunk advisory. This is a performance concern, not a deployment blocker.
- The live GitHub Pages site will remain blank until the updated workflow is pushed and GitHub finishes the new deploy run.
- The repo may still need GitHub Pages configured to use GitHub Actions in repository settings if it is currently pointed at a branch-based publish source.

## Final Verdict

The blank-site issue is resolved in the tested deployment artifact.

The root cause was deployment configuration, not a rendering failure in the app itself.

The current local production build:

- renders correctly under `/PeptideMAXX/`
- supports route entry via hash-based navigation
- loads built assets successfully
- shows no console errors in the tested Pages simulation
