import {
  CourseLevel,
  WorkshopDetails,
  AiGenerationMeta,
} from "@/types/coursesTypes";

export type StoreStatus = "IDLE" | "PENDING" | "SUCCESS" | "ERROR";

// Represents an Enrollment row from the DB
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed_topic_ids: string[];
  enrolled_at: string;
  updated_at: string;
}

// Represents a WorkshopRegistration row from the DB
export interface WorkshopRegistration {
  id: string;
  user_id: string;
  course_id: string;
  creator_id: string;

  // Student-facing
  student_note: string | null;      // what the student learned

  // Creator-facing
  remark: string | null;            // creator's comment on the student
  attended: boolean;                // did the student attend?

  // Timestamps
  registered_at: string;
  updated_at: string;
}



// Represents a Topic row from the DB
export interface Topic {
  id: string;
  course_id: string;
  title: string;
  summary_text: string | null;
  video_url: string | null;
  start_playing_at: number;
  order_index: number;
  duration: string | null;
  is_ai_generated: boolean;
  created_at: string;
}

// Represents a Course row + Joined Topics
export interface Course {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  level: CourseLevel;

  is_live_workshop: boolean;
  workshop_details: WorkshopDetails | null;

  is_ai_generated: boolean;
  ai_generation_meta: AiGenerationMeta | null;

  tags: string[] | null;
  created_at: string;
  updated_at: string;

  // Joined Table Data
  topics: Topic[];
}
