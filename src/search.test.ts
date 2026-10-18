import { describe, expect, it } from "vitest";
import type { Episode } from "./types";
import { filterEpisodes, initialSearchState, isMissing, normalise } from "./search";

const makeEpisode = (overrides: Partial<Episode> = {}): Episode => ({
  number: 1, title: "Der blinde Hellseher", series: "TKKG", synopsis: "Ein Fall im Museum",
  cover_url: "https://example.test/cover.jpg", release_date: null, release_year: 1981,
  physical_releases: [{ medium: "CD", source_url: "https://example.test" }],
  tracks: [{ title: "Mutprobe" }], cast: [{ name: "Sascha Draeger", character: "Tim / Tarzan" }],
  credits: [{ role: "Director", name: "Example Person" }], ratings: [], sources: [], last_checked: null, ...overrides,
});
describe("catalogue search", () => {
  it("matches title and episode number case-insensitively", () => {
    const data = [makeEpisode(), makeEpisode({ number: 2, title: "Andere Folge" })];
    expect(filterEpisodes(data, { ...initialSearchState, query: "HELLSEHER" }, {}).map(e => e.number)).toEqual([1]);
    expect(filterEpisodes(data, { ...initialSearchState, query: "2" }, {}).map(e => e.number)).toEqual([2]);
  });
  it("normalises accents and distinguishes speakers from characters", () => {
    const episode = makeEpisode({ cast: [{ name: "Jürgen Müller", character: "Kommissar" }] });
    expect(normalise("Jürgen")).toBe("jurgen");
    expect(filterEpisodes([episode], { ...initialSearchState, speaker: "jurgen muller" }, {})).toHaveLength(1);
    expect(filterEpisodes([episode], { ...initialSearchState, character: "Jürgen" }, {})).toHaveLength(0);
    expect(filterEpisodes([episode], { ...initialSearchState, character: "kommissar" }, {})).toHaveLength(1);
  });
  it("filters years, synopsis, tracks, credits and listened status together", () => {
    const episode = makeEpisode();
    const state = { ...initialSearchState, year: "1981", synopsisQuery: "museum", trackQuery: "mutprobe", creditQuery: "example", listening: "listened" as const };
    expect(filterEpisodes([episode], state, { "1": { listened: true } })).toHaveLength(1);
    expect(filterEpisodes([episode], state, {})).toHaveLength(0);
    expect(filterEpisodes([episode], { ...state, year: "1990" }, { "1": { listened: true } })).toHaveLength(0);
  });
  it("finds missing metadata without confusing year and exact date", () => {
    const episode = makeEpisode({ release_year: null, release_date: null, synopsis: "  ", cover_url: null, cast: [], tracks: [], credits: [], physical_releases: [] });
    for (const field of ["release_year", "release_date", "synopsis", "cover", "cast", "tracks", "credits", "physical_releases"] as const) expect(isMissing(episode, field)).toBe(true);
    expect(filterEpisodes([episode], { ...initialSearchState, year: "missing" }, {})).toHaveLength(1);
    expect(filterEpisodes([episode], { ...initialSearchState, missingField: "synopsis" }, {})).toHaveLength(1);
  });
  it("sorts unknown years last and unrated episodes below rated episodes", () => {
    const data = [makeEpisode({ number: 3, release_year: null }), makeEpisode({ number: 2, release_year: 1980 }), makeEpisode({ number: 1, release_year: 1990 })];
    expect(filterEpisodes(data, { ...initialSearchState, sort: "year-asc" }, {}).map(e => e.number)).toEqual([2,1,3]);
    expect(filterEpisodes(data, { ...initialSearchState, sort: "rating-desc" }, { "3": { listened: false, personalRating: 2 }, "2": { listened: false, personalRating: 5 } }).map(e => e.number)).toEqual([2,3,1]);
  });
});
