import { describe, expect, it } from "vitest";
import type { Episode } from "./types";
import { getListeningOptions } from "./listeningLinks";

const episode = (listening_links?: Episode["listening_links"]): Episode => ({
  number: 1,
  title: "Die Jagd nach den Millionendieben",
  series: "TKKG",
  synopsis: null,
  cover_url: null,
  release_date: null,
  release_year: 1981,
  physical_releases: [],
  tracks: [],
  cast: [],
  credits: [],
  ratings: [],
  sources: [],
  last_checked: null,
  listening_links,
});

describe("episode listening links", () => {
  it("provides an official episode hub when a verified link exists", () => {
    const result = getListeningOptions(episode([{
      service: "official",
      label: "Offizielle Hörspiel-Plattformen",
      url: "https://tkkg.lnk.to/-001AW",
      link_type: "official_hub",
      source_url: "https://www.tkkg.de/produkte/hoerspiele",
    }]));
    expect(result.official).toHaveLength(1);
    expect(result.official[0].url).toBe("https://tkkg.lnk.to/-001AW");
    expect(result.official[0].kind).toBe("official");
  });

  it("does not render unsafe or non-official destinations as verified links", () => {
    const result = getListeningOptions(episode([
      { service: "official", label: "Bad scheme", url: "javascript:alert(1)", link_type: "official_hub", source_url: "https://www.tkkg.de/produkte/hoerspiele" },
      { service: "official", label: "Wrong host", url: "https://example.com/episode", link_type: "official_hub", source_url: "https://www.tkkg.de/produkte/hoerspiele" },
    ]));
    expect(result.official).toHaveLength(0);
  });

  it("offers accurately labelled search fallbacks for six services", () => {
    const result = getListeningOptions(episode());
    expect(result.official).toHaveLength(0);
    expect(result.searches.map((item) => item.label)).toEqual([
      "Spotify", "Apple Music", "Amazon Music", "Deezer", "YouTube Music", "YouTube",
    ]);
    expect(result.searches.every((item) => item.kind === "search")).toBe(true);
    expect(result.searches[0].url).toContain("open.spotify.com/search/");
    expect(decodeURIComponent(result.searches[0].url)).toContain("Die Jagd nach den Millionendieben");
  });
});
