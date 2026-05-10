import axiosInstance from "./axiosInstance";

export enum ContentJobStatus {
  SCHEDULED = "scheduled",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

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

export interface RenderItem {
  url: string;
  jobId: number;
  contentTitle: string;
  scheduledDate: string;
}

export interface ScheduledContent {
  id: number;
  title: string;
  source_type: string;
  scheduled_at_utc: string;
  processing_status: string;
  full_output_url?: string;
  user_script?: string;
  prompt?: string;
}

export interface DashboardStats {
  scheduledThisMonth: number;
  inProgress: number;
  scheduledToday: number;
}

export interface MonthlyScheduleItem {
  id: string;
  date: string;
  type: "ai" | "self";
  title: string;
  status: ContentJobStatus;
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

export interface CreateContentRequestPayload {
  title: string;
  source_type: string;
  prompt?: string;
  user_script?: string;
  voice_over_id: number;
  render_format: string;
  template_id: number;
}

export async function createContentRequest(
  payload: CreateContentRequestPayload
): Promise<Record<string, unknown>> {
  const response = await axiosInstance.post(
    "/textToContentGen/CreateRequest",
    payload
  );
  return response.data;
}

export interface VideoTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  video_url: string;
  render_format: string;
  default_music_url: string | null;
  default_music_volume: string;
  allow_music_override: boolean;
  override_music_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getVideoTemplates(): Promise<VideoTemplate[]> {
  const response = await axiosInstance.get(
    "/textToContentGen/videoTemplate/get"
  );
  return response.data;
}

export interface AudioTemplate {
  id: number;
  name: string;
  category: string;
  accent: string;
  tone: string;
  url: string;
  sort_order: number;
}

export async function getAudioTemplates(): Promise<AudioTemplate[]> {
  const response = await axiosInstance.get("/textToContentGen/getAudio");
  return response.data;
}

export async function getLatestRenders(): Promise<RenderItem[]> {
  const response = await axiosInstance.get("/textToContentGen/getLatestRenders");
  return response.data;
}

export async function getScheduledContent(date: string): Promise<ScheduledContent[]> {
  const response = await axiosInstance.get("/textToContentGen/getScheduledContent", {
    params: { date }
  });
  return response.data;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await axiosInstance.get("/textToContentGen/getDashboardStats");
  return response.data;
}

export async function getMonthlySchedule(year: number, month: number): Promise<MonthlyScheduleItem[]> {
  const response = await axiosInstance.get("/textToContentGen/getMonthlySchedule", {
    params: { year, month }
  });
  return response.data;
}
