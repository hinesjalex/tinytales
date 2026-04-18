import { NextResponse } from "next/server";
import { saveBook } from "@/lib/supabaseAdmin";
import { checkLimit, getClientIp } from "@/lib/rateLimit";
import { nanoid } from "nanoid";

const RATE = { max: 20, windowMs: 60 * 60 * 1000 };

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (!checkLimit(`save:${ip}`, RATE)) {
      return NextResponse.json(
        { error: "Too many books saved. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, age, theme, title, pages, coverImageUrl } = body;

    if (!name || typeof name !== "string" || name.length > 30) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (!title || typeof title !== "string" || title.length > 200) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    if (!Array.isArray(pages) || pages.length === 0 || pages.length > 30) {
      return NextResponse.json({ error: "Invalid pages" }, { status: 400 });
    }

    const safeName = name.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "").trim();
    if (!safeName) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const shareId = nanoid(10);

    await saveBook({
      shareId,
      name: safeName,
      age: Number.isFinite(age) && age >= 2 && age <= 9 ? age : 5,
      theme: theme || "custom",
      title,
      pages,
      coverImageUrl: coverImageUrl || null,
    });

    return NextResponse.json({
      shareId,
      title,
      pages,
      childName: safeName,
    });
  } catch (err) {
    console.error("Save book error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
