# TinyTales — Project Context

> Orientation doc for new contributors (human or AI). Captures what the product is, what's actually built today, and what to tackle next.

## Product

Personalized children's storybooks where the kid is the hero. Parent enters a child's name, optionally describes a story, reviews/edits pages (text + optional AI-generated or uploaded illustration), previews the book, and gets a shareable link. Landing copy also promises a printed hardcover — **not yet built**.

**Primary surfaces**
- `/` — marketing landing (sample mini-book, "how it works", stats, CTA).
- `/create` — the full funnel, from name entry through finish.
- `/book/[id]` — SSR shareable book view with OG meta tags.
- `/privacy` — privacy policy copy.

## Stack

- **Framework:** Next.js 14 App Router, plain JavaScript (no TypeScript), Tailwind CSS.
- **DB + storage:** Supabase — single `books` table (JSONB `pages` column, `cover_image_url`) and public-read `illustrations` storage bucket.
- **Text AI:** provider-agnostic layer in [lib/ai.js](lib/ai.js). Adapters for Anthropic (default), OpenAI, Google. Env toggle via `AI_PROVIDER`.
- **Image AI:** provider-agnostic layer in [lib/images.js](lib/images.js). Adapters for fal.ai "Nano Banana 2" (default) and OpenAI Images. Pipeline generates a character turnaround sheet once per book, then chain-anchors each page against the reference + previous page to preserve character identity.
- **Writes:** all server-side via [lib/supabaseAdmin.js](lib/supabaseAdmin.js) using `SUPABASE_SERVICE_ROLE_KEY`. RLS is locked — the anon client can only read.
- **Rate limiting:** shared module [lib/rateLimit.js](lib/rateLimit.js) applied to every generate/write route. Best-effort in-memory per serverless instance.
- **Hosting:** Vercel. Per-route `maxDuration` configured in [vercel.json](vercel.json) (image route is 180s — requires Pro).

## Key files

- [app/create/page.js](app/create/page.js) — client component that owns the entire funnel: `SetupScreen` → `StartModePicker` → `AIStoryGenerator` → `BookEditor` (incl. `PageEditor`, `BulkPasteBar`, cover) → `BookPreview` → `FinishScreen`. The editor now has working **Generate** buttons per page and on the cover; they call `/api/generate-page-image` and cache the character reference in state.
- [app/page.js](app/page.js) — landing page.
- [app/book/[id]/page.js](app/book/[id]/page.js) — SSR reader; resolves book by `share_id`, renders [components/BookReaderClient.js](components/BookReaderClient.js).
- [app/api/generate-story/route.js](app/api/generate-story/route.js) — story text generation, rate-limited.
- [app/api/generate-page-image/route.js](app/api/generate-page-image/route.js) — per-page illustration. Lazily creates the character reference on first call, returns it so the client can reuse it for subsequent pages.
- [app/api/save-book/route.js](app/api/save-book/route.js) — server-side insert using service-role client, rate-limited, with input validation.
- [app/api/upload-image/route.js](app/api/upload-image/route.js) — base64 → Supabase Storage proxy, service-role, path/content-type validated, 4 MB cap, rate-limited.
- [lib/ai.js](lib/ai.js), [lib/images.js](lib/images.js), [lib/prompts.js](lib/prompts.js), [lib/rateLimit.js](lib/rateLimit.js), [lib/supabaseAdmin.js](lib/supabaseAdmin.js), [lib/supabase.js](lib/supabase.js) (read-only browser client), [lib/clientImageUpload.js](lib/clientImageUpload.js).
- [supabase/schema.sql](supabase/schema.sql) — base setup (public-read only). [supabase/migration-tighten-rls.sql](supabase/migration-tighten-rls.sql) — drops the old permissive insert policies; run once on any environment that was set up before this change.

## Risks / rough edges still open

1. **In-memory rate limiting on serverless** ([lib/rateLimit.js](lib/rateLimit.js)) is per-instance — Vercel scales out, so effective limits are higher than configured. Swap for Upstash / Vercel KV when it matters.
2. **Images shuttle through base64 data URIs** in React state and request bodies on save. Fine at small page counts near the 4 MB cap; may choke on mobile for a 20-page book full of uploads. Consider direct-to-storage signed-URL uploads.
3. **Print/hardcover is marketing-only.** Landing promises "$39.99 per printed book" and "hold a hardcover", FinishScreen says "Print hardcover — coming soon". No fulfillment backend exists.
4. **No analytics, no error reporting** — only `console.error`.
5. **Cover Generate doesn't auto-suggest a hint** from the story's title/opening page. Today it starts empty; users can type anything.

## Next priorities

1. **Decide the print story.** Either ship a POD integration (Lulu / Blurb / Gelato) so the CTA resolves, or remove the price + hardcover claims from landing and FinishScreen until it exists. Today the funnel dead-ends at "share a link" while marketing promises a physical book.
2. **Reduce base64 data-URI dependency.** Move page-image uploads to direct-to-storage (Supabase signed upload URLs), so the Finish step doesn't push the full book's images through `/api/upload-image` one-by-one. Also unlocks larger / higher-res uploads.
3. **Add analytics + error reporting.** Vercel Analytics + Sentry or PostHog, plus a `/api/*` error channel. Today a failed image generation surfaces only in the user's inline error state.

## Env vars (from `.env.example`)

```
AI_PROVIDER=anthropic | openai | google
ANTHROPIC_API_KEY / ANTHROPIC_MODEL (default claude-sonnet-4-20250514)
OPENAI_API_KEY / OPENAI_MODEL / OPENAI_IMAGE_MODEL
GOOGLE_API_KEY / GOOGLE_MODEL

IMAGE_PROVIDER=nanobanana | openai
IMAGE_RESOLUTION=1K
FAL_KEY (required for nanobanana)

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # server-only — DO NOT prefix with NEXT_PUBLIC_
```

Deploy steps are in [DEPLOY.md](DEPLOY.md). `SUPABASE_SERVICE_ROLE_KEY` must be set in Vercel as a **plain** (non-public) env var.
