export interface SourceReference {
  name: string;
  url: string;
  retrieved_at: string;
}

export interface PhysicalRelease {
  medium?: string | null;
  label?: string | null;
  ean?: string | null;
  release_date?: string | null;
  source_url: string;
}

export interface Episode {
  number: number;
  title: string;
  series: "TKKG";
  synopsis: string | null;
  cover_url: string | null;
  release_date: string | null;
  release_year: number | null;
  physical_releases: PhysicalRelease[];
  tracks: { title: string; duration?: string | null }[];
  cast: { name: string; character?: string | null }[];
  credits: { role: string; name: string }[];
  ratings: { source: string; category: string; value: string | number; review_count?: number | null }[];
  sources: SourceReference[];
  last_checked: string | null;
}

export interface EpisodeProgress {
  listened: boolean;
  personalRating?: number;
  notes?: string;
}

export type ProgressMap = Record<string, EpisodeProgress>;
