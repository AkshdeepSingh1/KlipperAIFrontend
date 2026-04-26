import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  Plus,
  CheckCircle2,
  Clock,
  Loader2,
  Download,
  Share2,
  FileText,
  User,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { ScheduleVideoDrawer } from "@/components/ScheduleVideoDrawer";
import { ScheduleCalendar, ScheduledVideoItem } from "@/components/ScheduleCalendar";

interface ScheduledVideo {
  id: string;
  time: string;
  title: string;
  script: string;
  voice: string;
  duration: string;
  status: "ready" | "generating" | "scheduled";
  thumbnail?: string;
}

interface Render {
  id: string;
  title: string;
  author: string;
  duration: string;
  thumbnail: string;
  date: string;
  status: "ready";
}

const mockScheduledVideosData: ScheduledVideoItem[] = [
  {
    id: "1",
    date: new Date(2026, 3, 19, 9, 0),
    type: "self",
    title: "Morning market recap — Tesla earnings",
    time: "09:00",
    status: "ready"
  },
  {
    id: "2",
    date: new Date(2026, 3, 19, 14, 30),
    type: "ai",
    title: "3 productivity hacks for designers",
    time: "14:30",
    status: "generating"
  },
  {
    id: "3",
    date: new Date(2026, 3, 19, 19, 0),
    type: "ai",
    title: "Why minimalism still wins in 2026",
    time: "19:00",
    status: "scheduled"
  },
  {
    id: "4",
    date: new Date(2026, 3, 22, 10, 0),
    type: "ai",
    title: "Tech trends to watch",
    time: "10:00",
    status: "scheduled"
  },
  {
    id: "5",
    date: new Date(2026, 3, 22, 15, 0),
    type: "self",
    title: "Weekly recap",
    time: "15:00",
    status: "scheduled"
  },
  {
    id: "6",
    date: new Date(2026, 3, 25, 11, 0),
    type: "ai",
    title: "Product launch teaser",
    time: "11:00",
    status: "scheduled"
  }
];

const mockRecentRenders: Render[] = [
  {
    id: "1",
    title: "Morning market recap — Tesla earnings",
    author: "Atlas",
    duration: "0:48",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=600&fit=crop",
    date: "Apr 19",
    status: "ready"
  },
  {
    id: "2",
    title: "Sunday reflections",
    author: "Kenji",
    duration: "1:12",
    thumbnail: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=600&fit=crop",
    date: "Apr 18",
    status: "ready"
  },
  {
    id: "3",
    title: "Brand teaser — autumn drop",
    author: "Vera",
    duration: "0:32",
    thumbnail: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=600&fit=crop",
    date: "Apr 19",
    status: "ready"
  },
  {
    id: "4",
    title: "Studio walkthrough — episode 04",
    author: "Atlas",
    duration: "1:58",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=600&fit=crop",
    date: "Apr 19",
    status: "ready"
  }
];

export default function TextToVideo() {
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 3, 19));
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 3, 1));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scheduledVideos, setScheduledVideos] = useState<ScheduledVideoItem[]>(mockScheduledVideosData);

  const videosForSelectedDate = useMemo(() => {
    return scheduledVideos.filter((video) => {
      const videoDate = new Date(video.date);
      return (
        videoDate.getDate() === selectedDate.getDate() &&
        videoDate.getMonth() === selectedDate.getMonth() &&
        videoDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [scheduledVideos, selectedDate]);

  const scheduledCount = scheduledVideos.filter(
    (v) => new Date(v.date).getMonth() === currentMonth.getMonth()
  ).length;
  const inProgressCount = scheduledVideos.filter((v) => v.status === "generating").length;
  const readyToPublishCount = scheduledVideos.filter((v) => v.status === "ready").length;

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-sm text-primary mb-2 uppercase tracking-wide">
            SUNDAY — APR 19, 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Schedule.</h1>
          <h2 className="text-4xl md:text-5xl font-bold text-muted-foreground mb-4">
            Generate. Ship.
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Plan a month of videos in minutes. Drop a script, or a single prompt — AutoCast
            writes, voices and renders it on the day you choose.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">3 renders queued today</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Scheduled This Month
              </p>
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{scheduledCount.toString().padStart(2, '0')}</span>
              <span className="text-sm text-muted-foreground">↗ +4 vs last week</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                In Progress
              </p>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{inProgressCount.toString().padStart(2, '0')}</span>
              <span className="text-sm text-muted-foreground">↗ Render queue active</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Ready to Publish
              </p>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{readyToPublishCount.toString().padStart(2, '0')}</span>
              <span className="text-sm text-muted-foreground">↗ All voiceovers approved</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 mb-8 items-start">
          <Card className="p-6">
            <ScheduleCalendar
              scheduledVideos={scheduledVideos}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
            />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  Day Plan
                </p>
                <h3 className="text-2xl font-bold">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h3>
              </div>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {videosForSelectedDate.length} tasks
            </p>

            {videosForSelectedDate.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="font-semibold mb-2">Nothing planned yet.</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  A blank day. Drop a script or a prompt and AutoCast will handle the rest.
                </p>
                <Button variant="outline" size="sm" onClick={() => handleOpenDrawer()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule first video
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {videosForSelectedDate.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-sm font-medium text-muted-foreground min-w-[3rem]">
                        {video.time}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                          {video.title}
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted">
                            <FileText className="w-3 h-3" />
                            {video.type === 'ai' ? 'AI Prompt' : 'Script'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {video.status === "ready" && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-green-500/20 text-green-400 font-medium">
                              ● READY
                            </span>
                          )}
                          {video.status === "generating" && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-amber-500/20 text-amber-400 font-medium">
                              ● GENERATING
                            </span>
                          )}
                          {video.status === "scheduled" && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted font-medium">
                              ● SCHEDULED
                            </span>
                          )}
                          {video.status === "generating" && (
                            <span className="text-xs text-muted-foreground">
                              ~1 min remaining
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <Button variant="outline" className="w-full" size="sm" onClick={() => handleOpenDrawer()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add task to {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Library
              </p>
              <h3 className="text-2xl font-bold">Recent renders</h3>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockRecentRenders.map((render, index) => (
              <motion.div
                key={render.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[9/16] bg-muted">
                    <img
                      src={render.thumbnail}
                      alt={render.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-green-500/90 text-white font-medium">
                        ● READY
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-md bg-black/70 text-white font-medium">
                      {render.duration}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2">
                        <Button size="sm" variant="secondary" className="flex-1">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                      {render.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {render.author}
                      </div>
                      <span>{render.date}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <ScheduleVideoDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        selectedDate={selectedDate}
      />
    </Layout>
  );
}
