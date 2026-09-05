# AbroadShield AI — Landing Page UI / Product Experience Audit

## Status
Structural redesign in progress. The public experience is being treated as a product narrative, not a gated application shell.

## Core architecture
**Public navigation explains. Primary CTA activates. Authenticated workspace operates.**

Public navigation is now:
- Home
- How it works
- Country intelligence
- Pricing

The agent is intentionally not a normal public navigation destination. It is the primary activation path and remains authentication-gated. The private workspace contains Agent, Dashboard, Journey workspace, Connectors and Networking/jobs.

## Implemented in this pass
- Added `PublicProduct.tsx` as the public product/problem narrative.
- Replaced the public `Journey` route's previous authentication-oriented explanation with a genuine product explanation for unauthenticated visitors.
- Removed `Agent` from the public header navigation.
- Connected the footer to the same central navigation controller used by the header.
- Rebalanced `HomeShowcase` into a calmer problem → product engine → journey → ecosystem sequence.
- Reduced repeated oversized visual treatments and kept the main 3D product visual as the focal moment.
- Kept illustrative product screens explicitly labelled rather than implying live account state.

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

## Remaining P0/P1 checks
- Verify current production build after all landing commits.
- Verify public route navigation and browser history behavior.
- Verify mobile navigation and keyboard focus.
- Verify authenticated Agent gating.
- Check current production runtime errors; recent OpenRouter `openrouter/free` calls have returned zero-choice/no-text responses and must not be treated as resolved until a fresh post-change check proves otherwise.
- Consolidate bespoke color/radius/typography values into a stronger token system.
- Audit CountryRules information density and semantic color usage.

## Definition of done
A production sign-off requires every public navigation item to have a clear informational purpose, every CTA to have an intentional outcome, no unexpected authentication during normal product education, obvious first-viewport hierarchy, purposeful motion, coherent responsive behavior, truthful claims, and clean current deployment/runtime verification.
