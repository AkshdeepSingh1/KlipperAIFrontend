import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import axiosInstance from "@/api/axiosInstance";
import { FilterStatus } from "@/api/videoApi";

export interface Short {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  createdAt: Date;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  uploadedAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
  shorts: Short[];
}

interface VideoContextType {
  videos: Video[];
  isLoadingVideos: boolean;
  fetchError: string | null;
  fetchVideos: (filterStatus: FilterStatus) => Promise<void>;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  deleteShort: (videoId: string, shortId: string) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

/** Format duration_seconds into human-readable string: "45s", "5m 30s", "1h 15m" */
function formatDurationSeconds(seconds: number | string | undefined): string {
  const sec = typeof seconds === "number" ? Math.floor(seconds) : Math.floor(Number(seconds) || 0);
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts = [`${h}h`, m > 0 ? `${m}m` : null, s > 0 ? `${s}s` : null].filter(Boolean);
  return parts.join(" ");
}

function parseDuration(raw: Record<string, unknown>, keySeconds = "duration_seconds", keyStr = "duration"): string {
  const sec = raw[keySeconds] ?? raw.durationSeconds;
  if (sec !== undefined && sec !== null && (typeof sec === "number" || typeof sec === "string")) return formatDurationSeconds(sec);
  return String(raw[keyStr] ?? "0:00");
}

/** Parse get-user-videos API date (UTC, no Z suffix) so Date represents correct instant for relative time. */
function parseUtcDate(value: unknown): Date {
  if (value instanceof Date) return value;
  const s = String(value ?? Date.now()).trim();
  if (!s) return new Date();
  // API returns UTC e.g. "2026-02-13T21:33:13.678471" — parse as UTC so "X hours ago" is correct
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s) && !/Z|[+-]\d{2}:?\d{2}$/.test(s)) {
    return new Date(s + "Z");
  }
  return new Date(s);
}

// Map API response (supports snake_case or camelCase) to Video format
function mapApiVideoToVideo(raw: Record<string, unknown>): Video {
  const uploadedAtRaw = raw.uploadedAt ?? raw.uploaded_at ?? raw.createdAt ?? raw.created_at;
  const rawShorts = (raw.shorts ?? raw.outputs ?? []) as Record<string, unknown>[];
  const shorts: Short[] = rawShorts.map((s, i) => ({
    id: String(s.id ?? s.short_id ?? `s-${i}`),
    title: String(s.title ?? s.name ?? ""),
    duration: parseDuration(s as Record<string, unknown>, "duration_seconds", "duration"),
    thumbnail: String((s as Record<string, unknown>).thumbnail ?? (s as Record<string, unknown>).thumbnail_url ?? ""),
    videoUrl: String(s.videoUrl ?? s.video_url ?? ""),
    createdAt: parseUtcDate(s.created_at ?? s.createdAt ?? Date.now()),
  }));
  const statusRaw = String(raw.processing_status ?? raw.status ?? "completed").toLowerCase();
  const status = (["processing", "completed", "failed", "pending"].includes(statusRaw) 
    ? (statusRaw === "pending" ? "processing" : statusRaw) 
    : "completed") as Video["status"];
  return {
    id: String(raw.id ?? raw.video_id ?? ""),
    title: String(raw.title ?? raw.name ?? ""),
    thumbnail: String((raw as Record<string, unknown>).thumbnail ?? (raw as Record<string, unknown>).thumbnail_url ?? ""),
    duration: parseDuration(raw, "duration_seconds", "duration"),
    uploadedAt: parseUtcDate(uploadedAtRaw),
    status,
    shorts,
  };
}

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchVideos = useCallback(async (filterStatus: FilterStatus) => {
    setIsLoadingVideos(true);
    setFetchError(null);
    try {
      const response = await axiosInstance.get("/videoInputOutput/get-user-videos", {
        params: { filterStatus },
        headers: { "Content-Type": "application/json" },
      });
      const data = response.data;
      const rawList = Array.isArray(data) ? data : data?.videos ?? data?.data ?? [];
      const mapped = (rawList as Record<string, unknown>[]).map(mapApiVideoToVideo).filter((v) => v.id);
      setVideos(mapped);
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string; detail?: string } } }).response?.data?.message
        ?? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : "Failed to load videos";
      // setFetchError(String(message ?? "Failed to load videos"));
      setVideos([]);
    } finally {
      setIsLoadingVideos(false);
    }
  }, []);

  const addVideo = (video: Video) => {
    setVideos((prev) => [video, ...prev]);
  };

  const updateVideo = (id: string, updates: Partial<Video>) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, ...updates } : video
      )
    );
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((video) => video.id !== id));
  };

  const deleteShort = (videoId: string, shortId: string) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
            ...video,
            shorts: video.shorts.filter((short) => short.id !== shortId),
          }
          : video
      )
    );
  };

  return (
    <VideoContext.Provider
      value={{ videos, isLoadingVideos, fetchError, fetchVideos, addVideo, updateVideo, deleteVideo, deleteShort }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideos() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideos must be used within a VideoProvider");
  }
  return context;
}
