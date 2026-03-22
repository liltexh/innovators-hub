// app/layout.tsx or pages/_app.tsx
"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authstore";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import { useCourseStore } from "@/stores/courseStore";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const {
    user,
    status: authStatus,
    checkUser,
    listenToAuthChanges,
  } = useAuthStore();
  // User Store
  const {
    status: userStatus,
    hasOnboarded,
    userPreference,
    fetchUserPreference,
    reset: resetUserStore,
  } = useUserStore();
  const fetchAllCourses = useCourseStore((state) => state.fetchAllCourses);

  const router = useRouter();

  // 1. Initialize Auth Listener on Mount
  useEffect(() => {
    checkUser();
    const unsubscribe = listenToAuthChanges();
    return () => unsubscribe();
  }, [checkUser, listenToAuthChanges]);

  // 2. Trigger User Profile Fetch ONLY when Auth is SUCCESS
  useEffect(() => {
    if (authStatus === "NO_USER") {
      resetUserStore(); // Clear user data if logged out
      router.push("/auth/login");
      return;
    }
    if (authStatus === "SUCCESS") {
      fetchUserPreference(user?.id!);
      fetchAllCourses();
    }
    console.log(user);
  }, [authStatus]);

  // 3. Trigger User Profile Fetch ONLY when Auth is SUCCESS
  useEffect(() => {
    if (authStatus !== "SUCCESS" || userStatus !== "SUCCESS" || !user) return;
    if (userStatus === "SUCCESS" && !hasOnboarded) {
      router.push("/auth/onboarding");
    } else {
      console.log(userPreference);
    }
  }, [userStatus]);

  return <>{children}</>;
}
