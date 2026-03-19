# Meta-Plan: Lost & Lucky Labs — Visual Fidelity Fixes

Canonical location: `specs/visual-fidelity/meta-plan.md` in the DoItClaude repo.

## Context

The Lost & Lucky Labs clone (`~/DoItClaude`) is functionally complete — all pages render, the API works, images are scraped, and the database is seeded. However, side-by-side browser comparison reveals significant visual gaps vs. the original Squarespace site. The existing test suite is purely structural/behavioral and caught none of these issues. This plan addresses the visual gaps while adding style-aware tests to prevent regression.

## Scope

**IN:**
- Fix all confirmed visual discrepancies between clone and original
- Add tests that verify visual/styling correctness (not just structure)
- Add the duplicate 18th portfolio entry if appropriate

**OUT:**
- Functional changes (forms, API, routing — these already work)
- Admin panel styling
- SEO, performance, or accessibility improvements beyond what's needed for visual parity
- Deployment/hosting setup

## Dependency Map

```
Phase 1 (typography + colors) ──→ Phase 2 (header logo) ──→ Phase 3 (hero + intro)
                                                                         ↓
Phase 4 (18th portfolio entry) ─────────────────────────────────→ Phase 5 (verification)
                                                                         ↓
                                                                  Phase 6 (punch list fixes)
```

- Phase 4 is independent — can run in parallel with Phases 1–3
- Phase 5 depends on all others

## Shared Constraints

- **Visual source of truth:** The live Squarespace site, not SITE_CLONE_SPEC.md, when they conflict
- **Test philosophy:** Each phase includes tests that would have caught the gap. No shortcuts.
- **Tailwind patterns:** Continue using Tailwind utility classes. Extend the theme config for design tokens rather than hardcoding everywhere.

## Explicit Boundaries

- Do not refactor working functionality
- Do not restructure the component tree beyond what's needed for the fixes
- Do not add new dependencies unless required (e.g., a Google Fonts import is fine, a CSS-in-JS library is not)

---

## Phase 1: Typography and Background Color

**Goal:** Establish the correct font families and page background color as the visual foundation. All headings should use the original site's display font with proper letter-spacing, body text should use the correct sans-serif stack, and the page background should match the original's light blue-gray instead of pure white.

**Dependencies:** None — this is the foundation.

**Success criteria:**
- Font families are configured in Tailwind theme (not hardcoded per-component)
- All heading elements render with the correct font
- Page background is the correct color
- Tests assert font family classes and background color

**Risk flags:**
- The exact font from the Squarespace site needs identification via Playwright computed style inspection. If it's a proprietary Squarespace font, we'll need a close open-source substitute.

---

## Phase 2: Header Logo Format

**Goal:** Header displays "LOST & LUCKY LABS" as styled text matching the original site, replacing the current PNG logo image. The existing Header.test.jsx (which asserts an `<img>` element) must be updated to match.

**Dependencies:** Phase 1 (needs the correct fonts configured).

**Success criteria:**
- Header shows text logo, not image
- Text styling matches the original (font, size, spacing, color)
- Header test updated and passing
- Mobile header verified (MobileMenu component checked)

**Risk flags:** Low risk. Contained change, one known test to update.

---

## Phase 3: Hero Background Image and Portfolio Intro Section

**Goal:** The hero section displays the original workshop background photo behind the text overlay with appropriate darkening for readability. Below it, a "Here are a few things we've worked on" intro section with horizontal rule and descriptive subtext appears before the portfolio grid.

**Dependencies:** Phase 1 (fonts/colors needed for correct rendering of new elements).

**Success criteria:**
- Hero has a background image with text overlay
- Portfolio intro section renders between hero and grid with heading, divider, and subtext
- Tests verify background image presence and intro section content
- HomePage test confirms correct section ordering

**Risk flags:**
- The hero background image may not exist in the scraped images. Need to check if it was captured, and scrape it from the live site if not.
- Text readability over the background image requires a semi-transparent overlay — exact opacity needs visual tuning.

---

## Phase 4: 18th Portfolio Entry

**Goal:** The portfolio grid displays 18 items matching the original site. The 18th item ("Laser Engraved Pet Cutting Board") is a second gallery entry that links to the existing `/laser-engravings` project page — it's NOT a separate project with its own detail page. It uses a different hero image (a pet cutting board) but routes to the same project.

**Dependencies:** None — fully independent of Phases 1–3.

**Success criteria:**
- 18th portfolio card appears in the grid with correct image and title
- Card links to `/laser-engravings` (same as project #13)
- Database/seed updated if needed, or handled at the component level
- Tests verify 18 cards render

**Risk flags:**
- The hero image for this entry needs to be scraped from the live site
- Architectural question: is this a second DB row pointing to the same project, or a UI-level duplicate? Needs investigation during phase spec.

---

## Phase 5: Visual Verification

**Goal:** Automated side-by-side comparison confirms the clone matches the original across all key sections: header, hero, portfolio intro, grid, project detail pages, contact page, and footer.

**Dependencies:** All of Phases 1–4.

**Success criteria:**
- Playwright screenshots of both sites saved as reference baselines
- Key computed styles compared (font-family, background-color, letter-spacing, layout dimensions)
- Any remaining discrepancies documented as a punch list
- All existing tests still pass

**Risk flags:**
- The live Squarespace site could change or go offline. Baseline screenshots should be captured early (Phase 1) and saved.

---

## Phase 6: Punch List Fixes

**Goal:** Fix all remaining visual discrepancies identified by Phase 5's verification punch list. Each item gets a targeted fix with a corresponding test update or addition to prevent regression.

**Dependencies:** Phase 5 (needs the punch list output).

**Success criteria:**
- Every item on the Phase 5 punch list is resolved or explicitly deferred with justification
- Phase 5 verification tests re-run and pass within tolerance thresholds
- All existing tests still pass
- No new dependencies introduced unless strictly necessary

**Risk flags:**
- Punch list scope is unknown until Phase 5 completes — could range from minor tweaks to significant rework
- Some discrepancies may be inherent to platform differences (Squarespace rendering vs. our stack) and need pragmatic tolerance decisions rather than pixel-perfect fixes
