import { describe, expect, it, vi } from "vitest";
import type { Episode } from "./types";
import { fetchCatalogue, isEpisodeCatalogue } from "./catalogue";

const fallback = [{ number: 1, title: "Fallback episode" }] as Episode[];
const current = [{ number: 1, title: "Updated episode" }] as Episode[];

describe("episode catalogue loading", () => {
  it("recognises a non-empty catalogue with episode numbers and titles", () => {
    expect(isEpisodeCatalogue(current)).toBe(true);
    expect(isEpisodeCatalogue([{ number: "1", title: "Wrong number type" }])).toBe(false);
    expect(isEpisodeCatalogue([{ number: 1, title: 4 }])).toBe(false);
    expect(isEpisodeCatalogue({ episodes: current })).toBe(false);
  });

  it("requests the generated catalogue under the configured GitHub Pages base path", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(current), { status: 200 }),
    );
    await expect(fetchCatalogue(fallback, "/TKKGtracker/", fetcher)).resolves.toEqual(current);
    expect(fetcher).toHaveBeenCalledWith("/TKKGtracker/data/episodes.json", { cache: "no-cache" });
  });

  it("uses the bundled catalogue if the request fails or data is invalid", async () => {
    const failedFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response("", { status: 503 }));
    await expect(fetchCatalogue(fallback, "/TKKGtracker/", failedFetch)).resolves.toBe(fallback);

    const invalidFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify([{ number: "bad", title: "Invalid" }]), { status: 200 }),
    );
    await expect(fetchCatalogue(fallback, "/TKKGtracker/", invalidFetch)).resolves.toBe(fallback);
  });
});
