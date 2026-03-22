// Mock Database Service - Simulates Supabase backend
// Relational structure : Users -> Enrollments -> Courses -> Topics

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "creator";
  onboarding_data: {
    tech_status: "new" | "experienced" | null;
    languages: string[];
    interests: string[];
    style: "self-paced" | "teacher-led" | null;
  };
  created_at: string;
}

export interface Course {
  id: string;
  creator_id: string | null;
  title: string;
  level: "amateur" | "beginner" | "intermediate" | "professional";
  is_live_workshop: boolean;
  workshop_details: {
    location: string;
    date: string;
    time: string;
    duration: string;
  } | null;
  is_ai_generated: boolean;
  thumbnail: string;
  description: string;
  tags: string[];
}

export interface Topic {
  id: string;
  course_id: string;
  title: string;
  video_url: string;
  summary_text: string;
  order_index: number;
  duration: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed_topics: string[];
  enrolled_at: string;
}

// Mock Data
const users: User[] = [
  {
    id: "user-1",
    email: "demo@upskill.dev",
    name: "Alex Chen",
    role: "user",
    onboarding_data: {
      tech_status: "new",
      languages: [],
      interests: ["web-development", "ai"],
      style: "self-paced",
    },
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "creator-1",
    email: "sarah@upskill.dev",
    name: "Sarah Miller",
    role: "creator",
    onboarding_data: {
      tech_status: "experienced",
      languages: ["javascript", "python"],
      interests: [],
      style: "teacher-led",
    },
    created_at: "2024-01-10T08:00:00Z",
  },
];

const courses: Course[] = [
  {
    id: "course-1",
    creator_id: "creator-1",
    title: "JavaScript Fundamentals",
    level: "beginner",
    is_live_workshop: false,
    workshop_details: null,
    is_ai_generated: false,
    thumbnail:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
    description: "Master the basics of JavaScript from variables to functions.",
    tags: ["javascript", "web", "programming"],
  },
  {
    id: "course-2",
    creator_id: null,
    title: "Python for Data Science",
    level: "intermediate",
    is_live_workshop: false,
    workshop_details: null,
    is_ai_generated: true,
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
    description: "AI-curated path to learn Python for data analysis.",
    tags: ["python", "data-science", "ai"],
  },
  {
    id: "course-3",
    creator_id: "creator-1",
    title: "React Masterclass",
    level: "intermediate",
    is_live_workshop: true,
    workshop_details: {
      location: "Tech Hub, 123 Main St, SF",
      date: "2025-01-15",
      time: "14:00",
      duration: "3 hours",
    },
    is_ai_generated: false,
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    description: "Live workshop covering advanced React patterns.",
    tags: ["react", "javascript", "frontend"],
  },
  {
    id: "course-4",
    creator_id: null,
    title: "Machine Learning Basics",
    level: "beginner",
    is_live_workshop: false,
    workshop_details: null,
    is_ai_generated: true,
    thumbnail:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
    description: "AI-generated introduction to ML concepts.",
    tags: ["machine-learning", "ai", "python"],
  },
  {
    id: "course-5",
    creator_id: "creator-1",
    title: "Node.js Backend Workshop",
    level: "professional",
    is_live_workshop: true,
    workshop_details: {
      location: "DevSpace, 456 Tech Ave, NYC",
      date: "2025-02-20",
      time: "10:00",
      duration: "4 hours",
    },
    is_ai_generated: false,
    thumbnail:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
    description: "Professional backend development workshop.",
    tags: ["nodejs", "backend", "api"],
  },
];

const topics: Topic[] = [
  {
    id: "topic-1",
    course_id: "course-1",
    title: "Variables and Data Types",
    video_url: "dQw4w9WgXcQ",
    summary_text:
      "Learn about JavaScript variables using let, const, and var. Understand primitive data types including strings, numbers, booleans, null, and undefined.",
    order_index: 1,
    duration: "12:30",
  },
  {
    id: "topic-2",
    course_id: "course-1",
    title: "Functions and Scope",
    video_url: "dQw4w9WgXcQ",
    summary_text:
      "Master function declarations, expressions, and arrow functions. Understand lexical scope and closures in JavaScript.",
    order_index: 2,
    duration: "18:45",
  },
  {
    id: "topic-3",
    course_id: "course-2",
    title: "NumPy Fundamentals",
    video_url: "dQw4w9WgXcQ",
    summary_text:
      "Introduction to NumPy arrays and vectorized operations for efficient numerical computing in Python.",
    order_index: 1,
    duration: "22:10",
  },
  {
    id: "topic-4",
    course_id: "course-2",
    title: "Pandas DataFrames",
    video_url: "dQw4w9WgXcQ",
    summary_text:
      "Learn to manipulate and analyze data using Pandas DataFrames, the core data structure for data science.",
    order_index: 2,
    duration: "25:00",
  },
];

const enrollments: Enrollment[] = [
  {
    id: "enroll-1",
    user_id: "user-1",
    course_id: "course-1",
    progress: 50,
    completed_topics: ["topic-1"],
    enrolled_at: "2024-01-20T12:00:00Z",
  },
];

// Simulate async delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API Functions
export const db = {
  // Users
  async getUser(id: string): Promise<User | null> {
    await delay(200);
    return users.find((u) => u.id === id) || null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    await delay(200);
    return users.find((u) => u.email === email) || null;
  },

  async createUser(user: Omit<User, "id" | "created_at">): Promise<User> {
    await delay(300);
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    await delay(200);
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...data };
    return users[index];
  },

  // Courses
  async getCourses(): Promise<Course[]> {
    await delay(300);
    return [...courses];
  },

  async getCourse(id: string): Promise<Course | null> {
    await delay(200);
    return courses.find((c) => c.id === id) || null;
  },

  async getCoursesByCreator(creatorId: string): Promise<Course[]> {
    await delay(250);
    return courses.filter((c) => c.creator_id === creatorId);
  },

  async getAICourses(): Promise<Course[]> {
    await delay(200);
    return courses.filter((c) => c.is_ai_generated);
  },

  async getLiveWorkshops(): Promise<Course[]> {
    await delay(200);
    return courses.filter((c) => c.is_live_workshop);
  },

  async createCourse(course: Omit<Course, "id">): Promise<Course> {
    await delay(400);
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}`,
    };
    courses.push(newCourse);
    return newCourse;
  },

  // Topics
  async getTopicsByCourse(courseId: string): Promise<Topic[]> {
    await delay(200);
    return topics
      .filter((t) => t.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  },

  async getTopic(id: string): Promise<Topic | null> {
    await delay(150);
    return topics.find((t) => t.id === id) || null;
  },

  async createTopic(topic: Omit<Topic, "id">): Promise<Topic> {
    await delay(300);
    const newTopic: Topic = {
      ...topic,
      id: `topic-${Date.now()}`,
    };
    topics.push(newTopic);
    return newTopic;
  },

  // Enrollments
  async getEnrollmentsByUser(userId: string): Promise<Enrollment[]> {
    await delay(200);
    return enrollments.filter((e) => e.user_id === userId);
  },

  async getEnrollment(
    userId: string,
    courseId: string
  ): Promise<Enrollment | null> {
    await delay(150);
    return (
      enrollments.find(
        (e) => e.user_id === userId && e.course_id === courseId
      ) || null
    );
  },

  async createEnrollment(
    userId: string,
    courseId: string
  ): Promise<Enrollment> {
    await delay(300);
    const existing = await this.getEnrollment(userId, courseId);
    if (existing) return existing;

    const newEnrollment: Enrollment = {
      id: `enroll-${Date.now()}`,
      user_id: userId,
      course_id: courseId,
      progress: 0,
      completed_topics: [],
      enrolled_at: new Date().toISOString(),
    };
    enrollments.push(newEnrollment);
    return newEnrollment;
  },

  async updateEnrollment(
    id: string,
    data: Partial<Enrollment>
  ): Promise<Enrollment | null> {
    await delay(200);
    const index = enrollments.findIndex((e) => e.id === id);
    if (index === -1) return null;
    enrollments[index] = { ...enrollments[index], ...data };
    return enrollments[index];
  },

  async markTopicComplete(
    enrollmentId: string,
    topicId: string
  ): Promise<Enrollment | null> {
    await delay(200);
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return null;

    if (!enrollment.completed_topics.includes(topicId)) {
      enrollment.completed_topics.push(topicId);
      const courseTopics = topics.filter(
        (t) => t.course_id === enrollment.course_id
      );
      enrollment.progress = Math.round(
        (enrollment.completed_topics.length / courseTopics.length) * 100
      );
    }
    return enrollment;
  },
};
