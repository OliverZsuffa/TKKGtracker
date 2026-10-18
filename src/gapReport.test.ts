import { describe, expect, it } from "vitest";
import { createGapReport, formatGapReportMarkdown } from "./gapReport";
import { initialSearchState } from "./search";

describe("suspected gap reports", () => {
  it("includes query, filters, timestamp and explicit unverified status", () => {
    const report = createGapReport({ state: { ...initialSearchState, query: "missing speaker", year: "missing" }, field: "speaker", description: "Please check this.", now: new Date("2026-01-02T03:04:05.000Z") });
    expect(report.schema).toBe("tkkgtracker-gap-report/v1");
    expect(report.status).toBe("unverified-user-observation");
    expect(report.query).toBe("missing speaker");
    expect(report.activeFilters).toContain("Year missing");
    expect(formatGapReportMarkdown(report)).toContain("Unverified user observation");
  });
  it("escapes markdown in user text and supports an absent episode", () => {
    const report = createGapReport({ state: initialSearchState, field: "other", description: "*not verified*\nline two" });
    const markdown = formatGapReportMarkdown(report);
    expect(report.episode).toBeNull();
    expect(markdown).toContain("Not specified");
    expect(markdown).toContain("\\*not verified\\*");
    expect(markdown).toContain("line two");
  });
});
