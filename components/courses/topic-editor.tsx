import { useState } from "react";
import { Plus, Search, Loader2, Sparkles, X, PlayCircle } from "lucide-react";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalInput } from "@/components/ui/BrutalInput";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { TopicInsert } from "@/types/coursesTypes";

interface TopicEditorProps {
  currentTopic: TopicInsert;
  editIndex: number | null;
  isSearchingVideo: boolean;
  isGeneratingSummary: boolean;
  onUpdateField: (field: keyof TopicInsert, value: any) => void;
  onGenerateSummary: () => void;
  onSaveTopic: () => void;
  onCancelEdit: () => void;
}

export function TopicEditor({
  currentTopic,
  editIndex,
  isSearchingVideo,
  isGeneratingSummary,
  onUpdateField,
  onGenerateSummary,
  onSaveTopic,
  onCancelEdit,
}: TopicEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <BrutalCard
      className={`border-dashed border-4 border-gray-300 shadow-none transition-colors ${
        editIndex !== null ? "bg-yellow-50/50 border-yellow-400" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold uppercase flex items-center gap-2">
          {editIndex !== null ? (
            <>
              <svg
                className="bg-black text-white rounded-full p-0.5"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
              </svg>
              Edit Topic #{editIndex + 1}
            </>
          ) : (
            <>
              <Plus
                className="bg-black text-white rounded-full p-0.5"
                size={20}
              />
              Add New Topic
            </>
          )}
        </h2>
        <div className="flex">
            
            <BrutalButton
              className="h-[42px] px-3 whitespace-nowrap border-2 border-black gap-2"
              variant="default"
              disabled={!currentTopic.video_url}
              onClick={() => setShowPreview(true)}
              title="Preview Video Popup"
            >
              <PlayCircle size={18} /> <span className="text-xs font-bold uppercase">Preview Video</span>
            </BrutalButton>
            
          </div>
        {editIndex !== null && (
          <button
            onClick={onCancelEdit}
            className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1"
          >
            <X size={14} /> Cancel Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase mb-1 block">
            Topic Title
          </label>
          <BrutalInput
            value={currentTopic.title}
            onChange={(e) => onUpdateField("title", e.target.value)}
            placeholder="e.g. Understanding Hooks"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase mb-1 block">
            Video ID / URL
          </label>
          <div className="flex gap-1">
            <BrutalInput
              value={currentTopic.video_url}
              onChange={(e) => onUpdateField("video_url", e.target.value)}
              placeholder="YouTube ID"
            />
            <BrutalButton
              onClick={() => setShowPreview(true)}
              disabled={isSearchingVideo}
              variant="primary"
            >
              {isSearchingVideo ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Search size={16} />
              )}
            </BrutalButton>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <div>
            <label className="text-xs font-bold uppercase mb-1 block">
              Duration
            </label>
            <BrutalInput
              value={currentTopic.duration}
              onChange={(e) => onUpdateField("duration", e.target.value)}
              placeholder="e.g. 10:24"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold uppercase mb-1 block">
              Start At (Sec)
            </label>
            <BrutalInput
              type="number"
              value={currentTopic.start_playing_at}
              onChange={(e) =>
                onUpdateField("start_playing_at", Number(e.target.value))
              }
              className="w-full"
              placeholder="e.g. 624"
            />
          </div>
          
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-bold uppercase">Summary</label>
          <button
            onClick={onGenerateSummary}
            disabled={isGeneratingSummary || !currentTopic.title}
            className="text-xs flex items-center gap-1 hover:underline font-bold"
          >
            {isGeneratingSummary ? (
              <Loader2 className="animate-spin" size={12} />
            ) : (
              <Sparkles size={12} />
            )}
            AI Generate
          </button>
        </div>
        <textarea
          value={currentTopic.summary_text}
          onChange={(e) => onUpdateField("summary_text", e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black rounded-md font-mono text-sm resize-none h-20 focus:outline-none transition-all"
          placeholder="What is this topic about?"
        />
      </div>

      <BrutalButton
        className="w-full"
        variant="default"
        disabled={!currentTopic.title}
        onClick={onSaveTopic}
      >
        {editIndex !== null ? "Update Topic" : "Add Topic to Curriculum"}
      </BrutalButton>

      {/* Video Preview Popup Modal */}
      {showPreview && currentTopic.video_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col p-4 rounded-xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold uppercase flex items-center gap-2">
                <PlayCircle size={20} /> Preview Video
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 hover:bg-gray-100 border-2 border-transparent hover:border-black rounded transition-colors"
                title="Close Preview"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="w-full aspect-video border-2 border-black rounded-md overflow-hidden bg-black">
              <iframe
                key={`${currentTopic.video_url}-${currentTopic.start_playing_at}`}
                src={`https://www.youtube.com/embed/${currentTopic.video_url}?start=${Math.floor(Number(currentTopic.start_playing_at)) || 0}&autoplay=1`}
                title="Video Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-3 text-sm font-mono text-gray-600 bg-gray-100 p-2 rounded border border-gray-300">
              Starts at: <span className="font-bold text-black">{currentTopic.duration || '0:00'}</span> ({currentTopic.start_playing_at || 0} seconds)
            </div>
          </div>
        </div>
      )}
    </BrutalCard>
  );
}
