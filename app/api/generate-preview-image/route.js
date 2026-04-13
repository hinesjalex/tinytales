import { NextResponse } from "next/server";
import { generateCharacterReference, generatePageIllustration } from "@/lib/images";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, age, coverIllustrationHint } = body;

    if (!name || !age || !coverIllustrationHint) {
      return NextResponse.json(
        { error: "Name, age, and cover illustration hint are required" },
        { status: 400 }
      );
    }

    // Step 1: Generate character reference
    const referenceUrl = await generateCharacterReference({ name, age });

    // Step 2: Generate cover illustration using that reference
    const coverUrl = await generatePageIllustration({
      referenceUrl,
      previousPageUrl: null,
      illustrationHint: coverIllustrationHint,
      characterName: name,
      pageNumber: 1,
      isCover: true,
    });

    return NextResponse.json({
      referenceUrl,
      coverUrl,
    });
  } catch (err) {
    console.error("Preview image error:", err);
    return NextResponse.json(
      { error: "Image generation failed. Please try again." },
      { status: 500 }
    );
  }
}
