import { useState } from "react";
import { Check, ArrowLeft } from "lucide-react";
import { Topic } from "@/types/clientCourseTypes";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";

interface CoursePlayerProps {
  topic: Topic;
  isCompleted: boolean;
  onMarkComplete: () => void;
  onBack: () => void;
}



export function CoursePlayer({
  topic,
  isCompleted,
  onMarkComplete,
  onBack,
}: CoursePlayerProps) {
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkComplete = async () => {
    setIsMarking(true);
    await onMarkComplete();
    setIsMarking(false);
  };





  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Course
      </button>

     {/* Video */}
      <BrutalCard className="p-0 overflow-hidden">
        <div className="aspect-video">
          <iframe
            // 1. The key forces the iframe to remount completely when the data arrives
            key={`${topic.video_url}-${topic.start_playing_at}`} 
            // 2. Math.floor ensures we pass a clean integer (no decimals)
            src={`https://www.youtube.com/embed/${topic.video_url}?start=${Math.floor(Number(topic.start_playing_at)) || 0}`}
            title={topic.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </BrutalCard>

      {/* Topic Info */}
      <BrutalCard>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold mb-1">{topic.title}</h1>
            <span className="font-mono text-sm text-muted-foreground">
              Duration: {topic.duration}
            </span>
          </div>
          {isCompleted && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[hsl(142,72%,45%)] text-primary-foreground rounded">
              <Check size={12} className="mr-1" />
              Completed
            </span>
          )}
        </div>

        <div className="h-px bg-border my-4" />

        {/* Summary */}
        <div>
          <h3 className="font-semibold mb-2">Summary</h3>
          <p className="text-muted-foreground text-sm whitespace-pre-line">
            {topic.summary_text}
          </p>
        </div>
      </BrutalCard>

      {/* Mark Complete */}
      {!isCompleted && (
        <BrutalButton
          variant="success"
          size="lg"
          className="w-full"
          onClick={handleMarkComplete}
          isLoading={isMarking}
        >
          <Check size={18} className="mr-2" />
          Mark as Complete
        </BrutalButton>
      )}
    </div>
  );
}
