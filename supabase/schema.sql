-- Run this in Supabase SQL Editor to set up the books table

create table if not exists public.books (
  id bigint generated always as identity primary key,
  share_id text unique not null,
  child_name text not null,
  child_age smallint not null,
  theme text not null,
  title text not null,
  pages jsonb not null,
  created_at timestamptz default now()
);

-- Index for share link lookups
create index if not exists idx_books_share_id on public.books (share_id);

-- Enable Row Level Security (public read, no public write)
alter table public.books enable row level security;

-- Anyone can read books (for shared links)
create policy "Books are publicly readable"
  on public.books for select
  using (true);

-- Only the API (service role or anon with insert) can create books
create policy "API can insert books"
  on public.books for insert
  with check (true);

-- ============================================
-- Storage: Create bucket for illustrations
-- Run this separately in the SQL Editor or
-- create the bucket manually in the Supabase
-- Storage dashboard with these settings:
--   Name: illustrations
--   Public: true
--   File size limit: 5MB
--   Allowed MIME types: image/png, image/jpeg, image/webp
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'illustrations',
  'illustrations',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Allow public read access to illustrations
create policy "Illustrations are publicly readable"
  on storage.objects for select
  using (bucket_id = 'illustrations');

-- Allow API to upload illustrations
create policy "API can upload illustrations"
  on storage.objects for insert
  with check (bucket_id = 'illustrations');
