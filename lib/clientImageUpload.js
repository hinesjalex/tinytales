/**
 * Client-side helper for persisting a book's images into Supabase Storage.
 *
 * Sends each image to /api/upload-image, which re-hosts it server-side.
 * Accepts three input shapes per image:
 *   - base64 data URI (parent-uploaded files)          → uploaded as imageData
 *   - external https URL (e.g. fal.ai generated image) → re-hosted via sourceUrl
 *   - already-on-Supabase URL                          → passed through unchanged
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

function isAlreadyOnSupabase(url) {
  return !!SUPABASE_URL && typeof url === "string" && url.startsWith(SUPABASE_URL);
}

async function uploadImage(urlOrData, path) {
  if (!urlOrData) return null;

  const body = urlOrData.startsWith("data:")
    ? { imageData: urlOrData, path }
    : { sourceUrl: urlOrData, path };

  try {
    const res = await fetch("/api/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Upload error:", err);
      return null;
    }

    const { url } = await res.json();
    return url;
  } catch (err) {
    console.error("Upload failed:", err.message);
    return null;
  }
}

export async function uploadBookImages(shareId, coverImage, pages) {
  let coverImageUrl = null;
  if (coverImage) {
    coverImageUrl = isAlreadyOnSupabase(coverImage)
      ? coverImage
      : await uploadImage(coverImage, `${shareId}/cover.png`);
  }

  const updatedPages = [];
  for (const page of pages) {
    if (page.imageUrl && !isAlreadyOnSupabase(page.imageUrl)) {
      const ext = page.imageUrl.startsWith("data:image/jpeg") ? "jpg" : "png";
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
