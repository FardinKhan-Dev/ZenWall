import { supabase } from './supabase';

/**
 * Sign up a new user with email & password.
 * The Supabase trigger will automatically create a profile
 * and grant 5 free credits on signup.
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
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
    provider: 'google',
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
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, credits, created_at')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
