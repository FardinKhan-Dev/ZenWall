import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getUserProfile, ensureProfile } from "@/lib/auth";

export interface Wallpaper {
  id: string;
  prompt: string;
  image_url: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  profile: { first_name?: string; last_name?: string } | null;
  credits: number;
  isLoading: boolean;
  isHydrated: boolean;
  wallpapers: Wallpaper[];

  // Actions
  setUser: (user: User | null) => void;
  setCredits: (credits: number) => void;
  setWallpapers: (wallpapers: Wallpaper[]) => void;
  addWallpaper: (wallpaper: Wallpaper) => void;
  deleteWallpaperFromStore: (id: string) => void;
  deductCredit: () => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  reset: () => void;
}

/**
 * Loads the profile for a session user.
 * If the profile doesn't exist (account deleted from DB while JWT is still valid),
 * signs the user out automatically to clear the stale session.
 */
async function syncProfile(userId: string, email: string) {
  let profile = await getUserProfile(userId);

  if (!profile) {
    // Try to create the profile (handles pre-trigger signups)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const meta = user?.user_metadata;
    await ensureProfile(userId, email, meta?.first_name, meta?.last_name);
    profile = await getUserProfile(userId);
  }

  // Profile still missing after ensureProfile → account was deleted from DB
  // Sign out to clear the stale JWT from localStorage
  if (!profile) {
    await supabase.auth.signOut();
    return null;
  }

  return profile;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  credits: 0,
  wallpapers: [],
  isLoading: true,
  isHydrated: false,

  setUser: (user) => set({ user }),
  setCredits: (credits) => set({ credits }),
  setWallpapers: (wallpapers) => set({ wallpapers }),
  addWallpaper: (wallpaper) => set((state) => ({ wallpapers: [wallpaper, ...state.wallpapers] })),
  deleteWallpaperFromStore: (id) =>
    set((state) => ({ wallpapers: state.wallpapers.filter((w) => w.id !== id) })),
  deductCredit: () => set((state) => ({ credits: Math.max(0, state.credits - 1) })),
  reset: () =>
    set({
      user: null,
      profile: null,
      credits: 0,
      wallpapers: [],
      isLoading: false,
      isHydrated: true,
    }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, credits: 0 });
  },

  /**
   * Initializes the auth state on app load.
   * - Gets the current session from Supabase
   * - Fetches the user's credit balance
   * - Auto-signs out if the account was deleted from the DB
   * - Listens for future auth state changes
   */
  initialize: async () => {
    set({ isLoading: true });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const profile = await syncProfile(session.user.id, session.user.email ?? "");
      if (profile) {
        set({
          user: session.user,
          profile: { first_name: profile.first_name, last_name: profile.last_name },
          credits: profile.credits ?? 0,
        });
      }
      // If profile is null, syncProfile already called signOut —
      // the onAuthStateChange listener below will call reset()
    }

    set({ isLoading: false, isHydrated: true });

    // Listen for future auth changes (sign in, sign out, token refresh)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        get().reset();
        return;
      }

      if (session?.user) {
        const profile = await syncProfile(session.user.id, session.user.email ?? "");
        if (profile) {
          set({
            user: session.user,
            profile: { first_name: profile.first_name, last_name: profile.last_name },
            credits: profile.credits ?? 0,
          });
        }
      } else {
        get().reset();
      }
    });
  },
}));
