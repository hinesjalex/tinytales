import { NextResponse } from "next/server";
import {
  generateCharacterReference,
  generatePageIllustration,
} from "@/lib/images";
import { checkLimit, getClientIp } from "@/lib/rateLimit";

const RATE = { max: 30, windowMs: 60 * 60 * 1000 };

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (!checkLimit(`img:${ip}`, RATE)) {
      return NextResponse.json(
        { error: "Too many image generations. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      name,
      age,
      referenceUrl,
      previousPageUrl,
      illustrationHint,
      pageNumber,
      isCover,
      characterDescription,
    } = body;

    if (!name || typeof name !== "string" || name.length > 30) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (!illustrationHint || typeof illustrationHint !== "string") {
      return NextResponse.json(
        { error: "Describe what to draw first" },
        { status: 400 }
      );
    }
    if (illustrationHint.length > 600) {
      return NextResponse.json(
        { error: "Description too long (max 600 chars)" },
        { status: 400 }
      );
    }

    const safeName = name.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "").trim();
    if (!safeName) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    const safeAge = Number.isFinite(age) && age >= 2 && age <= 9 ? age : 5;

    const safeDescription =
      typeof characterDescription === "string"
        ? characterDescription.slice(0, 600).trim()
        : "";

    // Lazily create the character reference sheet on first call.
    let ref = referenceUrl && typeof referenceUrl === "string" ? referenceUrl : null;
    if (!ref) {
      ref = await generateCharacterReference({
        name: safeName,
        age: safeAge,
        description: safeDescription || undefined,
      });
    }

    const imageUrl = await generatePageIllustration({
      referenceUrl: ref,
      previousPageUrl: previousPageUrl || null,
      illustrationHint: illustrationHint.slice(0, 600),
      characterName: safeName,
      pageNumber: pageNumber || 1,
      isCover: !!isCover,
    });

    return NextResponse.json({ imageUrl, referenceUrl: ref });
  } catch (err) {
    console.error("Page image generation error:", err);
    return NextResponse.json(
      { error: "Image generation failed. Please try again." },
      { status: 500 }
    );
  }
}
