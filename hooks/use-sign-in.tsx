"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export type SignInData = {
  email: string;
  password: string;
};

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signIn = async (data: SignInData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      // Success! Redirect to dashboard or home
      router.push("/");
      router.refresh(); // Ensures the layout updates to show logged-in state
    } catch (err: any) {
      setError(err.message || "Invalid login credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, error };
}
