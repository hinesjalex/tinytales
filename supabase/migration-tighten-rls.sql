-- Run in Supabase SQL Editor.
-- Drops the permissive anon insert/update policies so only the server
-- (using SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS) can write books
-- and upload illustrations. Public reads stay public.

-- ---- books table ----
drop policy if exists "API can insert books" on public.books;

-- Keep this: /book/[id] SSR reads use the anon client.
-- create policy "Books are publicly readable"
--   on public.books for select using (true);

-- ---- illustrations storage bucket ----
drop policy if exists "API can upload illustrations" on storage.objects;
drop policy if exists "Anyone can upload illustrations" on storage.objects;
drop policy if exists "Anyone can update illustrations" on storage.objects;

-- Keep this: <img src=...> and /book/[id] render public URLs.
-- create policy "Illustrations are publicly readable"
--   on storage.objects for select using (bucket_id = 'illustrations');
