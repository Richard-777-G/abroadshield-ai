# AbroadShield AI — Landing Page UI / Product Experience Audit

## Status
Structural redesign and verification are in progress. The public experience is being treated as a product narrative, not a gated application shell.

## Core architecture
**Public navigation explains. Primary CTA activates. Authenticated workspace operates.**

Public navigation is:
- Home
- How it works
- Country intelligence
- Pricing

The agent is intentionally not a normal public navigation destination. It is the primary activation path and remains authentication-gated. The private workspace contains Agent, Dashboard, Journey workspace, Connectors and Networking/jobs.

## Implemented in the current pass
- Centralized public navigation ownership in `page.tsx`.
- Removed duplicate history mutation from the header.
- Connected pricing CTAs to explicit authenticated/unauthenticated outcomes.
- Connected the vision CTA to the same route controller.
- Connected footer navigation to the same route controller.
- Added explicit button types and focus-visible treatment to public interactive controls.
- Rebalanced `HomeShowcase` into a calmer problem → product engine → journey → ecosystem sequence.
- Reduced repeated oversized visual treatments and kept the main 3D product visual as the focal moment.
- Kept illustrative product screens explicitly labelled rather than implying live account state.
- Hardened the AI runtime so configured model fallbacks can be attempted after provider errors or HTTP-200 empty responses.

## Verified deployment state
The latest audited build completed TypeScript, static generation, route generation and serverless-function creation successfully. A current production runtime-error check returned no runtime errors for the selected verification window.

A clean runtime window is evidence for that window only; it is not a permanent guarantee of provider availability.

## Visual system direction
Three visual levels:
1. Focal — hero/product visualization and primary CTA.
2. Structural — problem, thesis, operating model, journey and evidence.
3. Supporting — metadata, labels, status and secondary controls.

Motion must communicate product behavior. Use reveal, restrained parallax, small hover elevation and meaningful connection animation. Do not animate every heading, word, icon or card simply because motion is available.

## Product storytelling direction
The public site should answer, in order:
1. What problem exists?
2. Why is existing fragmentation insufficient?
3. What is AbroadShield's product thesis?
4. How does the operating loop work?
5. What evidence/country intelligence does it use?
6. What does the interface actually look like?
7. What is real today versus future direction?
8. How does the visitor start?

Purposeful diagrams, product surfaces and editorial visuals are preferred over generic stock photography. Images are only added when they increase comprehension or establish a credible product/editorial narrative.

## Claim discipline
Never present fabricated metrics, customer counts, partnerships, marketplace traction, live user state or unsupported popularity claims. Future ecosystem and revenue language must remain explicitly strategic until evidence exists.

## Remaining P1/P2 checks
- Verify public route navigation and browser history behavior with an actual browser runner when available.
- Verify mobile navigation and keyboard focus at rendered viewport level.
- Verify authenticated Agent gating against live session state.
- Consolidate bespoke color/radius/typography values into a stronger token system.
- Audit CountryRules information density and semantic color usage.
- Continue reducing oversized public sections where rendered viewport evidence shows hierarchy problems.
- Review legacy static fixtures in `data.ts` so they cannot surface as real user metrics.

## Definition of done
A production sign-off requires every public navigation item to have a clear informational purpose, every CTA to have an intentional outcome, no unexpected authentication during normal product education, obvious first-viewport hierarchy, purposeful motion, coherent responsive behavior, truthful claims, and clean current deployment/runtime verification.
