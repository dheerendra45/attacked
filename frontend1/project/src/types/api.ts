export interface JobStatus {
  job_id: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILURE";
  progress: number;
  error?: string | null;
  briefing_id?: string | null;
}

export interface BriefingSummary {
  id: string;
  video_src: string;
  duration_s: number;
  slice_len_s: number;
  scores: {
    content: number;
    delivery: number;
    impact: number;
    composite: number;
  };
  highlights: Array<{
    t_start: number;
    t_end: number;
    risk_tags: string[];
    note: string;
  }>;
  volatility: {
    content: number;
    delivery: number;
    impact: number;
  };
  created_at: string; // ISO
}

export interface BriefingListItem {
  id: string;
  video_src: string;
  scores: Record<string, number>;
  created_at: string;
}

export interface SliceRow {
  slice_id: string;
  t_start: number;
  t_end: number;
  transcript: string;
  metrics: Record<string, any>;
  risk_tags: string[];
  thumbnails: string[];
  au: Record<string, number>;
}

export interface HealthResponse {
  status: string;
  time: string;
}

export interface JobResponse {
  job_id: string;
}