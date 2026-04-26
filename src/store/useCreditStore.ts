import { create } from "zustand";

interface CreditState {
  credits: number;
  setCredits: (credits: number) => void;
  deductCredit: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useCreditStore = create<CreditState>((set) => ({
  credits: 0,
  setCredits: (credits) => set({ credits }),
  deductCredit: () => set((state) => ({ credits: Math.max(0, state.credits - 1) })),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
