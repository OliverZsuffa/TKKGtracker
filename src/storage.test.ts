import { describe, expect, it } from "vitest";
import { cleanProgressForExport, importProgress, loadProgress, saveProgress } from "./storage";

describe("progress storage", () => {
  it("returns an empty map when no progress exists", () => {
    localStorage.clear();
    expect(loadProgress()).toEqual({});
  });

  it("round trips progress through local storage", () => {
    const progress = { "1": { listened: true }, "2": { listened: false, notes: "Later" } };
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });

  it("rejects unrelated JSON files", async () => {
    const file = new File([JSON.stringify({ hello: "world" })], "wrong.json", { type: "application/json" });
    await expect(importProgress(file)).rejects.toThrow("not a TKKGTracker progress export");
  });

  it("rejects malformed episode progress", async () => {
    const file = new File([JSON.stringify({ format: "tkkgtracker-progress/v1", progress: { "1": { listened: "yes" } } })], "bad.json", { type: "application/json" });
    await expect(importProgress(file)).rejects.toThrow("invalid episode record");
  });

  it("omits untouched and unlistened episodes from exports", () => {
    expect(cleanProgressForExport({
      "215": { listened: false },
      "218": { listened: false, notes: "" },
      "220": { listened: false, notes: "  \t " },
    })).toEqual({});
  });

  it("keeps listened episodes and removes empty notes", () => {
    expect(cleanProgressForExport({
      "1": { listened: true, notes: "" },
      "2": { listened: true, notes: "  " },
    })).toEqual({
      "1": { listened: true },
      "2": { listened: true },
    });
  });

  it("preserves ratings and non-empty notes even when unlistened", () => {
    expect(cleanProgressForExport({
      "169": { listened: true, personalRating: 1, notes: "Keine Spannung, zu schnell vorbei" },
      "3": { listened: false, personalRating: 4, notes: "" },
      "4": { listened: false, notes: "Noch einmal hören" },
    })).toEqual({
      "169": { listened: true, personalRating: 1, notes: "Keine Spannung, zu schnell vorbei" },
      "3": { listened: false, personalRating: 4 },
      "4": { listened: false, notes: "Noch einmal hören" },
    });
  });

  it("does not mutate the original progress object", () => {
    const progress = { "1": { listened: false, notes: "   " }, "2": { listened: true, notes: "" } };
    const original = JSON.stringify(progress);
    cleanProgressForExport(progress);
    expect(JSON.stringify(progress)).toBe(original);
  });
});
