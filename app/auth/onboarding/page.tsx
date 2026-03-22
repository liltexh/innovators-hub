"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalTag } from "@/components/ui/BrutalTag";
import { cn } from "@/lib/utils";

import { useOnboarding, OnboardingData } from "@/hooks/use-onboarding";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authstore";

/* ------------------------------------------------------------------ */
/* DATA OPTIONS */
/* ------------------------------------------------------------------ */

const programmingLanguages = [
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "TypeScript",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "C#",
];

const learningInterests = [
  "Web Development",
  "Mobile Apps",
  "Data Science",
  "Machine Learning",
  "Game Development",
  "Cybersecurity",
  "Blockchain",
  "UI/UX Design",
];

const goals = [
  "Get Hired",
  "Build a Startup",
  "Freelancing",
  "Academic/Research",
  "Just for Fun",
  "Career Switch",
];

const frictionBlockers = [
  "Procrastination",
  "Lack of Time",
  "No Clear Path",
  "Tutorial Hell",
  "Imposter Syndrome",
  "Financial Constraints",
  "Lack of Community",
];

const weeklyHoursOptions = [
  { label: "Casual (2–5 hrs)", value: 5 },
  { label: "Part-time (10–15 hrs)", value: 15 },
  { label: "Dedicated (20+ hrs)", value: 20 },
  { label: "Full-time (40+ hrs)", value: 40 },
];

const experienceLevels = [
  "amateur",
  "beginner",
  "intermediate",
  "professional",
] as const;

type ExperienceLevel = (typeof experienceLevels)[number];

type Step =
  | "tech_status"
  | "experience_level"
  | "languages"
  | "interests"
  | "goal"
  | "blockers"
  | "hours"
  | "style";

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export default function OnboardingSurveyPage() {
  const router = useRouter();

  const { user } = useAuthStore();
  const { hasOnboarded, status: userStatus } = useUserStore();
  const { submitPreferences, isSubmitting } = useOnboarding();

  /* ------------------------------------------------------------------ */
  /* REDIRECT IF ALREADY ONBOARDED */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (userStatus === "SUCCESS" && hasOnboarded) {
      router.replace("/");
    }
  }, [userStatus, hasOnboarded, router]);

  /* ------------------------------------------------------------------ */
  /* STATE */
  /* ------------------------------------------------------------------ */

  const [step, setStep] = useState<Step>("tech_status");

  const [techStatus, setTechStatus] = useState<"new" | "experienced" | null>(
    null
  );

  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel | null>(null);

  const [languages, setLanguages] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [hours, setHours] = useState<number | null>(null);
  const [style, setStyle] = useState<"self-paced" | "teacher-led" | null>(null);

  /* ------------------------------------------------------------------ */
  /* HELPERS */
  /* ------------------------------------------------------------------ */

  const toggleSelection = (
    item: string,
    list: string[],
    setter: (val: string[]) => void
  ) => {
    setter(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  };

  const stepsOrder: Step[] =
    techStatus === "experienced"
      ? [
          "tech_status",
          "experience_level",
          "languages",
          "goal",
          "blockers",
          "hours",
          "style",
        ]
      : ["tech_status", "interests", "goal", "blockers", "hours", "style"];

  const getStepNumber = () => stepsOrder.indexOf(step) + 1;
  const getTotalSteps = () => stepsOrder.length;

  /* ------------------------------------------------------------------ */
  /* NAVIGATION */
  /* ------------------------------------------------------------------ */

  const goNext = () => {
    const idx = stepsOrder.indexOf(step);
    setStep(stepsOrder[idx + 1]);
  };

  const goBack = () => {
    const idx = stepsOrder.indexOf(step);
    setStep(stepsOrder[idx - 1]);
  };

  const canProceed = () => {
    switch (step) {
      case "tech_status":
        return techStatus !== null;
      case "experience_level":
        return experienceLevel !== null;
      case "languages":
        return languages.length > 0;
      case "interests":
        return interests.length > 0;
      case "goal":
        return goal !== null;
      case "hours":
        return hours !== null;
      case "style":
        return style !== null;
      default:
        return true;
    }
  };

  /* ------------------------------------------------------------------ */
  /* SUBMIT */
  /* ------------------------------------------------------------------ */

  const handleComplete = async () => {
    if (!user || !goal || !style || !hours || !techStatus) return;

    const payload: OnboardingData = {
      skill_level: techStatus === "new" ? "amateur" : experienceLevel!,
      primary_goal: goal,
      learning_style: style,
      weekly_hours: hours,
      interests,
      languages,
      blockers,
    };

    await submitPreferences(user.id, payload);
  };

  /* ------------------------------------------------------------------ */
  /* LOADING STATE */
  /* ------------------------------------------------------------------ */

  if (userStatus === "PENDING" || userStatus === "IDLE") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <BrutalCard className="w-full max-w-2xl p-8">
        {/* Progress */}
        <div className="flex justify-between mb-8">
          <span className="font-mono text-sm">
            Step {getStepNumber()} of {getTotalSteps()}
          </span>
          <div className="flex gap-2">
            {Array.from({ length: getTotalSteps() }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-8 h-1.5 rounded",
                  i < getStepNumber() ? "bg-foreground" : "bg-border"
                )}
              />
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-wrap gap-2 mb-8">
          {step === "tech_status" && (
            <>
              <BrutalTag
                interactive
                selected={techStatus === "new"}
                onClick={() => {
                  setTechStatus("new");
                  setExperienceLevel("amateur");
                }}
              >
                I'm New to Tech
              </BrutalTag>
              <BrutalTag
                interactive
                selected={techStatus === "experienced"}
                onClick={() => {
                  setTechStatus("experienced");
                  setExperienceLevel(null);
                }}
              >
                I Have Experience
              </BrutalTag>
            </>
          )}

          {step === "experience_level" &&
            experienceLevels.map((lvl) => (
              <BrutalTag
                key={lvl}
                interactive
                selected={experienceLevel === lvl}
                onClick={() => setExperienceLevel(lvl)}
                className="capitalize"
              >
                {lvl}
              </BrutalTag>
            ))}

          {step === "languages" &&
            programmingLanguages.map((l) => (
              <BrutalTag
                key={l}
                interactive
                selected={languages.includes(l)}
                onClick={() => toggleSelection(l, languages, setLanguages)}
              >
                {l}
              </BrutalTag>
            ))}

          {step === "interests" &&
            learningInterests.map((i) => (
              <BrutalTag
                key={i}
                interactive
                selected={interests.includes(i)}
                onClick={() => toggleSelection(i, interests, setInterests)}
              >
                {i}
              </BrutalTag>
            ))}

          {step === "goal" &&
            goals.map((g) => (
              <BrutalTag
                key={g}
                interactive
                selected={goal === g}
                onClick={() => setGoal(g)}
              >
                {g}
              </BrutalTag>
            ))}

          {step === "blockers" &&
            frictionBlockers.map((b) => (
              <BrutalTag
                key={b}
                interactive
                selected={blockers.includes(b)}
                onClick={() => toggleSelection(b, blockers, setBlockers)}
              >
                {b}
              </BrutalTag>
            ))}

          {step === "hours" &&
            weeklyHoursOptions.map((h) => (
              <BrutalTag
                key={h.label}
                interactive
                selected={hours === h.value}
                onClick={() => setHours(h.value)}
              >
                {h.label}
              </BrutalTag>
            ))}

          {step === "style" && (
            <>
              <BrutalTag
                interactive
                selected={style === "self-paced"}
                onClick={() => setStyle("self-paced")}
              >
                Self-Paced
              </BrutalTag>
              <BrutalTag
                interactive
                selected={style === "teacher-led"}
                onClick={() => setStyle("teacher-led")}
              >
                Teacher-Led
              </BrutalTag>
            </>
          )}
        </div>

        {/* NAV */}
        <div className="flex justify-between">
          {step !== "tech_status" ? (
            <BrutalButton
              variant="ghost"
              onClick={goBack}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} className="mr-2" /> Back
            </BrutalButton>
          ) : (
            <div />
          )}

          {step === "style" ? (
            <BrutalButton
              variant="primary"
              onClick={handleComplete}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Complete"}
              {!isSubmitting && <Check size={16} className="ml-2" />}
            </BrutalButton>
          ) : (
            <BrutalButton
              variant="primary"
              onClick={goNext}
              disabled={!canProceed()}
            >
              Next <ArrowRight size={16} className="ml-2" />
            </BrutalButton>
          )}
        </div>
      </BrutalCard>
    </div>
  );
}
