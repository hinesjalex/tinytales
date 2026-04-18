import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key.
 * Bypasses RLS — never import this from client code.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "[supabaseAdmin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — writes will fail."
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
