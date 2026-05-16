import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { X, Sparkles, FileText, Clock, Loader2, ChevronLeft, ChevronRight, Play, Pause, Mic } from "lucide-react";
import { format } from "date-fns";
import { createContentRequest, getVideoTemplates, VideoTemplate, getAudioTemplates, AudioTemplate } from "@/api/videoApi";

interface ScheduleVideoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}


const formatOptions = [
  {
    id: "9:16-cinematic",
    name: "9:16 Cinematic",
    description: "TikTok / Reels",
    renderFormat: "vertical_9_16",
  },
];

export function ScheduleVideoDrawer({
  open,
  onOpenChange,
  selectedDate,
}: ScheduleVideoDrawerProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());
  const [time, setTime] = useState("09:00");
  const [title, setTitle] = useState("");
  const [sourceTab, setSourceTab] = useState("ai-prompt");
  const [script, setScript] = useState("");

  const [selectedFormat, setSelectedFormat] = useState("9:16-cinematic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoTemplates, setVideoTemplates] = useState<VideoTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [hoveredTemplateId, setHoveredTemplateId] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [audioTemplates, setAudioTemplates] = useState<AudioTemplate[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<number | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const steps = [
    { number: 1, title: "Schedule" },
    { number: 2, title: "The Script" },
    { number: 3, title: "Video Template" },
    { number: 4, title: "Audio Template" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      fetchVideoTemplates();
      fetchAudioTemplates();
      setDate(selectedDate || new Date());
    } else {
      // Stop any playing audio when dialog closes
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingAudioId(null);
    }
  }, [open, selectedDate]);

  const fetchVideoTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const templates = await getVideoTemplates();
      setVideoTemplates(templates);
    } catch (error) {
      console.error("Error fetching video templates:", error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const fetchAudioTemplates = async () => {
    setIsLoadingAudio(true);
    try {
      const audios = await getAudioTemplates();
      setAudioTemplates(audios);
    } catch (error) {
      console.error("Error fetching audio templates:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handlePlayAudio = (e: React.MouseEvent, template: AudioTemplate) => {
    e.stopPropagation();
    if (playingAudioId === template.id) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    // Stop previous
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(template.url);
    audioRef.current = audio;
    setPlayingAudioId(template.id);
    audio.play().catch(err => {
      console.error("Audio playback failed:", err);
      setPlayingAudioId(null);
    });
    
    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => setPlayingAudioId(null);
  };


  const handleVideoHover = (templateId: number) => {
    setHoveredTemplateId(templateId);
    const video = videoRefs.current[templateId];
    if (video) {
      video.play().catch(() => { });
    }
  };

  const handleVideoLeave = (templateId: number) => {
    setHoveredTemplateId(null);
    const video = videoRefs.current[templateId];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!script.trim()) {
      alert("Please enter a prompt or script");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedFormatOption = formatOptions.find((f) => f.id === selectedFormat);

      const payload = {
        title: title.trim(),
        source_type: sourceTab === "my-script" ? "my_script" : "ai",
        prompt: sourceTab === "ai-prompt" ? script.trim() : undefined,
        user_script: sourceTab === "my-script" ? script.trim() : undefined,
        voice_over_id: selectedAudio ?? 1,
        render_format: selectedFormatOption?.renderFormat || "vertical_9_16",
        template_id: selectedTemplate || 1,
      };

      await createContentRequest(payload);
      onOpenChange(false);

      // Reset form
      setCurrentStep(1);
      setTitle("");
      setScript("");
      setSelectedFormat("9:16-cinematic");
      setSourceTab("ai-prompt");
      setSelectedTemplate(null);
      setSelectedAudio(null);
      setPlayingAudioId(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    } catch (error) {
      console.error("Error scheduling video:", error);
      alert("Failed to schedule video. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] h-[80vh] flex flex-col p-0 overflow-hidden gap-0 bg-background sm:rounded-2xl border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Schedule a video</DialogTitle>
          <DialogDescription>
            Create and schedule your automated video render.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-full w-full">
          {/* Sidebar */}
          <div className="w-[280px] bg-muted/20 border-r flex flex-col overflow-y-auto shrink-0 relative">
            <div className="p-6 h-full flex flex-col">
              <div className="mb-8 py-2">
                <h3 className="font-semibold text-lg text-foreground">Schedule a Video</h3>
              </div>

              <div className="space-y-1.5 flex-1">
                {steps.map((step, index) => {
                  const isActive = currentStep === step.number;
                  const isPast = currentStep > step.number;
                  return (
                    <button
                      key={step.number}
                      onClick={() => handleStepClick(step.number)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isActive
                        ? 'bg-background shadow-sm ring-1 ring-border font-medium text-foreground'
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${isActive
                        ? 'border-primary'
                        : isPast
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-muted-foreground/30'
                        }`}>
                        {isActive && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className="text-sm">{step.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-background relative">



            <div className="flex-1 overflow-y-auto px-10 py-10 pt-14">
              <div className="max-w-[600px]">
                {/* Header for current step */}
                <div className="mb-10">
                  <h2 className="text-3xl font-bold mb-3 text-foreground tracking-tight">
                    {steps.find(s => s.number === currentStep)?.title}
                  </h2>
                  <p className="text-muted-foreground text-base">
                    {currentStep === 1 && "Pick a day and tell AutoCast when to render your video."}
                    {currentStep === 2 && "Bring your own script, or let AI draft one on the day."}
                    {currentStep === 3 && "Select a category that matches your video content style."}
                    {currentStep === 4 && "Choose the perfect voice and format for your content."}
                  </p>
                </div>

                {/* Step 1: Schedule */}
                {currentStep === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div>
                      <Label htmlFor="title" className="text-xs font-semibold mb-2 block uppercase tracking-wider text-muted-foreground">
                        Title
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter video title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mb-2 h-11 text-base shadow-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Internal — used to find this in your library.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <Label className="text-xs font-semibold mb-3 block uppercase tracking-wider text-muted-foreground">
                          Schedule Date
                        </Label>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                          className="rounded-xl border shadow-sm bg-card p-3"
                        />
                      </div>

                      <div className="flex flex-col">
                        <Label htmlFor="time" className="text-xs font-semibold mb-3 block uppercase tracking-wider text-muted-foreground">
                          Time
                        </Label>
                        <div className="relative mb-6">
                          <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="flex-1 h-11 shadow-sm px-4"
                          />
                          <Clock className="w-4 h-4 text-muted-foreground absolute right-3 top-3.5 pointer-events-none" />
                        </div>

                        <div className="mt-auto p-5 rounded-xl border bg-muted/30">
                          <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">
                            Will Publish
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {date ? format(date, "EEE, MMM d") : "Select date"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {time} · your timezone
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: The Script */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div>
                      <Tabs value={sourceTab} onValueChange={setSourceTab} className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-muted rounded-xl">
                          <TabsTrigger value="ai-prompt" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                            <Sparkles className="w-4 h-4" />
                            AI Prompt
                          </TabsTrigger>
                          <TabsTrigger value="my-script" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                            <FileText className="w-4 h-4" />
                            My Script
                          </TabsTrigger>
                        </TabsList>
                        <div className="mt-8">
                          <TabsContent value="ai-prompt" className="mt-0 outline-none">
                            <Label htmlFor="ai-prompt-input" className="sr-only">AI Prompt Text</Label>
                            <Textarea
                              id="ai-prompt-input"
                              placeholder="e.g. A 45-second explainer about why minimalism matters in product design. Punchy hook, 3 examples, end with a question."
                              value={script}
                              onChange={(e) => setScript(e.target.value)}
                              className="min-h-[280px] resize-none shadow-sm text-base p-5 rounded-xl bg-background"
                            />
                            <div className="mt-4 p-4 rounded-xl bg-primary/5 text-primary text-sm flex gap-3 items-start border border-primary/20">
                              <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
                              <div>
                                <p className="font-semibold mb-1">AI generates a fresh script when the day arrives.</p>
                                <p className="opacity-80 leading-relaxed">It will use trending formats and your prompt to craft something unique.</p>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="my-script" className="mt-0 outline-none">
                            <Label htmlFor="my-script-input" className="sr-only">My Script Text</Label>
                            <Textarea
                              id="my-script-input"
                              placeholder="Paste your exact script here..."
                              value={script}
                              onChange={(e) => setScript(e.target.value)}
                              className="min-h-[280px] resize-none shadow-sm text-base p-5 rounded-xl bg-background"
                            />
                            <p className="text-sm text-muted-foreground mt-4 px-1 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Your script will be voiced and rendered exactly as written.
                            </p>
                          </TabsContent>
                        </div>
                      </Tabs>
                    </div>
                  </div>
                )}

                {/* Step 3: Video Template */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="-mx-4 md:-mx-0">
                      {isLoadingTemplates ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground font-medium">Loading stunning templates...</p>
                        </div>
                      ) : videoTemplates.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed rounded-xl bg-muted/20">
                          <p className="text-sm text-muted-foreground">No templates available right now.</p>
                        </div>
                      ) : (
                        <div className="flex gap-4 overflow-x-auto pb-6 px-4 md:px-0 snap-x">
                          {videoTemplates.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                              onMouseEnter={() => handleVideoHover(template.id)}
                              onMouseLeave={() => handleVideoLeave(template.id)}
                              className={`relative group shrink-0 w-[160px] md:w-[180px] p-2 rounded-2xl border-2 transition-all text-left bg-card snap-start ${selectedTemplate === template.id
                                ? "border-primary ring-4 ring-primary/10"
                                : "border-transparent hover:border-border shadow-sm hover:shadow-md"
                                }`}
                            >
                              <div className="relative aspect-[9/16] bg-muted/30 rounded-xl mb-3 overflow-hidden">
                                <video
                                  ref={(el) => (videoRefs.current[template.id] = el)}
                                  src={template.video_url}
                                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                  muted
                                  loop
                                  playsInline
                                />
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-md text-foreground flex items-center justify-center shadow-sm transition-opacity duration-200">
                                  <div className={`w-[14px] h-[14px] rounded-full border-[1.5px] ${selectedTemplate === template.id ? 'border-primary bg-primary' : 'border-muted-foreground/50'}`}>
                                    {selectedTemplate === template.id && (
                                      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white p-[2px]">
                                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <p className="font-semibold text-sm px-1 text-center truncate">{template.name}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Render Format */}
                    <div className="pt-6 border-t border-border/50">
                      <Label className="text-xs font-semibold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        Render Format
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formatOptions.map((format) => (
                          <button
                            key={format.id}
                            onClick={() => setSelectedFormat(format.id)}
                            className={`relative p-5 rounded-xl border-2 transition-all text-left bg-card ${
                              selectedFormat === format.id
                                ? "border-primary ring-4 ring-primary/10 shadow-sm"
                                : "border-border hover:border-primary/40 shadow-sm"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-semibold text-foreground">{format.name}</p>
                              <div
                                className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  selectedFormat === format.id ? "border-primary" : "border-muted-foreground/30"
                                }`}
                              >
                                {selectedFormat === format.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{format.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Audio Template */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {isLoadingAudio ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground font-medium">Loading voice samples...</p>
                      </div>
                    ) : audioTemplates.length === 0 ? (
                      <div className="py-16 text-center border-2 border-dashed rounded-xl bg-muted/20">
                        <Mic className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No audio templates available right now.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <style>{"@keyframes waveBar { from { height: 20%; opacity: 0.6; } to { height: 70%; opacity: 1; } }"}</style>
                        {audioTemplates.map((audio, index) => {
                          const isSelected = selectedAudio === audio.id;
                          const isPlaying = playingAudioId === audio.id;
                          // Deterministic avatar portraits
                          const avatars = [
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
                          ];
                          const avatar = avatars[index % avatars.length];
                          return (
                            <div
                              key={audio.id}
                              onClick={() => {
                                setSelectedAudio(audio.id);
                                // If we select a new voice, stop any playing audio from the previous one
                                if (playingAudioId !== null && playingAudioId !== audio.id) {
                                  if (audioRef.current) {
                                    audioRef.current.onended = null;
                                    audioRef.current.onerror = null;
                                    audioRef.current.pause();
                                    audioRef.current.src = "";
                                  }
                                  setPlayingAudioId(null);
                                }
                              }}
                              className={`relative p-4 rounded-xl border-2 transition-all text-left bg-card cursor-pointer ${
                                isSelected
                                  ? "border-primary ring-4 ring-primary/10 shadow-sm"
                                  : "border-border hover:border-primary/40 shadow-sm"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Avatar with waveform overlay when playing */}
                                <div className="relative w-12 h-12 shrink-0">
                                  <img
                                    src={avatar}
                                    alt={audio.name}
                                    className={`w-12 h-12 rounded-full object-cover ring-2 transition-all ${
                                      isSelected ? "ring-primary" : "ring-border"
                                    }`}
                                  />
                                  {/* Animated waveform overlay — no height change */}
                                  {isPlaying && (
                                    <div className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center gap-[2px] overflow-hidden">
                                      {[...Array(5)].map((_, i) => (
                                        <div
                                          key={i}
                                          className="w-[3px] rounded-full bg-white"
                                          style={{
                                            animationName: "waveBar",
                                            animationDuration: `${0.5 + i * 0.1}s`,
                                            animationTimingFunction: "ease-in-out",
                                            animationIterationCount: "infinite",
                                            animationDirection: "alternate",
                                            animationDelay: `${i * 0.08}s`,
                                            height: "40%",
                                          }}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-foreground mb-1 text-sm">{audio.name}</p>
                                  <div className="flex flex-wrap gap-1">
                                    <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                      {audio.category.replace("_", " ")}
                                    </span>
                                    <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                      {audio.accent}
                                    </span>
                                  </div>
                                </div>

                                {/* Play / Pause button */}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handlePlayAudio(e, audio); }}
                                  className={`relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                    isPlaying
                                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/40"
                                      : isSelected
                                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                  }`}
                                >
                                  {isPlaying ? (
                                    <Pause className="w-3.5 h-3.5" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 ml-0.5" />
                                  )}
                                  {/* Subtle pulse ring when playing */}
                                  {isPlaying && (
                                    <span className="absolute inset-0 rounded-full bg-primary/25 animate-ping" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="px-10 py-5 border-t bg-background flex items-center justify-between shrink-0">
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
                  Cancel
                </Button>
              </div>
              <div className="flex items-center gap-4">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handleBack} className="min-w-[100px] rounded-full font-medium">
                    Back
                  </Button>
                )}
                {currentStep < steps.length ? (
                  <Button onClick={handleNext} className="min-w-[120px] rounded-full shadow-sm font-medium">
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="min-w-[160px] rounded-full shadow-md font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Video"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
