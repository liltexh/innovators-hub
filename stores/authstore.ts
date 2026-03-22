// stores/authStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type AuthStatus = "IDLE" | "PENDING" | "SUCCESS" | "NO_USER" | "ERROR";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;

  checkUser: () => Promise<void>;
  listenToAuthChanges: () => () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "IDLE",
  isAuthenticated: false,

  /**
   * Check current authenticated user (on app load / refresh)
   */
  checkUser: async () => {
    try {
      set({ status: "PENDING" });

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        set({
          user: null,
          isAuthenticated: false,
          status: "NO_USER",
        });
        return;
      }

      set({
        user: data.user,
        isAuthenticated: true,
        status: "SUCCESS",
      });
    } catch (err) {
      console.error("Auth check error:", err);
      set({
        user: null,
        isAuthenticated: false,
        status: "ERROR",
      });
    }
  },

  /**
   * Listen to Supabase auth state changes
   * Call once (e.g. in root layout)
   */
  listenToAuthChanges: () => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          set({
            user: session.user,
            isAuthenticated: true,
            status: "SUCCESS",
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            status: "NO_USER",
          });
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  },

  /**
   * Logout (optional convenience)
   */
  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      isAuthenticated: false,
      status: "NO_USER",
    });
  },
}));
