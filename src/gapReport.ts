import type { MissingField, SearchState } from "./search";
import { missingFieldLabels } from "./search";
import type { Episode } from "./types";

export interface GapReport {
  schema: "tkkgtracker-gap-report/v1";
  createdAt: string;
  status: "unverified-user-observation";
  query: string;
  activeFilters: string[];
  episode: { number: number; title: string } | null;
  field: MissingField | "speaker" | "character" | "other";
  description: string;
}
export function createGapReport(input: {
  state: SearchState; episode?: Episode | null; field: GapReport["field"]; description: string; now?: Date;
}): GapReport {
  const filters = [
    input.state.year !== "all" ? (input.state.year === "missing" ? "Year missing" : "Year: " + input.state.year) : "",
    input.state.speaker ? "Speaker: " + input.state.speaker : "",
    input.state.character ? "Character: " + input.state.character : "",
    input.state.missingField ? "Missing: " + missingFieldLabels[input.state.missingField] : "",
    input.state.synopsisQuery.trim() ? "Synopsis contains: " + input.state.synopsisQuery.trim() : "",
    input.state.trackQuery.trim() ? "Track contains: " + input.state.trackQuery.trim() : "",
    input.state.creditQuery.trim() ? "Credits contain: " + input.state.creditQuery.trim() : "",
    input.state.listening !== "all" ? "Listening: " + input.state.listening : "",
  ].filter(Boolean);
  return {
    schema: "tkkgtracker-gap-report/v1",
    createdAt: (input.now ?? new Date()).toISOString(),
    status: "unverified-user-observation",
    query: input.state.query.trim(),
    activeFilters: filters,
    episode: input.episode ? { number: input.episode.number, title: input.episode.title } : null,
    field: input.field,
    description: input.description.trim(),
  };
}
function safeMarkdown(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/([\\`*_{}\[\]()#+.!|>~-])/g, "\\$1").replace(/\r?\n/g, "  \n");
}
export function formatGapReportMarkdown(report: GapReport): string {
  const field = report.field in missingFieldLabels ? missingFieldLabels[report.field as MissingField] : report.field;
  return [
    "# TKKGTracker — suspected catalogue gap", "",
    "> **Unverified user observation.** This report records a suspicion and does not establish that information is missing from authoritative sources.", "",
    "- Created: " + report.createdAt,
    "- Category: " + safeMarkdown(field),
    "- Search query: " + safeMarkdown(report.query || "(empty)"),
    "- Episode: " + (report.episode ? String(report.episode.number).padStart(3, "0") + " — " + safeMarkdown(report.episode.title) : "Not specified"),
    "- Active filters: " + (report.activeFilters.length ? report.activeFilters.map(safeMarkdown).join(", ") : "None"), "",
    "## Additional context", "", safeMarkdown(report.description || "No additional context provided."), "",
    "## Structured report", "", "```json", JSON.stringify(report, null, 2), "```", "",
  ].join("\n");
}
export function downloadText(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
