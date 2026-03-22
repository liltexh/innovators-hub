"use client";
import { Layout } from "@/components/layout/layout";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalTag } from "@/components/ui/BrutalTag";
import { User, Mail, Settings, Repeat } from "lucide-react";
import { useAuthStore } from "@/stores/authstore";
import { useUserStore } from "@/stores/userStore";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const userPreference = useUserStore((state) => state.userPreference);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  return (
    <Layout>
      {/* Profile Header */}
      <BrutalCard className="mb-6">
        <div className="flex flex-col md:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 bg-foreground text-primary-foreground rounded-lg flex items-center justify-center">
            <User size={36} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* <h1 className="text-2xl font-bold">{user.name}</h1> */}
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-mono rounded ${
                  user.role === "creator"
                    ? "bg-foreground text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                {user.user_metadata?.role === "creator" ? "Creator" : "Learner"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
              <Mail size={14} />
              <span>{user.email}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <BrutalButton
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-destructive hover:text-destructive"
              >
                Logout
              </BrutalButton>
            </div>
          </div>
        </div>
      </BrutalCard>

      {/* Preferences */}
      <BrutalCard>
        <div className="flex items-center gap-3 mb-5">
          <Settings size={18} className="text-muted-foreground" />
          <h2 className="text-lg font-semibold">Learning Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="font-mono text-xs text-muted-foreground mb-2">
              Tech Status
            </p>
            <BrutalTag>{userPreference?.skill_level || "Not Set"}</BrutalTag>
          </div>

          <div>
            <p className="font-mono text-xs text-muted-foreground mb-2">
              Learning Style
            </p>
            <BrutalTag>{userPreference?.learning_style || "Not Set"}</BrutalTag>
          </div>

          <div>
            <p className="font-mono text-xs text-muted-foreground mb-2">
              Languages
            </p>
            <div className="flex flex-wrap gap-1.5">
              {userPreference?.languages.length ? (
                userPreference.languages.map((lang) => (
                  <BrutalTag key={lang}>{lang}</BrutalTag>
                ))
              ) : (
                <BrutalTag>no language</BrutalTag>
              )}
            </div>
          </div>

          <div>
            <p className="font-mono text-xs text-muted-foreground mb-2">
              Interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {userPreference?.interests.length ? (
                userPreference.interests.map((interest) => (
                  <BrutalTag key={interest}>{interest}</BrutalTag>
                ))
              ) : (
                <BrutalTag>no interests</BrutalTag>
              )}
            </div>
          </div>
        </div>
      </BrutalCard>
    </Layout>
  );
}
