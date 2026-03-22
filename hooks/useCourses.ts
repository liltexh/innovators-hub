'use client'
import { useState, useEffect, useCallback } from 'react';
import { db, Course, Topic, Enrollment } from '@/services/mockDatabase';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    db.getCourses().then(data => {
      setCourses(data);
      setIsLoading(false);
    });
  }, []);

  const getCourse = useCallback(async (id: string): Promise<Course | null> => {
    return db.getCourse(id);
  }, []);

  const getAICourses = useCallback(async (): Promise<Course[]> => {
    return db.getAICourses();
  }, []);

  const getLiveWorkshops = useCallback(async (): Promise<Course[]> => {
    return db.getLiveWorkshops();
  }, []);

  const getCreatorCourses = useCallback(async (creatorId: string): Promise<Course[]> => {
    return db.getCoursesByCreator(creatorId);
  }, []);

  const createCourse = useCallback(async (course: Omit<Course, 'id'>): Promise<Course> => {
    const newCourse = await db.createCourse(course);
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  }, []);

  return {
    courses,
    isLoading,
    getCourse,
    getAICourses,
    getLiveWorkshops,
    getCreatorCourses,
    createCourse,
  };
}

export function useTopics(courseId: string | null) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!courseId) {
      setTopics([]);
      return;
    }

    setIsLoading(true);
    db.getTopicsByCourse(courseId).then(data => {
      setTopics(data);
      setIsLoading(false);
    });
  }, [courseId]);

  const createTopic = useCallback(async (topic: Omit<Topic, 'id'>): Promise<Topic> => {
    const newTopic = await db.createTopic(topic);
    setTopics(prev => [...prev, newTopic]);
    return newTopic;
  }, []);

  return {
    topics,
    isLoading,
    createTopic,
  };
}

export function useEnrollments(userId: string | null) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setEnrollments([]);
      return;
    }

    setIsLoading(true);
    db.getEnrollmentsByUser(userId).then(data => {
      setEnrollments(data);
      setIsLoading(false);
    });
  }, [userId]);

  const enroll = useCallback(async (courseId: string): Promise<Enrollment | null> => {
    if (!userId) return null;
    
    const enrollment = await db.createEnrollment(userId, courseId);
    setEnrollments(prev => {
      const exists = prev.find(e => e.id === enrollment.id);
      if (exists) return prev;
      return [...prev, enrollment];
    });
    return enrollment;
  }, [userId]);

  const markComplete = useCallback(async (enrollmentId: string, topicId: string): Promise<Enrollment | null> => {
    const updated = await db.markTopicComplete(enrollmentId, topicId);
    if (updated) {
      setEnrollments(prev => prev.map(e => e.id === updated.id ? updated : e));
    }
    return updated;
  }, []);

  const getEnrollment = useCallback((courseId: string): Enrollment | undefined => {
    return enrollments.find(e => e.course_id === courseId);
  }, [enrollments]);

  const isEnrolled = useCallback((courseId: string): boolean => {
    return enrollments.some(e => e.course_id === courseId);
  }, [enrollments]);

  return {
    enrollments,
    isLoading,
    enroll,
    markComplete,
    getEnrollment,
    isEnrolled,
  };
}
