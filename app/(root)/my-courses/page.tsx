"use client";
import { useEffect } from "react";
import { useCourseStore } from "@/stores/courseStore";
import { Layout } from "@/components/layout/layout";
import { CourseCard } from "@/components/courses/course-card";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { GraduationCap, BookMarked } from "lucide-react";
import { useAuthStore } from "@/stores/authstore";

export default function MyCoursesPage() {
  const user = useAuthStore((state) => state.user);
  const { fetchUserCourses, userCourses, userEnrollments, status } =
    useCourseStore();

  useEffect(() => {
    if (user?.id) {
      fetchUserCourses(user.id);
    }
  }, [user?.id, fetchUserCourses]);

  const isLoading = status === "IDLE" || status === "PENDING";

  // Helper: find the enrollment row for a given course id
  const getEnrollment = (courseId: string) =>
    userEnrollments.find((e) => e.course_id === courseId);

  const inProgress = userCourses.filter(
    (c) => (getEnrollment(c.id)?.progress ?? 0) < 100
  );

  const completed = userCourses.filter(
    (c) => (getEnrollment(c.id)?.progress ?? 0) === 100
  );

  return (
    <Layout>
      {/* Header */}
      <BrutalCard className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-foreground text-primary-foreground rounded-lg flex items-center justify-center">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">My Courses</h1>
            <p className="text-muted-foreground text-sm">
              Track your learning progress
            </p>
          </div>
        </div>
      </BrutalCard>

      {/* Loading skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="loading-brutal aspect-[4/3]" />
          ))}
        </div>
      ) : userCourses.length === 0 ? (
        /* Empty state */
        <BrutalCard className="text-center py-16">
          <BookMarked size={40} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-1">No courses yet</p>
          <p className="text-muted-foreground text-sm">
            Start learning by browsing our courses
          </p>
        </BrutalCard>
      ) : (
        <>
          {/* In Progress */}
          {inProgress.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold mb-5">In Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {inProgress.map((course) => {
                  const enrollment = getEnrollment(course.id);
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrolled
                      progress={enrollment?.progress}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-5">Completed</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {completed.map((course) => {
                  const enrollment = getEnrollment(course.id);
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrolled
                      progress={enrollment?.progress}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </Layout>
  );
}
