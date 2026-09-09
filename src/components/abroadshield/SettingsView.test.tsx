import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SettingsView from "./SettingsView";

describe("SettingsView Component DOM & Flow Verification", () => {
  test("renders student identity, destination selector, stage controls, and sign out CTA", () => {
    const html = renderToStaticMarkup(<SettingsView />);

    // 1. Title & Header
    expect(html).toContain("Student Account &amp; Journey Profile");
    expect(html).toContain("Authenticated Settings &amp; Preferences");

    // 2. Academic & Destination Context
    expect(html).toContain("Target Destination Country");
    expect(html).toContain("Sorbonne Université, HEC Paris, TU Munich");
    expect(html).toContain("MSc Data Science, MBA International Business");

    // 3. Stage Orchestration
    expect(html).toContain("Active Stage &amp; Statutory Governance");
    expect(html).toContain("Stage 1");
    expect(html).toContain("Pre-Departure");

    // 4. Discoverable Sign Out Button
    expect(html).toContain("Sign Out");

    // 5. Data Privacy & Isolation
    expect(html).toContain("Connected Gateways &amp; Privacy");
    expect(html).toContain("Zero Telemetry Leaks");
    expect(html).toContain("France Travail API");
  });
});
