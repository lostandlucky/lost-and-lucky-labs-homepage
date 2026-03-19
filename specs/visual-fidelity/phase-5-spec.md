# Phase 5: Visual Verification — Phase Spec

## Context
Phases 1-4 complete (typography, logo, hero bg, portfolio intro, 18th entry). 181 tests pass. No e2e/visual tests exist yet. Playwright is available via MCP but not as an npm dependency. The meta-plan requires automated computed-style comparison and screenshot baselines.

## Objective
Verify the clone visually matches the original site by comparing computed styles across key sections, capturing screenshot baselines, and documenting remaining discrepancies as a punch list.

## Decisions for Review

1. **Install Playwright as a dev dependency?** Yes — install `@playwright/test` in `scripts/` workspace. **[APPROVED]**

2. **Tolerance strategy?** Colors: 5/channel. Dimensions: 10px. Font-size: 2px. Letter-spacing: 1px. Font-family: compare first font, normalized. Widen if hitting loops. **[APPROVED]**

## Requirements

- Automated Playwright tests comparing computed styles between `localhost:5173` (clone) and `https://www.lostandluckylabs.com` (original)
- Sections covered: header, hero, portfolio intro, grid cards, footer, contact page, one project detail page
- Properties compared: font-family, font-size, color, background-color, letter-spacing, padding, layout dimensions
- Graceful degradation if original site unavailable (validate against hardcoded expected values instead)
- Screenshot baselines captured via MCP for both sites
- Punch list documenting matches and discrepancies
- Existing 181 tests remain green

## Acceptance Criteria

- [ ] `npm run test:visual` runs Playwright style-comparison tests cleanly
- [ ] Tests cover all 7 sections (header, hero, intro, grid, project detail, contact, footer)
- [ ] Punch list at `specs/visual-fidelity/punch-list.md` with matches/discrepancies table
- [ ] Screenshot baselines in `specs/visual-fidelity/phase-5-baselines/`
- [ ] `npm test` still passes (181 tests)

## Boundaries

- Do NOT fix discrepancies — only document them
- Do NOT modify existing components or tests
- Do NOT add pixel-diff tooling — computed-style comparison only
- Playwright tests in `scripts/` workspace, separate from vitest

## Sources

- Meta-plan: `specs/visual-fidelity/meta-plan.md` (Phase 5)
- Live site fonts (captured): Cabin 700 (headings), Esteban 400 (body/nav)
- Original selectors: `[data-section-id="header"]`, first `[data-section-id]` after header (hero), `.gallery-masonry` (portfolio), `footer`
- Clone selectors: `header[role="banner"]`, `[data-testid="hero-section"]`, `[data-testid="portfolio-intro"]`, `#portfolio`, `footer[role="contentinfo"]`

## Files to Create/Modify

| File | Action |
|------|--------|
| `scripts/package.json` | Add `@playwright/test` devDep + `test:visual` script |
| `package.json` (root) | Add `test:visual` convenience script |
| `scripts/playwright.config.js` | Playwright config (testDir, baseURL, webServer) |
| `scripts/visual-verify/style-comparison.spec.js` | Automated style comparison tests |
| `specs/visual-fidelity/punch-list.md` | Matches/discrepancies documentation |
| `specs/visual-fidelity/phase-5-baselines/` | MCP-captured screenshots |

## Verification

1. `npm test` — all 181 existing tests pass
2. `npm run test:visual` — Playwright tests run and report
3. Visual inspection of punch list and screenshot baselines
