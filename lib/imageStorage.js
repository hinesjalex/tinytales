/**
 * Download generated images and persist in Supabase Storage.
 *
 * Handles both the character reference sheet and all page illustrations.
 * Temporary URLs (from fal.ai, OpenAI) are downloaded and stored permanently.
 */

import supabase from "./supabase";

const BUCKET = "illustrations";

/**
 * Store a single image in Supabase Storage.
 * Accepts a URL or base64 data URI.
 * Returns the permanent public URL.
 */
async function storeImage(imageData, path) {
  let buffer;

  if (imageData.startsWith("data:")) {
    const base64 = imageData.split(",")[1];
    buffer = Buffer.from(base64, "base64");
  } else {
    const res = await fetch(imageData);
    if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "image/png",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Store all illustrations for a book:
 *   - Character reference sheet
 *   - Each page illustration
 *
 * Returns permanent public URLs for everything.
 */
export async function storeBookIllustrations(
  referenceUrl,
  pageImages,
  shareId
) {
  // Store character reference
  let storedReferenceUrl = null;
  if (referenceUrl) {
    try {
      storedReferenceUrl = await storeImage(
        referenceUrl,
        `${shareId}/character-reference.png`
      );
    } catch (err) {
      console.error("Failed to store character reference:", err.message);
    }
  }

  // Store page illustrations sequentially (maintain order for debugging)
  const storedPages = [];
  for (const page of pageImages) {
    if (!page.imageUrl) {
      storedPages.push({ pageNumber: page.pageNumber, storedUrl: null });
      continue;
    }

    try {
      const storedUrl = await storeImage(
        page.imageUrl,
        `${shareId}/page-${page.pageNumber}.png`
      );
      storedPages.push({ pageNumber: page.pageNumber, storedUrl });
    } catch (err) {
      console.error(
        `Failed to store page ${page.pageNumber} image:`,
        err.message
      );
      storedPages.push({ pageNumber: page.pageNumber, storedUrl: null });
    }
  }

  return {
    referenceUrl: storedReferenceUrl,
    pageImages: storedPages,
  };
}
