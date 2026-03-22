import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type UserStatus = "IDLE" | "PENDING" | "SUCCESS" | "ERROR";

export interface UserPreference {
  id: string;
  user_id: string;

  onboarding_completed: boolean;

  skill_level: string;
  primary_goal: string;
  learning_style: string;
  weekly_hours: number;

  interests: string[];
  blockers: string[];
  languages: string[];

  created_at: string;
  updated_at: string;

  // 👇 fallback for any future / unmapped fields
  [key: string]: any;
}

interface UserState {
  userPreference: UserPreference | null;
  hasOnboarded: boolean;
  status: UserStatus;
  errorMessage: string | null;

  fetchUserPreference: (userId: string) => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userPreference: null,
  hasOnboarded: false,
  status: "IDLE",
  errorMessage: null,

  reset: () =>
    set({
      userPreference: null,
      hasOnboarded: false,
      status: "IDLE",
      errorMessage: null,
    }),

  fetchUserPreference: async (userId: string) => {
    set({ status: "PENDING", errorMessage: null });

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      // Ignore "no rows found"
      if (error && error.code !== "PGRST116") {
        throw error;
      }

      set({
        userPreference: data ?? null,
        hasOnboarded: data?.onboarding_completed === true,
        status: "SUCCESS",
      });
    } catch (error: any) {
      console.error("User preference fetch failed:", error);
      set({
        status: "ERROR",
        errorMessage: error.message || "Unknown error",
      });
    }
  },
}));
