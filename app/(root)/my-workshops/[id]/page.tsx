"use client";
import { useEffect, useState } from "react";
import { useCourseStore } from "@/stores/courseStore";
import { Layout } from "@/components/layout/layout";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { WorkshopRegistration } from "@/types/clientCourseTypes";
import {
  ArrowLeft, Users, Check, X, Calendar,
  MapPin, Clock, MessageSquare, BookOpen, UserCheck,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase"; // adjust path as needed
import { getUserProfile, type UserProfile } from "@/lib/utils";

export default function WorkshopRosterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    fetchCourseById, fetchWorkshopRoster, updateRegistration,
    currentCourse, workshopRoster, status, workshopStatus,
  } = useCourseStore();

  // Local remark drafts per registration id
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [savingRemark, setSavingRemark] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchCourseById(id);
    fetchWorkshopRoster(id);
  }, [id]);

  // Seed remark drafts from fetched roster
  useEffect(() => {
    const initial: Record<string, string> = {};
    workshopRoster.forEach((r) => {
      initial[r.id] = r.remark ?? "";
    });
    setRemarks(initial);
  }, [workshopRoster]);

  const handleToggleAttendance = async (reg: WorkshopRegistration) => {
    await updateRegistration(reg.id, { attended: !reg.attended });
  };

  const handleSaveRemark = async (reg: WorkshopRegistration) => {
    setSavingRemark(reg.id);
    await updateRegistration(reg.id, { remark: remarks[reg.id] ?? "" });
    setSavingRemark(null);
  };

  const isLoading =
    status === "IDLE" || status === "PENDING" ||
    workshopStatus === "PENDING";

  const course = currentCourse;
  const attendedCount = workshopRoster.filter((r) => r.attended).length;

  return (
    <Layout>
      {/* Back */}
      <button
        onClick={() => router.push("/my-workshops")}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        My Workshops
      </button>

      {/* Workshop header */}
      {course && (
        <BrutalCard className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-32 aspect-video rounded-md overflow-hidden border border-border flex-shrink-0">
              <img src={course.thumbnail ?? ""} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold mb-2">{course.title}</h1>
              {course.workshop_details && (
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {course.workshop_details.date} at {course.workshop_details.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {course.workshop_details.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    {course.workshop_details.location}
                  </span>
                </div>
              )}
            </div>
          </div>
        </BrutalCard>
      )}

      {/* Stats row */}
      {!isLoading && workshopRoster.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <StatCard icon={<Users size={18} />} label="Registered" value={workshopRoster.length} />
          <StatCard icon={<UserCheck size={18} />} label="Attended" value={attendedCount} />
          <StatCard
            icon={<BookOpen size={18} />}
            label="Notes Submitted"
            value={workshopRoster.filter((r) => r.student_note?.trim()).length}
            className="col-span-2 sm:col-span-1"
          />
        </div>
      )}

      {/* Roster heading */}
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          Registrations
          {!isLoading && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({workshopRoster.length})
            </span>
          )}
        </h2>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (<div key={i} className="loading-brutal h-48 rounded-xl" />))}
        </div>
      ) : workshopRoster.length === 0 ? (
        <BrutalCard className="text-center py-16">
          <Users size={36} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold">No registrations yet</p>
          <p className="text-muted-foreground text-sm">Students who register will appear here</p>
        </BrutalCard>
      ) : (
        <div className="space-y-4">
          {workshopRoster.map((reg, idx) => (
            <StudentCard
              key={reg.id}
              reg={reg}
              index={idx + 1}
              remarkDraft={remarks[reg.id] ?? ""}
              onRemarkChange={(val) => setRemarks((prev) => ({ ...prev, [reg.id]: val }))}
              onSaveRemark={() => handleSaveRemark(reg)}
              onToggleAttendance={() => handleToggleAttendance(reg)}
              savingRemark={savingRemark === reg.id}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, className,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <BrutalCard className={cn("flex items-center gap-3 py-4", className)}>
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </BrutalCard>
  );
}

// ── Student card ──────────────────────────────────────────────────────
function StudentCard({
  reg, index, remarkDraft, onRemarkChange, onSaveRemark, onToggleAttendance, savingRemark,
}: {
  reg: WorkshopRegistration;
  index: number;
  remarkDraft: string;
  onRemarkChange: (v: string) => void;
  onSaveRemark: () => void;
  onToggleAttendance: () => void;
  savingRemark: boolean;
}) {
  // 1. State for profile and loading status
  const [profile, setProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // 2. Fetch effect
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("email, full_name, avatar_url, level, department")
          .eq("id", reg.user_id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    if (reg.user_id) fetchProfile();
  }, [reg.user_id]);
  return (
    <BrutalCard className="space-y-4">
      {/* Student header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Avatar Swap: Actual Image -> Placeholder Index */}
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name ?? "Avatar"} 
              className="w-10 h-10 rounded-full object-cover border-2 border-foreground shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-bold flex-shrink-0">
              {index}
            </div>
          )}



          <div>
            {/* Name/Email Swap: Profile Name -> Loading State -> user_id fallback */}
            {loadingProfile ? (
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="flex flex-col">
                <p className="font-bold text-sm leading-tight">
                  {profile?.full_name || "Unknown Student"}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {profile?.email || reg.user_id}
                </p>
              </div>
            )}

            {/* Level/Dept Swap: Only shows if they exist */}
            {!loadingProfile && (profile?.level || profile?.department) && (
              <div className="flex gap-2 mt-1">
                {profile?.level && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary font-medium">
                    {profile.level}
                  </span>
                )}
                {profile?.department && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-secondary border border-border rounded text-muted-foreground">
                    {profile.department}
                  </span>
                )}
              </div>
            )}

            <p className="text-[10px] text-muted-foreground mt-1">
              Joined {new Date(reg.registered_at).toLocaleDateString()}
            </p>
          </div>
        </div>



        

        {/* Attendance toggle */}
        <button
          onClick={onToggleAttendance}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors border",
            reg.attended
              ? "bg-[hsl(142,72%,45%)] text-primary-foreground border-transparent"
              : "bg-card text-muted-foreground border-border hover:border-foreground"
          )}
        >
          {reg.attended ? <Check size={12} /> : <X size={12} />}
          {reg.attended ? "Attended" : "Mark Attended"}
        </button>
      </div>

      <div className="h-px bg-border" />

      {/* Student note (read-only for creator) */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
          <BookOpen size={13} />
          Student's Note
        </div>
        {reg.student_note?.trim() ? (
          <p className="text-sm bg-secondary rounded-md px-3 py-2.5 whitespace-pre-line">
            {reg.student_note}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No note submitted yet</p>
        )}
      </div>

      {/* Creator remark */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
          <MessageSquare size={13} />
          Your Remark
        </div>
        <textarea
          value={remarkDraft}
          onChange={(e) => onRemarkChange(e.target.value)}
          placeholder="Leave a remark for this student…"
          rows={3}
          className="w-full px-3 py-2.5 border border-border bg-secondary text-foreground text-sm rounded-md outline-none resize-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
        />
        <div className="flex justify-end mt-2">
          <BrutalButton
            variant="secondary"
            onClick={onSaveRemark}
            isLoading={savingRemark}
            className="text-xs"
          >
            Save Remark
          </BrutalButton>
        </div>
      </div>
    </BrutalCard>
  );
}
