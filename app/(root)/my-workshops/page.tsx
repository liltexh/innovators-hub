"use client";
import { useEffect } from "react";
import { useCourseStore } from "@/stores/courseStore";
import { Layout } from "@/components/layout/layout";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { Video, Users, ArrowRight, Calendar, MapPin } from "lucide-react";
import { useAuthStore } from "@/stores/authstore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MyWorkshopsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { fetchAllCourses, allCourses, status } = useCourseStore();

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  const isLoading = status === "IDLE" || status === "PENDING";

  // Only live workshops created by this user
  const myWorkshops = allCourses.filter(
    (c) => c.is_live_workshop && c.creator_id === user?.id
  );

  const now = new Date();

  const upcoming = myWorkshops
    .filter((w) => w.workshop_details && new Date(w.workshop_details.date) >= now)
    .sort((a, b) =>
      new Date(a.workshop_details!.date).getTime() - new Date(b.workshop_details!.date).getTime()
    );

  const past = myWorkshops
    .filter((w) => w.workshop_details && new Date(w.workshop_details.date) < now)
    .sort((a, b) =>
      new Date(b.workshop_details!.date).getTime() - new Date(a.workshop_details!.date).getTime()
    );

  return (
    <Layout>
      {/* Header */}
      <BrutalCard className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-foreground text-primary-foreground rounded-lg flex items-center justify-center">
            <Video size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">My Workshops</h1>
            <p className="text-muted-foreground text-sm">
              Manage your live workshops and view registrations
            </p>
          </div>
        </div>
      </BrutalCard>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="loading-brutal h-28 rounded-xl" />)}
        </div>
      ) : myWorkshops.length === 0 ? (
        <BrutalCard className="text-center py-16">
          <Video size={40} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-1">No workshops yet</p>
          <p className="text-muted-foreground text-sm mb-5">
            Create your first live workshop to get started
          </p>
          <BrutalButton variant="primary" onClick={() => router.push("/create-course")}>
            Create Workshop
          </BrutalButton>
        </BrutalCard>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-muted-foreground" />
                Upcoming
              </h2>
              <div className="space-y-3">
                {upcoming.map((course) => (
                  <WorkshopRow
                    key={course.id}
                    course={course}
                    onManage={() => router.push(`/my-workshops/${course.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
                Past Workshops
              </h2>
              <div className="space-y-3 opacity-70">
                {past.map((course) => (
                  <WorkshopRow
                    key={course.id}
                    course={course}
                    onManage={() => router.push(`/my-workshops/${course.id}`)}
                    past
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </Layout>
  );
}

// ── Workshop row card ───────────────────────────────────────────────
function WorkshopRow({
  course,
  onManage,
  past = false,
}: {
  course: any;
  onManage: () => void;
  past?: boolean;
}) {
  return (
    <BrutalCard className={cn("flex flex-col sm:flex-row sm:items-center gap-4", past && "opacity-90")}>
      {/* Thumbnail */}
      <div className="sm:w-24 h-16 rounded-md overflow-hidden border border-border flex-shrink-0">
        <img
          src={course.thumbnail ?? "/file.svg"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate mb-1">{course.title}</h3>
        {course.workshop_details && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {course.workshop_details.date} at {course.workshop_details.time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {course.workshop_details.location}
            </span>
          </div>
        )}
      </div>

      {/* Action */}
      <BrutalButton
        variant={past ? "secondary" : "primary"}
        onClick={onManage}
        className="sm:ml-auto flex items-center gap-2 whitespace-nowrap"
      >
        <Users size={14} />
        Manage Roster
        <ArrowRight size={14} />
      </BrutalButton>
    </BrutalCard>
  );
}
