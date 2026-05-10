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
  Sparkles,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScheduleVideoDrawer } from "@/components/ScheduleVideoDrawer";
import { ScheduleCalendar, ScheduledVideoItem } from "@/components/ScheduleCalendar";
import { useEffect } from "react";
import { getLatestRenders, RenderItem, getScheduledContent, ScheduledContent, getDashboardStats, DashboardStats, getMonthlySchedule, MonthlyScheduleItem, ContentJobStatus } from "@/api/videoApi";

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
    date: new Date(2026, 3, 28, 9, 0),
    type: "self",
    title: "Morning market recap — Tesla earnings",
    time: "09:00",
    status: "ready"
  },
  {
    id: "2",
    date: new Date(2026, 3, 28, 14, 30),
    type: "ai",
    title: "3 productivity hacks for designers",
    time: "14:30",
    status: "generating"
  },
  {
    id: "3",
    date: new Date(2026, 3, 28, 19, 0),
    type: "ai",
    title: "Why minimalism still wins in 2026",
    time: "19:00",
    status: "scheduled"
  },
  {
    id: "4",
    date: new Date(2026, 3, 29, 10, 0),
    type: "ai",
    title: "Tech trends to watch",
    time: "10:00",
    status: "scheduled"
  },
  {
    id: "5",
    date: new Date(2026, 3, 30, 15, 0),
    type: "self",
    title: "Weekly recap",
    time: "15:00",
    status: "scheduled"
  },
  {
    id: "6",
    date: new Date(2026, 4, 2, 11, 0),
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
    date: "Apr 28",
    status: "ready"
  },
  {
    id: "2",
    title: "Sunday reflections",
    author: "Kenji",
    duration: "1:12",
    thumbnail: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=600&fit=crop",
    date: "Apr 27",
    status: "ready"
  },
  {
    id: "3",
    title: "Brand teaser — autumn drop",
    author: "Vera",
    duration: "0:32",
    thumbnail: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=600&fit=crop",
    date: "Apr 28",
    status: "ready"
  },
  {
    id: "4",
    title: "Studio walkthrough — episode 04",
    author: "Atlas",
    duration: "1:58",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=600&fit=crop",
    date: "Apr 28",
    status: "ready"
  }
];

export default function TextToVideo() {
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scheduledVideos, setScheduledVideos] = useState<ScheduledVideoItem[]>([]);
  const [recentRenders, setRecentRenders] = useState<RenderItem[]>([]);
  const [playingJobId, setPlayingJobId] = useState<number | null>(null);
  const [isFetchingRenders, setIsFetchingRenders] = useState(false);
  const [dayTasks, setDayTasks] = useState<ScheduledContent[]>([]);
  const [isFetchingDayTasks, setIsFetchingDayTasks] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRenders = async () => {
      setIsFetchingRenders(true);
      try {
        const renders = await getLatestRenders();
        setRecentRenders(renders);
      } catch (error) {
        console.error("Failed to fetch renders:", error);
      } finally {
        setIsFetchingRenders(false);
      }
    };
    fetchRenders();
  }, []);

  useEffect(() => {
    const fetchDayTasks = async () => {
      // Format date as YYYY-MM-DD in local time
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      setIsFetchingDayTasks(true);
      try {
        const tasks = await getScheduledContent(dateStr);
        setDayTasks(tasks);
      } catch (error) {
        console.error("Failed to fetch day tasks:", error);
      } finally {
        setIsFetchingDayTasks(false);
      }
    };
    fetchDayTasks();
  }, [selectedDate]);

  useEffect(() => {
    const fetchMonthlySchedule = async () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1; // getMonth() is 0-indexed
      try {
        const data = await getMonthlySchedule(year, month);
        // Map API response to ScheduledVideoItem format
        const mapped: ScheduledVideoItem[] = data.map(item => ({
          id: item.id,
          date: new Date(item.date),
          type: item.type,
          title: item.title,
          status: item.status === ContentJobStatus.COMPLETED ? "ready" : 
                  item.status === ContentJobStatus.PROCESSING ? "generating" : "scheduled"
        }));
        setScheduledVideos(mapped);
      } catch (error) {
        console.error("Failed to fetch monthly schedule:", error);
      }
    };
    fetchMonthlySchedule();
  }, [currentMonth]);

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
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Schedule.</h1>
          <h2 className="text-4xl md:text-5xl font-bold text-muted-foreground mb-4">
            Generate. Ship.
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Plan a month of videos in minutes. Drop a script, or a single prompt — AutoCast
            writes, voices and renders it on the day you choose.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Button onClick={handleOpenDrawer}>
              <Plus className="w-4 h-4 mr-2" />
              New Video
            </Button>
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
              <span className="text-5xl font-bold">{(stats?.scheduledThisMonth ?? 0).toString().padStart(2, '0')}</span>
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
              <span className="text-5xl font-bold">{(stats?.inProgress ?? 0).toString().padStart(2, '0')}</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Renders scheduled today
              </p>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{(stats?.scheduledToday ?? 0).toString().padStart(2, '0')}</span>
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
              {dayTasks.length} tasks
            </p>

            {isFetchingDayTasks ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Updating day plan...</p>
              </div>
            ) : dayTasks.length === 0 ? (
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
                {dayTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors bg-muted/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-sm font-medium text-muted-foreground min-w-[3.5rem]">
                        {new Date(task.scheduled_at_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm line-clamp-2">
                            {task.title}
                          </h4>
                          {task.full_output_url && (
                             <Button 
                               size="sm" 
                               variant="ghost" 
                               className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                               onClick={() => window.open(task.full_output_url, '_blank')}
                               title="Watch Output"
                             >
                               <Play className="w-4 h-4" />
                             </Button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase tracking-tight">
                            <FileText className="w-2.5 h-2.5" />
                            {task.source_type === 'ai_prompt' ? 'AI' : 'Script'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.processing_status === "completed" && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 font-bold uppercase">
                              ● Completed
                            </span>
                          )}
                          {task.processing_status === "processing" && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold uppercase">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              Processing
                            </span>
                          )}
                          {task.processing_status === "pending" && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-bold uppercase">
                              ● Pending
                            </span>
                          )}
                           {task.processing_status === "failed" && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 font-bold uppercase">
                              ● Failed
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
            {recentRenders.map((render, index) => (
              <motion.div
                key={render.jobId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow bg-card">
                  <div className="relative aspect-[9/16] bg-black flex items-center justify-center">
                    {playingJobId === render.jobId ? (
                      <video
                        src={render.url}
                        autoPlay
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={render.url}
                          className="w-full h-full object-cover opacity-60"
                          preload="metadata"
                        />
                        <div 
                          className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors"
                          onClick={() => setPlayingJobId(render.jobId)}
                        >
                          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-white fill-current ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-green-500/90 text-white font-medium">
                            ● READY
                          </span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(render.url, '_blank');
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                      {render.contentTitle}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        AutoCast AI
                      </div>
                      <span>{new Date(render.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {recentRenders.length === 0 && !isFetchingRenders && (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="font-semibold mb-2">No renders yet.</h4>
                <p className="text-sm text-muted-foreground">
                  Your generated videos will appear here once they are ready.
                </p>
              </div>
            )}
            {isFetchingRenders && recentRenders.length === 0 && (
               <div className="col-span-full py-12 text-center">
                 <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                 <p className="text-sm text-muted-foreground mt-2">Loading library...</p>
               </div>
            )}
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
