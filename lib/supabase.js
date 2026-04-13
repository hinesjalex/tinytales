import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase;

/**
 * Save a generated book. Returns the share ID.
 */
export async function saveBook({ shareId, name, age, theme, title, pages }) {
  const { error } = await supabase.from("books").insert({
    share_id: shareId,
    child_name: name,
    child_age: age,
    theme,
    title,
    pages, // JSONB column
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
  return shareId;
}

/**
 * Fetch a book by share ID.
 */
export async function getBook(shareId) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("share_id", shareId)
    .single();

  if (error) return null;
  return data;
}
