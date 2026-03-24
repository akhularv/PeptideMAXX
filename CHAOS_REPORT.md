# CHAOS_REPORT.md

Date: 2026-03-24
Target: PeptideMaxx.AI metrics route and shared navigation after reference-visual swap
Verdict: PASS WITH ADVISORY

## Scope

This pass focused on the user-reported issues around:

- broken-feeling scroll/layout
- poor replacement of the muscle-composition visual
- stability after swapping in the reference-based image

## Tests Run

### C-01 Build verification
- Command: `npm run build`
- Result: PASS
- Observed: production build completed successfully in under 1s.

### C-02 Reference image integrity
- Probe: Playwright DOM evaluation on `/app/metrics`
- Result: PASS
- Observed:
  - `img[alt="Muscle workload front and back target reference"]` exists
  - image loaded successfully
  - natural width: `145`

### C-03 Desktop overflow and scroll sanity
- Probe: Playwright DOM evaluation at `1440x1100`
- Result: PASS
- Observed:
  - `body.scrollWidth = 1432`
  - `window.innerWidth = 1440`
  - horizontal overflow: `false`
  - document height larger than viewport as expected for page scroll

### C-04 Mobile overflow sanity
- Probe: Playwright DOM evaluation at `390x844`
- Result: PASS
- Observed:
  - `body.scrollWidth = 382`
  - `window.innerWidth = 390`
  - horizontal overflow: `false`

### C-05 Mobile nav regression check
- Probe: Playwright mobile screenshot after responsive nav patch
- Result: PASS
- Observed:
  - nav no longer expands into the earlier crowded multi-row overlap state
  - session pill is hidden on narrow screens
  - route remains readable at first paint

### C-06 Visual fidelity check
- Probe: reference-based screenshot crop embedded into metrics panel
- Result: PASS
- Observed:
  - previous synthetic body-map panel removed
  - metrics route now uses the extracted muscle-workload visual from the supplied Dribbble reference

## Fixes Applied During Chaos Pass

### F-01 Replace synthetic anatomy panel with reference crop
- File: `src/pages/Metrics.tsx`
- Replaced the custom SVG body-map with the extracted reference image and simplified the surrounding copy/chips.

### F-02 Add asset to build pipeline
- File: `src/assets/muscle-workload-reference.png`
- Added the cropped source image as a local asset so the app does not depend on live third-party image hosting.

### F-03 Responsive nav stabilization
- Files:
  - `src/components/layout/TopNav.tsx`
  - `src/styles/index.css`
- Added responsive classes and mobile rules to stop nav crowding/overlap on narrow screens.

## Remaining Risks

- Build still reports a large-JS-chunk advisory. This is a performance concern, not a correctness failure.
- The embedded muscle visual is a cropped reference image, so future design work may still want a first-party bespoke anatomy illustration for stronger brand cohesion.

## Final Verdict

No critical failures remain in the tested path.

The metrics route now:

- uses the requested reference visual
- avoids horizontal overflow on desktop and mobile
- keeps the nav readable on mobile
- builds cleanly
