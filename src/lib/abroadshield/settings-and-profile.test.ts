import { describe, expect, test } from "bun:test";
import { sanitizeJourneyProfile } from "./journey-service";

describe("Settings and Profile Persistence", () => {
  test("sanitizes student profile input and normalizes phase correctly", () => {
    const input = {
      destination: "France",
      university: "Sorbonne Université",
      course: "MSc Computer Science",
      intake: "Fall 2025 (September)",
      currentPhase: "ARRIVAL",
      readiness: 85,
      documentsTotal: 10,
      documentsVerified: 8,
    };

    const sanitized = sanitizeJourneyProfile(input);

    expect(sanitized.destination).toBe("France");
    expect(sanitized.university).toBe("Sorbonne Université");
    expect(sanitized.course).toBe("MSc Computer Science");
    expect(sanitized.intake).toBe("Fall 2025 (September)");
    expect(sanitized.currentPhase).toBe("arrival");
    expect(sanitized.readiness).toBe(85);
    expect(sanitized.documentsTotal).toBe(10);
    expect(sanitized.documentsVerified).toBe(8);
  });

  test("clamps negative numerical fields to zero", () => {
    const sanitized = sanitizeJourneyProfile({
      readiness: -20,
      documentsTotal: -5,
      documentsVerified: -1,
    });

    expect(sanitized.readiness).toBe(0);
    expect(sanitized.documentsTotal).toBe(0);
    expect(sanitized.documentsVerified).toBe(0);
  });

  test("handles unknown journey phase gracefully by defaulting to pre-departure", () => {
    const sanitized = sanitizeJourneyProfile({
      currentPhase: "invalid_phase_xyz",
    });

    expect(sanitized.currentPhase).toBe("pre-departure");
  });
});
