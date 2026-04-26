import { Video } from "@/contexts/VideoContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { t } from "@/i18n";

interface VideoCardProps {
  video: Video;
  /** Status label to show at top: "Completed" or "In Progress" based on tab */
  statusLabel?: "Completed" | "In Progress";
}

export function VideoCard({ video, statusLabel }: VideoCardProps) {
  const isClickable = video.status === "completed" && statusLabel !== "In Progress";
  
  const cardContent = (
    <Card className={`overflow-hidden card-shadow transition-shadow duration-300 ${isClickable ? "hover:shadow-lg cursor-pointer" : "cursor-not-allowed opacity-80"}`}>
        <div className="relative group">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-lg line-clamp-2">{video.title}</h3>
          </div>
          <div className="absolute top-4 left-4 right-4 flex justify-end">
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wide ${statusLabel === "Completed"
                ? "bg-green-500/20 text-green-400"
                : statusLabel === "In Progress"
                  ? "bg-amber-500/20 text-amber-400"
                  : video.status === "completed"
                    ? "bg-green-500/20 text-green-400"
                    : video.status === "processing"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                }`}
            >
              {statusLabel === "Completed"
                ? t("dashboard.statusCompleted")
                : statusLabel === "In Progress"
                  ? t("dashboard.statusInProgress")
                  : video.status}
            </span>
          </div>
          {isClickable && (
            <Button
              variant="glass"
              size="icon"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Play className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {video.duration}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDistanceToNow(video.uploadedAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </Card>
  );

  if (isClickable) {
    return (
      <Link
        to={`/video/${video.id}/clips`}
        state={{
          title: video.title,
          fromTab: "my-videos",
        }}
        className="block"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
