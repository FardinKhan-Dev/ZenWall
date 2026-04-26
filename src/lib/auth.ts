import { supabase } from "./supabase";

/**
 * Sign up a new user with email & password.
 * The Supabase trigger will automatically create a profile
 * and grant 5 free credits on signup.
 */
export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Sign in an existing user with email & password.
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Sign in with Google OAuth.
 * Redirects the user to Google and back to /dashboard on success.
 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) throw error;
}

/**
 * Sign out the current user and clear their session.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Fetch the current logged-in user's profile including their credit balance.
 * Returns null if the profile row doesn't exist yet (e.g., before trigger runs).
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, credits, first_name, last_name, created_at")
    .eq("id", userId)
    .single();

  // PGRST116 = row not found — not a crash-worthy error
  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

/**
 * Creates a profile row manually for users who signed up before the trigger.
 * Safe to call multiple times — uses ON CONFLICT DO NOTHING.
 */
export async function ensureProfile(
  userId: string,
  email: string,
  firstName?: string,
  lastName?: string
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      credits: 5,
      first_name: firstName,
      last_name: lastName,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  if (error) console.error("ensureProfile error:", error.message);
}
