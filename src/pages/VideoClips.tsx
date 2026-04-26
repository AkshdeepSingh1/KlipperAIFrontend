import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { getClipsFromVideoId, Clip } from "@/api/videoApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Loader2, Film, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { t } from "@/i18n";

function ClipCard({ clip, onPlay }: { clip: Clip; onPlay: () => void }) {
  return (
    <Card className="overflow-hidden group aspect-[9/16] max-h-[320px] bg-muted cursor-pointer">
      <div className="relative w-full h-full">
        <img
          src={clip.thumbnail}
          alt={clip.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <Button
          variant="glass"
          size="icon"
          onClick={onPlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12"
        >
          <Play className="w-6 h-6" />
        </Button>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-medium line-clamp-2 mb-1">{clip.title}</p>
          <p className="text-xs text-muted-foreground">{clip.duration}</p>
        </div>
      </div>
    </Card>
  );
}

export default function VideoClips() {
  const { videoId } = useParams<{ videoId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  const locationState = location.state as { title?: string; fromTab?: string } | null;
  const videoTitle = locationState?.title;
  const fromTab = locationState?.fromTab;

  useEffect(() => {
    if (!videoId || !isAuthenticated) return;
    setLoading(true);
    setError(null);
    getClipsFromVideoId(videoId)
      .then(setClips)
      .catch((err) => {
        const message =
          err?.response?.data?.message ??
          err?.response?.data?.detail ??
          "Failed to load clips";
        setError(String(message));
        setClips([]);
      })
      .finally(() => setLoading(false));
  }, [videoId, isAuthenticated]);

  if (authLoading) {
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

  if (!videoId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">{t("videoClips.missingIdMessage")}</p>
          <Button
            variant="link"
            onClick={() =>
              navigate(
                (location.state as { fromTab?: string } | null)?.fromTab === "in-progress"
                  ? "/video-management?tab=in-progress"
                  : "/video-management"
              )
            }
          >
            {t("videoClips.backToDashboard")}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              navigate(fromTab === "in-progress" ? "/video-management?tab=in-progress" : "/video-management")
            }
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {videoTitle
                ? t("videoClips.headerTitleWithName").replace("{{title}}", videoTitle)
                : t("videoClips.headerTitleFallback")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {loading
                ? t("videoClips.loadingLabel")
                : clips.length === 1
                  ? t("videoClips.clipsCountOne").replace(
                    "{{count}}",
                    String(clips.length)
                  )
                  : t("videoClips.clipsCountMany").replace(
                    "{{count}}",
                    String(clips.length)
                  )}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">
              {t("videoClips.loadingSectionLabel")}
            </p>
          </div>
        ) : clips.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Film className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {t("videoClips.emptyTitle")}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {error
                ? t("videoClips.emptyDescriptionError")
                : t("videoClips.emptyDescriptionNoError")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {clips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} onPlay={() => setSelectedClip(clip)} />
            ))}
          </div>
        )}
      </div>

      {selectedClip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedClip(null)}
        >
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedClip(null)}
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={selectedClip.videoUrl}
                controls
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="mt-4 text-white">
              <h3 className="text-lg font-semibold">{selectedClip.title}</h3>
              <p className="text-sm text-white/70">{selectedClip.duration}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
