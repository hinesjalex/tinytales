/**
 * Client-side image upload to Supabase Storage.
 *
 * Uploads base64 images directly from the browser to Supabase,
 * bypassing Vercel's 4.5MB API body size limit.
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BUCKET = "illustrations";

/**
 * Upload a single base64 image to Supabase Storage.
 * Returns the permanent public URL.
 *
 * @param {string} base64Data - base64 data URI (data:image/png;base64,...)
 * @param {string} path - storage path (e.g., "abc123/cover.png")
 * @returns {string|null} public URL or null on failure
 */
export async function uploadImage(base64Data, path) {
  if (!base64Data || !base64Data.startsWith("data:")) return null;

  try {
    // Extract the base64 content and mime type
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return null;

    const contentType = matches[1];
    const base64 = matches[2];

    // Convert base64 to Uint8Array
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error.message);
      return null;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error("Upload failed:", err.message);
    return null;
  }
}

/**
 * Upload all images for a book (cover + pages) to Supabase Storage.
 * Returns the book data with permanent URLs replacing base64 data.
 *
 * @param {string} shareId - unique book ID for storage paths
 * @param {string|null} coverImage - base64 cover image
 * @param {Array} pages - pages array with potential base64 imageUrl fields
 * @returns {object} { coverImageUrl, pages } with permanent URLs
 */
export async function uploadBookImages(shareId, coverImage, pages) {
  let coverImageUrl = null;

  // Upload cover image
  if (coverImage && coverImage.startsWith("data:")) {
    coverImageUrl = await uploadImage(coverImage, `${shareId}/cover.png`);
  } else if (coverImage) {
    // Already a URL (not base64)
    coverImageUrl = coverImage;
  }

  // Upload page images
  const updatedPages = [];
  for (const page of pages) {
    if (page.imageUrl && page.imageUrl.startsWith("data:")) {
      const ext = page.imageUrl.includes("image/jpeg") ? "jpg" : "png";
      const storedUrl = await uploadImage(
        page.imageUrl,
        `${shareId}/page-${page.pageNumber}.${ext}`
      );
      updatedPages.push({ ...page, imageUrl: storedUrl });
    } else {
      updatedPages.push(page);
    }
  }

  return { coverImageUrl, pages: updatedPages };
}
