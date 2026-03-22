"use client";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft, Play, Check, Sparkles, MapPin, Calendar,
  Clock, Lock, BookOpen,
} from "lucide-react";
import { useCourseStore } from "@/stores/courseStore";
import { Topic } from "@/types/clientCourseTypes";
import { Layout } from "@/components/layout/layout";
import { CoursePlayer } from "@/components/courses/course-player";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalTag } from "@/components/ui/BrutalTag";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    fetchCourseById, fetchCurrentEnrollment, enrollInCourse, markTopicComplete,
    fetchMyWorkshopRegistration, registerForWorkshop, updateStudentNote,
    currentCourse, currentEnrollment, workshopRegistration,
    status, enrollmentStatus, workshopStatus,
  } = useCourseStore();

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState("");

  const isWorkshop = currentCourse?.is_live_workshop ?? false;

  // On mount: load course + the right "am-I-registered" record
  useEffect(() => {
    if (!id) return;
    fetchCourseById(id).then(() => {
      const course = useCourseStore.getState().currentCourse;
      if (course?.is_live_workshop) {
        fetchMyWorkshopRegistration(id);
      }
      // Always fetch current enrollment so workshops can use mark complete via enrollment
      fetchCurrentEnrollment(id);
    });
  }, [id]);

  // Sync note textarea with fetched registration
  useEffect(() => {
    if (workshopRegistration?.student_note) {
      setNote(workshopRegistration.student_note);
    }
  }, [workshopRegistration?.student_note]);

  // Debounce note save on change
  const handleNoteChange = (value: string) => {
    setNote(value);
    if (!workshopRegistration) return;
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      updateStudentNote(workshopRegistration.id, value);
    }, 800);
  };

  const registered = !!workshopRegistration;
  const enrolled = !!currentEnrollment;
  const isLoading = status === "IDLE" || status === "PENDING";

  const isTopicCompleted = (topicId: string) =>
    currentEnrollment?.completed_topic_ids?.includes(topicId) ?? false;

  const handleCTA = async () => {
    setActionLoading(true);
    if (isWorkshop) {
      await registerForWorkshop(id);
    } 
    await enrollInCourse(id);
    setActionLoading(false);
  };

  const handleMarkComplete = async () => {
    if (!selectedTopic) return;
    await markTopicComplete(selectedTopic.id);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-brutal aspect-video max-w-2xl" />
      </Layout>
    );
  }

  if (status === "ERROR" || !currentCourse) {
    return (
      <Layout>
        <BrutalCard className="text-center py-16">
          <p className="text-lg font-semibold mb-4">Course not found</p>
          <BrutalButton onClick={() => router.push("/courses")}>Browse Courses</BrutalButton>
        </BrutalCard>
      </Layout>
    );
  }

  const course = currentCourse;
  const topics = course.topics ?? [];
  // For workshops: access is granted once registered; for courses: once enrolled
  const canAccessTopics = isWorkshop ? registered : enrolled;

  const isWorkshopEnded =
    course.is_live_workshop &&
    course.workshop_details &&
    new Date(course.workshop_details.date) < new Date();

  if (selectedTopic) {
    return (
      <Layout>
        <CoursePlayer
          topic={selectedTopic}
          isCompleted={isTopicCompleted(selectedTopic.id)}
          onMarkComplete={handleMarkComplete}
          onBack={() => setSelectedTopic(null)}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Course Header */}
      <BrutalCard className="mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3">
            <div className="aspect-video rounded-md overflow-hidden border border-border">
              <img src={course.thumbnail ?? ""} alt={course.title} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <LevelBadge level={course.level} />
              {course.is_ai_generated && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-foreground text-primary-foreground rounded">
                  <Sparkles size={10} className="mr-1" /> AI Generated
                </span>
              )}
              {course.is_live_workshop && (
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded",
                  isWorkshopEnded ? "bg-muted text-muted-foreground" : "bg-[hsl(142,72%,45%)] text-primary-foreground"
                )}>
                  {isWorkshopEnded ? "Workshop Ended" : "Live Workshop"}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-3">{course.title}</h1>
            <p className="text-muted-foreground text-sm mb-5">{course.description}</p>

            {/* Workshop details */}
            {course.is_live_workshop && course.workshop_details && (
              <div className="bg-secondary rounded-md p-4 mb-5 font-mono text-sm space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} />
                  <span>{course.workshop_details.date} at {course.workshop_details.time}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={14} />
                  <span>Duration: {course.workshop_details.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={14} />
                  <span>{course.workshop_details.location}</span>
                </div>
              </div>
            )}

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {course.tags.map((tag) => (
                  <BrutalTag key={tag} variant="muted">#{tag}</BrutalTag>
                ))}
              </div>
            )}

            {/* CTA / Status */}
            {isWorkshop ? (
              !registered ? (
                <BrutalButton
                  variant="primary"
                  onClick={handleCTA}
                  isLoading={actionLoading || workshopStatus === "PENDING"}
                >
                  Register for Workshop
                </BrutalButton>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-[hsl(142,72%,45%)] text-primary-foreground rounded">
                  <Check size={14} /> Registered
                </span>
              )
            ) : !enrolled ? (
              <BrutalButton
                variant="primary"
                onClick={handleCTA}
                isLoading={actionLoading || enrollmentStatus === "PENDING"}
              >
                Start Learning
              </BrutalButton>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="max-w-xs">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{currentEnrollment?.progress ?? 0}%</span>
                  </div>
                  <div className="progress-brutal">
                    <div className="progress-brutal-fill" style={{ width: `${currentEnrollment?.progress ?? 0}%` }} />
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[hsl(142,72%,45%)] text-primary-foreground rounded w-fit">
                  <Check size={12} /> Enrolled
                </span>
              </div>
            )}
          </div>
        </div>
      </BrutalCard>

      {/* Workshop Student Note */}
      {isWorkshop && registered && (
        <BrutalCard className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} className="text-muted-foreground" />
            <h2 className="font-semibold">My Notes</h2>
            <span className="text-xs text-muted-foreground ml-auto">Auto-saved</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Write down what you're learning from this workshop…"
            rows={5}
            className="w-full px-4 py-3 border border-border bg-secondary text-foreground text-sm rounded-md outline-none resize-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
          />
        </BrutalCard>
      )}

      {/* Topics */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Course Content</h2>
        {topics.length === 0 ? (
          <BrutalCard className="text-center py-12">
            <p className="font-semibold">No topics yet</p>
            <p className="text-muted-foreground text-sm">Content coming soon</p>
          </BrutalCard>
        ) : (
          <div className="space-y-2">
            {topics.map((topic, index) => {
              const completed = isTopicCompleted(topic.id);
              return (
                <BrutalCard
                  key={topic.id}
                  interactive={canAccessTopics}
                  onClick={() => canAccessTopics && setSelectedTopic(topic)}
                  className={cn("flex items-center gap-4", !canAccessTopics && "opacity-60 cursor-not-allowed")}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-md flex items-center justify-center font-medium text-sm shrink-0",
                    completed ? "bg-[hsl(142,72%,45%)] text-primary-foreground" : "bg-secondary"
                  )}>
                    {completed ? <Check size={18} /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{topic.title}</h3>
                    <span className="font-mono text-xs text-muted-foreground">{topic.duration}</span>
                  </div>
                  {canAccessTopics
                    ? <Play size={18} className="text-muted-foreground shrink-0" />
                    : <Lock size={16} className="text-muted-foreground shrink-0" />
                  }
                </BrutalCard>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}
