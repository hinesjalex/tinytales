import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

const BUCKET = "illustrations";

export async function POST(request) {
  try {
    const body = await request.json();
    const { imageData, path } = body;

    if (!imageData || !path) {
      return NextResponse.json({ error: "Missing imageData or path" }, { status: 400 });
    }

    // Extract base64 content
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: "Invalid image data format" }, { status: 400 });
    }

    const contentType = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from(base64, "base64");

    // Check size (Vercel limit is ~4.5MB for request body, but the base64 is larger than the binary)
    if (buffer.length > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 4MB)" }, { status: 400 });
    }

    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
