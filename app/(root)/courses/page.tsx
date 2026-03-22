"use client";
import { useCourses, useEnrollments } from "@/hooks/useCourses";
import { Layout } from "@/components/layout/layout";
import { CourseCard } from "@/components/courses/course-card";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BookOpen, Search } from "lucide-react";
import { useState } from "react";
import { BrutalInput } from "@/components/ui/BrutalInput";
import { BrutalTag } from "@/components/ui/BrutalTag";
import { useAuthStore } from "@/stores/authstore";
import { useCourseStore } from "@/stores/courseStore";
import CourseLoading from "@/components/loading/course-loading";

const levels = [
  "all",
  "amateur",
  "beginner",
  "intermediate",
  "professional",
] as const;

export default function CoursesPage() {
  const user = useAuthStore((state) => state.user);
  const { enrollments } = useEnrollments(user?.id || null);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] =
    useState<(typeof levels)[number]>("all");
  const allCourses = useCourseStore((state) => state.allCourses);
  const courseStatus = useCourseStore((state) => state.status);

  const filteredCourses = allCourses?.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.tags !== null &&
        course.tags.some((t) =>
          t.toLowerCase().includes(search.toLowerCase())
        ));
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (courseStatus === "IDLE" || courseStatus === "PENDING") {
    return <CourseLoading />;
  }

  return (
    <Layout>
      {/* Header */}
      <BrutalCard className="mb-8">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-foreground text-primary-foreground rounded-lg flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Browse Courses</h1>
            <p className="text-muted-foreground text-sm">
              Find your next learning adventure
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <BrutalInput
            placeholder="Search courses or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Level Filter */}
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => (
            <BrutalTag
              key={level}
              interactive
              selected={levelFilter === level}
              onClick={() => setLevelFilter(level)}
            >
              {level === "all" ? "All Levels" : level}
            </BrutalTag>
          ))}
        </div>
      </BrutalCard>

      {/* Results */}
      {filteredCourses.length === 0 ? (
        <BrutalCard className="text-center py-16">
          <p className="text-lg font-semibold mb-1">No courses found</p>
          <p className="text-muted-foreground text-sm">
            Try adjusting your search or filters
          </p>
        </BrutalCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
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
      )}
    </Layout>
  );
}
