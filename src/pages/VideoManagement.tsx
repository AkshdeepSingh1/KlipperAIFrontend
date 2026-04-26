import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { VideoCard } from "@/components/VideoCard";
import { useVideos } from "@/contexts/VideoContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Upload, Video, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { t } from "@/i18n";
import { FilterStatus } from "@/api/videoApi";

export default function VideoManagement() {
  const { videos, fetchVideos, isLoadingVideos, fetchError } = useVideos();
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const initialTab =
    searchParams.get("tab") === "in-progress" ? "in-progress" : "my-videos";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [hasFetchedAll, setHasFetchedAll] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = value === "in-progress" ? "/video-management?tab=in-progress" : "/video-management";
    navigate(url, { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get("tab") === "in-progress" ? "in-progress" : "my-videos";
    setActiveTab(tabFromUrl);
  }, [location.search]);

  useEffect(() => {
    if (isAuthenticated && !hasFetchedAll) {
      fetchVideos(FilterStatus.ALL);
      setHasFetchedAll(true);
    }
  }, [isAuthenticated, hasFetchedAll, fetchVideos]);

  // Filter videos based on active tab
  const filteredVideos = videos.filter((video) => {
    if (activeTab === "my-videos") {
      return video.status === "completed";
    } else {
      return video.status === "processing";
    }
  });

  const completedCount = videos.filter((v) => v.status === "completed").length;
  const inProgressCount = videos.filter((v) => v.status === "processing").length;

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
            {new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()} — {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase().replace(',', ',')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Upload.</h1>
          <h2 className="text-4xl md:text-5xl font-bold text-muted-foreground mb-4">
            Transform. Publish.
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Turn your long-form videos into viral shorts in minutes. Upload once, let AI find the best moments, and generate engaging clips ready to post.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">
              {isLoadingVideos
                ? t("dashboard.loadingLabel")
                : videos.length === 1
                  ? `${videos.length} video processed`
                  : `${videos.length} videos processed`}
            </span>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <Link to="/upload">
            <Button variant="gradient" size="lg">
              <Upload className="w-4 h-4 mr-2" />
              {t("dashboard.uploadButton")}
            </Button>
          </Link>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            {fetchError}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-11 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="my-videos" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t("dashboard.tabMyVideos")} ({completedCount})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {t("dashboard.tabInProgress")} ({inProgressCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-videos" className="mt-0">
            {isLoadingVideos ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredVideos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24"
              >
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                  <Video className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {t("dashboard.myVideosEmptyTitle")}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t("dashboard.myVideosEmptyDescription")}
                </p>
                <Link to="/upload">
                  <Button variant="gradient" size="lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t("dashboard.myVideosEmptyCta")}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <VideoCard video={video} statusLabel="Completed" />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="mt-0">
            {isLoadingVideos ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredVideos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24"
              >
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {t("dashboard.inProgressEmptyTitle")}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t("dashboard.inProgressEmptyDescription")}
                </p>
                <Link to="/upload">
                  <Button variant="gradient" size="lg">
                    <Upload className="w-4 h-4 mr-2" />
                    {t("dashboard.inProgressEmptyCta")}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <VideoCard video={video} statusLabel="In Progress" />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
