import { describe, expect, test } from "bun:test";
import { calculateFrenchWorkBudget, calculateVlsTsValidationDeadline } from "./france";

describe("France VLS-TS validation deadline", () => {
  test("uses three calendar months rather than a fixed 90-day approximation", () => {
    const result = calculateVlsTsValidationDeadline({ entryDateIntoFrance: "2026-01-31", currentDate: "2026-04-01" });
    expect(result.deadline).toBe("2026-04-30");
    expect(result.daysRemaining).toBe(29);
    expect(result.status).toBe("WARNING_30_DAYS");
  });

  test("handles leap-year February correctly", () => {
    const result = calculateVlsTsValidationDeadline({ entryDateIntoFrance: "2028-02-29", currentDate: "2028-05-29" });
    expect(result.deadline).toBe("2028-05-29");
    expect(result.daysRemaining).toBe(0);
    expect(result.status).toBe("DUE_TODAY");
  });

  test("flags the exact boundary and overdue state", () => {
    expect(calculateVlsTsValidationDeadline({ entryDateIntoFrance: "2026-06-10", currentDate: "2026-09-10" }).status).toBe("DUE_TODAY");
    expect(calculateVlsTsValidationDeadline({ entryDateIntoFrance: "2026-06-10", currentDate: "2026-09-11" }).status).toBe("OVERDUE");
  });

  test("requires manual review for invalid dates", () => {
    const result = calculateVlsTsValidationDeadline({ entryDateIntoFrance: "2026-02-30", currentDate: "2026-09-06" });
    expect(result.status).toBe("REQUIRES_MANUAL_CHECK");
    expect(result.deadline).toBeNull();
    expect(result.taxStampCostEuros).toBeNull();
  });
});

describe("France student work budget", () => {
  test("stays safe below the 80 percent warning threshold", () => {
    const result = calculateFrenchWorkBudget({ annualLoggedHours: 771, calendarYear: 2026 });
    expect(result.annualMaxHours).toBe(964);
    expect(result.remainingHours).toBe(193);
    expect(result.percentageUsed).toBe(80);
    expect(result.complianceState).toBe("WARNING_80_PERCENT");
  });

  test("flags a breach when logged hours exceed the statutory budget", () => {
    const result = calculateFrenchWorkBudget({ annualLoggedHours: 965, calendarYear: 2026 });
    expect(result.remainingHours).toBe(0);
    expect(result.percentageUsed).toBe(100);
    expect(result.complianceState).toBe("BREACH");
  });

  test("rejects invalid work inputs", () => {
    const result = calculateFrenchWorkBudget({ annualLoggedHours: -1, calendarYear: 2026 });
    expect(result.complianceState).toBe("REQUIRES_MANUAL_CHECK");
    expect(result.annualMaxHours).toBeNull();
  });
});
