"use client";
import { TrendingUp } from "lucide-react";
import { useEnrollments } from "@/hooks/useCourses";
import { Layout } from "@/components/layout/layout";
import { CourseCard } from "@/components/courses/course-card";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { useAuthStore } from "@/stores/authstore";
import { useCourseStore } from "@/stores/courseStore";
import CourseLoading from "@/components/loading/course-loading";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

  const { enrollments } = useEnrollments(user?.id || null);
  const allCourses = useCourseStore((state) => state.allCourses);
  const courseStatus = useCourseStore((state) => state.status);

  if (courseStatus === "IDLE" || courseStatus === "PENDING") {
    return <CourseLoading />;
  }
  return (
    <Layout>
      {/* Welcome Section */}
      <BrutalCard className="mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Continue your learning journey
            </p>
          </div>
        </div>
      </BrutalCard>

      {/* Creator Content Section */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp size={18} className="text-muted-foreground" />
          <h2 className="text-lg font-semibold">From Creators</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCourses.map((course) => {
            const enrollment = enrollments.find(
              (e) => e.course_id === course.id
            );
            return (
              <CourseCard
                key={course.id}
                course={course}
                enrolled={!!enrollment}
                progress={enrollment?.progress}
              />
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
