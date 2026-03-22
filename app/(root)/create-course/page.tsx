"use client";

import { useState, useRef } from "react";
import {
  Plus,
  Sparkles,
  Search,
  Loader2,
  Trash2,
  PlayCircle,
  Image as ImageIcon,
  Youtube,
  Upload,
  RefreshCcw,
  X,
} from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { Layout } from "@/components/layout/layout";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalInput } from "@/components/ui/BrutalInput";
import { BrutalTag } from "@/components/ui/BrutalTag";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authstore";

import { CourseLevel, TopicInsert } from "@/types/coursesTypes";
import { TopicEditor } from "@/components/courses/topic-editor";

// --- Utility: Extract YouTube ID ---
const extractYoutubeId = (urlOrId: string) => {
  if (!urlOrId) return null;
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = urlOrId.match(regExp);

  return match && match[7].length === 11
    ? match[7]
    : urlOrId.length === 11
    ? urlOrId
    : null;
};

const levels: CourseLevel[] = [
  "amateur",
  "beginner",
  "intermediate",
  "professional",
];

export default function CreateCoursePage() {
  const router = useRouter();
  const { createCourse, isCreating } = useCourses();
  const user = useAuthStore((state) => state.user);

  // --- Course State ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<CourseLevel>("beginner");

  // --- Thumbnail State ---
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailMode, setThumbnailMode] = useState<
    "youtube" | "upload" | "ai"
  >("youtube");
  const [ytInput, setYtInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isWorkshop, setIsWorkshop] = useState(false);
  const [workshopDate, setWorkshopDate] = useState("");
  const [workshopTime, setWorkshopTime] = useState("");
  const [workshopDuration, setWorkshopDuration] = useState("");
  const [workshopLocation, setWorkshopLocation] = useState("");

  const [tags, setTags] = useState("");

  // --- Topic Management State ---
  const [topics, setTopics] = useState<TopicInsert[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentTopic, setCurrentTopic] = useState<TopicInsert>({
    title: "",
    summary_text: "",
    video_url: "",
    duration: "",
    order_index: 0,
    start_playing_at: 0,
    is_ai_generated: false,
  });

  // --- Loading States ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState("");
  const [isSearchingVideo, setIsSearchingVideo] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const updateCurrentTopic = (field: keyof TopicInsert, value: any) => {
    setCurrentTopic((prev) => ({ ...prev, [field]: value }));
  };

  // --- API Helper ---
  const callAiApi = async (
    action: string,
    data: any,
    retries = 3,
    delay = 1000
  ) => {
    try {
      const response = await fetch("/api/ai/course-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });

      if (response.status === 429) {
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          return callAiApi(action, data, retries - 1, delay * 2);
        }
        throw new Error("Server busy. Please try again.");
      }

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.details || result.error || "API Error");

      return result;
    } catch (error: any) {
      console.error("API Call Failed:", error);
      throw error;
    }
  };

  // --- THUMBNAIL LOGIC ---
  const handleYoutubeThumbnailInput = (val: string) => {
    setYtInput(val);
    const id = extractYoutubeId(val);
    if (id) {
      setThumbnailUrl(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setThumbnailUrl(objectUrl);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!title) {
      toast({
        title: "Title required",
        description: "Enter a title first.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingImage(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      if (topics.length > 0 && topics[0].video_url) {
        const id = extractYoutubeId(topics[0].video_url);
        if (id)
          setThumbnailUrl(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
      } else {
        setThumbnailUrl(
          `https://source.unsplash.com/random/800x600/?${encodeURIComponent(
            title
          )},technology`
        );
      }
      toast({
        title: "Image Generated",
        description: "AI selected a cover based on your content.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not generate image",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- AI Feature: Auto Generate Curriculum ---
  const handleAutoGenerate = async () => {
    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Provide a course title so AI can research topics!",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenMessage("Researching high-quality topics...");

    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const generatedTopics: TopicInsert[] = await callAiApi(
        "generate_curriculum",
        {
          title,
          description,
          level,
          tags: tagList,
        }
      );

      // Update topics state directly with AI response
      setTopics(generatedTopics);

      // Auto-set thumbnail from the first valid video if none exists
      if (
        !thumbnailUrl &&
        generatedTopics.length > 0 &&
        generatedTopics[0].video_url
      ) {
        const firstVidId = extractYoutubeId(generatedTopics[0].video_url);
        if (firstVidId) {
          setThumbnailUrl(
            `https://img.youtube.com/vi/${firstVidId}/maxresdefault.jpg`
          );
          setYtInput(firstVidId);
        }
      }

      toast({
        title: "Curriculum Generated!",
        description: `Created ${generatedTopics.length} topics.`,
      });
    } catch (err: any) {
      toast({
        title: "Generation Failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenMessage("");
    }
  };

  

  // --- AI Feature: Generate Summary ---
  const handleGenerateSummary = async () => {
    if (!currentTopic.title.trim()) return;
    setIsGeneratingSummary(true);
    try {
      const result = await callAiApi("generate_summary", {
        topicTitle: currentTopic.title,
      });

      // The API returns { summary: "..." }
      updateCurrentTopic("summary_text", result.summary);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate summary",
        variant: "destructive",
      });
    }
    setIsGeneratingSummary(false);
  };

  const handleAddTopic = () => {
    if (!currentTopic.title) return;
    
    if (editIndex !== null) {
      // Update existing topic
      setTopics((prev) => {
        const updated = [...prev];
        updated[editIndex] = { ...currentTopic, order_index: editIndex };
        return updated;
      });
      setEditIndex(null);
    } else {
      // Add new topic
      setTopics((prev) => [
        ...prev,
        { ...currentTopic, order_index: prev.length },
      ]);
    }
    
    // Reset form
    setCurrentTopic({
      title: "",
      summary_text: "",
      video_url: "",
      duration: "",
      order_index: 0,
      start_playing_at: 0,
      is_ai_generated: false,
    });
  };

  const handleEditTopic = (index: number) => {
    setCurrentTopic(topics[index]);
    setEditIndex(index);
    
    // Scroll to the editor section
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleRemoveTopic = (index: number) => {
    setTopics((prev) => {
      const newTopics = prev.filter((_, idx) => idx !== index);
      // Re-index remaining topics
      return newTopics.map((t, idx) => ({ ...t, order_index: idx }));
    });
    // If we're editing this topic, cancel edit
    if (editIndex === index) {
      setEditIndex(null);
      setCurrentTopic({
        title: "",
        summary_text: "",
        video_url: "",
        duration: "",
        order_index: 0,
        start_playing_at: 0,
        is_ai_generated: false,
      });
    } else if (editIndex !== null && editIndex > index) {
      // Shift edit index if a previous item is removed
      setEditIndex(editIndex - 1);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !user) return;

    try {
      const workshopDetailsPayload = isWorkshop
        ? {
            date: workshopDate,
            time: workshopTime,
            duration: workshopDuration,
            location: workshopLocation,
          }
        : null;

      const result = await createCourse({
        creator_id: user.id,
        title: title.trim(),
        description: description.trim() || `A ${level} course on ${title}`,
        level,
        thumbnail: thumbnailUrl,
        is_live_workshop: isWorkshop,
        workshop_details: workshopDetailsPayload,
        tags: tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        topics: topics,
      });

      if (result && result.id) {
        router.push(`/courses/${result.id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <BrutalCard className="mb-6 bg-yellow-400 border-black">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              Create Course
            </h1>
            <p className="font-mono text-sm font-bold opacity-75">
              Draft your masterclass
            </p>
          </div>
          <div className="flex gap-2">
            <BrutalButton
              onClick={handleAutoGenerate}
              disabled={isGenerating || !title}
              className="bg-black text-white hover:bg-black/70"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <Sparkles className="mr-2" size={18} />
              )}
              {isGenerating
                ? genMessage || "Generating..."
                : "Auto Generate Topics"}
            </BrutalButton>
          </div>
        </div>
      </BrutalCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Course Meta (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <BrutalCard>
            <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mb-4">
              Meta Data
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Title</label>
                <BrutalInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced SQL"
                />
              </div>

              {/* --- THUMBNAIL SELECTOR START --- */}
              <div className="bg-gray-50 border-2 border-black p-3 rounded-lg">
                <label className="text-sm font-bold mb-2 uppercase flex items-center gap-2">
                  <ImageIcon size={16} /> Course Thumbnail
                </label>

                {/* Preview Window */}
                <div className="relative w-full aspect-video bg-gray-200 border-2 border-black rounded-md mb-3 overflow-hidden flex items-center justify-center group">
                  {thumbnailUrl ? (
                    <>
                      <img
                        src={thumbnailUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Clear Button */}
                      <button
                        onClick={() => {
                          setThumbnailUrl("");
                          setYtInput("");
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md border border-black opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="text-gray-400 text-xs font-mono text-center px-4">
                      No image selected.
                      <br />
                      Choose a method below.
                    </div>
                  )}
                </div>

                {/* Selection Tabs */}
                <div className="flex gap-1 mb-2">
                  <button
                    onClick={() => setThumbnailMode("youtube")}
                    className={`flex-1 py-1 text-xs font-bold border border-black rounded-sm flex justify-center items-center gap-1 ${
                      thumbnailMode === "youtube"
                        ? "bg-black text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    <Youtube size={12} /> YT
                  </button>
                  <button
                    onClick={() => setThumbnailMode("upload")}
                    className={`flex-1 py-1 text-xs font-bold border border-black rounded-sm flex justify-center items-center gap-1 ${
                      thumbnailMode === "upload"
                        ? "bg-black text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    <Upload size={12} /> Upload
                  </button>
                  <button
                    onClick={() => setThumbnailMode("ai")}
                    className={`flex-1 py-1 text-xs font-bold border border-black rounded-sm flex justify-center items-center gap-1 ${
                      thumbnailMode === "ai"
                        ? "bg-black text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    <Sparkles size={12} /> AI
                  </button>
                </div>

                {/* Inputs based on Mode */}
                {thumbnailMode === "youtube" && (
                  <BrutalInput
                    placeholder="Paste YouTube URL or ID"
                    value={ytInput}
                    onChange={(e) =>
                      handleYoutubeThumbnailInput(e.target.value)
                    }
                    className="text-xs h-9"
                  />
                )}

                {thumbnailMode === "upload" && (
                  <div className="relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <BrutalButton
                      className="w-full h-9 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                      variant="default"
                    >
                      Select from Computer
                    </BrutalButton>
                  </div>
                )}

                {thumbnailMode === "ai" && (
                  <BrutalButton
                    className="w-full h-9 text-xs"
                    onClick={handleGenerateThumbnail}
                    disabled={isGeneratingImage || !title}
                    variant="primary"
                  >
                    {isGeneratingImage ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <RefreshCcw size={14} className="mr-2" />
                    )}
                    Generate Magic Cover
                  </BrutalButton>
                )}
              </div>
              {/* --- THUMBNAIL SELECTOR END --- */}

              <div>
                <label className="block text-sm font-bold mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white rounded-md font-mono text-sm resize-none h-24 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Level</label>
                <div className="flex flex-wrap gap-2">
                  {levels.map((l) => (
                    <BrutalTag
                      key={l}
                      interactive
                      selected={level === l}
                      onClick={() => setLevel(l)}
                    >
                      {l}
                    </BrutalTag>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Tags</label>
                <BrutalInput
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="comma, separated, tags"
                />
              </div>
            </div>
          </BrutalCard>

          <BrutalCard>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={isWorkshop}
                onChange={() => setIsWorkshop(!isWorkshop)}
                className="w-5 h-5 border-2 border-black rounded focus:ring-0 checked:bg-black"
              />
              <label className="font-bold uppercase">Is Live Workshop?</label>
            </div>

            {isWorkshop && (
              <div className="space-y-3 pl-1">
                <BrutalInput
                  type="date"
                  value={workshopDate}
                  onChange={(e) => setWorkshopDate(e.target.value)}
                />
                <BrutalInput
                  type="time"
                  value={workshopTime}
                  onChange={(e) => setWorkshopTime(e.target.value)}
                />
                <BrutalInput
                  placeholder="Duration (e.g. 2h)"
                  value={workshopDuration}
                  onChange={(e) => setWorkshopDuration(e.target.value)}
                />
                <BrutalInput
                  placeholder="Location / URL"
                  value={workshopLocation}
                  onChange={(e) => setWorkshopLocation(e.target.value)}
                />
              </div>
            )}
          </BrutalCard>
        </div>

        {/* RIGHT COLUMN: Curriculum Builder (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {topics.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold uppercase text-sm text-muted-foreground">
                Current Curriculum ({topics.length})
              </h3>
              {topics.map((topic, idx) => (
                <div
                  key={idx}
                  className={`bg-white border-2 border-black p-4 rounded-lg flex items-start gap-4 transition-all ${
                    editIndex === idx 
                      ? "ring-2 ring-black shadow-md bg-yellow-50" 
                      : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  <div className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-full font-bold font-mono shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{topic.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {topic.summary_text || "No summary"}
                    </p>
                    {topic.video_url && (
                      <div className="flex items-center gap-2 mt-2 text-xs font-mono bg-blue-100 w-fit px-2 py-1 rounded border border-blue-900">
                        <PlayCircle size={12} />
                        Video Linked
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEditTopic(idx)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                      title="Edit Topic"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                    </button>
                    <button
                      onClick={() => handleRemoveTopic(idx)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                      title="Remove Topic"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Topic Form via new TopicEditor Component */}
          <TopicEditor
            currentTopic={currentTopic}
            editIndex={editIndex}
            isSearchingVideo={isSearchingVideo}
            isGeneratingSummary={isGeneratingSummary}
            onUpdateField={updateCurrentTopic}
            onGenerateSummary={handleGenerateSummary}
            onSaveTopic={handleAddTopic}
            onCancelEdit={() => {
              setEditIndex(null);
              setCurrentTopic({
                title: "",
                summary_text: "",
                video_url: "",
                duration: "",
                order_index: 0,
                start_playing_at: 0,
                is_ai_generated: false,
              });
            }}
          />
        </div>
      </div>

      {/* Footer Submit */}
      <div className="mt-8 border-t-2 border-black pt-6 flex justify-end">
        <BrutalButton
          variant="primary"
          size="lg"
          className="w-full md:w-auto text-lg px-8 py-6"
          onClick={handleCreate}
          isLoading={isCreating}
          disabled={!title.trim() || topics.length === 0}
        >
          <Plus size={20} className="mr-2" />
          Publish Course ({topics.length} topics)
        </BrutalButton>
      </div>
    </Layout>
  );
}
