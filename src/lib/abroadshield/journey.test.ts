import { describe, expect, test } from "bun:test";
import { countryContext, normalizePhase } from "./journey";

describe("Journey normalization", () => {
  test("normalizes valid phases without accepting arbitrary values", () => {
    expect(normalizePhase(" ARRIVAL ")).toBe("arrival");
    expect(normalizePhase("studying")).toBe("studying");
    expect(normalizePhase("not-a-phase")).toBe("pre-departure");
    expect(normalizePhase()).toBe("pre-departure");
  });

  test("resolves country context case-insensitively and trims input", () => {
    expect(countryContext(" France ").code).toBe("FR");
    expect(countryContext("FRANCE").code).toBe("FR");
    expect(countryContext("unknown").code).toBe("");
  });
});
