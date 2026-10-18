import type { Episode, ProgressMap } from "./types";

export type MissingField = "release_year" | "release_date" | "synopsis" | "cover" | "cast" | "tracks" | "credits" | "physical_releases";
export type ListeningFilter = "all" | "listened" | "unlistened";
export type SortMode = "number-asc" | "number-desc" | "title-asc" | "year-asc" | "year-desc" | "rating-desc";
export interface SearchState {
  query: string; year: string; speaker: string; character: string; missingField: MissingField | "";
  synopsisQuery: string; trackQuery: string; creditQuery: string; listening: ListeningFilter; sort: SortMode;
}
export const initialSearchState: SearchState = {
  query: "", year: "all", speaker: "", character: "", missingField: "",
  synopsisQuery: "", trackQuery: "", creditQuery: "", listening: "all", sort: "number-asc",
};
export const missingFieldLabels: Record<MissingField, string> = {
  release_year: "Release year", release_date: "Exact release date", synopsis: "Synopsis",
  cover: "Cover art", cast: "Cast / speakers", tracks: "Track list",
  credits: "Production credits", physical_releases: "Physical releases",
};
export function normalise(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("de").trim();
}
function contains(haystack: string | null | undefined, needle: string): boolean {
  return !needle.trim() || normalise(haystack ?? "").includes(normalise(needle));
}
export function isMissing(episode: Episode, field: MissingField): boolean {
  switch (field) {
    case "release_year": return episode.release_year == null;
    case "release_date": return !episode.release_date?.trim();
    case "synopsis": return !episode.synopsis?.trim();
    case "cover": return !episode.cover_url?.trim();
    case "cast": return !episode.cast?.some((person) => person.name.trim());
    case "tracks": return !episode.tracks?.some((track) => track.title.trim());
    case "credits": return !episode.credits?.some((credit) => credit.role.trim() || credit.name.trim());
    case "physical_releases": return !episode.physical_releases?.length;
  }
}
export function getSearchOptions(episodes: Episode[]) {
  return {
    years: [...new Set(episodes.map((e) => e.release_year).filter((year): year is number => year != null))].sort((a,b) => a-b),
    speakers: [...new Set(episodes.flatMap((e) => e.cast.map((p) => p.name.trim()).filter(Boolean)))].sort((a,b) => a.localeCompare(b, "de")),
    characters: [...new Set(episodes.flatMap((e) => e.cast.map((p) => p.character?.trim() ?? "").filter(Boolean)))].sort((a,b) => a.localeCompare(b, "de")),
  };
}
export function activeSearchLabels(state: SearchState): string[] {
  const labels: string[] = [];
  if (state.query.trim()) labels.push("Search: “" + state.query.trim() + "”");
  if (state.year === "missing") labels.push("Year missing");
  else if (state.year !== "all") labels.push("Year: " + state.year);
  if (state.speaker) labels.push("Speaker: " + state.speaker);
  if (state.character) labels.push("Character: " + state.character);
  if (state.missingField) labels.push("Missing: " + missingFieldLabels[state.missingField]);
  if (state.synopsisQuery.trim()) labels.push("Synopsis: “" + state.synopsisQuery.trim() + "”");
  if (state.trackQuery.trim()) labels.push("Track: “" + state.trackQuery.trim() + "”");
  if (state.creditQuery.trim()) labels.push("Credits: “" + state.creditQuery.trim() + "”");
  if (state.listening !== "all") labels.push(state.listening === "listened" ? "Listened" : "Not listened");
  return labels;
}
export function filterEpisodes(episodes: Episode[], state: SearchState, progress: ProgressMap): Episode[] {
  const filtered = episodes.filter((episode) => {
    const q = state.query.trim();
    const basicMatch = !q || contains(episode.title, q) || String(episode.number).includes(q);
    const yearMatch = state.year === "all" || (state.year === "missing" ? episode.release_year == null : String(episode.release_year ?? "") === state.year);
    const speakerMatch = !state.speaker || episode.cast.some((person) => normalise(person.name) === normalise(state.speaker));
    const characterMatch = !state.character || episode.cast.some((person) => contains(person.character, state.character));
    const missingMatch = !state.missingField || isMissing(episode, state.missingField);
    const synopsisMatch = !state.synopsisQuery.trim() || contains(episode.synopsis, state.synopsisQuery);
    const trackMatch = !state.trackQuery.trim() || episode.tracks.some((track) => contains(track.title, state.trackQuery));
    const creditMatch = !state.creditQuery.trim() || episode.credits.some((credit) => contains(credit.name, state.creditQuery) || contains(credit.role, state.creditQuery));
    const listened = progress[String(episode.number)]?.listened === true;
    const listeningMatch = state.listening === "all" || (state.listening === "listened" ? listened : !listened);
    return basicMatch && yearMatch && speakerMatch && characterMatch && missingMatch && synopsisMatch && trackMatch && creditMatch && listeningMatch;
  });
  return filtered.sort((a,b) => {
    switch (state.sort) {
      case "number-desc": return b.number-a.number;
      case "title-asc": return a.title.localeCompare(b.title, "de") || a.number-b.number;
      case "year-asc": return (a.release_year ?? Number.POSITIVE_INFINITY) - (b.release_year ?? Number.POSITIVE_INFINITY) || a.number-b.number;
      case "year-desc": return (b.release_year ?? Number.NEGATIVE_INFINITY) - (a.release_year ?? Number.NEGATIVE_INFINITY) || a.number-b.number;
      case "rating-desc": return (progress[String(b.number)]?.personalRating ?? 0) - (progress[String(a.number)]?.personalRating ?? 0) || a.number-b.number;
      default: return a.number-b.number;
    }
  });
}
