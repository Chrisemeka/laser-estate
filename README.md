# Laser Estate Services

A real-estate platform for **Laser Estate Services** (Lagos, Nigeria), specialising in prime residential and commercial property across Ikoyi, Victoria Island, Banana Island, and Lekki.

**Stack:** Next.js 14 (App Router, TypeScript) · Supabase (Postgres, Auth, RLS) · Cloudflare R2 (media, S3-compatible) · Tailwind CS  S · Leaflet (maps) · Resend (email) · Vercel (hosting).

---

## MVP feature list

**Public**
- Home with featured listings
- Browse with filters (area, listing type, property type, price, bedrooms, search)
- SEO-friendly individual listing pages with photo/video gallery, map, amenities, and price
- WhatsApp / call / structured inquiry form on every listing
- About and Contact pages
- Deduplicated view counting per session

**Admin (realtor only)**
- Sign in / sign up (admin auto-detected by email)
- Dashboard with per-listing view counts and inquiry alerts
- Create/edit/delete listings with rich fields, amenities picker, and coordinates
- Cloudflare R2 media upload (images + video) via presigned URLs, drag-to-reorder cover
- Draft → Available → Under Offer → Sold/Rented workflow
- Inquiries inbox with WhatsApp/email quick actions and "handled" toggle

---

## 1 · Create accounts (all free)

### Supabase
1. Go to https://supabase.com → **Sign up** with GitHub.
2. **New project** — name it `laser-estate`, pick a strong DB password (save it), region `West EU (London)` (closest to Nigeria).
3. Wait ~2 min for provisioning.
4. In the sidebar go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY` (server only!)

### Cloudflare R2 (media storage)

R2 gives you 10GB storage + 1M writes + 10M reads per month **free**, with zero egress fees. A credit card must be on file to activate (no charges below the free tier).

1. Go to https://dash.cloudflare.com → sign up → in the sidebar click **R2**.
2. First-time only: click **Enable R2** and add a payment method.
3. **Create bucket** → name it `laser-estate-media` → **Location: Automatic** → Create.
4. Open the bucket → **Settings** tab:
   - **Public access** → under *R2.dev subdomain*, click **Allow access**. Copy the public URL (looks like `https://pub-abc123def456.r2.dev`). This becomes `NEXT_PUBLIC_R2_PUBLIC_URL`.
   - **CORS Policy** → **Add CORS policy** → paste:
     ```json
     [
       {
         "AllowedOrigins": ["http://localhost:3000", "https://YOUR-VERCEL-DOMAIN.vercel.app"],
         "AllowedMethods": ["GET", "PUT"],
         "AllowedHeaders": ["*"],
         "MaxAgeSeconds": 3600
       }
     ]
     ```
     (add your custom domain once you have one)
5. Grab your **Account ID** — visible on the R2 overview page. This becomes `R2_ACCOUNT_ID`.
6. Left sidebar → **R2** → **Manage R2 API Tokens** → **Create User API Token**:
   - Permissions: **Object Read & Write**
   - Specify bucket: `laser-estate-media`
   - TTL: leave default
   - Create → copy the **Access Key ID** and **Secret Access Key** immediately (shown once).

**Optional — custom domain** (looks professional and dodges the pub-*.r2.dev URL): bucket **Settings → Custom Domains → Connect Domain**, point e.g. `media.laserestate.ng`. Update `NEXT_PUBLIC_R2_PUBLIC_URL` to that URL.

### Resend (email — optional but recommended)
1. https://resend.com → **Sign up**.
2. Add and verify your domain (or use `onboarding@resend.dev` sender for testing).
3. Create an API key → `RESEND_API_KEY`.
4. Set `INQUIRY_NOTIFICATION_EMAIL` to your dad's email.

---

## 2 · Run the schema

1. In Supabase, open **SQL Editor**.
2. Copy the contents of `supabase/migrations/0001_init.sql`, paste, **Run**.
   The migration seeds `obi.anyanwu@yahoo.com` as the admin email in the `app_settings` table.
3. To change the admin email later:
   ```sql
   update app_settings set value = 'new@email.com' where key = 'admin_email';
   ```
4. (Optional) Sign up in the app first with that email (see step 4), then run `supabase/seed.sql` to load sample listings.

---

## 3 · Local dev

```bash
git clone <this repo>
cd laser-estate
npm install
cp .env.example .env.local
# fill in the values from step 1
npm run dev
```

Open http://localhost:3000.

## 4 · Create the admin user

1. Visit `/login` → **Create account**.
2. Sign up with the email you set as `app.admin_email` (e.g. `obi.anyanwu@yahoo.com`).
3. The signup trigger stamps the profile as `admin`. You'll now see the **Dashboard** link in the navbar.

Any other email that signs up gets the `client` role.

---

## 5 · Deploy to Vercel

1. Push this repo to GitHub.
2. Go to https://vercel.com → **New Project** → import the repo.
3. Framework preset auto-detects Next.js.
4. **Environment Variables**: paste every key from `.env.local`.
5. Deploy.
6. In Supabase: **Authentication → URL Configuration** → set **Site URL** to your Vercel URL. Add both `http://localhost:3000` and the production URL under **Redirect URLs**.

Every push to `main` auto-deploys. Every PR gets a preview URL.

---

## 6 · CI (GitHub Actions)

A basic pipeline runs typecheck + build on every push. Create `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy
          NEXT_PUBLIC_R2_PUBLIC_URL: https://pub-dummy.r2.dev
```

---

## Project structure

```
laser-estate/
├─ supabase/
│  ├─ migrations/0001_init.sql   ← schema, RLS, triggers
│  └─ seed.sql                    ← sample data
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx               ← global shell (Fraunces + Inter)
│  │  ├─ page.tsx                 ← home
│  │  ├─ properties/
│  │  │  ├─ page.tsx              ← browse + filters
│  │  │  └─ [slug]/page.tsx       ← detail (gallery, map, inquiry)
│  │  ├─ admin/                   ← realtor dashboard
│  │  ├─ login/                   ← auth
│  │  ├─ about/  contact/
│  │  └─ api/
│  │     ├─ views/route.ts        ← dedup view tracking
│  │     ├─ inquiries/route.ts    ← form submission + email
│  │     └─ upload-url/…          ← presigned R2 upload URLs (admin only)
│  ├─ components/                 ← Navbar, Footer, PropertyCard, Gallery, MapView, InquiryForm, …
│  ├─ lib/
│  │  ├─ supabase/                ← client, server, admin, types
│  │  ├─ r2.ts
│  │  ├─ constants.ts             ← BRAND, areas, property types
│  │  └─ utils.ts                 ← formatNaira, slugify, …
│  └─ middleware.ts               ← protects /admin
├─ tailwind.config.ts             ← charcoal + red + ivory palette
├─ next.config.js
└─ .env.example
```

---

## Design system

- **Palette**
  - `ink` charcoal `#141414` (primary text + brand)
  - `accent` red `#C8102E` (from the letterhead)
  - `ivory` warm cream `#FAF7F2` (background)
  - `gold` `#B8935A` (hairline dividers, subtle luxury accent)
- **Typography**
  - Headings: **Fraunces** (serif with soft-luxurious feel)
  - Body: **Inter** (crisp, professional)
  - `.eyebrow` utility for small-caps section labels

---

## What's intentionally out of scope for MVP

- Client sign-up + saved listings + saved-search alerts → **V2**
- AI features (listing description generator, natural-language search, amenity auto-tagging) → **V3**
- Total-cost-of-purchase and installment calculators → **V2**
- Payments / escrow → out of scope entirely

---

## Sources

- Realtor branding, address, and contacts extracted from the uploaded offer letter.
- Sample listings in `supabase/seed.sql` are fictional; replace with real inventory.
