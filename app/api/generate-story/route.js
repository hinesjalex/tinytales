import { NextResponse } from "next/server";
import { generate } from "@/lib/ai";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { checkLimit, getClientIp } from "@/lib/rateLimit";

const RATE = { max: 20, windowMs: 60 * 60 * 1000 };

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (!checkLimit(`story:${ip}`, RATE)) {
      return NextResponse.json(
        { error: "Too many stories generated. Please try again later." },
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
    if (!customStory || typeof customStory !== "string" || customStory.length > 500) {
      return NextResponse.json(
        { error: "Story description required (max 500 chars)" },
        { status: 400 }
      );
    }

    const safeName = name.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "").trim();
    if (!safeName) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    // Generate story text
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

    if (!story.title || !Array.isArray(story.pages) || story.pages.length < 5) {
      return NextResponse.json(
        { error: "Story generation produced invalid output. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      title: story.title,
      pages: story.pages,
      childName: safeName,
    });
  } catch (err) {
    console.error("Story generation error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
