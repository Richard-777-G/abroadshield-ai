import { describe, expect, test } from "bun:test";
import { isValidCalendarDate, requireCalendarDate } from "./date-validation";

describe("calendar date validation", () => {
  test("accepts real calendar dates", () => {
    expect(isValidCalendarDate("2026-09-07")).toBe(true);
    expect(isValidCalendarDate("2028-02-29")).toBe(true);
  });

  test("rejects impossible dates", () => {
    expect(isValidCalendarDate("2026-02-29")).toBe(false);
    expect(isValidCalendarDate("2026-04-31")).toBe(false);
    expect(isValidCalendarDate("2026-13-01")).toBe(false);
  });

  test("rejects malformed values", () => {
    expect(isValidCalendarDate("2026-9-7")).toBe(false);
    expect(isValidCalendarDate("2026-09-07T00:00:00Z")).toBe(false);
  });

  test("throws with the field name for invalid required values", () => {
    expect(() => requireCalendarDate("2026-02-29", "entryDate")).toThrow("entryDate");
  });
});
