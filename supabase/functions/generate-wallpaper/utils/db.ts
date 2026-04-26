// @ts-expect-error - Deno specific import
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Atomically deducts 1 credit using the `deduct_credit` PostgreSQL RPC function.
 * The SQL function handles the `credits > 0` check in a single DB operation,
 * preventing race conditions entirely.
 *
 * Required SQL (already in supabase_setup.sql):
 * CREATE OR REPLACE FUNCTION public.deduct_credit(p_user_id UUID)
 * RETURNS INTEGER AS $$
 *   UPDATE public.profiles SET credits = credits - 1
 *   WHERE id = p_user_id AND credits > 0
 *   RETURNING credits;
 * $$ LANGUAGE SQL SECURITY DEFINER;
 *
 * @returns The remaining credit count after deduction
 */
export async function checkAndDeductCredits(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await supabase.rpc("deduct_credit", {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`Credit deduction failed: ${error.message}`);
  }

  // The RPC returns NULL if no row was updated (i.e., credits were already 0)
  if (data === null || data === undefined) {
    throw new Error("Insufficient credits.");
  }

  return data as number;
}

/**
 * Logs a successfully generated wallpaper to the history table.
 * Throws on failure so the caller can handle it appropriately.
 */
export async function logWallpaperHistory(
  supabase: SupabaseClient,
  userId: string,
  prompt: string,
  imageUrl: string
): Promise<void> {
  const { error } = await supabase
    .from("wallpapers")
    .insert({ user_id: userId, prompt, image_url: imageUrl });

  if (error) throw new Error(`Failed to log wallpaper history: ${error.message}`);
}

/**
 * Ensures the user isn't generating wallpapers too frequently.
 * Enforces a 10-second cooldown based on the wallpapers history.
 */
export async function checkRateLimit(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("wallpapers")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) return; // Fail open for rate limiting if DB check fails

  if (data && data.length > 0) {
    const lastTime = new Date(data[0].created_at).getTime();
    const now = Date.now();
    const diff = now - lastTime;

    if (diff < 10000) {
      // 10 seconds
      const wait = Math.ceil((10000 - diff) / 1000);
      throw new Error(`Please wait ${wait}s before generating again.`);
    }
  }
}
