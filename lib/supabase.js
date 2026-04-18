import { createClient } from "@supabase/supabase-js";

/**
 * Public Supabase client (anon key). Safe to use from the browser and for
 * public read queries. Writes go through lib/supabaseAdmin.js server-side.
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase;

export async function getBook(shareId) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("share_id", shareId)
    .single();

  if (error) return null;
  return data;
}
