import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { checkLimit, getClientIp } from "@/lib/rateLimit";

const BUCKET = "illustrations";
const RATE = { max: 200, windowMs: 60 * 60 * 1000 };
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = /^image\/(png|jpeg|jpg|webp)$/i;

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (!checkLimit(`upload:${ip}`, RATE)) {
      return NextResponse.json(
        { error: "Too many uploads. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { imageData, sourceUrl, path } = body;

    if (!path || (!imageData && !sourceUrl)) {
      return NextResponse.json({ error: "Missing imageData/sourceUrl or path" }, { status: 400 });
    }

    if (typeof path !== "string" || !/^[a-zA-Z0-9_\-/.]+$/.test(path) || path.includes("..")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    let buffer;
    let contentType;

    if (imageData) {
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: "Invalid image data format" }, { status: 400 });
      }
      contentType = matches[1];
      if (!ALLOWED_MIME.test(contentType)) {
        return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
      }
      buffer = Buffer.from(matches[2], "base64");
    } else {
      if (typeof sourceUrl !== "string" || !/^https:\/\//i.test(sourceUrl)) {
        return NextResponse.json({ error: "sourceUrl must be https" }, { status: 400 });
      }
      const res = await fetch(sourceUrl);
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch source image (${res.status})` },
          { status: 502 }
        );
      }
      contentType = (res.headers.get("content-type") || "image/png").split(";")[0].trim();
      if (!ALLOWED_MIME.test(contentType)) {
        return NextResponse.json({ error: `Unsupported image type: ${contentType}` }, { status: 400 });
      }
      const arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large (max 4MB)" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      console.error("Supabase storage error:", {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
      });
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
