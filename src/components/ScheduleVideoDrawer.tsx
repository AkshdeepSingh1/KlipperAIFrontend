import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { X, Sparkles, FileText, Clock } from "lucide-react";
import { format } from "date-fns";

interface ScheduleVideoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}

const voiceOptions = [
  {
    id: "atlas",
    name: "Atlas",
    description: "CALM · MALE",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  },
  {
    id: "vera",
    name: "Vera",
    description: "BRIGHT · FEMALE",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
  {
    id: "kenji",
    name: "Kenji",
    description: "WARM · NARRATOR",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
  },
  {
    id: "nova",
    name: "Nova",
    description: "ENERGETIC · FEMALE",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
  },
];

const formatOptions = [
  {
    id: "9:16-cinematic",
    name: "9:16 Cinematic",
    description: "TikTok / Reels",
  },
  {
    id: "16:9-documentary",
    name: "16:9 Documentary",
    description: "YouTube",
  },
  {
    id: "1:1-square",
    name: "1:1 Square",
    description: "Instagram feed",
  },
  {
    id: "9:16-bold",
    name: "9:16 Bold Caption",
    description: "Hook-driven",
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
  const [selectedVoice, setSelectedVoice] = useState("atlas");
  const [selectedFormat, setSelectedFormat] = useState("9:16-cinematic");

  const handleSubmit = () => {
    console.log({
      date,
      time,
      title,
      sourceTab,
      script,
      selectedVoice,
      selectedFormat,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary uppercase tracking-wide mb-2">
                NEW SCHEDULED RENDER
              </p>
              <SheetTitle className="text-3xl font-bold">Schedule a video.</SheetTitle>
            </div>
          </div>
          <SheetDescription>
            Pick a day, drop a script or a prompt, choose a voice. AutoCast renders it on time.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-sm font-medium mb-2 block uppercase tracking-wide">
              Title
            </Label>
            <Input
              id="title"
              placeholder="sdfag"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-1"
            />
            <p className="text-xs text-muted-foreground">
              Internal — used to find this in your library.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block uppercase tracking-wide">
                Schedule Date
              </Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>

            <div>
              <Label htmlFor="time" className="text-sm font-medium mb-2 block uppercase tracking-wide">
                Time
              </Label>
              <div className="flex items-center gap-2 mb-4">
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex-1"
                />
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="mt-6 p-4 rounded-lg border bg-muted/50">
                <p className="text-sm font-medium mb-1 uppercase tracking-wide">
                  Will Publish
                </p>
                <p className="text-lg font-bold">
                  {date ? format(date, "EEE, MMM d") : "Select date"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {time} · your timezone
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block uppercase tracking-wide">
              Source
            </Label>
            <Tabs value={sourceTab} onValueChange={setSourceTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai-prompt" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Prompt
                </TabsTrigger>
                <TabsTrigger value="my-script" className="gap-2">
                  <FileText className="w-4 h-4" />
                  My Script
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ai-prompt" className="mt-4">
                <Textarea
                  placeholder="e.g. A 45-second explainer about why minimalism matters in product design. Punchy hook, 3 examples, end with a question."
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  AI generates a fresh script when the day arrives.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Bring your own script, or let AI draft one on the day.
                </p>
              </TabsContent>
              <TabsContent value="my-script" className="mt-4">
                <Textarea
                  placeholder="Paste your script here..."
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Your script will be used exactly as written.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Voiceover
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {voiceOptions.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                    selectedVoice === voice.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {selectedVoice === voice.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <img
                      src={voice.image}
                      alt={voice.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm">{voice.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {voice.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Format
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedFormat === format.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-semibold text-sm mb-1">{format.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <span className="uppercase tracking-wide">Render uses</span> · 1 credit
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90"
              >
                Schedule Video
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
