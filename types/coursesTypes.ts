// @/types/courses.ts

export type CourseLevel =
  | "amateur"
  | "beginner"
  | "intermediate"
  | "professional";

// Structure for the 'workshop_details' JSONB column
export interface WorkshopDetails {
  date: string;
  time: string;
  duration: string;
  location: string;
}

// Structure for the 'ai_generation_meta' JSONB column (optional, based on your schema)
export interface AiGenerationMeta {
  prompt?: string;
  model?: string;
}

// Input type for creating a Topic (matches 'topics' table minus generated fields)
export interface TopicInsert {
  title: string;
  summary_text?: string;
  video_url?: string; // Base URL only
  start_playing_at?: number;
  order_index: number;
  duration?: string;
  is_ai_generated?: boolean;
}

// Input type for creating a Course (matches 'courses' table)
export interface CreateCoursePayload {
  creator_id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  level: CourseLevel;

  is_live_workshop: boolean;
  workshop_details?: WorkshopDetails | null; // Maps to jsonb

  is_ai_generated?: boolean;
  ai_generation_meta?: AiGenerationMeta | null; // Maps to jsonb

  tags?: string[]; // Maps to text[]

  // Not in courses table, but needed for the transaction
  topics: TopicInsert[];
}
