# TinyTales

Personalized AI-generated storybooks where your child is the hero.

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in the keys
# Run supabase/schema.sql in the Supabase SQL Editor (one-time).
npm run dev
```

See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for a full orientation (product, architecture, risks, priorities) and [DEPLOY.md](DEPLOY.md) for Vercel deploy steps.

## Architecture

```
app/
  page.js                          → landing page
  create/page.js                   → the full funnel (all screens in one client component)
  book/[id]/page.js                → shareable book page (SSR + OG meta)
  privacy/page.js                  → privacy policy
  api/
    generate-story/route.js        → model-agnostic story text generation
    generate-page-image/route.js   → per-page illustration (lazy char reference + chain anchor)
    save-book/route.js             → server-side book insert (service role)
    upload-image/route.js          → base64 → Supabase Storage (service role)

components/
  BookReaderClient.js              → page-by-page reader used on /book/[id]

lib/
  ai.js                            → AI text adapters (Anthropic | OpenAI | Google)
  images.js                        → image adapters (fal.ai Nano Banana 2 | OpenAI)
  prompts.js                       → story prompts, page count tiers by age
  supabase.js                      → browser (anon) client + public read helpers
  supabaseAdmin.js                 → server-only client using SUPABASE_SERVICE_ROLE_KEY
  rateLimit.js                     → shared in-memory IP rate limiter
  clientImageUpload.js             → browser helper that POSTs to /api/upload-image
```

## Providers

**Text** — `AI_PROVIDER=anthropic | openai | google` (see `lib/ai.js`). Each provider needs its own API key; the layer normalizes the response to raw text.

**Images** — `IMAGE_PROVIDER=nanobanana | openai` (see `lib/images.js`). The pipeline generates a three-angle character turnaround sheet once per book, then chain-anchors every page against that sheet and the previous page's output to keep the child visually consistent.

## Data & writes

- Single Supabase table `books` with a JSONB `pages` column (one row per shared book).
- Supabase Storage bucket `illustrations` is public-read.
- All writes (book rows, image uploads) go through server routes using `SUPABASE_SERVICE_ROLE_KEY`. Anon clients only ever read.
- Rate limiting is best-effort in-memory per-instance via `lib/rateLimit.js`; for a hard ceiling, move to Upstash / Vercel KV.

## Deploy

```bash
npx vercel
```

Set every variable from `.env.example` in Vercel's dashboard (critically: `SUPABASE_SERVICE_ROLE_KEY` — server-only, not `NEXT_PUBLIC_*`). Image generation on a full book can take 2–3 minutes; `vercel.json` sets `maxDuration: 180` on the image route, which requires Vercel Pro. See [DEPLOY.md](DEPLOY.md) for the full walkthrough.

## V1 Scope

- [x] Landing page with sample mini-book
- [x] Name → mode picker (AI assist vs. blank editor)
- [x] AI story generation (model-agnostic)
- [x] Per-page manual editing: text, upload, AI-generated illustration
- [x] Cover upload or AI generation
- [x] Character-consistent illustrations (reference sheet + chain anchoring)
- [x] Shareable `/book/[id]` with OG tags
- [x] Server-side writes with service role; public reads only
- [x] IP rate limiting on every generate/write route
- [x] Input validation + name sanitization
- [x] Privacy policy page

## Not in V1

- Photo upload (COPPA — deferred)
- Accounts / auth
- Payment
- Voice narration
- Print-on-demand / hardcover fulfillment
- Multiple illustration styles
