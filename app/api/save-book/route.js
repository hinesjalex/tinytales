import { NextResponse } from "next/server";
import { saveBook } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, age, theme, title, pages } = body;

    if (!name || !title || !pages) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const shareId = nanoid(10);
    const pagesWithImages = pages.map((page) => ({ ...page, imageUrl: null }));

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
    console.error("Save book error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
