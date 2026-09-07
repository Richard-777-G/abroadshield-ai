import { describe, expect, test } from "bun:test";
import { detectCapability } from "./capability-router";

describe("Capability routing", () => {
  test("routes statutory France intents before generic visa/document intents", () => {
    expect(detectCapability("How do I pay CVEC for 2026-2027?")).toBe("cvec_payment");
    expect(detectCapability("When do I validate my VLS-TS visa?")).toBe("vlsts_validation");
    expect(detectCapability("How many student work hours can I use? 964 hours")).toBe("work_rule_check");
  });

  test("routes common operational intents to registered capabilities", () => {
    expect(detectCapability("Find jobs in Paris")).toBe("job_search");
    expect(detectCapability("Find a room near my university")).toBe("housing_search");
    expect(detectCapability("Draft an email to the university")).toBe("draft_email");
    expect(detectCapability("Check my documents")).toBe("document_check");
    expect(detectCapability("What are the upcoming deadlines?")).toBe("deadline_scan");
    expect(detectCapability("Tailor my CV for this role")).toBe("tailor_cv");
  });

  test("does not route empty or unrelated text", () => {
    expect(detectCapability("")).toBeNull();
    expect(detectCapability("hello, tell me something interesting")).toBeNull();
  });
});
