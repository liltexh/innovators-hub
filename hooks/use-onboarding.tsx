import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

// Define the shape of the data the UI will collect
export interface OnboardingData {
  skill_level: string;
  primary_goal: string;
  learning_style: string;
  weekly_hours: number;
  interests: string[];
  languages: string[];
  blockers: string[];
}

export function useOnboarding() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Use the new action we defined in the userStore refactor
  const { fetchUserPreference } = useUserStore();

  /**
   * Now accepts userId as an argument to link the data to the correct user
   */
  const submitPreferences = async (userId: string, data: OnboardingData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!userId) throw new Error("User ID is missing");

      const { error: dbError } = await supabase.from("user_preferences").upsert(
        {
          user_id: userId, // Use the argument passed to the function
          skill_level: data.skill_level,
          primary_goal: data.primary_goal,
          learning_style: data.learning_style,
          weekly_hours: data.weekly_hours,
          interests: data.interests,
          languages: data.languages,
          blockers: data.blockers,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (dbError) throw dbError;

      // CRITICAL: Update the global store immediately.
      // This flips 'hasOnboarded' to true in the store, allowing the AuthGate
      // to let the user pass through to the dashboard.
      await fetchUserPreference(userId);

      // Redirect to dashboard
      router.push("/");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Failed to save preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitPreferences, isSubmitting, error };
}
