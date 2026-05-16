import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, User, Play, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { getLatestRenders, RenderItem } from "@/api/videoApi";
import { useNavigate } from "react-router-dom";

export default function LastRenders() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [renders, setRenders] = useState<RenderItem[]>([]);
  const [isLoadingRenders, setIsLoadingRenders] = useState(false);
  const [playingJobId, setPlayingJobId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRenders = async () => {
      setIsLoadingRenders(true);
      try {
        const data = await getLatestRenders();
        setRenders(data);
      } catch (error) {
        console.error("Failed to fetch renders:", error);
      } finally {
        setIsLoadingRenders(false);
      }
    };
    fetchRenders();
  }, []);

  const groupedRenders = useMemo(() => {
    const groups: { [key: string]: RenderItem[] } = {};
    
    // Sort renders by date descending
    const sorted = [...renders].sort((a, b) => 
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );

    sorted.forEach(render => {
      const date = new Date(render.scheduledDate);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(render);
    });

    return groups;
  }, [renders]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout showFooter={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)} 
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-4xl font-bold mb-2">Last Renders.</h1>
            <p className="text-muted-foreground">
              Your complete history of generated videos, organized by month.
            </p>
          </div>
        </div>

        {isLoadingRenders ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Fetching your masterpiece library...</p>
          </div>
        ) : Object.keys(groupedRenders).length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No renders found</h3>
            <p className="text-muted-foreground mb-6">
              Start scheduling videos to see your history grow.
            </p>
            <Button onClick={() => navigate("/text-to-video")}>
              Schedule a Video
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedRenders).map(([monthYear, monthRenders]) => (
              <div key={monthYear} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold tracking-tight">{monthYear}</h2>
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                    {monthRenders.length} {monthRenders.length === 1 ? 'video' : 'videos'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {monthRenders.map((render, index) => (
                    <motion.div
                      key={render.jobId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow bg-card h-full flex flex-col">
                        <div className="relative aspect-[9/16] bg-black flex items-center justify-center overflow-hidden">
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
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <h4 className="font-semibold text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                            {render.contentTitle}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
