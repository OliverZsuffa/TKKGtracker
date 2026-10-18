import type { ProgressMap } from "./types";

const STORAGE_KEY = "tkkgtracker.progress.v1";
const EXPORT_FORMAT = "tkkgtracker-progress/v1";

export function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as ProgressMap;
  } catch {
    return {};
  }
}

export function saveProgress(progress: ProgressMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function exportProgress(progress: ProgressMap): void {
  const payload = {
    format: EXPORT_FORMAT,
    exportedAt: new Date().toISOString(),
    progress,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "tkkgtracker-progress.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importProgress(file: File): Promise<ProgressMap> {
  const parsed: unknown = JSON.parse(await file.text());
  if (!parsed || typeof parsed !== "object" || !("format" in parsed) || !("progress" in parsed)) {
    throw new Error("This file is not a TKKGTracker progress export.");
  }
  const payload = parsed as { format: unknown; progress: unknown };
  if (payload.format !== EXPORT_FORMAT || !payload.progress || typeof payload.progress !== "object" || Array.isArray(payload.progress)) {
    throw new Error("The progress file has an unsupported format.");
  }
  const progress: ProgressMap = {};
  for (const [key, value] of Object.entries(payload.progress)) {
    if (!/^\d+$/.test(key) || !value || typeof value !== "object" || !("listened" in value) || typeof value.listened !== "boolean") {
      throw new Error("The progress file contains an invalid episode record.");
    }
    progress[key] = value as ProgressMap[string];
  }
  return progress;
}
