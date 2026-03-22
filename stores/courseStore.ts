import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  StoreStatus,
  Course,
  Enrollment,
  WorkshopRegistration,
} from "@/types/clientCourseTypes";

// ------------------------------------------------------------------
// 1. Store Interface
// ------------------------------------------------------------------

interface CourseState {
  // Course state
  allCourses: Course[];
  userCourses: Course[];
  userEnrollments: Enrollment[];
  currentCourse: Course | null;

  // Regular enrollment state
  currentEnrollment: Enrollment | null;

  // Workshop registration state
  workshopRegistration: WorkshopRegistration | null;     // student's own registration
  workshopRoster: WorkshopRegistration[];                // creator: all students for a course

  status: StoreStatus;
  enrollmentStatus: StoreStatus;
  workshopStatus: StoreStatus;
  errorMessage: string | null;

  // Course Actions
  fetchAllCourses: () => Promise<void>;
  fetchCourseById: (courseId: string) => Promise<void>;
  fetchUserCourses: (userId: string) => Promise<void>;

  // Regular Enrollment Actions
  fetchCurrentEnrollment: (courseId: string) => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  markTopicComplete: (topicId: string) => Promise<void>;

  // Workshop Registration Actions
  registerForWorkshop: (courseId: string) => Promise<void>;
  fetchMyWorkshopRegistration: (courseId: string) => Promise<void>;
  updateStudentNote: (registrationId: string, note: string) => Promise<void>;

  // Creator Actions
  fetchWorkshopRoster: (courseId: string) => Promise<void>;
  updateRegistration: (
    id: string,
    updates: Partial<Pick<WorkshopRegistration, "attended" | "remark">>
  ) => Promise<void>;

  reset: () => void;
}

// ------------------------------------------------------------------
// 2. Store Implementation
// ------------------------------------------------------------------

export const useCourseStore = create<CourseState>((set, get) => ({
  allCourses: [],
  userCourses: [],
  userEnrollments: [],
  currentCourse: null,
  currentEnrollment: null,
  workshopRegistration: null,
  workshopRoster: [],
  status: "IDLE",
  enrollmentStatus: "IDLE",
  workshopStatus: "IDLE",
  errorMessage: null,

  reset: () =>
    set({
      allCourses: [],
      userCourses: [],
      userEnrollments: [],
      currentCourse: null,
      currentEnrollment: null,
      workshopRegistration: null,
      workshopRoster: [],
      status: "IDLE",
      enrollmentStatus: "IDLE",
      workshopStatus: "IDLE",
      errorMessage: null,
    }),

  // ----------------------------------------------------------------
  // [1] Return ALL courses and their topics
  // ----------------------------------------------------------------
  fetchAllCourses: async () => {
    set({ status: "PENDING", errorMessage: null });
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`*, topics (*)`)
        .order("created_at", { ascending: false })
        .order("order_index", { foreignTable: "topics", ascending: true });

      if (error) throw error;
      set({ allCourses: data as unknown as Course[], status: "SUCCESS" });
    } catch (error: any) {
      console.error("Fetch all courses failed:", error);
      set({ status: "ERROR", errorMessage: error.message });
    }
  },

  // ----------------------------------------------------------------
  // [2] Return SINGLE course + its topics by ID
  // ----------------------------------------------------------------
  fetchCourseById: async (courseId: string) => {
    set({ status: "PENDING", errorMessage: null });
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`*, topics (*)`)
        .eq("id", courseId)
        .order("order_index", { foreignTable: "topics", ascending: true })
        .single();

      if (error) throw error;
      set({ currentCourse: data as unknown as Course, status: "SUCCESS" });
    } catch (error: any) {
      console.error(`Fetch course ${courseId} failed:`, error);
      set({ status: "ERROR", errorMessage: error.message });
    }
  },

  // ----------------------------------------------------------------
  // [3] Courses the user is enrolled in (via enrollments table join)
  // ----------------------------------------------------------------
  fetchUserCourses: async (userId: string) => {
    set({ status: "PENDING", errorMessage: null });
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select(`*, course:courses (*, topics (*))`)
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

      const rows = data as any[];
      const courses = rows.map((r) => r.course).filter(Boolean) as Course[];
      const enrollments = rows.map(({ course: _c, ...rest }) => rest) as Enrollment[];

      set({ userCourses: courses, userEnrollments: enrollments, status: "SUCCESS" });
    } catch (error: any) {
      console.error(`Fetch user courses for ${userId} failed:`, error);
      set({ status: "ERROR", errorMessage: error.message });
    }
  },

  // ----------------------------------------------------------------
  // [4] Load enrollment for current course (regular self-paced)
  // ----------------------------------------------------------------
  fetchCurrentEnrollment: async (courseId: string) => {
    set({ enrollmentStatus: "PENDING" });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { set({ currentEnrollment: null, enrollmentStatus: "IDLE" }); return; }

      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (error) throw error;
      set({ currentEnrollment: data as Enrollment | null, enrollmentStatus: "SUCCESS" });
    } catch (error: any) {
      console.error("Fetch enrollment failed:", error);
      set({ enrollmentStatus: "ERROR" });
    }
  },

  // ----------------------------------------------------------------
  // [5] Enroll in a regular self-paced course
  // ----------------------------------------------------------------
  enrollInCourse: async (courseId: string) => {
    set({ enrollmentStatus: "PENDING" });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from("enrollments")
        .upsert(
          { user_id: user.id, course_id: courseId, progress: 0, completed_topic_ids: [] },
          { onConflict: "user_id,course_id" }
        )
        .select()
        .single();

      if (error) throw error;
      set({ currentEnrollment: data as Enrollment, enrollmentStatus: "SUCCESS" });
    } catch (error: any) {
      console.error("Enroll failed:", error);
      set({ enrollmentStatus: "ERROR" });
    }
  },

  // ----------------------------------------------------------------
  // [6] Mark a topic complete + recalculate progress
  // ----------------------------------------------------------------
  markTopicComplete: async (topicId: string) => {
    const { currentEnrollment, currentCourse } = get();
    if (!currentEnrollment || !currentCourse) return;
    if (currentEnrollment.completed_topic_ids.includes(topicId)) return;

    const updatedCompleted = [...currentEnrollment.completed_topic_ids, topicId];
    const totalTopics = currentCourse.topics?.length ?? 0;
    const newProgress = totalTopics > 0
      ? Math.round((updatedCompleted.length / totalTopics) * 100)
      : 0;

    // Optimistic update
    set({ currentEnrollment: { ...currentEnrollment, completed_topic_ids: updatedCompleted, progress: newProgress } });

    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ completed_topic_ids: updatedCompleted, progress: newProgress, updated_at: new Date().toISOString() })
        .eq("id", currentEnrollment.id);

      if (error) throw error;
    } catch (error: any) {
      console.error("Mark topic complete failed:", error);
      set({ currentEnrollment }); // rollback
    }
  },

  // ----------------------------------------------------------------
  // [7] Register for a live workshop (student)
  // ----------------------------------------------------------------
  registerForWorkshop: async (courseId: string) => {
    set({ workshopStatus: "PENDING" });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Get creator_id from the course already in state
      const creatorId = get().currentCourse?.creator_id;
      if (!creatorId) throw new Error("Course not loaded");

      const { data, error } = await supabase
        .from("workshop_registrations")
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            creator_id: creatorId,
            attended: false,
            student_note: null,
            remark: null,
          },
          { onConflict: "user_id,course_id" }
        )
        .select()
        .single();

      if (error) throw error;
      set({ workshopRegistration: data as WorkshopRegistration, workshopStatus: "SUCCESS" });
    } catch (error: any) {
      console.error("Workshop register failed:", error);
      set({ workshopStatus: "ERROR" });
    }
  },

  // ----------------------------------------------------------------
  // [8] Fetch student's own registration row for a workshop
  // ----------------------------------------------------------------
  fetchMyWorkshopRegistration: async (courseId: string) => {
    set({ workshopStatus: "PENDING" });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { set({ workshopRegistration: null, workshopStatus: "IDLE" }); return; }

      const { data, error } = await supabase
        .from("workshop_registrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (error) throw error;
      set({ workshopRegistration: data as WorkshopRegistration | null, workshopStatus: "SUCCESS" });
    } catch (error: any) {
      console.error("Fetch workshop registration failed:", error);
      set({ workshopStatus: "ERROR" });
    }
  },

  // ----------------------------------------------------------------
  // [9] Student updates their own note (optimistic)
  // ----------------------------------------------------------------
  updateStudentNote: async (registrationId: string, note: string) => {
    const prev = get().workshopRegistration;
    set({ workshopRegistration: prev ? { ...prev, student_note: note } : prev });

    try {
      const { error } = await supabase
        .from("workshop_registrations")
        .update({ student_note: note, updated_at: new Date().toISOString() })
        .eq("id", registrationId);

      if (error) throw error;
    } catch (error: any) {
      console.error("Update student note failed:", error);
      set({ workshopRegistration: prev }); // rollback
    }
  },

  // ----------------------------------------------------------------
  // [10] Creator: fetch all registrations for a workshop
  // ----------------------------------------------------------------
  fetchWorkshopRoster: async (courseId: string) => {
    set({ workshopStatus: "PENDING" });
    try {
      const { data, error } = await supabase
        .from("workshop_registrations")
        .select("*")
        .eq("course_id", courseId)
        .order("registered_at", { ascending: true });

      if (error) throw error;
      set({ workshopRoster: data as WorkshopRegistration[], workshopStatus: "SUCCESS" });
    } catch (error: any) {
      console.error("Fetch roster failed:", error);
      set({ workshopStatus: "ERROR" });
    }
  },

  // ----------------------------------------------------------------
  // [11] Creator: update attended flag or remark for a student (optimistic)
  // ----------------------------------------------------------------
  updateRegistration: async (id, updates) => {
    const prev = get().workshopRoster;
    // Optimistic update
    set({
      workshopRoster: prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    });

    try {
      const { error } = await supabase
        .from("workshop_registrations")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    } catch (error: any) {
      console.error("Update registration failed:", error);
      set({ workshopRoster: prev }); // rollback
    }
  },
}));
