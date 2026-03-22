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
    tags: string[] = [],
    referenceVideos: string = "",
    additionalInfo: string = ""
  ): Promise<TopicInsert[]> {
    let extraContext = "";
    let extraRules = "";
    let ruleIndex = 1;

    if (referenceVideos && referenceVideos.trim() !== "") {
      extraContext += `\n    User Reference Videos: "${referenceVideos}"`;
      extraRules += `\n    ${ruleIndex++}. PROVIDED REFERENCE VIDEOS FIRST: You MUST immediately extract and use these provided YouTube videos. Extract the 11-char video ID from their input. Do NOT run Google Search for these specific videos to save time—just extract the ID and assign it to the 'video_url' field for relevant topics.`;
    }

    if (additionalInfo && additionalInfo.trim() !== "") {
      extraContext += `\n    User Additional Info: "${additionalInfo}"`;
      extraRules += `\n    ${ruleIndex++}. ADDITIONAL INFO: Strongly adhere to any instructions inside "User Additional Info".`;
    }

    const prompt = `Create a professional, high-impact curriculum for a ${level} course.
    Title: "${title}"
    Context: "${description}"
    Tags: ${tags.join(", ")}${extraContext}
    
    CRITICAL QUALITY & RELIABILITY RULES:${extraRules}
    ${ruleIndex++}. RELIABLE VIDEOS ONLY: For any topics NOT covered by the provided reference videos, you MUST use Google Search to find REAL, ACTIVE YouTube videos. Verify the exact 11-character video ID is correct. Do not guess or hallucinate IDs.
    ${ruleIndex++}. VIDEO REUSE STRATEGY: You CAN and ARE ENCOURAGED to reuse the same comprehensive "master" tutorial video (e.g., a 2-hour crash course) across multiple topics, as long as the content at that specific timestamp perfectly aligns with the topic.
    ${ruleIndex++}. TOPIC COUNT: Generate 5-15 topics (up to 20 for complex subjects if the title "${title}" is meant to be long).
    ${ruleIndex++}. LONG SUMMARIES: Each topic must have an extremely thorough, highly detailed, and educational summary. It should perfectly explain the concepts.
    ${ruleIndex++}. DATA STRUCTURE:
       - title: Engaging lesson title.
       - summary_text: Deep, highly detailed technical overview (must act as a standalone written lesson).
       - video_url: VERIFIED 11-character YouTube ID of a real, existing video.
       - duration: Segment length (e.g., "10:30").
       - start_playing_at: INTEGER seconds where the specific topic begins in the video.
       - order_index: Sequential integer.
       - is_ai_generated: true.

    Return the results strictly as a JSON array of objects.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Mandatory for video ID verification
        responseMimeType: "application/json",
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
