# TinyTales

Personalized AI-generated storybooks where your child is the hero.

## Quick Start

```bash
# Install dependencies
npm install

# Copy env and fill in your keys
cp .env.example .env.local

# Set up Supabase
# 1. Create a project at supabase.com
# 2. Run supabase/schema.sql in the SQL Editor
# 3. Copy project URL and anon key into .env.local

# Run dev server
npm run dev
```

## Architecture

```
app/
  page.js              → Landing + full funnel (client component)
  layout.js            → Root layout with meta tags
  api/generate/route.js → Story generation endpoint
  book/[id]/page.js    → Shareable book page (SSR + OG tags)

components/
  NameGate.js          → Name input (step 0)
  SampleBook.js        → Personalized sample story (the hook)
  Onboarding.js        → Age + theme selection (steps 1-2)
  GeneratingScreen.js  → Progress UI while API works
  BookReaderClient.js  → Book reader + share actions

lib/
  ai.js                → Model-agnostic AI layer (Anthropic/OpenAI/Google)
  prompts.js           → Story generation prompts + page count config
  supabase.js          → Database client + book CRUD
```

## AI Provider

Set `AI_PROVIDER` in `.env.local` to switch models:

- `anthropic` → Claude (default)
- `openai` → GPT-4o
- `google` → Gemini

Each provider needs its own API key. The abstraction layer normalizes responses.

## Deploy

See **DEPLOY.md** for the full step-by-step guide.

**Important:** Sequential illustration generation takes 60-90s.
Vercel free tier has a 60s function timeout. You'll need Vercel Pro ($20/mo)
for the 300s timeout, or reduce page counts to fit within 60s.

```bash
npx vercel
```

Set environment variables in Vercel dashboard. Done.

## V1 Scope

- [x] Name-first hook with personalized sample
- [x] Age + theme onboarding (2 steps)
- [x] AI story generation (model-agnostic)
- [x] Book reader with page-by-page navigation
- [x] Shareable book links with OG meta tags
- [x] Rate limiting (10 books/hour/IP)
- [x] Input validation + name sanitization
- [ ] Pre-made illustration assets (in progress)
- [ ] Privacy policy page
- [ ] Analytics

## Not in V1

- Photo upload (COPPA — deferred to V2)
- Accounts / auth
- Payment
- Voice narration
- Print-on-demand
- Multiple illustration styles
