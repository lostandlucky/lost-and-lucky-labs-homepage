# Lost & Lucky Labs — Site Clone Specification

> **Single source of truth** for cloning [lostandluckylabs.com](https://www.lostandluckylabs.com) from Squarespace into a React + Node.js application with SQLite CMS.

---

## Table of Contents

1. [Overview & Goals](#1-overview--goals)
2. [Test Strategy](#2-test-strategy)
3. [Phased Implementation Roadmap](#3-phased-implementation-roadmap)
4. [Complete Site Map](#4-complete-site-map)
5. [Shared Layout Specification](#5-shared-layout-specification)
6. [Page-by-Page Specifications](#6-page-by-page-specifications)
7. [Complete Project Data Catalog](#7-complete-project-data-catalog)
8. [Architecture & File Structure](#8-architecture--file-structure)
9. [Database Schema](#9-database-schema)
10. [API Endpoints](#10-api-endpoints)
11. [CMS Admin Panel Specification](#11-cms-admin-panel-specification)
12. [Image Asset Strategy](#12-image-asset-strategy)
13. [Build & Deployment](#13-build--deployment)
14. [Verification Checklist](#14-verification-checklist)

---

## 1. Overview & Goals

### What This Document Is

A complete blueprint for building a pixel-perfect clone of **lostandluckylabs.com** — a custom woodworking and fabrication studio portfolio site currently hosted on Squarespace. After implementation, the original Squarespace site will no longer need to be referenced.

### Source Site

| Field | Value |
|-------|-------|
| URL | https://www.lostandluckylabs.com |
| Platform | Squarespace 7.1 |
| Template ID | `5c5a519771c10ba3470d8101` |
| Site ID | `5fac067233bc4707879da16c` |

### Target Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18+ with Vite |
| Styling | Tailwind CSS |
| Backend | Node.js / Express |
| Database | SQLite (via better-sqlite3) |
| Email | Nodemailer (SMTP / Gmail) |
| Image Storage | Local filesystem (served by Express) |
| Test Runner | Vitest |
| Server Test Utilities | supertest |
| Component Test Utilities | @testing-library/react + jsdom |

### Key Requirements

- **Pixel-perfect visual clone** of the current Squarespace site
- **Functional contact form** that stores submissions in the database AND sends email notifications
- **CMS admin panel** for managing projects, images, and contact submissions
- **All images downloaded locally** — no hotlinking to Squarespace CDN
- **Responsive design** matching current mobile/tablet/desktop behavior
- **SEO-friendly** with proper meta tags and semantic HTML
- **TDD workflow** — every feature phase begins with failing tests, then implementation to green

---

## 2. Test Strategy

### Framework: Vitest

Vitest is the test runner for the entire monorepo. It integrates natively with Vite (used by both the client and admin apps) and supports ESM, TypeScript, and jsdom out of the box with fast HMR-aware watch mode.

### Test Environments

| Scope | Environment | Key Libraries |
|-------|-------------|---------------|
| Database layer | Node (default) | better-sqlite3 (in-memory `:memory:`) |
| API routes | Node (default) | supertest, better-sqlite3 (in-memory) |
| React components (client) | jsdom | @testing-library/react, @testing-library/jest-dom |
| React components (admin) | jsdom | @testing-library/react, @testing-library/jest-dom |
| Scripts | Node (default) | fs mocks, fetch mocks |

### Isolation Strategy

- **Database tests** use a fresh in-memory SQLite instance per test file (created in `beforeEach` or `beforeAll`), ensuring no state leaks between tests.
- **API route tests** create a throwaway Express app wired to an in-memory database, exercised via `supertest`.
- **Component tests** render in jsdom with mocked `fetch` calls (via `vi.fn()` or `msw`). No real API server is started.
- **Email** is always mocked — `vi.mock('../services/email.js')` replaces Nodemailer with a spy.
- **Filesystem** is mocked in scraping/upload tests via `vi.mock('fs')` or `memfs`.

### Mocking Conventions

| Dependency | Mock Technique |
|-----------|---------------|
| Nodemailer / email.js | `vi.mock()` — spy on `sendMail` |
| `fetch` (client API calls) | `vi.stubGlobal('fetch', vi.fn())` or MSW |
| `fs` / filesystem | `vi.mock('fs')` or `memfs` |
| Image processing | `vi.mock()` — no-op stubs |
| `window.scrollTo` | `vi.stubGlobal` |
| `IntersectionObserver` | Polyfill in test setup |

### Vitest Configuration

Each workspace has its own `vitest.config.js`:

- **`server/vitest.config.js`** — environment: `'node'`, no special transforms
- **`client/vitest.config.js`** — environment: `'jsdom'`, setup file for `@testing-library/jest-dom`
- **`admin/vitest.config.js`** — environment: `'jsdom'`, setup file for `@testing-library/jest-dom`
- **`scripts/vitest.config.js`** — environment: `'node'`

### Test Runner Commands

```bash
# Run all tests across all workspaces
npm test

# Run tests for a single workspace
npm run test:server
npm run test:client
npm run test:admin

# Run a specific phase's tests (using filename patterns)
npx vitest run --reporter verbose server/__tests__/db/

# Watch mode during development
npx vitest --watch
```

### Naming Conventions

- Test files live in `__tests__/` directories mirroring the source structure
- Test files are named `<module>.test.js` (server/scripts) or `<Component>.test.jsx` (client/admin)
- Each `describe` block matches the module or component name
- Each `it('...')` reads as a sentence: `it('returns 404 for unknown slug')`

---

## 3. Phased Implementation Roadmap

This section defines 7 implementation phases, each designed for a red/green TDD workflow. For every phase: write the tests first (red), then build until they pass (green).

### Phase Dependency Graph

```
Phase 0 ──> Phase 1 ──> Phase 2 ──> Phase 4 ──> Phase 5
                           │
                           v
                        Phase 3 ──> Phase 6
                           │
                           v
                        Phase 7
```

**Parallelism:** Phases 4+5 and Phase 6 can run in parallel after their respective API phases complete. Phase 7 can begin any time after Phase 1 but is logically last.

### Phase Summary

| Phase | Name | Depends On | Test Files | Tests |
|-------|------|------------|------------|-------|
| 0 | Project Setup & Scaffolding | — | 0 | 0 |
| 1 | Database Layer | Phase 0 | 6 | 23 |
| 2 | Public API Routes | Phase 1 | 4 | 22 |
| 3 | Auth & Admin API Routes | Phases 1–2 | 6 | 25 |
| 4 | Public Frontend (Layout, Home, Projects) | Phase 2 | 13 | 39 |
| 5 | Contact Page Frontend | Phases 2, 4 | 2 | 13 |
| 6 | Admin Panel | Phase 3 | 8 | 30 |
| 7 | Image Scraping, Seeding & Production Build | Phase 1 | 4 | 13 |
| | **Totals** | | **43** | **165** |

---

### Phase 0: Project Setup & Scaffolding

**Goal:** Initialize the monorepo with all tooling, dependencies, and configuration so that every subsequent phase can focus purely on application code. After this phase, `npm run dev` starts all dev servers and `npm test` runs (with zero tests).

**Depends on:** Nothing — this is the starting point.

**Deliverables:**

- **Root monorepo:**
  - `package.json` with npm workspaces (`server/`, `client/`, `admin/`, `scripts/`) and root scripts (`dev`, `build`, `test`, `setup`, etc.)
  - `.gitignore` (node_modules, dist, data/, .env, OS files)
  - `.env.example` with all documented env vars
  - `README.md` with basic setup instructions

- **`client/` — Vite + React app:**
  - Scaffold via `npm create vite@latest` (React template)
  - Install and configure Tailwind CSS (tailwind.config.js, postcss.config.js, index.css with `@tailwind` directives)
  - Install React Router (`react-router-dom`)
  - Configure Vite dev proxy for `/api` and `/images` to `localhost:3000`
  - Install and configure Vitest + jsdom + @testing-library/react + @testing-library/jest-dom
  - Create `vitest.config.js` and test setup file
  - Verify: `npm -w client run dev` serves the default React page

- **`server/` — Express app:**
  - `package.json` with Express, better-sqlite3, bcrypt, jsonwebtoken, nodemailer, multer, cors
  - `index.js` — minimal Express app with JSON body parser, CORS, and a health-check `GET /api/health` route
  - Install and configure Vitest + supertest
  - Create `vitest.config.js`
  - Verify: `npm -w server run dev` starts Express on port 3000

- **`admin/` — Vite + React app:**
  - Scaffold via `npm create vite@latest` (React template)
  - Install and configure Tailwind CSS
  - Install React Router
  - Configure Vite dev proxy for `/api` to `localhost:3000`
  - Install and configure Vitest + jsdom + @testing-library/react + @testing-library/jest-dom
  - Create `vitest.config.js` and test setup file
  - Verify: `npm -w admin run dev` serves the default React page

- **`scripts/`:**
  - `package.json`
  - `vitest.config.js`

- **Concurrency:** Install `concurrently` at root so `npm run dev` starts all three servers in parallel

**No tests in this phase** — this is purely tooling and configuration. The smoke test is that all dev servers start and `npm test` runs without errors across all workspaces.

**Acceptance criteria:**
1. `npm install` from root installs all workspace dependencies
2. `npm run dev` starts client (:5173), server (:3000), and admin (:5174) concurrently
3. `npm test` executes Vitest in all workspaces (0 tests, 0 failures)
4. Client and admin Vite apps proxy `/api/*` to Express
5. `GET http://localhost:3000/api/health` returns `{ "status": "ok" }`

---

### Phase 1: Database Layer

**Goal:** Establish the data foundation. Every subsequent phase depends on a working database layer with helpers for CRUD operations on every table.

**Depends on:** Phase 0 (project scaffolding must be complete).

**Deliverables:**
- `server/db/schema.sql` — full DDL
- `server/db/database.js` — connection factory + query helpers for all tables
- `server/db/seed.sql` — default settings and 17 projects
- All `server/__tests__/db/` test files

**Test Plan — 6 files, 23 tests:**

#### `server/__tests__/db/schema.test.js`

```
describe('Schema')
  it('creates all five tables without error')
  it('creates expected indexes on projects, project_images, and contact_submissions')
  it('enforces NOT NULL constraints on required project fields')
  it('cascades deletes from projects to project_images')
```

#### `server/__tests__/db/projects.test.js`

```
describe('Projects queries')
  it('inserts a project and retrieves it by slug')
  it('lists only published projects sorted by sort_order')
  it('updates a project title and description')
  it('deletes a project and its associated images via cascade')
```

#### `server/__tests__/db/images.test.js`

```
describe('Project images queries')
  it('inserts an image record linked to a project')
  it('returns images for a project sorted by sort_order')
  it('marks exactly one image as hero per project')
  it('deletes an image record by id')
```

#### `server/__tests__/db/contacts.test.js`

```
describe('Contact submissions queries')
  it('inserts a contact submission with name, email, and message')
  it('lists submissions ordered newest first')
  it('marks a submission as read')
  it('deletes a submission by id')
```

#### `server/__tests__/db/settings.test.js`

```
describe('Settings queries')
  it('returns seeded default settings as key-value object')
  it('updates an existing setting value')
  it('returns all settings keys after partial update')
  it('preserves updated_at timestamp on modification')
```

#### `server/__tests__/db/seed.test.js`

```
describe('Seed data')
  it('seeds all 17 projects with correct slugs and sort_order')
  it('seeds all 8 default settings with expected keys')
  it('seeds an admin user with a bcrypt-hashed password')
```

---

### Phase 2: Public API Routes

**Goal:** Expose the public-facing read API and contact form endpoint so the frontend (Phase 4) has something to call.

**Depends on:** Phase 1 (database layer must be complete).

**Deliverables:**
- `server/index.js` — Express app bootstrap with middleware
- `server/routes/api.js` — public routes: `GET /api/projects`, `GET /api/projects/:slug`, `GET /api/settings`, `POST /api/contact`
- `server/middleware/validate.js` — contact form validation
- `server/services/email.js` — Nodemailer transport (mocked in tests)
- Static file serving for `/images/*`

**Test Plan — 4 files, 22 tests:**

#### `server/__tests__/routes/projects.test.js`

```
describe('GET /api/projects')
  it('returns all published projects with hero image')
  it('returns projects sorted by sort_order')
  it('excludes unpublished (draft) projects')

describe('GET /api/projects/:slug')
  it('returns a single project with all images')
  it('returns 404 for an unknown slug')
  it('returns 404 for an unpublished project slug')
```

#### `server/__tests__/routes/settings.test.js`

```
describe('GET /api/settings')
  it('returns all settings as a key-value object')
  it('includes site_title and site_tagline')
  it('includes contact_email and contact_phone')
  it('includes hero_cta_text and contact UI strings')
```

#### `server/__tests__/routes/contact.test.js`

```
describe('POST /api/contact')
  it('creates a submission and returns 201 with valid data')
  it('returns 400 when name is missing')
  it('returns 400 for invalid email format')
  it('returns 400 when message is empty')
  it('returns 400 when any field exceeds max length')
  it('triggers email notification via Nodemailer on success')
```

#### `server/__tests__/routes/static.test.js`

```
describe('Static file serving')
  it('serves image files from /images/projects/:slug/:filename')
  it('serves the logo from /images/logo/Lost&Lucky_Logo_Blue.png')
  it('returns 404 for non-existent image paths')
  it('sets correct Content-Type header for JPEG files')
  it('sets correct Content-Type header for PNG files')
  it('sets Cache-Control headers on image responses')
```

---

### Phase 3: Auth & Admin API Routes

**Goal:** Build the admin API so the admin panel (Phase 6) has authenticated CRUD endpoints for every resource.

**Depends on:** Phases 1–2 (database layer + Express app).

**Deliverables:**
- `server/middleware/auth.js` — JWT verification middleware
- `server/routes/admin.js` — all admin endpoints
- `server/routes/upload.js` — multipart image upload with `multer`

**Test Plan — 6 files, 25 tests:**

#### `server/__tests__/middleware/auth.test.js`

```
describe('Auth middleware')
  it('rejects requests without an Authorization header')
  it('rejects requests with an invalid JWT token')
  it('passes requests with a valid Bearer token')
  it('attaches decoded user info to req.user on valid auth')
```

#### `server/__tests__/routes/admin-auth.test.js`

```
describe('POST /api/admin/login')
  it('returns a JWT token for valid credentials')
  it('returns 401 for an incorrect password')
  it('returns 401 for an unknown username')

describe('GET /api/admin/dashboard')
  it('returns project_count, unread_messages, and total_messages')
```

#### `server/__tests__/routes/admin-projects.test.js`

```
describe('Admin project CRUD')
  it('GET /api/admin/projects lists all projects including drafts')
  it('POST /api/admin/projects creates a new project')
  it('PUT /api/admin/projects/:id updates project fields')
  it('DELETE /api/admin/projects/:id removes project and its images')
  it('PUT /api/admin/projects/reorder updates sort_order for all projects')
  it('returns 401 for unauthenticated project requests')
```

#### `server/__tests__/routes/admin-images.test.js`

```
describe('Admin image management')
  it('POST /api/admin/projects/:id/images uploads an image file')
  it('PUT /api/admin/images/:id updates alt_text and sort_order')
  it('DELETE /api/admin/images/:id removes image record and file from disk')
  it('rejects uploads exceeding 10MB file size limit')
```

#### `server/__tests__/routes/admin-contacts.test.js`

```
describe('Admin contact management')
  it('GET /api/admin/contacts lists submissions newest first')
  it('GET /api/admin/contacts/:id returns detail and marks as read')
  it('DELETE /api/admin/contacts/:id removes a submission')
  it('returns 401 for unauthenticated contact requests')
```

#### `server/__tests__/routes/admin-settings.test.js`

```
describe('Admin settings')
  it('GET /api/admin/settings returns all settings')
  it('PUT /api/admin/settings updates specified keys only')
  it('PUT /api/admin/settings ignores unknown keys')
```

---

### Phase 4: Public Frontend (Layout, Home, Projects)

**Goal:** Build the visitor-facing React app — shared layout, homepage with hero + portfolio grid, project detail pages with lightbox. This is the largest phase by test count.

**Depends on:** Phase 2 (public API routes must be serving data).

**Deliverables:**
- All `client/src/components/*.jsx` (except `ContactForm.jsx`, built in Phase 5)
- All `client/src/pages/HomePage.jsx` and `ProjectPage.jsx`
- `client/src/hooks/useScrollToHash.js`
- `client/src/lib/api.js`
- `client/src/App.jsx` — React Router configuration
- `client/vitest.config.js` and test setup file

**Test Plan — 13 files, 39 tests:**

#### `client/src/__tests__/lib/api.test.js`

```
describe('API client')
  it('fetchProjects returns parsed project list from /api/projects')
  it('fetchProject returns a single project by slug')
  it('submitContact posts form data to /api/contact and returns response')
```

#### `client/src/__tests__/components/Header.test.jsx`

```
describe('Header')
  it('renders logo image linking to homepage')
  it('renders Portfolio, Contact, and Instagram nav links')
  it('shows hamburger menu button on mobile viewport')
  it('hides desktop nav links on mobile viewport')
```

#### `client/src/__tests__/components/Footer.test.jsx`

```
describe('Footer')
  it('renders Home, Portfolio, and Contact links')
  it('renders Instagram social icon with correct href')
  it('renders a top border divider')
```

#### `client/src/__tests__/components/Layout.test.jsx`

```
describe('Layout')
  it('renders Header and Footer around children')
  it('applies max-width container to main content area')
```

#### `client/src/__tests__/components/HeroSection.test.jsx`

```
describe('HeroSection')
  it('renders the site title from settings')
  it('renders the tagline from settings')
  it('renders CTA button linking to /contact-us')
  it('displays CTA button text from settings')
```

#### `client/src/__tests__/components/PortfolioGrid.test.jsx`

```
describe('PortfolioGrid')
  it('renders a grid of ProjectCard components')
  it('displays projects in sort_order')
  it('renders the correct number of project cards')
```

#### `client/src/__tests__/components/ProjectCard.test.jsx`

```
describe('ProjectCard')
  it('renders the project hero thumbnail image')
  it('renders the project title')
  it('links to the project detail page by slug')
```

#### `client/src/__tests__/components/ImageGallery.test.jsx`

```
describe('ImageGallery')
  it('renders all non-hero images in a grid')
  it('calls onImageClick when a gallery image is clicked')
  it('applies responsive grid column classes')
```

#### `client/src/__tests__/components/Lightbox.test.jsx`

```
describe('Lightbox')
  it('displays the selected image at full size')
  it('navigates to next image on right arrow click')
  it('navigates to previous image on left arrow click')
  it('closes on backdrop click')
  it('closes on Escape key press')
```

#### `client/src/__tests__/components/MobileMenu.test.jsx`

```
describe('MobileMenu')
  it('renders nav links when open')
  it('does not render nav links when closed')
  it('calls onClose when a nav link is clicked')
```

#### `client/src/__tests__/pages/HomePage.test.jsx`

```
describe('HomePage')
  it('renders HeroSection and PortfolioGrid')
  it('fetches projects and settings on mount')
  it('scrolls to #portfolio anchor when URL hash is present')
```

#### `client/src/__tests__/pages/ProjectPage.test.jsx`

```
describe('ProjectPage')
  it('fetches and displays project data by slug from URL params')
  it('renders the hero image at full width')
  it('opens Lightbox when a gallery image is clicked')
```

#### `client/src/__tests__/hooks/useScrollToHash.test.js`

```
describe('useScrollToHash')
  it('scrolls to the element matching the URL hash on mount')
  it('does nothing when no hash is present')
```

---

### Phase 5: Contact Page Frontend

**Goal:** Build the contact page with its form, validation, submission, and success feedback. Separated from Phase 4 because it introduces form state management and API mutation.

**Depends on:** Phases 2 and 4 (needs the `POST /api/contact` endpoint and the shared Layout).

**Deliverables:**
- `client/src/components/ContactForm.jsx`
- `client/src/pages/ContactPage.jsx`

**Test Plan — 2 files, 13 tests:**

#### `client/src/__tests__/components/ContactForm.test.jsx`

```
describe('ContactForm')
  it('renders name, email, and message input fields')
  it('shows validation error when name is empty on submit')
  it('shows validation error for invalid email format')
  it('shows validation error when message is empty on submit')
  it('calls onSubmit with form data when all fields are valid')
  it('disables submit button while request is in flight')
  it('displays success message after successful submission')
  it('clears form fields after successful submission')
```

#### `client/src/__tests__/pages/ContactPage.test.jsx`

```
describe('ContactPage')
  it('renders the page heading from settings')
  it('renders contact email as a mailto link')
  it('renders phone number as a tel link')
  it('renders Instagram icon link')
  it('renders the ContactForm component')
```

---

### Phase 6: Admin Panel

**Goal:** Build the full CMS admin panel — login, dashboard, project management with image upload, contact message viewer, and settings editor.

**Depends on:** Phase 3 (all admin API endpoints must be working).

**Deliverables:**
- All `admin/src/components/*.jsx`
- `admin/src/App.jsx` — admin router with auth guard
- `admin/vitest.config.js` and test setup file

**Test Plan — 8 files, 30 tests:**

#### `admin/src/__tests__/components/Login.test.jsx`

```
describe('Login')
  it('renders username and password input fields')
  it('calls login handler with credentials on submit')
  it('displays error message for invalid credentials')
  it('redirects to dashboard on successful login')
```

#### `admin/src/__tests__/components/Dashboard.test.jsx`

```
describe('Dashboard')
  it('displays total project count')
  it('displays unread message count with badge indicator')
  it('renders quick links to Projects, Messages, and Settings')
  it('fetches dashboard stats on mount')
```

#### `admin/src/__tests__/components/ProjectList.test.jsx`

```
describe('ProjectList')
  it('renders a table with all projects including drafts')
  it('displays thumbnail, title, slug, status, and sort order columns')
  it('shows confirmation dialog before deleting a project')
  it('removes project from list after confirmed delete')
  it('renders a New Project button linking to the editor')
```

#### `admin/src/__tests__/components/ProjectEditor.test.jsx`

```
describe('ProjectEditor')
  it('renders an empty form for new project creation')
  it('populates form fields when editing an existing project')
  it('auto-generates slug from title input')
  it('saves project data on form submit')
  it('toggles published/draft status')
```

#### `admin/src/__tests__/components/ImageUploader.test.jsx`

```
describe('ImageUploader')
  it('renders a drag-and-drop upload zone')
  it('uploads files and displays new thumbnails')
  it('sets hero image when star icon is clicked')
  it('deletes image with confirmation when X icon is clicked')
```

#### `admin/src/__tests__/components/ContactMessages.test.jsx`

```
describe('ContactMessages')
  it('renders a table of contact submissions')
  it('displays unread messages with a visual indicator')
  it('opens full message detail on row click')
  it('deletes a message on delete button click')
```

#### `admin/src/__tests__/components/Settings.test.jsx`

```
describe('Settings')
  it('renders editable fields for all settings values')
  it('saves updated settings on form submit')
  it('shows success feedback after saving')
```

#### `admin/src/__tests__/App.test.jsx`

```
describe('Admin App')
  it('redirects to login page when not authenticated')
  it('renders dashboard when authenticated')
```

---

### Phase 7: Image Scraping, Seeding & Production Build

**Goal:** Build the one-time setup utilities (image scraper, database seeder, setup script) and verify the production build pipeline serves both SPAs correctly.

**Depends on:** Phase 1 (database layer). Logically runs last because the site should be functionally complete before worrying about production bundling and scraping.

**Deliverables:**
- `scripts/scrape-images.js`
- `scripts/seed-database.js`
- `scripts/setup.js`
- `scripts/vitest.config.js`
- Production Express config in `server/index.js` (SPA fallback routing)

**Test Plan — 4 files, 13 tests:**

#### `scripts/__tests__/scrape-images.test.js`

```
describe('Image scraper')
  it('extracts image URLs from a Squarespace project page HTML')
  it('downloads images to the correct local directory structure')
  it('names the first image hero.jpg and gallery images sequentially')
  it('downloads the logo to images/logo/')
```

#### `scripts/__tests__/seed-database.test.js`

```
describe('Database seeder')
  it('populates all 17 projects from seed data')
  it('creates image records linked to each project')
  it('is idempotent — running twice does not duplicate data')
```

#### `scripts/__tests__/setup.test.js`

```
describe('Setup script')
  it('creates the data/ directory if it does not exist')
  it('initializes the database with the full schema')
  it('creates a default admin user with hashed password')
```

#### `server/__tests__/production.test.js`

```
describe('Production build serving')
  it('serves client SPA index.html for unmatched routes')
  it('serves admin SPA for /admin/* routes')
  it('sets security headers including Content-Security-Policy')
```

---

## 4. Complete Site Map

### All Pages (19 URLs)

| # | Path | Type | Description |
|---|------|------|-------------|
| 1 | `/` | Homepage | Hero + portfolio grid (same content as `/home`) |
| 2 | `/home` | Homepage (alias) | Redirects/aliases to `/` |
| 3 | `/contact-us` | Contact | Contact form + info |
| 4 | `/ornate-zebrawood-mirror` | Project | Ornate Zebrawood Mirror |
| 5 | `/wood-inlay-cutting-board` | Project | Wood Inlay Cutting Board |
| 6 | `/led-storefront-sign` | Project | LED Storefront Sign |
| 7 | `/custom-video-arcade` | Project | Custom Video Arcade |
| 8 | `/box-elder-slab-coffee-table` | Project | Box Elder Slab Coffee Table |
| 9 | `/resin-memorabilia` | Project | Resin Filled Memorabilia |
| 10 | `/resin-filled-branding-on-a-wooden-slab-bench` | Project | Resin Filled Branding on Wooden Slab Benches |
| 11 | `/laser-etched-pet-glasses` | Project | Laser Etched Pet Glasses |
| 12 | `/world-series-wooden-bat-mugs` | Project | World Series Wooden Bat Mugs |
| 13 | `/personalized-pens` | Project | Personalized Pens |
| 14 | `/copper-inlay-on-rosewood-sign` | Project | Copper Inlay on Rosewood Sign |
| 15 | `/crotch-wood-slab-coffee-table` | Project | Crotch Wood Slab Coffee Table |
| 16 | `/laser-engravings` | Project | Laser Engravings |
| 17 | `/hometown-memorabilia` | Project | Hometown Memorabilia |
| 18 | `/chipping-challenge-backyard-game` | Project | Chipping Challenge Backyard Game |
| 19 | `/custom-branded-plyometric-boxes` | Project | Custom Branded Plyometric Boxes |
| 20 | `/customized-toddler-step-stools` | Project | Custom Toddler Step Stools |

> **Note:** `/` and `/home` serve identical content. The router should handle both paths.

### Navigation Structure

```
Header (fixed):
  [Logo: LOST & LUCKY LABS]   [Portfolio]  [Contact]  [Instagram Icon]

Footer:
  Home  |  Portfolio  |  Contact  |  [Instagram Icon]
```

- **Portfolio** links to `/#portfolio` (smooth-scroll anchor on homepage)
- **Contact** links to `/contact-us`
- **Instagram** links to `https://www.instagram.com/lostandluckylabs/?hl=en`
- **Logo** links to `/`

---

## 5. Shared Layout Specification

### Header

| Property | Value |
|----------|-------|
| Position | Fixed top, full width |
| Background | White |
| Z-index | 1000+ |
| Height | ~70px desktop, ~50px mobile |
| Max content width | 1200px, centered |
| Padding | 0 20px desktop, 0 6vw mobile |

**Logo:**
- Image file: `Lost&Lucky_Logo_Blue.png`
- Source URL: `https://images.squarespace-cdn.com/content/v1/5fac067233bc4707879da16c/1610730203113-62I67X0TPQEHWGC4Q7M3/Lost%26Lucky_Logo_Blue.png`
- Desktop height: 50px
- Mobile max-height: 30px
- Links to `/`

**Navigation items (right-aligned):**
1. **Portfolio** — text link to `/#portfolio`
2. **Contact** — text link to `/contact-us`
3. **Instagram** — icon (SVG) linking to Instagram profile

**Mobile hamburger menu:**
- Appears below tablet breakpoint (~768px)
- Three-line icon (CSS "top-bun, patty, bottom-bun" pattern)
- Opens full-width dropdown with nav links
- Animates open/close

### Footer

| Property | Value |
|----------|-------|
| Background | White |
| Padding | 40px 20px |
| Max content width | 1200px, centered |
| Border-top | 1px solid light gray |

**Content:**
- Navigation links: Home, Portfolio, Contact (centered or left-aligned)
- Instagram social icon with 2px inset box-shadow border styling
- Copyright text (optional, not prominent on current site)

### Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| Mobile | < 768px | Single column, hamburger nav, 6vw side padding |
| Tablet | 768px–1199px | 2-column portfolio grid, standard nav |
| Desktop | 1200px+ | 2-column portfolio grid, max-width container |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Body | `"Helvetica Neue", Helvetica, Arial, sans-serif` | 16px base | 400 |
| H1 (hero title) | Same family | 48px desktop / 32px mobile | 700 |
| H2 (section titles) | Same family | 36px desktop / 24px mobile | 600 |
| H3 (project titles) | Same family | 28px desktop / 22px mobile | 600 |
| Nav links | Same family | 14px | 400, uppercase, letter-spacing 2px |
| Body text | Same family | 16px | 400, line-height 1.6 |

### Brand Colors

| Usage | Color | Hex |
|-------|-------|-----|
| Brand blue (logo, accents) | Dark navy blue | `#1a3a5c` (approximate — color-pick from downloaded logo) |
| Text primary | Near black | `#333333` |
| Text secondary | Medium gray | `#666666` |
| Background | White | `#ffffff` |
| Border/dividers | Light gray | `#e0e0e0` |
| CTA button background | Brand blue | `#1a3a5c` |
| CTA button text | White | `#ffffff` |

> **Important:** Final hex values should be color-picked from the downloaded logo asset for exact match.

---

## 6. Page-by-Page Specifications

### 6a. Homepage (`/`)

#### Hero Section

```
┌─────────────────────────────────────────────┐
│                                             │
│          LOST & LUCKY LABS                  │
│     Built for you, not the masses           │
│                                             │
│            [ Inquire Here ]                 │
│                                             │
└─────────────────────────────────────────────┘
```

| Element | Details |
|---------|---------|
| Title | "LOST & LUCKY LABS" — large, centered, uppercase |
| Tagline | "Built for you, not the masses" — centered below title |
| CTA Button | "Inquire Here" — links to `/contact-us` |
| Background | White or very light |
| Vertical padding | Generous (100px+ desktop) |

#### Portfolio Section (id="portfolio")

- Anchor target for `#portfolio` smooth-scroll links
- **Section heading:** None visible (projects start directly)
- **Grid layout:** 2 columns on tablet+, 1 column on mobile
- **Gap:** ~20px between items

**Each portfolio item:**
- Clickable thumbnail image (project's primary/hero image)
- Project title overlaid or below image
- Links to the project detail page
- Hover effect: subtle scale or opacity change

**Portfolio item order** (as displayed on homepage):

1. Ornate Zebrawood Mirror
2. Wood Inlay Cutting Board
3. LED Storefront Sign
4. Custom Video Arcade
5. Box Elder Slab Coffee Table
6. Resin Filled Memorabilia
7. Resin Filled Branding on Wooden Slab Benches
8. Laser Etched Pet Glasses
9. World Series Wooden Bat Mugs
10. Personalized Pens
11. Copper Inlay on Rosewood Sign
12. Crotch Wood Slab Coffee Table
13. Laser Engravings
14. Hometown Memorabilia
15. Chipping Challenge Backyard Game
16. Custom Branded Plyometric Boxes
17. Custom Toddler Step Stools

### 6b. Contact Page (`/contact-us`)

```
┌─────────────────────────────────────────────┐
│                                             │
│    What would you like built today?         │
│                                             │
│    your-email@example.com               │
│    (555) 555-0100                           │
│    [Instagram icon]                         │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │ Name *                          │      │
│    ├─────────────────────────────────┤      │
│    │ Email *                         │      │
│    ├─────────────────────────────────┤      │
│    │ Message *                       │      │
│    │                                 │      │
│    │                                 │      │
│    ├─────────────────────────────────┤      │
│    │          [ Send ]               │      │
│    └─────────────────────────────────┘      │
│                                             │
└─────────────────────────────────────────────┘
```

| Element | Details |
|---------|---------|
| Heading | "What would you like built today?" — large, centered |
| Email | `your-email@example.com` — clickable mailto link |
| Phone | `(555) 555-0100` — clickable tel link |
| Instagram | Icon link to Instagram profile |
| Form: Name | Text input, required, label "Name" |
| Form: Email | Email input, required, label "Email" |
| Form: Message | Textarea, required, label "Message" |
| Submit button | Text: "Send" |
| Success message | "Thank you for your inquiry! We will get back to you shortly." |
| Max width | 1200px container, form ~600px centered |

**Backend behavior on submit:**
1. Validate all three fields are non-empty
2. Validate email format
3. Store submission in `contact_submissions` table
4. Send email notification via Nodemailer to `your-email@example.com`
5. Return success response
6. Display success message to user

### 6c. Project Page Template (`/:slug`)

All 17 project pages use the same layout template:

```
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  │         HERO IMAGE                  │    │
│  │         (full width)                │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Project Title                              │
│                                             │
│  Description paragraph text here...         │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  img 1   │  │  img 2   │  │  img 3   │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  img 4   │  │  img 5   │  │  img 6   │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

| Element | Details |
|---------|---------|
| Hero image | First/featured image, full container width, aspect ratio preserved |
| Title | Project name, large heading (H1 or H2) |
| Description | One or more paragraphs of body text |
| Image gallery | Grid of remaining images, 2–3 columns |
| Gallery click | Opens lightbox/modal with fullsize image |
| Lightbox | Fullsize image, prev/next arrows, close (X) button, click-outside-to-close |
| Max content width | 1200px, centered |

**Lightbox behavior:**
- Click any gallery image → opens modal overlay
- Dark semi-transparent backdrop
- Centered fullsize image
- Left/right arrow navigation between images
- Close button (X) in top-right
- Click backdrop to close
- Keyboard: Escape to close, arrow keys for prev/next

---

## 7. Complete Project Data Catalog

This section contains the actual content for all 17 projects. This data will seed the SQLite database.

---

### Project 1: Ornate Zebrawood Mirror

| Field | Value |
|-------|-------|
| Slug | `ornate-zebrawood-mirror` |
| Title | Ornate Zebrawood Mirror |
| Sort Order | 1 |
| Image Count | 8 |

**Description:**

The solid zebrawood frame was cut into thin strips, soaked in water, curved into shape, glued together, and fitted with mirror glass. The result is an ornate, flowing frame that highlights the distinctive striped grain pattern of zebrawood.

**Gallery images:** 8 photos showing multiple angles of the finished mirror, close-up detail shots of the wood grain and curves, construction process documentation, and different lighting conditions highlighting the zebrawood's natural striping.

---

### Project 2: Wood Inlay Cutting Board

| Field | Value |
|-------|-------|
| Slug | `wood-inlay-cutting-board` |
| Title | Wood Inlay Cutting Board |
| Sort Order | 2 |
| Image Count | 8 |

**Description:**

A decorative cutting board crafted from multiple wood types. The base uses curly maple, creating the wavy pattern in the grain, while padauk wood provides the rose petals with an orange glow. Dark rosewood outlines complete the design. The board is finished with Rubio Monocoat, providing a food-safe finish.

**Gallery images:** 8 photographs showing close-up detail shots, overhead views, angled perspective photographs, and full product display images.

---

### Project 3: LED Storefront Sign

| Field | Value |
|-------|-------|
| Slug | `led-storefront-sign` |
| Title | LED Storefront Sign |
| Sort Order | 3 |
| Image Count | 8 |

**Description:**

This prototype evolved into a final product for a local gym franchise. The system runs on a Raspberry Pi and displays uploaded GIFs resized to fit a 24x55 LED matrix resolution. It calculates which portion of the GIF is visible within the logo letters and sends only that information to the LEDs.

Earlier iterations included an Arduino-based version programmed to respond to external noise and music, though the team ultimately chose simplicity over this interactive approach.

**Gallery images:** 8 photographs (1 primary hero + 7 additional) showing the completed LED sign, different stages, angles, configurations, physical construction, and experimental phases.

---

### Project 4: Custom Video Arcade

| Field | Value |
|-------|-------|
| Slug | `custom-video-arcade` |
| Title | Custom Video Arcade |
| Sort Order | 4 |
| Image Count | 10 |

**Description:**

A custom-built video arcade cabinet (also known as "Guncade"). A 3D model of each panel and their placement was created using a CAD program, with CNC cutting used for complex components. The visual design draws inspiration from NES controller aesthetics and nostalgic gaming elements. The system runs on a Raspberry Pi 4 with an I-PAC controller interface. The marquee uses a shadow box technique with translucent acrylic and white LEDs for backlighting.

**Gallery images:** ~10 images showing CAD design screenshots, construction phases, finished cabinet exterior and details, and control panel closeups.

---

### Project 5: Box Elder Slab Coffee Table

| Field | Value |
|-------|-------|
| Slug | `box-elder-slab-coffee-table` |
| Title | Box Elder Slab Coffee Table |
| Sort Order | 5 |
| Image Count | 10 |

**Description:**

A custom coffee table crafted from box elder maple slab wood featuring distinctive pink streaks running through the wood. Deep cracks in the original slab were filled with epoxy for a seamless finish. The piece underwent planing, sanding, and was sealed with Rubio Monocoat. Custom steel legs with a cross-hatch pattern and ground, black-painted welds complete the modern aesthetic.

**Gallery images:** 10 photographs displaying various angles and details of the finished table.

---

### Project 6: Resin Filled Memorabilia

| Field | Value |
|-------|-------|
| Slug | `resin-memorabilia` |
| Title | Resin Filled Memorabilia |
| Sort Order | 6 |
| Image Count | 6 |

**Description:**

To make these signs, an image is carved into a walnut panel using a CNC, creating separate troughs for the different colors of resin. Mica powder is used to color the resin, which is carefully poured into each trough. After curing, the piece is sanded smooth and finished with a gloss coating.

**Gallery images:** 6 portfolio images arranged in a grid layout showing completed resin-wood projects at various angles.

---

### Project 7: Resin Filled Branding on Wooden Slab Benches

| Field | Value |
|-------|-------|
| Slug | `resin-filled-branding-on-a-wooden-slab-bench` |
| Title | Resin Filled Branding on Wooden Slab Benches |
| Sort Order | 7 |
| Image Count | 7 |

**Description:**

Two custom benches crafted from live edge Ambrosia Maple slabs. A CNC router was used to carve gym branding into the wood, then those carved sections were filled with Mica powder-tinted resin. Following this, a flood coat was applied for a polished finish. The benches feature custom steel legs coated in black paint for rust protection.

**Gallery images:** 7 photographs documenting various angles and stages of the finished benches.

---

### Project 8: Laser Etched Pet Glasses

| Field | Value |
|-------|-------|
| Slug | `laser-etched-pet-glasses` |
| Title | Laser Etched Pet Glasses |
| Sort Order | 8 |
| Image Count | 7 |

**Description:**

CO2 lasers are not capable of actually "engraving" glass. Instead, the laser superheats microscopic air bubbles trapped inside the glass walls. The process requires advanced image filtering to achieve detailed pet portraits on the glass surface, creating a frosted appearance.

**Gallery images:** 7 photographs showcasing finished laser-etched pet glasses from various angles and designs.

---

### Project 9: World Series Wooden Bat Mugs

| Field | Value |
|-------|-------|
| Slug | `world-series-wooden-bat-mugs` |
| Title | World Series Wooden Bat Mug |
| Sort Order | 9 |
| Image Count | 4 |

**Description:**

These mugs were made from maple slabs turned on a lathe to resemble baseball bats. The design includes expanded bottoms for stability, laser-engraved World Series Championship logos, and food-safe resin filling with Polycrylic coating for waterproofing.

**Gallery images:** 4 product photographs displaying different angles of the finished wooden bat mugs.

---

### Project 10: Personalized Pens

| Field | Value |
|-------|-------|
| Slug | `personalized-pens` |
| Title | Hand Made Personalized Pens for Teachers |
| Sort Order | 10 |
| Image Count | 4 |

**Description:**

These pens were made as a gift for a group of elementary school teachers during Teacher Appreciation Week. The Walnut pens were turned on a lathe and polished to a smooth sheen. Each pen was then inscribed with the receiving teacher's name using a laser.

**Gallery images:** 4 images (1 large hero image at the top + 3 thumbnail images below arranged horizontally) showing different angles and details of the finished wooden pens.

---

### Project 11: Copper Inlay on Rosewood Sign

| Field | Value |
|-------|-------|
| Slug | `copper-inlay-on-rosewood-sign` |
| Title | Copper Inlay on Rosewood Sign |
| Sort Order | 11 |
| Image Count | 6 |

**Description:**

A handcrafted wooden sign featuring rosewood planks joined together and laser engraved with a family household logo. The defining technique involves 8-gauge wire that was flattened using a rolling mill, annealed, and carefully hand-fitted into the engraved design. After sanding and finishing with polyurethane spray coating, the result combines rustic wood aesthetics with metallic inlay work.

**Gallery images:** 6 images showing various angles and details of the completed sign and construction process.

---

### Project 12: Crotch Wood Slab Coffee Table

| Field | Value |
|-------|-------|
| Slug | `crotch-wood-slab-coffee-table` |
| Title | Crotch Wood Slab Coffee Table |
| Sort Order | 12 |
| Image Count | 7 |

**Description:**

This coffee table was made from a piece of maple crotch wood. The raw slab was planed using a CNC router and sanded down to create a smooth surface. The piece features a natural wood finish sealed with Rubio Monocoat and minimalist hairpin legs.

**Gallery images:** 7 images showing various angles and details of the finished coffee table.

---

### Project 13: Laser Engravings

| Field | Value |
|-------|-------|
| Slug | `laser-engravings` |
| Title | Laser Engravings |
| Sort Order | 13 |
| Image Count | 11 |

**Description:**

Laser engravers have the amazing ability to easily customize just about any type of decor. From family crests, to favorite holiday scores, to pictures of pets. Below are some samples of the many laser engraved pieces we have delivered.

**Gallery images:** 11 product images showing completed engraved items (wooden pieces, decorative boards, custom designs) in a grid layout.

---

### Project 14: Hometown Memorabilia

| Field | Value |
|-------|-------|
| Slug | `hometown-memorabilia` |
| Title | Hometown Memorabilia |
| Sort Order | 14 |
| Image Count | 4 |

**Description:**

A walnut plaque laser cut to resemble the State of South Carolina, with engraved state flag imagery and white paint accents. The piece is finished with polyurethane for protection.

**Gallery images:** ~4 images shown from different angles and perspectives.

---

### Project 15: Chipping Challenge Backyard Game

| Field | Value |
|-------|-------|
| Slug | `chipping-challenge-backyard-game` |
| Title | Chipping Challenge Backyard Game |
| Sort Order | 15 |
| Image Count | 2 |

**Description:**

This backyard game was constructed using pine lumber, stained and coated with polyurethane for protection. Artificial turf adds a golfing aesthetic while also providing padded landing for golf balls. Scoring: 1 point for hitting the board, 3 points for sinking into the large hole, and 5 points for either smaller hole.

**Gallery images:** 2 images — front view of the completed game and an alternative angle showing the construction.

---

### Project 16: Custom Branded Plyometric Boxes

| Field | Value |
|-------|-------|
| Slug | `custom-branded-plyometric-boxes` |
| Title | Custom Branded Plyometric Boxes |
| Sort Order | 16 |
| Image Count | 7 |

**Description:**

Fitness equipment featuring multi-height plyometric boxes enhanced with laser-engraved gym branding. Multiple step-up heights in a single box, depending on which surface you face towards the ground. Additional practical features include orientation arrows and side handles for improved usability.

**Gallery images:** 7 photographs showing various angles and details of the branded boxes in use and storage.

---

### Project 17: Custom Toddler Step Stools

| Field | Value |
|-------|-------|
| Slug | `customized-toddler-step-stools` |
| Title | Custom Toddler Step Stools |
| Sort Order | 17 |
| Image Count | 3 |

**Description:**

Rustic step stools crafted from Pine 2"x8" lumber with personalized laser-engraved names on masked tops. The stools are finished with paint and polyurethane coating for water protection.

**Gallery images:** 3 product photos displaying the completed stools from different angles.

---

### Image Count Summary

| Project | Images |
|---------|--------|
| Ornate Zebrawood Mirror | 8 |
| Wood Inlay Cutting Board | 8 |
| LED Storefront Sign | 8 |
| Custom Video Arcade | 10 |
| Box Elder Slab Coffee Table | 10 |
| Resin Filled Memorabilia | 6 |
| Resin Filled Branding on Wooden Slab Benches | 7 |
| Laser Etched Pet Glasses | 7 |
| World Series Wooden Bat Mugs | 4 |
| Personalized Pens | 4 |
| Copper Inlay on Rosewood Sign | 6 |
| Crotch Wood Slab Coffee Table | 7 |
| Laser Engravings | 11 |
| Hometown Memorabilia | 4 |
| Chipping Challenge Backyard Game | 2 |
| Custom Branded Plyometric Boxes | 7 |
| Custom Toddler Step Stools | 3 |
| **Total** | **~112** |

---

## 8. Architecture & File Structure

```
lostandlucky/
├── client/                          # React frontend (Vite)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── components/
│   │   │   │   ├── Header.test.jsx
│   │   │   │   ├── Footer.test.jsx
│   │   │   │   ├── Layout.test.jsx
│   │   │   │   ├── HeroSection.test.jsx
│   │   │   │   ├── PortfolioGrid.test.jsx
│   │   │   │   ├── ProjectCard.test.jsx
│   │   │   │   ├── ImageGallery.test.jsx
│   │   │   │   ├── Lightbox.test.jsx
│   │   │   │   ├── MobileMenu.test.jsx
│   │   │   │   └── ContactForm.test.jsx
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.test.jsx
│   │   │   │   ├── ProjectPage.test.jsx
│   │   │   │   └── ContactPage.test.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useScrollToHash.test.js
│   │   │   └── lib/
│   │   │       └── api.test.js
│   │   ├── components/
│   │   │   ├── Header.jsx           # Fixed header with nav
│   │   │   ├── Footer.jsx           # Footer with nav + social
│   │   │   ├── Layout.jsx           # Wraps Header + children + Footer
│   │   │   ├── HeroSection.jsx      # Homepage hero
│   │   │   ├── PortfolioGrid.jsx    # Homepage project grid
│   │   │   ├── ProjectCard.jsx      # Single portfolio thumbnail
│   │   │   ├── ImageGallery.jsx     # Project page image grid
│   │   │   ├── Lightbox.jsx         # Fullscreen image viewer
│   │   │   ├── ContactForm.jsx      # Contact form component
│   │   │   └── MobileMenu.jsx       # Hamburger menu overlay
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # / route
│   │   │   ├── ProjectPage.jsx      # /:slug route
│   │   │   └── ContactPage.jsx      # /contact-us route
│   │   ├── hooks/
│   │   │   └── useScrollToHash.js   # Smooth scroll for #portfolio
│   │   ├── lib/
│   │   │   └── api.js               # API client (fetch wrapper)
│   │   ├── App.jsx                  # Router setup
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Tailwind directives + global styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── vitest.config.js             # jsdom environment + test setup
│   └── package.json
│
├── server/                          # Express backend
│   ├── __tests__/
│   │   ├── db/
│   │   │   ├── schema.test.js
│   │   │   ├── projects.test.js
│   │   │   ├── images.test.js
│   │   │   ├── contacts.test.js
│   │   │   ├── settings.test.js
│   │   │   └── seed.test.js
│   │   ├── middleware/
│   │   │   └── auth.test.js
│   │   ├── routes/
│   │   │   ├── projects.test.js
│   │   │   ├── settings.test.js
│   │   │   ├── contact.test.js
│   │   │   ├── static.test.js
│   │   │   ├── admin-auth.test.js
│   │   │   ├── admin-projects.test.js
│   │   │   ├── admin-images.test.js
│   │   │   ├── admin-contacts.test.js
│   │   │   └── admin-settings.test.js
│   │   └── production.test.js
│   ├── db/
│   │   ├── schema.sql               # Table definitions
│   │   ├── seed.sql                 # Initial project data
│   │   └── database.js              # SQLite connection + helpers
│   ├── routes/
│   │   ├── api.js                   # Public API routes
│   │   ├── admin.js                 # Admin API routes
│   │   └── upload.js                # Image upload handling
│   ├── middleware/
│   │   ├── auth.js                  # Admin authentication
│   │   └── validate.js              # Request validation
│   ├── services/
│   │   ├── email.js                 # Nodemailer configuration
│   │   └── imageProcessor.js        # Image resizing (optional)
│   ├── index.js                     # Express app setup
│   ├── vitest.config.js             # Node environment
│   └── package.json
│
├── admin/                           # CMS admin panel (React, separate Vite app)
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── components/
│   │   │   │   ├── Login.test.jsx
│   │   │   │   ├── Dashboard.test.jsx
│   │   │   │   ├── ProjectList.test.jsx
│   │   │   │   ├── ProjectEditor.test.jsx
│   │   │   │   ├── ImageUploader.test.jsx
│   │   │   │   ├── ContactMessages.test.jsx
│   │   │   │   └── Settings.test.jsx
│   │   │   └── App.test.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # Overview stats
│   │   │   ├── ProjectList.jsx      # Manage projects
│   │   │   ├── ProjectEditor.jsx    # Create/edit project
│   │   │   ├── ImageUploader.jsx    # Drag-and-drop image upload
│   │   │   ├── ContactMessages.jsx  # View contact submissions
│   │   │   ├── Settings.jsx         # Site settings editor
│   │   │   └── Login.jsx            # Admin login form
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── vitest.config.js             # jsdom environment + test setup
│   └── package.json
│
├── scripts/
│   ├── __tests__/
│   │   ├── scrape-images.test.js
│   │   ├── seed-database.test.js
│   │   └── setup.test.js
│   ├── scrape-images.js             # Download all images from Squarespace
│   ├── seed-database.js             # Populate DB from seed data
│   └── setup.js                     # Full first-run setup
│
├── images/                          # Downloaded image assets
│   ├── logo/
│   │   └── Lost&Lucky_Logo_Blue.png
│   └── projects/
│       ├── ornate-zebrawood-mirror/
│       │   ├── hero.jpg
│       │   ├── 01.jpg
│       │   ├── 02.jpg
│       │   └── ...
│       ├── wood-inlay-cutting-board/
│       │   └── ...
│       └── ... (one folder per project)
│
├── data/
│   └── lostandlucky.db              # SQLite database file
│
├── .env.example                     # Environment variable template
├── .gitignore
├── package.json                     # Root package.json (workspaces)
└── README.md
```

### Directory Purposes

| Directory | Purpose |
|-----------|---------|
| `client/` | Public-facing React SPA — the visitor-facing website |
| `client/src/__tests__/` | Client component and page tests (Vitest + jsdom) |
| `server/` | Express API server — serves API, static files, and SPA in production |
| `server/__tests__/` | Database, route, and middleware tests (Vitest + supertest) |
| `admin/` | Separate React app for CMS administration |
| `admin/src/__tests__/` | Admin component tests (Vitest + jsdom) |
| `scripts/` | One-time setup and utility scripts |
| `scripts/__tests__/` | Script unit tests (Vitest + mocked fs/fetch) |
| `images/` | All downloaded image assets, organized by project slug |
| `data/` | SQLite database file (gitignored in production) |

---

## 9. Database Schema

### Full SQL Schema

```sql
-- Site-wide settings (key-value pairs)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects (portfolio items)
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,  -- 0=draft, 1=published
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project images
CREATE TABLE IF NOT EXISTS project_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    filename TEXT NOT NULL,           -- e.g. "hero.jpg", "01.jpg"
    alt_text TEXT DEFAULT '',
    is_hero INTEGER NOT NULL DEFAULT 0,  -- 1=hero/featured image
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,  -- 0=unread, 1=read
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,       -- bcrypt hash
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_sort ON project_images(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_submissions(is_read);
```

### Default Settings Seed Data

```sql
INSERT INTO settings (key, value) VALUES
    ('site_title', 'LOST & LUCKY LABS'),
    ('site_tagline', 'Built for you, not the masses'),
    ('contact_email', 'your-email@example.com'),
    ('contact_phone', '(555) 555-0100'),
    ('instagram_url', 'https://www.instagram.com/lostandluckylabs/?hl=en'),
    ('hero_cta_text', 'Inquire Here'),
    ('contact_heading', 'What would you like built today?'),
    ('contact_success_message', 'Thank you for your inquiry! We will get back to you shortly.');
```

### Relationships

```
settings (standalone key-value store)

projects 1──┤ project_images
   │
   └── slug (used in URL routing)

contact_submissions (standalone)

admin_users (standalone)
```

---

## 10. API Endpoints

### Public API (`/api`)

#### GET `/api/projects`

Returns all published projects for the homepage portfolio grid.

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "slug": "ornate-zebrawood-mirror",
      "title": "Ornate Zebrawood Mirror",
      "sort_order": 1,
      "hero_image": {
        "id": 1,
        "filename": "hero.jpg",
        "alt_text": "Ornate Zebrawood Mirror"
      }
    }
  ]
}
```

#### GET `/api/projects/:slug`

Returns a single project with all images for the project detail page.

**Response:**
```json
{
  "project": {
    "id": 1,
    "slug": "ornate-zebrawood-mirror",
    "title": "Ornate Zebrawood Mirror",
    "description": "The solid zebrawood frame was cut into...",
    "images": [
      {
        "id": 1,
        "filename": "hero.jpg",
        "alt_text": "Ornate Zebrawood Mirror",
        "is_hero": 1,
        "sort_order": 0,
        "url": "/images/projects/ornate-zebrawood-mirror/hero.jpg"
      },
      {
        "id": 2,
        "filename": "01.jpg",
        "alt_text": "",
        "is_hero": 0,
        "sort_order": 1,
        "url": "/images/projects/ornate-zebrawood-mirror/01.jpg"
      }
    ]
  }
}
```

**404 Response:**
```json
{ "error": "Project not found" }
```

#### GET `/api/settings`

Returns all public site settings.

**Response:**
```json
{
  "settings": {
    "site_title": "LOST & LUCKY LABS",
    "site_tagline": "Built for you, not the masses",
    "contact_email": "your-email@example.com",
    "contact_phone": "(555) 555-0100",
    "instagram_url": "https://www.instagram.com/lostandluckylabs/?hl=en",
    "hero_cta_text": "Inquire Here",
    "contact_heading": "What would you like built today?",
    "contact_success_message": "Thank you for your inquiry! We will get back to you shortly."
  }
}
```

#### POST `/api/contact`

Submits a contact form message.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'd like a custom cutting board."
}
```

**Validation:**
- `name`: required, non-empty string, max 200 characters
- `email`: required, valid email format, max 200 characters
- `message`: required, non-empty string, max 5000 characters

**Success Response (201):**
```json
{ "message": "Thank you for your inquiry! We will get back to you shortly." }
```

**Validation Error (400):**
```json
{ "error": "Invalid email address" }
```

### Admin API (`/api/admin`)

All admin endpoints require authentication via session cookie or Bearer token.

#### POST `/api/admin/login`

**Request:** `{ "username": "admin", "password": "..." }`
**Response:** `{ "token": "...", "message": "Login successful" }`

#### GET `/api/admin/dashboard`

**Response:**
```json
{
  "project_count": 17,
  "unread_messages": 3,
  "total_messages": 42
}
```

#### CRUD: Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/projects` | List all projects (including drafts) |
| GET | `/api/admin/projects/:id` | Get single project with images |
| POST | `/api/admin/projects` | Create new project |
| PUT | `/api/admin/projects/:id` | Update project |
| DELETE | `/api/admin/projects/:id` | Delete project + images |
| PUT | `/api/admin/projects/reorder` | Update sort_order for all projects |

#### CRUD: Project Images

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/projects/:id/images` | Upload image(s) — multipart/form-data |
| PUT | `/api/admin/images/:id` | Update image alt_text, sort_order, is_hero |
| DELETE | `/api/admin/images/:id` | Delete single image |

#### Contact Messages

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/contacts` | List all contact submissions (newest first) |
| GET | `/api/admin/contacts/:id` | Get single submission (marks as read) |
| DELETE | `/api/admin/contacts/:id` | Delete submission |

#### Settings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/settings` | Get all settings |
| PUT | `/api/admin/settings` | Update settings (partial update) |

---

## 11. CMS Admin Panel Specification

### Access

- URL: `/admin` (served as separate SPA or route)
- Authentication: Username/password login
- Default credentials created during setup: `admin` / (user-chosen password)
- Session-based auth with httpOnly cookie (or JWT Bearer token)

### Pages

#### Login

- Username and password fields
- "Login" submit button
- Error message display for invalid credentials

#### Dashboard

- **Project count:** Total published projects
- **Unread messages:** Count with badge indicator
- **Quick links:** "Manage Projects", "View Messages", "Settings"

#### Project List

- Table with columns: Thumbnail, Title, Slug, Status (Published/Draft), Sort Order, Actions
- **Actions:** Edit, Delete (with confirmation dialog)
- **Drag-to-reorder** or sort_order number input
- **"New Project"** button at top

#### Project Editor (Create/Edit)

- **Title:** Text input
- **Slug:** Auto-generated from title, editable
- **Description:** Textarea (Markdown or plain text)
- **Status:** Toggle Published/Draft
- **Images:**
  - Drag-and-drop upload zone
  - Existing images shown as sortable thumbnail grid
  - Click to set as hero image (star icon)
  - Click to delete (X icon, with confirmation)
  - Alt text input per image
- **Save / Cancel** buttons

#### Contact Messages

- Table: Name, Email, Date, Read/Unread status
- Click row → view full message
- Mark as read/unread toggle
- Delete button

#### Settings

- Editable fields for all `settings` table values:
  - Site title, tagline, contact email, phone, Instagram URL
  - Hero CTA text, contact heading, success message
- **Save** button

---

## 12. Image Asset Strategy

### Scraping Script (`scripts/scrape-images.js`)

The script should:

1. Query each project page on `lostandluckylabs.com`
2. Find all `<img>` tags within the project content area
3. Extract the Squarespace CDN URLs (pattern: `images.squarespace-cdn.com/content/v1/5fac067233bc4707879da16c/...`)
4. Download each image to local storage
5. Also download the logo: `https://images.squarespace-cdn.com/content/v1/5fac067233bc4707879da16c/1610730203113-62I67X0TPQEHWGC4Q7M3/Lost%26Lucky_Logo_Blue.png`

**Squarespace CDN base URL:**
```
https://images.squarespace-cdn.com/content/v1/5fac067233bc4707879da16c/
```

### Local Storage Structure

```
images/
├── logo/
│   └── Lost&Lucky_Logo_Blue.png
└── projects/
    ├── ornate-zebrawood-mirror/
    │   ├── hero.jpg          # First/featured image
    │   ├── 01.jpg            # Gallery image 1
    │   ├── 02.jpg            # Gallery image 2
    │   └── ...
    ├── wood-inlay-cutting-board/
    │   ├── hero.jpg
    │   ├── 01.jpg
    │   └── ...
    └── ... (17 project folders total)
```

### Image Naming Conventions

| Image Type | Naming Pattern | Example |
|-----------|----------------|---------|
| Logo | Original filename | `Lost&Lucky_Logo_Blue.png` |
| Hero/featured | `hero.jpg` | `images/projects/led-storefront-sign/hero.jpg` |
| Gallery images | Zero-padded sequential | `01.jpg`, `02.jpg`, `03.jpg` |

### Serving Images

- Express serves the `images/` directory as static files
- URL pattern: `/images/projects/<slug>/<filename>`
- Example: `/images/projects/ornate-zebrawood-mirror/hero.jpg`
- Logo: `/images/logo/Lost&Lucky_Logo_Blue.png`

### Upload Handling (CMS)

- New image uploads via admin go to `images/projects/<slug>/`
- Use `multer` middleware for multipart uploads
- Accepted formats: JPEG, PNG, WebP
- Max file size: 10MB per image
- Auto-rename to sequential pattern if needed

---

## 13. Build & Deployment

### Prerequisites

- Node.js 18+
- npm or yarn

### Environment Variables (`.env`)

```env
# Server
PORT=3000
NODE_ENV=development

# Admin auth
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=           # bcrypt hash, set during setup

# JWT (if using token auth)
JWT_SECRET=your-secret-key-here

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password    # Gmail App Password
EMAIL_TO=your-email@example.com

# Database
DB_PATH=./data/lostandlucky.db
```

### Development Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd lostandlucky
npm install          # Root dependencies + workspace installs

# 2. Set up environment
cp .env.example .env
# Edit .env with your values

# 3. Initialize database
npm run setup        # Creates DB, runs schema, seeds data

# 4. Download images from Squarespace (one-time)
npm run scrape-images

# 5. Start development servers
npm run dev          # Starts client (Vite :5173) + server (Express :3000) + admin (Vite :5174)
```

### Package.json Scripts (Root)

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\" \"npm run dev:admin\"",
    "dev:client": "npm -w client run dev",
    "dev:server": "npm -w server run dev",
    "dev:admin": "npm -w admin run dev",
    "build": "npm -w client run build && npm -w admin run build",
    "start": "npm -w server run start",
    "setup": "node scripts/setup.js",
    "scrape-images": "node scripts/scrape-images.js",
    "seed": "node scripts/seed-database.js",
    "test": "npm -w server run test && npm -w client run test && npm -w admin run test",
    "test:server": "npm -w server run test",
    "test:client": "npm -w client run test",
    "test:admin": "npm -w admin run test",
    "test:scripts": "npx vitest run --config scripts/vitest.config.js",
    "test:watch": "npx vitest --watch"
  }
}
```

### Production Build

```bash
# Build both frontends
npm run build

# Output:
#   client/dist/   → served by Express at /
#   admin/dist/    → served by Express at /admin

# Start production server
NODE_ENV=production npm start
```

### Production Express Configuration

```javascript
// In production, Express serves:
// 1. API routes at /api/*
// 2. Static images at /images/*
// 3. Admin SPA at /admin/*  (from admin/dist/)
// 4. Public SPA at /*       (from client/dist/) — catch-all for React Router
```

### Vite Dev Proxy

During development, the Vite dev server proxies API requests to Express:

```javascript
// client/vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/images': 'http://localhost:3000'
    }
  }
});
```

---

## 14. Verification Checklist

### Phase-Based Test Suites

> Run all 165 tests before considering the build complete:
>
> ```bash
> npm test                  # All workspaces
> npm run test:scripts      # Scripts workspace
> ```

- [ ] **Phase 0** — Project setup: `npm run dev` starts all servers, `npm test` runs with no errors, `GET /api/health` returns OK
- [ ] **Phase 1** — Database layer: `npm run test:server -- --reporter verbose server/__tests__/db/` (23 tests pass)
- [ ] **Phase 2** — Public API: `npm run test:server -- --reporter verbose server/__tests__/routes/{projects,settings,contact,static}.test.js` (22 tests pass)
- [ ] **Phase 3** — Admin API: `npm run test:server -- --reporter verbose server/__tests__/routes/admin-*.test.js server/__tests__/middleware/` (25 tests pass)
- [ ] **Phase 4** — Public frontend: `npm run test:client` (39 tests pass)
- [ ] **Phase 5** — Contact frontend: tests included in `npm run test:client` (13 additional tests pass)
- [ ] **Phase 6** — Admin panel: `npm run test:admin` (30 tests pass)
- [ ] **Phase 7** — Scripts & production: `npm run test:scripts && npm run test:server -- server/__tests__/production.test.js` (13 tests pass)

### Visual Comparison

- [ ] Homepage hero section matches original (title, tagline, button)
- [ ] Portfolio grid matches 2-column layout with correct project order
- [ ] Project page hero image displays at full width
- [ ] Project page description text matches original
- [ ] Project page image gallery displays correctly
- [ ] Contact page heading and contact info matches
- [ ] Contact form layout matches original
- [ ] Header is fixed and matches original styling
- [ ] Footer matches original styling
- [ ] Logo displays correctly at proper sizes
- [ ] Brand colors match original site

### Functional Testing

- [ ] All 17 project pages load with correct content
- [ ] Portfolio thumbnails link to correct project pages
- [ ] Image gallery lightbox opens on click
- [ ] Lightbox prev/next navigation works
- [ ] Lightbox close (X button, backdrop click, Escape key) works
- [ ] Contact form validates required fields
- [ ] Contact form submits successfully
- [ ] Contact form shows success message
- [ ] Contact submission is saved to database
- [ ] Email notification is sent on form submission
- [ ] `/#portfolio` anchor smooth-scrolls to portfolio section
- [ ] `/home` route serves same content as `/`
- [ ] Navigation links all work (Portfolio, Contact, Instagram)
- [ ] Mobile hamburger menu opens and closes
- [ ] Logo links to homepage

### CMS Admin Testing

- [ ] Admin login works
- [ ] Dashboard shows correct counts
- [ ] Can create a new project
- [ ] Can edit an existing project
- [ ] Can delete a project
- [ ] Can upload images to a project
- [ ] Can reorder projects
- [ ] Can set hero image
- [ ] Can view contact submissions
- [ ] Can mark messages as read/unread
- [ ] Can update site settings
- [ ] Settings changes reflect on public site

### Responsive Testing

- [ ] Mobile (375px): single column, hamburger menu, proper padding
- [ ] Tablet (768px): 2-column grid, standard nav
- [ ] Desktop (1200px+): max-width container, full nav
- [ ] Images scale properly at all sizes
- [ ] Text remains readable at all sizes
- [ ] Touch targets are accessible on mobile

### Production Build

- [ ] `npm run build` completes without errors
- [ ] Production server serves client SPA
- [ ] Production server serves admin SPA at `/admin`
- [ ] API endpoints respond correctly in production mode
- [ ] Static images are served correctly
- [ ] React Router handles client-side navigation (no 404 on refresh)

---

## Appendix: Quick Reference

### Key URLs

| Resource | URL |
|----------|-----|
| Original site | https://www.lostandluckylabs.com |
| Squarespace CDN | https://images.squarespace-cdn.com/content/v1/5fac067233bc4707879da16c/ |
| Logo image | https://images.squarespace-cdn.com/content/v1/5fac067233bc4707879da16c/1610730203113-62I67X0TPQEHWGC4Q7M3/Lost%26Lucky_Logo_Blue.png |
| Instagram | https://www.instagram.com/lostandluckylabs/?hl=en |
| Contact email | your-email@example.com |
| Contact phone | (555) 555-0100 |

### Tech Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React | 18+ |
| Build tool | Vite | 5+ |
| Styling | Tailwind CSS | 3+ |
| Backend | Express | 4+ |
| Database | SQLite | via better-sqlite3 |
| Email | Nodemailer | latest |
| Image upload | Multer | latest |
| Auth | bcrypt + JWT | latest |
| Test runner | Vitest | latest |
| API test utility | supertest | latest |
| Component testing | @testing-library/react | latest |
| DOM assertions | @testing-library/jest-dom | latest |
