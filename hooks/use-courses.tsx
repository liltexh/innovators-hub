"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CreateCoursePayload } from "@/types/coursesTypes"; // Import types from Step 1

export function useCourses() {
  const supabase = createClient();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const createCourse = async (payload: CreateCoursePayload) => {
    setIsCreating(true);
    let createdCourseId: string | null = null;

    try {
      // 1. Insert Course into 'courses' table
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .insert({
          creator_id: payload.creator_id,
          title: payload.title,
          description: payload.description,
          level: payload.level,
          thumbnail: payload.thumbnail,
          is_live_workshop: payload.is_live_workshop,
          workshop_details: payload.workshop_details, // Supabase handles the JSONB conversion automatically
          tags: payload.tags,
          is_ai_generated: payload.is_ai_generated || false,
        })
        .select("id")
        .single();

      if (courseError)
        throw new Error(`Course creation failed: ${courseError.message}`);

      createdCourseId = courseData.id;

      // 2. Insert Topics into 'topics' table (if any exist)
      if (payload.topics.length > 0) {
        // Map the payload topics to include the new course_id
        const topicsToInsert = payload.topics.map((t) => ({
          course_id: createdCourseId, // Link FK
          title: t.title,
          summary_text: t.summary_text,
          video_url: t.video_url,
          duration: t.duration,
          order_index: t.order_index,
          start_playing_at: t.start_playing_at || 0,
          is_ai_generated: t.is_ai_generated || false,
        }));

        const { error: topicError } = await supabase
          .from("topics")
          .insert(topicsToInsert);

        if (topicError) {
          // MANUAL ROLLBACK: If topics fail, delete the course to avoid orphan data
          console.error("Topic error, rolling back course creation...");
          await supabase.from("courses").delete().eq("id", createdCourseId);
          throw new Error(`Topic creation failed: ${topicError.message}`);
        }
      }

      // 3. Success
      toast({
        title: "Success",
        description: "Course and curriculum published successfully.",
      });

      router.refresh();
      return { id: createdCourseId };
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to create course",
        variant: "destructive",
      });
      return null; // Return null to indicate failure to component
    } finally {
      setIsCreating(false);
    }
  };

  return { createCourse, isCreating };
}
