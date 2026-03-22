import { NextResponse } from "next/server";
import { aiService } from "@/services/geminiService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, data } = body;

    if (!action || !data) {
      return NextResponse.json(
        { error: "Missing action or data payload" },
        { status: 400 }
      );
    }

    switch (action) {
      case "generate_curriculum": {
        const topics = await aiService.generateCurriculum(
          data.title,
          data.description,
          data.level,
          data.tags,
          data.referenceVideos,
          data.additionalInfo
        );
        return NextResponse.json(topics);
      }

      

      case "generate_summary": {
        const summary = await aiService.generateTopicSummary(data.topicTitle);
        // Returns wrapped in an object so the frontend can destructure result.summary
        return NextResponse.json({ summary });
      }

      default:
        return NextResponse.json(
          { error: "Unknown action provided" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("[COURSE_HELPER_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
