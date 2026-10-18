import type { Episode } from "./types";

export function isEpisodeCatalogue(value: unknown): value is Episode[] {
  return Array.isArray(value) && value.every((item) => (
    item !== null
    && typeof item === "object"
    && "number" in item
    && Number.isInteger(item.number)
    && "title" in item
    && typeof item.title === "string"
  ));
}

export async function fetchCatalogue(
  fallback: Episode[],
  baseUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<Episode[]> {
  try {
    const response = await fetcher(`${baseUrl}data/episodes.json`, { cache: "no-cache" });
    if (!response.ok) return fallback;
    const value: unknown = await response.json();
    return isEpisodeCatalogue(value) && value.length > 0 ? value : fallback;
  } catch {
    return fallback;
  }
}
