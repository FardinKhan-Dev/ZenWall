import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getUserProfile } from '@/lib/auth';

interface AuthState {
  user: User | null;
  credits: number;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setCredits: (credits: number) => void;
  deductCredit: () => void;
  initialize: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  credits: 0,
  isLoading: true,
  isHydrated: false,

  setUser: (user) => set({ user }),
  setCredits: (credits) => set({ credits }),
  deductCredit: () => set((state) => ({ credits: Math.max(0, state.credits - 1) })),
  reset: () => set({ user: null, credits: 0, isLoading: false }),

  /**
   * Initializes the auth state on app load.
   * - Gets the current session from Supabase
   * - Fetches the user's credit balance
   * - Listens for auth state changes (sign in / sign out)
   */
  initialize: async () => {
    set({ isLoading: true });

    // 1. Get initial session
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      set({ user: session.user });
      try {
        const profile = await getUserProfile(session.user.id);
        set({ credits: profile.credits ?? 0 });
      } catch {
        set({ credits: 0 });
      }
    }

    set({ isLoading: false, isHydrated: true });

    // 2. Listen for future auth changes (sign in, sign out, token refresh)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ user: session.user });
        try {
          const profile = await getUserProfile(session.user.id);
          set({ credits: profile.credits ?? 0 });
        } catch {
          set({ credits: 0 });
        }
      } else {
        get().reset();
      }
    });
  },
}));
