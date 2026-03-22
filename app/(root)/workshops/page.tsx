"use client";
import { useEffect } from "react";
import { useCourseStore } from "@/stores/courseStore";
import { Layout } from "@/components/layout/layout";
import { CourseCard } from "@/components/courses/course-card";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { Video, Calendar, Clock } from "lucide-react";

export default function WorkshopsPage() {
  const { fetchAllCourses, allCourses, status } = useCourseStore();

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  const isLoading = status === "IDLE" || status === "PENDING";

  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // All live-workshop courses
  const workshops = allCourses.filter((c) => c.is_live_workshop);

  // Upcoming: workshop date is today or in the future — sorted soonest first
  const upcomingWorkshops = workshops
    .filter((w) => {
      if (!w.workshop_details) return false;
      return new Date(w.workshop_details.date) >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.workshop_details!.date).getTime() -
        new Date(b.workshop_details!.date).getTime()
    );

  // Past: ended within the last month — sorted most-recent first
  const pastWorkshops = workshops
    .filter((w) => {
      if (!w.workshop_details) return false;
      const date = new Date(w.workshop_details.date);
      return date < now && date >= oneMonthAgo;
    })
    .sort(
      (a, b) =>
        new Date(b.workshop_details!.date).getTime() -
        new Date(a.workshop_details!.date).getTime()
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
            <h1 className="text-xl md:text-2xl font-bold">Live Workshops</h1>
            <p className="text-muted-foreground text-sm">
              In-person learning with expert instructors
            </p>
          </div>
        </div>
      </BrutalCard>

      {/* Upcoming Workshops */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
          <Calendar size={18} className="text-muted-foreground" />
          Upcoming Workshops
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="loading-brutal aspect-[4/3]" />
            ))}
          </div>
        ) : upcomingWorkshops.length === 0 ? (
          <BrutalCard className="text-center py-12">
            <p className="font-semibold">No upcoming workshops</p>
            <p className="text-muted-foreground text-sm">
              Check back later for new sessions
            </p>
          </BrutalCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingWorkshops.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Past Workshops (within the last month) */}
      {!isLoading && pastWorkshops.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-5 text-muted-foreground flex items-center gap-2">
            <Clock size={18} />
            Recently Ended
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
            {pastWorkshops.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
