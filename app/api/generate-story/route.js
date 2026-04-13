import { NextResponse } from "next/server";
import { generate } from "@/lib/ai";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";

// Basic in-memory rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 20; // more generous since text is cheap

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
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
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
