import type { Episode, ListeningLink } from "./types";

export interface ListeningOption {
  id: string;
  label: string;
  url: string;
  kind: "official" | "search";
  description: string;
}

const SERVICES = [
  {
    id: "spotify",
    label: "Spotify",
    url: (query: string) => `https://open.spotify.com/search/${encodeURIComponent(query)}`,
  },
  {
    id: "apple-music",
    label: "Apple Music",
    url: (query: string) => `https://music.apple.com/de/search?term=${encodeURIComponent(query)}`,
  },
  {
    id: "amazon-music",
    label: "Amazon Music",
    url: (query: string) => `https://music.amazon.de/search/${encodeURIComponent(query)}`,
  },
  {
    id: "deezer",
    label: "Deezer",
    url: (query: string) => `https://www.deezer.com/search/${encodeURIComponent(query)}`,
  },
  {
    id: "youtube-music",
    label: "YouTube Music",
    url: (query: string) => `https://music.youtube.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "youtube",
    label: "YouTube",
    url: (query: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
  },
] as const;

export function getListeningOptions(episode: Episode): {
  official: ListeningOption[];
  searches: ListeningOption[];
} {
  const official: ListeningOption[] = (episode.listening_links ?? [])
    .filter(isSafeOfficialLink)
    .map((link: ListeningLink, index) => ({
      id: `official-${index}-${link.url}`,
      label: link.label,
      url: link.url,
      kind: "official" as const,
      description: "Official episode-specific listening page",
    }));

  const query = `TKKG Folge ${String(episode.number).padStart(3, "0")} ${episode.title}`;
  const searches: ListeningOption[] = SERVICES.map((service) => ({
    id: service.id,
    label: service.label,
    url: service.url(query),
    kind: "search" as const,
    description: `Search ${service.label} for this episode; availability is not confirmed`,
  }));

  return { official, searches };
}

function isSafeOfficialLink(link: ListeningLink): boolean {
  try {
    const url = new URL(link.url);
    return url.protocol === "https:" &&
      url.hostname === "tkkg.lnk.to" &&
      link.service === "official" &&
      link.link_type === "official_hub";
  } catch {
    return false;
  }
}
