/**
 * Client-side image upload via our API proxy.
 *
 * Sends base64 images to /api/upload-image, which uploads
 * to Supabase Storage server-side. Avoids CORS issues.
 */

/**
 * Upload a single base64 image via our API.
 * Returns the permanent public URL.
 */
async function uploadImage(base64Data, path) {
  if (!base64Data || !base64Data.startsWith("data:")) return null;

  try {
    const res = await fetch("/api/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData: base64Data, path }),
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

/**
 * Upload all images for a book (cover + pages).
 * Returns the book data with permanent URLs replacing base64 data.
 */
export async function uploadBookImages(shareId, coverImage, pages) {
  let coverImageUrl = null;

  // Upload cover image
  if (coverImage && coverImage.startsWith("data:")) {
    coverImageUrl = await uploadImage(coverImage, `${shareId}/cover.png`);
  } else if (coverImage) {
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
