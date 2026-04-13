import { NextResponse } from "next/server";
import { generatePageIllustration } from "@/lib/images";
import { storeBookIllustrations } from "@/lib/imageStorage";
import { saveBook } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, age, theme, title, pages, referenceUrl, coverUrl } = body;

    if (!name || !title || !pages || !referenceUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const shareId = nanoid(10);

    // Generate illustrations for remaining pages with chain-anchoring
    const pageImages = [{ pageNumber: 1, imageUrl: coverUrl }];
    let previousPageUrl = coverUrl;

    for (let i = 1; i < pages.length; i++) {
      const page = pages[i];
      try {
        const imageUrl = await generatePageIllustration({
          referenceUrl,
          previousPageUrl,
          illustrationHint: page.illustrationHint,
          characterName: name,
          pageNumber: page.pageNumber,
          isCover: false,
        });
        pageImages.push({ pageNumber: page.pageNumber, imageUrl });
        if (imageUrl) previousPageUrl = imageUrl;
      } catch (err) {
        console.error(`Failed page ${page.pageNumber}:`, err.message);
        pageImages.push({ pageNumber: page.pageNumber, imageUrl: null });
      }
    }

    // Store all images permanently
    const stored = await storeBookIllustrations(referenceUrl, pageImages, shareId);

    // Merge stored URLs into pages
    const pagesWithImages = pages.map((page) => {
      const img = stored.pageImages.find((s) => s.pageNumber === page.pageNumber);
      return { ...page, imageUrl: img?.storedUrl || null };
    });

    // Save to database
    await saveBook({
      shareId,
      name,
      age,
      theme: theme || "custom",
      title,
      pages: pagesWithImages,
    });

    return NextResponse.json({
      shareId,
      title,
      pages: pagesWithImages,
      childName: name,
    });
  } catch (err) {
    console.error("Illustration generation error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
