# Phase 6: Punch List Fixes — Phase Spec

## Objective

Fix all 17 visual discrepancies identified by Phase 5's automated comparison between the clone and the original Lost & Lucky Labs site. Each fix should bring the clone's computed styles within the existing tolerance thresholds (color: 5/channel, dimension: 10px, font-size: 2px, letter-spacing: 1px).

## Decisions for Review

1. **Hero video approach** — YouTube iframe embed (`AHsceDsFEQs`, muted, looping, 0.5x speed). Use existing hero image as poster/fallback. **[RESOLVED: YouTube iframe]**

2. **Header background** — Change from white to black, flip text/logo to white. **[RESOLVED: Match original (black)]**

3. **Footer background and padding** — Transparent background, 0px padding, matching original. **[RESOLVED: Match original]**

## Requirements

### Header (1 fix)
- Background color must match original (currently white, original is black)
- Text and logo colors must remain readable against new background

### Hero (5 fixes)
- Must include background video per Decision #1 outcome
- Must fill the viewport height (100vh or equivalent)
- Text color must be white (currently black)
- Padding must approximate original values (~66px top, ~0px bottom)
- Background image should serve as fallback/poster for the video

### Portfolio Grid Cards (2 fixes)
- Card dimensions must fall within tolerance of original (target: ~367px wide, ~490px tall)
- This likely means switching to a 3-column grid or constraining max-width

### Project Detail Page (3 fixes)
- Heading color: change from `#333` to black (`#000`)
- Letter-spacing: add ~7.6px to project title
- Background-color: resolve the transparent vs white discrepancy

### Contact Page (3 fixes)
- Heading font-size: increase from 36px to ~43.6px
- Heading color: change from `#333` to black (`#000`)
- Letter-spacing: add ~9.6px to contact heading

### Footer (3 fixes)
- Background color must match original per Decision #3 outcome
- Padding top/bottom must approximate original (0px)
- Footer content must remain readable

## Acceptance Criteria

- [ ] `npm run test:visual` passes — all 17 previously-failing comparisons now within tolerance
- [ ] `npm test` passes — all 170 existing vitest tests still green
- [ ] No new npm dependencies added (except possibly a video-related one if Decision #1 requires it)
- [ ] Every punch list item is either fixed or explicitly deferred with justification in a completion report
- [ ] Header, hero, footer visual changes don't break mobile layout

## Boundaries

- Do NOT refactor component structure beyond what's needed for these fixes
- Do NOT touch portfolio intro section (all 5 comparisons already passing)
- Do NOT modify the Playwright test thresholds — fixes must meet existing tolerances
- Do NOT change admin panel styling
- Do NOT add new pages or routes
- Keep changes to Tailwind utility classes and theme config where possible

## Sources

- Punch list: `specs/visual-fidelity/punch-list.md` (17 failures, 28 passes)
- Playwright tests: `scripts/visual-verify/style-comparison.spec.js`
- Phase 5 spec: `specs/visual-fidelity/phase-5-spec.md`
- Meta-plan: `specs/visual-fidelity/meta-plan.md`
- Memory note on hero preference: Steve may prefer the taller hero

### Files likely to be modified

| File | Changes |
|------|---------|
| `client/src/components/Header.jsx` | Background color, text colors |
| `client/src/components/HeroSection.jsx` | Video embed, viewport height, padding, text color |
| `client/src/components/Footer.jsx` | Background color, padding |
| `client/src/components/ProjectCard.jsx` | Card dimensions |
| `client/src/components/PortfolioGrid.jsx` | Grid column count or max-width |
| `client/src/pages/ProjectPage.jsx` | Heading color, letter-spacing |
| `client/src/pages/ContactPage.jsx` | Heading font-size, color, letter-spacing |
| `client/tailwind.config.js` | Possible theme token additions |

## Verification

1. `npm test` — all 170 vitest tests pass
2. `npm run test:visual` — all Playwright style comparisons pass (0 failures)
3. Manual browser check at `localhost:5173` — hero video plays, header/footer look correct
