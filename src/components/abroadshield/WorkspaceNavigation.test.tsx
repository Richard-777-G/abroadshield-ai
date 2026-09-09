import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkspaceHeader, NAV } from "./WorkspaceNavigation";

describe("Workspace Navigation & Header Verification", () => {
  test("NAV includes settings with student-centric labels", () => {
    const settingsNav = NAV.find((item) => item.id === "settings");
    expect(settingsNav).toBeDefined();
    expect(settingsNav?.label).toBe("Settings & Profile");

    const limitsNav = NAV.find((item) => item.id === "dashboard");
    expect(limitsNav).toBeDefined();
    expect(limitsNav?.label).toBe("Statutory Limits");

    const copilotNav = NAV.find((item) => item.id === "agent");
    expect(copilotNav).toBeDefined();
    expect(copilotNav?.label).toBe("Ask Co-Pilot");
    expect(copilotNav?.href).toBe("/app/agent");

    const oppsNav = NAV.find((item) => item.id === "network");
    expect(oppsNav?.href).toBe("/app/opportunities");

    const limitsHref = NAV.find((item) => item.id === "dashboard");
    expect(limitsHref?.href).toBe("/app/limits");

    const settingsHref = NAV.find((item) => item.id === "settings");
    expect(settingsHref?.href).toBe("/app/settings");
  });

  test("WorkspaceHeader renders discoverable user profile trigger and dossier inspector", () => {
    const html = renderToStaticMarkup(
      <WorkspaceHeader
        activeView="agent"
        firstName="Richard"
        email="richard@example.com"
        onOpenMobile={() => {}}
      />
    );

    expect(html).toContain("Richard");
    expect(html).toContain("Dossier Inspector");
    expect(html).toContain("STATUTORY GUARD: ACTIVE");
  });
});

