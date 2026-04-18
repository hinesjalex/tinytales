import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key.
 * Bypasses RLS — never import this from client code.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail fast at import time so misconfigured deploys surface a clear error
// in Vercel logs instead of a downstream RLS violation that looks like a
// bug in the policies.
if (!url) {
  throw new Error("[supabaseAdmin] NEXT_PUBLIC_SUPABASE_URL is not set.");
}
if (!serviceKey) {
  throw new Error(
    "[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY is not set. Without it, " +
      "server writes fall through to anon and trip RLS. Check Vercel " +
      "Project Settings → Environment Variables (Production scope), " +
      "then redeploy so the new env is picked up."
  );
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export default supabaseAdmin;

export async function saveBook({ shareId, name, age, theme, title, pages, coverImageUrl }) {
  const { error } = await supabaseAdmin.from("books").insert({
    share_id: shareId,
    child_name: name,
    child_age: age,
    theme,
    title,
    pages,
    cover_image_url: coverImageUrl || null,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
  return shareId;
}
