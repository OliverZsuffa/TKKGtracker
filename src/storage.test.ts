import { describe, expect, it } from "vitest";
import { importProgress, loadProgress, saveProgress } from "./storage";

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
});
