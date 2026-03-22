"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export type SignUpData = {
  role: "user" | "creator";
  fullName: string;
  email: string;
  password: string;

  // student-only
  level?: string;
  department?: string;
  matricNumber?: string;
};

export function useSignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
            // student-only metadata
            level: data.role === "user" ? data.level : null,
            department: data.role === "user" ? data.department : null,
            matric_number: data.role === "user" ? data.matricNumber : null,
          },
        },
      });

      if (authError) throw authError;

      router.push("/auth/onboarding");
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return { signUp, isLoading, error };
}
