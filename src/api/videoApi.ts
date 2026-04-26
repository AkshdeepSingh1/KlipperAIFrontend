import axiosInstance from "./axiosInstance";

export enum FilterStatus {
  INCOMPLETE = 0,
  COMPLETED = 1,
  ALL = 2,
}

export interface Clip {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  createdAt: Date;
}

function parseDuration(raw: Record<string, unknown>): string {
  const sec =
    raw.duration_sec ??
    raw.duration_seconds ??
    raw.durationSeconds ??
    raw.durationSec;
  if (
    sec !== undefined &&
    sec !== null &&
    (typeof sec === "number" || typeof sec === "string")
  ) {
    const s = typeof sec === "number" ? Math.floor(sec) : Math.floor(Number(sec) || 0);
    if (s < 60) return `${s}s`;
    if (s < 3600) {
      const m = Math.floor(s / 60);
      const r = s % 60;
      return r > 0 ? `${m}m ${r}s` : `${m}m`;
    }
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    const parts = [
      `${h}h`,
      m > 0 ? `${m}m` : null,
      r > 0 ? `${r}s` : null,
    ].filter(Boolean);
    return parts.join(" ");
  }
  return String(raw.duration ?? "0:00");
}

function mapRawToClip(raw: Record<string, unknown>, index: number): Clip {
  const createdAt = raw.createdAt ?? raw.created_at;
  return {
    id: String(raw.id ?? raw.clip_id ?? `clip-${index}`),
    title: String(raw.title ?? raw.name ?? `Clip ${index + 1}`),
    duration: parseDuration(raw),
    thumbnail: String(raw.thumbnail_url ?? raw.thumbnail ?? ""),
    videoUrl: String(raw.clip_url ?? raw.videoUrl ?? raw.video_url ?? ""),
    createdAt:
      createdAt instanceof Date
        ? createdAt
        : new Date(String(createdAt ?? Date.now())),
  };
}

export async function getClipsFromVideoId(videoId: string): Promise<Clip[]> {
  const response = await axiosInstance.get(
    "/videoInputOutput/getClipsFromVideoId",
    { params: { videoId } }
  );
  const data = response.data;
  const rawList = Array.isArray(data)
    ? data
    : data?.clips ?? data?.data ?? [];
  return (rawList as Record<string, unknown>[]).map(mapRawToClip);
}
