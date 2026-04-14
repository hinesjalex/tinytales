-- Run this in Supabase SQL Editor to add cover image support
-- This is safe to run on an existing table

ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Also ensure the storage bucket allows upserts (needed for client-side uploads)
-- If you haven't already created the illustrations bucket, run this:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'illustrations',
  'illustrations',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Ensure public read access for illustrations
CREATE POLICY IF NOT EXISTS "Illustrations are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'illustrations');

-- Ensure API/client can upload illustrations
CREATE POLICY IF NOT EXISTS "Anyone can upload illustrations"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'illustrations');

-- Allow upserts (overwriting existing files)
CREATE POLICY IF NOT EXISTS "Anyone can update illustrations"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'illustrations');
