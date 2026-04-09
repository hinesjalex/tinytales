# TinyTales — Deploy Guide

Everything you need to go from download to live URL.

---

## Step 1: Supabase (database + image storage)

1. Go to **supabase.com** → Create a free account → New Project
2. Name it `tinytales`, pick a region close to your users, set a DB password
3. Once the project is ready, go to **SQL Editor** (left sidebar)
4. Paste the entire contents of `supabase/schema.sql` and click **Run**
   - This creates the `books` table and the `illustrations` storage bucket
5. Go to **Settings → API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public key` → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 2: AI keys

### Text generation (pick one):

**Anthropic (recommended):**
1. Go to **console.anthropic.com** → Create account → API Keys
2. Create a new key → copy it
3. This is your `ANTHROPIC_API_KEY`

**OpenAI (alternative):**
1. Go to **platform.openai.com** → API Keys → Create
2. This is your `OPENAI_API_KEY`
3. Set `AI_PROVIDER=openai` in your env

### Image generation (pick one):

**fal.ai + Nano Banana 2 (recommended):**
1. Go to **fal.ai** → Create account → Dashboard → Keys
2. Create a new key → copy it
3. This is your `FAL_KEY`
4. Set `IMAGE_PROVIDER=nanobanana` in your env

**OpenAI Images (alternative):**
1. Same key as text generation above
2. Set `IMAGE_PROVIDER=openai` in your env

---

## Step 3: Deploy to Vercel

### Option A: CLI (fastest)

```bash
# Install Vercel CLI if you don't have it
npm i -g vercel

# From the tinytales directory
cd tinytales
npm install
vercel

# Follow the prompts:
#   - Set up and deploy? Y
#   - Which scope? (your account)
#   - Link to existing project? N
#   - Project name: tinytales
#   - Directory: ./
#   - Override settings? N
```

### Option B: GitHub (recommended for ongoing)

1. Create a new GitHub repo called `tinytales`
2. Push the code:
```bash
cd tinytales
git init
git add .
git commit -m "TinyTales v1"
git remote add origin https://github.com/YOUR_USERNAME/tinytales.git
git push -u origin main
```
3. Go to **vercel.com** → New Project → Import from GitHub
4. Select the `tinytales` repo → Deploy

### Set environment variables:

In the Vercel dashboard → Your project → Settings → Environment Variables

Add each of these:

| Variable | Value |
|---|---|
| `AI_PROVIDER` | `anthropic` |
| `ANTHROPIC_API_KEY` | your key |
| `IMAGE_PROVIDER` | `nanobanana` |
| `FAL_KEY` | your key |
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |

Then redeploy: **Deployments → three dots → Redeploy**

---

## Step 4: Custom domain (optional)

1. In Vercel dashboard → Your project → Settings → Domains
2. Add your domain (e.g. `tinytales.app`)
3. Vercel will show you DNS records to add at your registrar
4. Once DNS propagates (~5 min), HTTPS is automatic

---

## Step 5: Verify

1. Visit your URL
2. Enter a child's name
3. Tap through the sample book
4. Go through onboarding (age + story)
5. Wait for generation (~60-90s)
6. Read the book
7. Tap "Send to family" and verify the share link works
8. Open the share link in an incognito window — check OG preview

---

## Troubleshooting

**"Story generation failed"**
→ Check your AI_PROVIDER and API key are set correctly in Vercel env vars
→ Check Vercel function logs: Dashboard → Deployments → Functions tab

**Images not showing**
→ Check FAL_KEY is set
→ Check Supabase Storage bucket `illustrations` exists and is public
→ Check Vercel function logs for image generation errors

**Share links show 404**
→ Check Supabase table `books` has data (Table Editor in Supabase dashboard)
→ Check NEXT_PUBLIC_SUPABASE_URL and key are correct

**Generation times out**
→ The Vercel function has a 300s (5 min) max duration set in vercel.json
→ If using Vercel free tier, max is 60s — upgrade to Pro ($20/mo) for 300s
→ Alternatively, reduce page count in lib/prompts.js to speed up generation

**Rate limit hit**
→ Default is 10 books/hour/IP — adjust in app/api/generate/route.js
