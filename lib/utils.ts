import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";


// Define the shape of the expected return object
export interface UserProfile {
  email: string;
  full_name: string;
  avatar_url?: string | null;
  level?: string | null;
  department?: string | null;
}

/**
 * helps in merching tailwind class with conditions.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fetches a user's profile details from the 'profiles' table.
 * Returns null if the user isn't found or an error occurs.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("email, full_name, avatar_url, level, department")
      .eq("id", userId)
      .single(); // .single() ensures we return an object instead of an array

    // Error boundary: Handle Supabase-specific errors (e.g., row not found)
    if (error) {
      console.error(`Supabase error fetching profile for ${userId}:`, error.message);
      return null;
    }

    // Return the data cast to our expected type
    return data as UserProfile;

  } catch (err) {
    // Error boundary: Handle unexpected network or runtime errors
    console.error(`Unexpected error fetching profile for ${userId}:`, err);
    return null;
  }
}
