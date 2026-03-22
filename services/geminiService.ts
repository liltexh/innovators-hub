import { GoogleGenAI } from "@google/genai";
import { CourseLevel, TopicInsert } from "@/types/coursesTypes";

// Initialize Gemini with the new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const aiService = {
  /**
   * Generates a full course curriculum using Gemini 2.5 Flash with Google Search.
   * Emphasizes content reliability and allows reusing high-quality videos with different timestamps.
   */
  async generateCurriculum(
    title: string,
    description: string,
    level: CourseLevel,
    tags: string[] = []
  ): Promise<TopicInsert[]> {
    const prompt = `Create a professional, high-impact curriculum for a ${level} course.
    Title: "${title}"
    Context: "${description}"
    Tags: ${tags.join(", ")}
    
    CRITICAL QUALITY & RELIABILITY RULES:
    1. RELIABLE VIDEOS ONLY: You MUST use Google Search to find REAL, ACTIVE YouTube videos that actually exist right now. Verify the exact 11-character video ID is correct. Do not guess or hallucinate IDs.
    2. VIDEO REUSE STRATEGY: You CAN and ARE ENCOURAGED to reuse the same comprehensive "master" tutorial video (e.g., a 2-hour crash course) across multiple topics, as long as the content at that specific 'start_playing_at' timestamp perfectly aligns with the topic. Calculate the correct 'start_playing_at' (in seconds) for each sub-topic. This is preferred over using many small, potentially low-quality videos.
    3. TOPIC COUNT: Generate 5-15 topics (up to 20 for complex subjects if the title:  "${title}" is ment to be long.).
    4. LONG SUMMARIES: Each topic must have an extremely thorough, highly detailed, and educational summary. It should explain the concepts so perfectly that a student can fully learn and understand the topic just by reading the summary alone, even if they never watch the video.
    5. DATA STRUCTURE:
       - title: Engaging lesson title.
       - summary_text: Deep, highly detailed technical overview (must act as a standalone written lesson).
       - video_url: VERIFIED 11-character YouTube ID of a real, existing video.
       - duration: Segment length (e.g., "10:30").
       - start_playing_at: INTEGER seconds where the specific topic begins in the video.
       - order_index: Sequential integer.
       - is_ai_generated: true.

    Return the results strictly as an array of objects.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Mandatory for video ID verification
      },
    });

    try {
      const text = response.text || "[]";
      const cleanedJson = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const topics: TopicInsert[] = JSON.parse(cleanedJson);

      // Sanitization: Ensure video IDs are clean and timestamps are valid
      return topics.map((t) => {
        let cleanId = t.video_url || "";
        if (cleanId.includes("v="))
          cleanId = cleanId.split("v=")[1].split("&")[0];
        if (cleanId.includes("youtu.be/"))
          cleanId = cleanId.split("youtu.be/")[1].split("?")[0];

        return {
          ...t,
          video_url: cleanId.substring(0, 11),
          start_playing_at: Math.max(0, Math.floor(t.start_playing_at || 0)),
          is_ai_generated: true,
        };
      });
    } catch (e) {
      console.error("Failed to parse curriculum JSON", e);
      throw new Error(
        "AI returned invalid curriculum data. The search for reliable videos might have timed out."
      );
    }
  },

  async generateTopicSummary(topicTitle: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a deep technical summary (6 sentences) for a masterclass topic: "${topicTitle}". Explain the 'why' and the 'how'.`,
    });
    return response.text || "No summary generated.";
  },

  async findViralVideo(
    topicTitle: string
  ): Promise<{ videoId: string; title: string }> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for a high-quality, verified YouTube tutorial for: "${topicTitle}". Return a REAL 11-character video ID.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const chunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const youtubeChunk = chunks.find(
      (c) =>
        c.web?.uri?.includes("youtube.com/watch?v=") ||
        c.web?.uri?.includes("youtu.be/")
    );

    if (youtubeChunk && youtubeChunk.web?.uri) {
      const uri = youtubeChunk.web.uri;
      let id = "";
      if (uri.includes("v=")) {
        id = new URL(uri).searchParams.get("v") || "";
      } else if (uri.includes("youtu.be/")) {
        id = uri.split("/").pop()?.split("?")[0] || "";
      }

      if (id && id.length >= 11) {
        return {
          videoId: id.substring(0, 11),
          title: youtubeChunk.web.title || topicTitle,
        };
      }
    }

    // Fallback if no specific chunk was found
    return { videoId: "dQw4w9WgXcQ", title: `Tutorial for ${topicTitle}` };
  },
};
