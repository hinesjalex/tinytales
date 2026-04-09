import { NextResponse } from "next/server";
import { generate } from "@/lib/ai";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { generateBookIllustrations } from "@/lib/images";
import { storeBookIllustrations } from "@/lib/imageStorage";
import { saveBook } from "@/lib/supabase";
import { nanoid } from "nanoid";

// Basic in-memory rate limiting (per-IP, resets on deploy)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // 10 books per hour per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { windowStart: now, count: 1 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

export async function POST(request) {
  try {
    // Rate limit
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many books generated. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, age, theme, customStory } = body;

    // Validate
    if (!name || typeof name !== "string" || name.length > 30) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (!age || age < 2 || age > 9) {
      return NextResponse.json({ error: "Invalid age" }, { status: 400 });
    }
    if (
      !customStory ||
      typeof customStory !== "string" ||
      customStory.length > 500
    ) {
      return NextResponse.json(
        { error: "Story description required (max 500 chars)" },
        { status: 400 }
      );
    }

    // Sanitize name
    const safeName = name.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "").trim();
    if (!safeName) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const shareId = nanoid(10);

    // --- Step 1: Generate story text ---
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
      name: safeName,
      age,
      theme: theme || "custom",
      customStory: customStory.slice(0, 500),
    });

    const raw = await generate(systemPrompt, userPrompt);

    const cleaned = raw.replace(/```json\s*|```\s*/g, "").trim();
    let story;
    try {
      story = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse story JSON:", cleaned.slice(0, 200));
      return NextResponse.json(
        { error: "Story generation failed. Please try again." },
        { status: 500 }
      );
    }

    if (
      !story.title ||
      !Array.isArray(story.pages) ||
      story.pages.length < 5
    ) {
      return NextResponse.json(
        {
          error:
            "Story generation produced invalid output. Please try again.",
        },
        { status: 500 }
      );
    }

    // --- Step 2: Generate illustrations (sequential, character-consistent) ---
    let pagesWithImages = story.pages;

    try {
      const { referenceUrl, pageImages } = await generateBookIllustrations({
        name: safeName,
        age,
        pages: story.pages,
      });

      // Store all images (reference + pages) in Supabase Storage
      const stored = await storeBookIllustrations(
        referenceUrl,
        pageImages,
        shareId
      );

      // Merge permanent URLs into pages
      pagesWithImages = story.pages.map((page) => {
        const img = stored.pageImages.find(
          (s) => s.pageNumber === page.pageNumber
        );
        return {
          ...page,
          imageUrl: img?.storedUrl || null,
        };
      });

      // Store reference URL in book metadata
      pagesWithImages._characterReferenceUrl = stored.referenceUrl;
    } catch (imgErr) {
      console.error(
        "Image generation error (continuing without images):",
        imgErr
      );
      pagesWithImages = story.pages.map((page) => ({
        ...page,
        imageUrl: null,
      }));
    }

    // --- Step 3: Save to database ---
    const pagesToStore = Array.isArray(pagesWithImages)
      ? pagesWithImages
      : story.pages;

    await saveBook({
      shareId,
      name: safeName,
      age,
      theme: theme || "custom",
      title: story.title,
      pages: pagesToStore,
    });

    return NextResponse.json({
      shareId,
      title: story.title,
      pages: pagesToStore,
      childName: safeName,
    });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
