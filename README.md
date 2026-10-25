# VIT ELECTRONICS(Initial Name : NextCircuit)

A next-generation tech & smart gadgets e-commerce platform built with Next.js 16 and NestJS 11, natively integrated with 23 AWS services including Amazon RDS PostgreSQL, S3, CloudFront, SQS, SNS, and EC2. Includes a full storefront, admin portal, product/order management, WhatsApp concierge, branded invoice PDFs, and rate-limited authentication.

---

## Table of Contents

1. [AWS Deployment Guide (Production)](./AWS_DEPLOYMENT_GUIDE.md)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Local Development Setup](#local-development-setup)
6. [Environment Variables](#environment-variables)
7. [AWS S3 & CloudFront Setup](#aws-s3--cloudfront-setup)
8. [Google OAuth Setup](#google-oauth-setup)
9. [Prisma — Database & Studio](#prisma--database--studio)
10. [Production Deployment (Docker)](#production-deployment-docker)
11. [Security](#security)
12. [Useful Commands](#useful-commands)

---

## Tech Stack

### Frontend (`/frontend`)

| Package | Version | Purpose |
|---|---|---|
| `next` | **16** | React framework — App Router, SSR, Turbopack, image optimisation, SEO metadata API |
| `react` / `react-dom` | **19** | UI rendering — React 19 with improved server components |
| `typescript` | 5 | Type safety across the entire frontend |
| `tailwindcss` | 3 | Utility-first CSS — all styling done via Tailwind classes |
| `next-auth` | **5 (beta)** | Auth.js v5 — JWT sessions, credentials login, Google OAuth |
| `axios` | 1 | HTTP client for all API calls to the backend |
| `gsap` | 3 | Animation library — hero slider transitions, scroll-triggered effects |
| `@studio-freight/lenis` | 1 | Smooth scroll library, integrated with GSAP ScrollTrigger |
| `framer-motion` | **12** | Page and component animations (React 19 compatible) |
| `@dnd-kit/core` + `sortable` | 6/10 | Drag-and-drop for admin reordering of products, homepage blocks etc. |
| `lucide-react` | 0.468 | Icon library — all icons throughout the site |
| `clsx` + `tailwind-merge` | — | Utility helpers for conditional Tailwind class merging |
| `@sentry/nextjs` | **10** | Error monitoring and performance tracking (requires DSN — see Environment Variables) |

### Backend (`/backend`)

| Package | Version | Purpose |
|---|---|---|
| `@nestjs/common` + `core` + `platform-express` | **11** | NestJS core framework — HTTP server, dependency injection, modules, guards |
| `@nestjs/config` | **4** | Loads `.env` variables and makes them available via `ConfigService` |
| `@nestjs/jwt` | **11** | JWT creation and verification for access tokens and refresh tokens |
| `@nestjs/passport` + `passport` + `passport-jwt` | — | JWT authentication strategy — validates Bearer tokens on protected routes |
| `@nestjs/throttler` | **6** | Global request rate limiting to prevent API abuse |
| `@nestjs/bullmq` + `bullmq` | **11** | Redis-backed background job queue — used for async tasks like email sending |
| `prisma` + `@prisma/client` | 5 | ORM for PostgreSQL — schema management, migrations, and type-safe DB queries |
| `ioredis` | 5 | Redis client — used for login rate limiting (brute force), caching, and BullMQ |
| `bcryptjs` | 3 | Pure-JS password hashing with 12 salt rounds (no native deps, replaces bcrypt) |
| `@aws-sdk/client-s3` | 3 | AWS SDK for uploading and managing files on Amazon S3 |
| `multer` | **2.2** | Multipart file upload middleware — handles image uploads before sending to S3 |
| `sharp` | 0.33 | Server-side image processing — resizes thumbnails, detects image luminance |
| `nodemailer` | **9** | Sends transactional emails (OTP verification, order invoices, password reset) via SMTP |
| `pdfkit` | 0.19 | Generates invoice PDFs server-side and attaches them to order confirmation emails |
| `@opensearch-project/opensearch` | 3 | Official AWS OpenSearch / Elasticsearch SDK — product indexing and search |
| `helmet` | 7 | Sets secure HTTP headers (CSP, X-Frame-Options, etc.) |
| `class-validator` + `class-transformer` | — | DTO validation — validates and transforms incoming request bodies |
| `rxjs` | 7 | Required by NestJS core for reactive patterns |
| `@sentry/node` | 10 | Error monitoring and performance tracking (requires DSN — see Environment Variables) |
| `reflect-metadata` | 0.2 | Required by TypeScript decorators used throughout NestJS |

### Infrastructure

| Tool | Purpose |
|---|---|
| **PostgreSQL 16** | Primary relational database — stores users, products, orders, config |
| **Redis 7** | Cache + message broker — login rate limiting (5 attempts / 5 min), BullMQ job queue |
| **Amazon OpenSearch** | Full-text search engine — fast product search with fuzzy matching (or RDS PostgreSQL fallback) |
| **Amazon S3 & CloudFront** | Object storage and global CDN distribution for product images, invoices, and assets |
| **Docker Compose** | Runs the full stack locally and in production |
| **WhatsApp Concierge** | Order flow — customers are redirected to WhatsApp to complete orders with the team |
| **SMTP (Gmail / any)** | Transactional email delivery — OTP codes, invoices, password reset |

---

## Project Structure

```
vit-electronics/
├── backend/                   NestJS 11 API server
│   ├── prisma/
│   │   ├── schema.prisma      Database schema — all models defined here
│   │   ├── migrations/        Auto-generated migration history
│   │   ├── seed.ts            Seeds initial data (admin user, categories)
│   │   └── seed.js            Plain JS seed for Docker (no ts-node needed)
│   ├── .npmrc                 Sets legacy-peer-deps=true for consistent installs
│   └── src/
│       ├── auth/              Login, register, OTP, Google OAuth, forgot password, JWT, rate limiting
│       ├── users/             User profile, addresses, role management
│       ├── products/          Product CRUD, categories, variants, images, search indexing
│       ├── orders/            Order creation, status management, invoice generation
│       ├── cart/              Server-side cart sync for logged-in users
│       ├── payments/          WhatsApp concierge + Cash on Delivery flow
│       ├── email/             SMTP email sending, invoice PDF generation, CRLF-safe headers
│       ├── media/             File upload to Amazon S3 via AWS SDK
│       ├── admin/             Admin-only endpoints (homepage slides, highlights, blocks, users)
│       ├── site-config/       Global site settings (fonts, colours, text, invoice branding, social links)
│       ├── verification/      OTP code creation and verification (email / password reset)
│       ├── newsletter/        Newsletter signup and management
│       ├── health/            Health check endpoint at /health
│       └── database/          PrismaService, RedisService
│
├── frontend/                  Next.js 16 App Router (React 19, Turbopack)
│   ├── .npmrc                 Sets legacy-peer-deps=true for consistent installs
│   └── src/
│       ├── app/
│       │   ├── (auth)/        Login, register, forgot-password pages
│       │   ├── (shop)/        Storefront — homepage, collections, products, cart, checkout
│       │   ├── (account)/     Orders, addresses, wishlist, profile (requires login)
│       │   ├── admin/         Admin portal — catalog, orders, homepage, themes, users, categories
│       │   ├── api/auth/      Auth.js v5 route handler (credentials + Google OAuth)
│       │   ├── layout.tsx     Root layout — fonts, CSS injection, SEO metadata, JSON-LD schemas
│       │   ├── robots.ts      Auto-generates /robots.txt
│       │   └── sitemap.ts     Auto-generates /sitemap.xml (static + dynamic product/category URLs)
│       ├── components/
│       │   ├── cinematic/     HeroSlider, ScrollGallery, EditorialSection, HomepageSectionHeading
│       │   ├── shop/          ProductGrid, ProductView, CategoryHero, FilterPanel, CartDrawer
│       │   ├── layout/        Navbar, Footer, SiteChrome (hides nav/footer on /admin routes)
│       │   ├── admin/         Admin-specific components (CategoryHighlightsManager, ProductRow, etc.)
│       │   └── ui/            Shared UI — Button, Input, PhoneInput, BackButton, NewsletterForm, etc.
│       ├── context/
│       │   ├── SiteConfigContext.tsx   Global site config (fonts, colours, text styles, social links)
│       │   ├── AuthContext.tsx         Authentication state
│       │   ├── CartContext.tsx         Cart — localStorage for guests, server-synced for logged-in users
│       │   ├── CurrencyContext.tsx     Currency selection (persisted in cookie with SameSite=Lax)
│       │   └── HeroThemeContext.tsx    Light/dark text theme per hero slide
│       ├── lib/
│       │   ├── api.ts          Axios instance with auth token injection
│       │   ├── auth.ts         Auth.js v5 config (credentials + Google providers, trustHost)
│       │   ├── site-config.ts  FONT_MAP and FONT_OPTIONS shared between server and client
│       │   └── utils.ts        Helpers — cn(), formatPrice(), formatDate(), safeUrl(), safeCdnUrl()
│       ├── proxy.ts            Route protection middleware (Next.js 16 convention, replaces middleware.ts)
│       └── types/              TypeScript interfaces for Product, Order, User, Address, etc.
│
├── infrastructure/
│   ├── docker-compose.local.yml   Runs postgres & redis locally
│   └── docker-compose.prod.yml    Runs full stack in production with health checks and build args
│
├── .env                       Root production environment file (used by Docker Compose)
├── .npmrc                     (frontend and backend each have their own)
├── .snyk                      Snyk security policy — suppresses reviewed false positives
└── README.md
```

---

## Prerequisites

Install these before starting:

- [Node.js](https://nodejs.org/) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local postgres & redis)
- [Git](https://git-scm.com/)

---

## Local Development Setup

### 1. Clone the repo

```bash
git clone https://github.com/likhithm123/AWS-PROJECT.git vit-electronics
cd vit-electronics
```

### 2. Start local services (postgres, redis)

```bash
docker compose -f infrastructure/docker-compose.local.yml up -d
```

This starts:
- PostgreSQL on port `5432`
- Redis on port `6379`

### 3. Set up the backend

```bash
cd backend
cp .env.example .env
# Fill in .env — see Environment Variables section below
npm install
npx prisma migrate dev       # runs all migrations and creates the DB schema
npx prisma db seed           # seeds admin user + categories
npm run start:dev            # starts NestJS on http://localhost:3001
```

> **Note:** The seed requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` to be set in `backend/.env`. It will throw if `ADMIN_PASSWORD` is missing.

### 4. Set up the frontend

```bash
cd frontend
cp .env.example .env.local
# Fill in .env.local — see Environment Variables section below
npm install
npm run dev                  # starts Next.js on http://localhost:3000
```

### 5. Open the app

| URL | What it is |
|---|---|
| `http://localhost:3000` | Storefront |
| `http://localhost:3000/admin` | Admin portal |
| `http://localhost:3001/health` | Backend health check |
| `http://localhost:5555` | Prisma Studio (run `npx prisma studio` first) |

---

## Environment Variables

### Backend — `backend/.env`

```env
# ── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vitelectronics?schema=public"
# For AWS RDS production: postgresql://postgres:VitElectronics2026!@<RDS_ENDPOINT>/vitelectronics?schema=public

# ── Redis ────────────────────────────────────────────────────────────────────
REDIS_URL="redis://localhost:6379"
# For Docker production: use redis://redis:6379
# Used for: login rate limiting (5 attempts per IP + per account → 5 min block), BullMQ jobs

# ── JWT ──────────────────────────────────────────────────────────────────────
JWT_SECRET="change-me-min-32-chars"
# Signs access tokens (15 min expiry) — generate with: openssl rand -hex 32
JWT_REFRESH_SECRET="change-me-different-secret"
# Signs refresh tokens (7 day expiry) — must be DIFFERENT from JWT_SECRET

# ── AWS S3 & CloudFront (media storage) ──────────────────────────────────────
AWS_REGION="us-east-1"
AWS_S3_BUCKET="vitelectronics-media"
AWS_CLOUDFRONT_DOMAIN="https://media.vitelectronics.com"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# ── Amazon OpenSearch / Elasticsearch ─────────────────────────
AWS_OPENSEARCH_ENDPOINT=""
# Leave blank to use built-in PostgreSQL database search automatically

# ── Email (SMTP) ─────────────────────────────────────────────────────────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
# For Gmail: generate an App Password at myaccount.google.com/apppasswords
SMTP_FROM="VIT ELECTRONICS <admin@vitelectronics.com>"

# ── Admin seed credentials ────────────────────────────────────────────────────
ADMIN_EMAIL="admin@vitelectronics.com"
ADMIN_PASSWORD="Admin@123"
# Used by `npx prisma db seed` — ADMIN_PASSWORD is REQUIRED (no fallback)

# ── Monitoring (optional) ─────────────────────────────────────────────────────
SENTRY_DSN=""
# From sentry.io → your project → Settings → Client Keys — leave blank to disable

# ── Server ───────────────────────────────────────────────────────────────────
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV=development
```

### Frontend — `frontend/.env.local`

```env
# ── API URLs ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL="http://localhost:3001"
INTERNAL_API_URL="http://localhost:3001"
# Use http://backend:3001 for INTERNAL_API_URL in Docker production

# ── Auth.js v5 ───────────────────────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-random-string"
AUTH_SECRET="change-me-random-string"
# AUTH_SECRET and NEXTAUTH_SECRET must be the same value
# Generate with: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# ── Google OAuth (optional) ──────────────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_ENABLED="false"
# Set to "true" to show the Google sign-in button
# NOTE: baked in at BUILD TIME — must be set before building the Docker image
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
# From Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID


# ── Media / CDN ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_CDN_URL="https://media.vitelectronics.com"
# Must match CloudFront domain or custom CDN domain in backend — used by safeCdnUrl()

# ── SEO ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL="https://vitelectronics.com"
# Your production domain — used for sitemap.xml, robots.txt, canonical URLs, OG tags

# ── Monitoring (optional) ─────────────────────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=""
```

---

## AWS S3 & CloudFront Setup

Amazon S3 stores all media uploads — product images, logos, OG images, favicons, and generated invoices. Amazon CloudFront caches and serves them worldwide.

### Step 1 — S3 Bucket & CloudFront CDN
You can provision the S3 bucket and CloudFront distribution automatically using the Terraform templates in `infrastructure/terraform/` (`s3_cloudfront.tf`), or configure manually:

1. In AWS Console: Navigate to **Amazon S3** → Create bucket (e.g. `vitelectronics-media`).
2. Navigate to **Amazon CloudFront** → Create distribution pointing to the S3 bucket as origin.
3. Configure Origin Access Control (OAC) so the S3 bucket remains private and only accessible via CloudFront.

### Step 2 — Configure Environment Variables
Set the following in `backend/.env`:
- `AWS_REGION` — e.g. `us-east-1`
- `AWS_S3_BUCKET` — e.g. `vitelectronics-media`
- `AWS_CLOUDFRONT_DOMAIN` — e.g. `https://media.vitelectronics.com` (or `https://dXXXXXXXXX.cloudfront.net`)
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` — IAM credentials (or use EC2 instance role in production)
- Set `NEXT_PUBLIC_CDN_URL` in `frontend/.env.local` to match your CloudFront domain.

---

## Google OAuth Setup

### Step 1 — Create OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Add **Authorized JavaScript origins**: `http://localhost:3000`
5. Add **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
6. Copy **Client ID** → `GOOGLE_CLIENT_ID`
7. Copy **Client Secret** → `GOOGLE_CLIENT_SECRET`

### Step 2 — Enable in environment

```env
NEXT_PUBLIC_GOOGLE_ENABLED="true"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

> **Important:** `NEXT_PUBLIC_GOOGLE_ENABLED` is baked in at **build time**. Changing it requires rebuilding the frontend Docker image (`--build --no-deps frontend`).

---

## Prisma — Database & Studio

### Run migrations

```bash
cd backend

# Development — creates a migration file and applies it
npx prisma migrate dev --name describe-your-change

# Quick sync without a migration file (development only)
npx prisma db push
```

### Seed the database

Requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`:

```bash
cd backend
npx prisma db seed
```

For Docker (after deploying):
```bash
docker compose -f infrastructure/docker-compose.prod.yml --env-file .env exec -T backend node prisma/seed.js
```

### Prisma Studio

```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

> **To manage the Docker database via Prisma Studio**, temporarily change `DATABASE_URL` in `backend/.env` to:
> ```
> DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/vitelectronics?schema=public"
> ```
> Then run `npx prisma studio`. Change it back when done.

---

## Production Deployment (Docker)

### 1. Fill in the root `.env` file

Key values to set (copy from `backend/.env.example` and add frontend vars):

```env
```env
DATABASE_URL="postgresql://postgres:VitElectronics2026!@<RDS_ENDPOINT>/vitelectronics?schema=public"
REDIS_URL="redis://redis:6379"
JWT_SECRET="your-32-char-secret"           # openssl rand -hex 32
JWT_REFRESH_SECRET="your-other-32-char-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
AUTH_SECRET="your-nextauth-secret"          # same as NEXTAUTH_SECRET
AUTH_URL="http://<EC2_PUBLIC_IP>:3000"
NEXTAUTH_URL="http://<EC2_PUBLIC_IP>:3000"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="<S3_BUCKET_NAME>"
AWS_CLOUDFRONT_DOMAIN="<CLOUDFRONT_DOMAIN>"
ADMIN_EMAIL="admin@vitelectronics.com"
ADMIN_PASSWORD="Admin@123"
NEXT_PUBLIC_CDN_URL="<CLOUDFRONT_DOMAIN>"
NEXT_PUBLIC_SITE_URL="http://<EC2_PUBLIC_IP>:3000"
```

### 2. Build and start everything

```bash
docker compose -f infrastructure/docker-compose.prod.yml --env-file .env up -d --build
```

Prisma migrations run automatically against AWS RDS. All services start with health checks.

### 3. Seed the production database (first deploy only)

```bash
docker compose -f infrastructure/docker-compose.prod.yml --env-file .env exec -T backend node prisma/seed.js
```

### 4. Update after a code change

```powershell
# Rebuild only the changed service
docker compose -f infrastructure/docker-compose.prod.yml --env-file .env up -d --build --no-deps backend
docker compose -f infrastructure/docker-compose.prod.yml --env-file .env up -d --build --no-deps frontend
```

### 5. View logs

```powershell
docker compose -f infrastructure/docker-compose.prod.yml --env-file .env logs -f backend
docker compose -f infrastructure/docker-compose.prod.yml --env-file .env logs -f frontend
```

---

## Security

### Rate Limiting (Brute Force Protection)
Login attempts are rate-limited using Redis with two independent counters:
- **Per IP:** 5 failures from the same IP → 5 minute block
- **Per account:** 5 failures on the same email → 5 minute block (even from different IPs)

Both counters reset on successful login. Real client IP extracted from `X-Forwarded-For` header for use behind proxies.

### Authentication
- Access tokens: JWT, 15 minute expiry
- Refresh tokens: JWT, 7 day expiry
- Passwords: bcryptjs with 12 salt rounds (pure JS, no native deps)
- Email OTP: 10 minute expiry, single-use
- Auth.js v5 with `trustHost: true` for Docker/production compatibility

### Email Security
All `to` and `subject` headers are sanitized to strip `\r\n` characters — prevents CRLF injection via nodemailer.

### URL Sanitization
- `safeUrl()` — validates protocol is http/https, returns `parsed.href` (not raw input)
- `safeCdnUrl()` — additionally validates hostname against trusted CDN domain allowlist (`*.cloudfront.net`, `*.amazonaws.com`, `media.vitelectronics.com`). Used for all media `src`/`href` attributes in the admin portal.

### CSS Injection Prevention
Dynamic CSS injected via `<style>` tag is sanitized through `sanitizeCssValue()` which strips non-printable characters and `</style>` sequences before injection.

### Package Security
- `bcrypt` replaced with `bcryptjs` — eliminates native `node-pre-gyp` dependency chain vulnerabilities
- `nodemailer` upgraded to v9 — fixes SSRF and CRLF vulnerabilities
- `multer` forced to v2.2.0 via npm overrides (including `@nestjs/platform-express` internal copy)
- `postcss` forced to v8.5.x via npm overrides (including Next.js internal copy)

---

## Useful Commands

```bash
# ── Backend ──────────────────────────────────────────────────────────────────
npm run start:dev            # start with hot reload
npm run build                # compile TypeScript
npx prisma studio            # open DB browser at localhost:5555
npx prisma migrate dev       # create + apply a new migration
npx prisma db push           # sync schema without creating a migration file
npx prisma db seed           # seed initial data (requires ADMIN_PASSWORD env var)
npx tsc --noEmit             # type-check without building

# ── Frontend ─────────────────────────────────────────────────────────────────
npm run dev                  # start dev server at localhost:3000 (Turbopack)
npm run build                # production build
npx tsc --noEmit             # type-check without building

# ── Docker (local services only) ─────────────────────────────────────────────
docker compose -f infrastructure/docker-compose.local.yml up -d       # start postgres, redis
docker compose -f infrastructure/docker-compose.local.yml down         # stop all
docker compose -f infrastructure/docker-compose.local.yml down -v      # stop + wipe all data volumes

# ── Docker (production) ───────────────────────────────────────────────────────
docker compose -f infrastructure/docker-compose.prod.yml --env-file .env up -d --build   # full build + start
docker compose -f infrastructure/docker-compose.prod.yml --env-file .env ps              # check container status
docker compose -f infrastructure/docker-compose.prod.yml --env-file .env down            # stop all
docker builder prune -f                                                                    # clear build cache
```
