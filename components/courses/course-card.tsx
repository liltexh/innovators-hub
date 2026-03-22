import { Sparkles, MapPin, Calendar } from "lucide-react";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Course } from "@/types/clientCourseTypes";

interface CourseCardProps {
  course: Course;
  enrolled?: boolean;
  progress?: number;
}

export function CourseCard({ course, enrolled, progress }: CourseCardProps) {
  const isWorkshopEnded =
    course.is_live_workshop &&
    course.workshop_details &&
    new Date(course.workshop_details.date) < new Date();

  return (
    <Link href={`/courses/${course.id}`}>
      <BrutalCard
        interactive
        className="h-full flex flex-col overflow-hidden p-0"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail || "/default-course-thumbnail.jpg"}
            alt={course.title}
            className="w-full h-full object-cover"
          />

          {/* Badges overlay */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            {course.is_ai_generated && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-foreground text-primary-foreground rounded">
                <Sparkles size={10} className="mr-1" />
                AI
              </span>
            )}
            {course.is_live_workshop && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded",
                  isWorkshopEnded
                    ? "bg-muted text-muted-foreground"
                    : "bg-[hsl(142,72%,45%)] text-primary-foreground"
                )}
              >
                {isWorkshopEnded ? "Ended" : "Live"}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold leading-tight line-clamp-2">
              {course.title}
            </h3>
          </div>

          <div className="mb-3">
            <LevelBadge level={course.level} />
          </div>

          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {course.description}
          </p>

          {/* Workshop Details */}
          {course.is_live_workshop && course.workshop_details && (
            <div className="space-y-1 mb-3 font-mono text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar size={12} />
                <span>
                  {course.workshop_details.date} at{" "}
                  {course.workshop_details.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={12} />
                <span className="truncate">
                  {course.workshop_details.location}
                </span>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-auto">
            {course.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Progress */}
          {enrolled && progress !== undefined && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="progress-brutal">
                <div
                  className="progress-brutal-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </BrutalCard>
    </Link>
  );
}
