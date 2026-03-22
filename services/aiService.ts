// AI Service - Mock Gemini API integration
// Will be replaced with real Gemini API calls later

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock AI responses
const topicSuggestions: Record<string, { title: string; level: string }> = {
  'react': { title: 'React.js Component Architecture', level: 'intermediate' },
  'javascript': { title: 'Modern JavaScript ES2024', level: 'beginner' },
  'python': { title: 'Python Programming Fundamentals', level: 'beginner' },
  'machine learning': { title: 'Introduction to Machine Learning', level: 'intermediate' },
  'ai': { title: 'Artificial Intelligence Basics', level: 'beginner' },
  'node': { title: 'Node.js Server Development', level: 'intermediate' },
  'typescript': { title: 'TypeScript for JavaScript Developers', level: 'intermediate' },
  'css': { title: 'Advanced CSS Layouts & Animations', level: 'beginner' },
  'api': { title: 'RESTful API Design Patterns', level: 'professional' },
  'database': { title: 'Database Design & SQL Mastery', level: 'intermediate' }
};

const mockSummaries = [
  "This comprehensive lesson covers the fundamental concepts and practical applications. You'll learn step-by-step techniques used by industry professionals, with hands-on examples and real-world scenarios.",
  "Dive deep into core principles that form the foundation of this topic. Through structured learning, you'll gain the skills needed to tackle complex problems with confidence.",
  "Master essential techniques through this focused tutorial. We break down complex concepts into digestible pieces, ensuring you understand both the 'how' and 'why'.",
  "This lesson provides a thorough exploration of key concepts. You'll develop practical skills that you can immediately apply to your projects and career."
];

const mockVideoIds = [
  'dQw4w9WgXcQ',
  'jNQXAC9IVRw',
  'ZZ5LpwO-An4',
  'kJQP7kiw5Fk'
];

export const aiService = {
  // Suggest proper topic name and difficulty based on input
  async suggestTopic(input: string): Promise<{ title: string; level: string }> {
    await delay(800); // Simulate AI processing
    
    const lowerInput = input.toLowerCase();
    for (const [key, value] of Object.entries(topicSuggestions)) {
      if (lowerInput.includes(key)) {
        return value;
      }
    }
    
    // Default suggestion
    return {
      title: `Introduction to ${input.charAt(0).toUpperCase() + input.slice(1)}`,
      level: 'beginner'
    };
  },

  // Generate topic summary
  async generateTopicSummary(topicTitle: string): Promise<string> {
    await delay(1200); // Simulate AI processing
    
    const randomSummary = mockSummaries[Math.floor(Math.random() * mockSummaries.length)];
    return `**${topicTitle}**\n\n${randomSummary}\n\n**Key Takeaways:**\n• Understand core concepts\n• Apply practical techniques\n• Build real-world projects`;
  },

  

  // Generate course recommendations based on user interests
  async getRecommendations(interests: string[]): Promise<string[]> {
    await delay(600);
    
    const recommendations: string[] = [];
    interests.forEach(interest => {
      if (topicSuggestions[interest.toLowerCase()]) {
        recommendations.push(topicSuggestions[interest.toLowerCase()].title);
      }
    });
    
    return recommendations.length > 0 
      ? recommendations 
      : ['Web Development Fundamentals', 'Programming Basics', 'Introduction to Tech'];
  },

  // Generate personalized learning path
  async generateLearningPath(
    techStatus: 'new' | 'experienced',
    interests: string[],
    style: 'self-paced' | 'teacher-led'
  ): Promise<{ title: string; description: string; courses: string[] }> {
    await delay(1500);
    
    const isNew = techStatus === 'new';
    
    return {
      title: isNew ? 'Beginner\'s Tech Journey' : 'Advanced Skill Path',
      description: style === 'self-paced' 
        ? 'Learn at your own pace with curated content tailored to your goals.'
        : 'Join live sessions with expert instructors for hands-on learning.',
      courses: isNew 
        ? ['Programming Basics', 'Web Development 101', 'Introduction to Databases']
        : interests.map(i => `Advanced ${i.charAt(0).toUpperCase() + i.slice(1)}`)
    };
  }
};
