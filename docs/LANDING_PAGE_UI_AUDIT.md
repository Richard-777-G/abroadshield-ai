# AbroadShield AI — Landing Page UI / Product Experience Audit

## Audit status

**Pass:** structural redesign in progress  
**Scope:** public landing experience, navigation, product narrative, interaction architecture, visual hierarchy, motion, responsive behavior and evidence/claim discipline.

## 1. Core finding

The landing experience was behaving partly like a marketing site and partly like the authenticated application. That produced a broken mental model: public navigation items could lead to authentication instead of explaining the product, while large visual treatments competed with the information needed to understand the product.

The public site now follows a simpler rule:

> **Public navigation explains. Primary CTA activates. Authenticated workspace operates.**

## 2. Navigation architecture

### Before

- `Home`
- `Journey`
- `Agent`
- `Countries`
- `Pricing`

The `Agent` route was protected, so a visitor clicking a navigation item could immediately receive a sign-in flow. This made a top-level navigation item behave like a private workspace control.

### New direction

Public navigation:

- Home
- How it works
- Country intelligence
- Pricing

Primary header action:

- Start with the agent

Private workspace remains behind authentication:

- Agent
- Dashboard
- Journey workspace
- Connectors
- Networking/jobs

This separates product education from product execution.

## 3. New public product narrative

Added `PublicProduct.tsx` as a dedicated public explanation surface.

It establishes:

1. **The problem** — the international-student journey is fragmented across decisions, preparation, relocation and career systems.
2. **The product thesis** — AbroadShield is a coordinating context layer, not simply another portal, job board or document locker.
3. **The operating loop** — Understand → Sequence → Prepare → Verify.
4. **The interface principle** — every product surface should answer: Where am I? What matters next? What can the agent do?
5. **Evidence** — country intelligence and official-source workflows are surfaced as a concrete product layer.
6. **Control** — consequential external actions remain approval-gated.

The illustrative product screen is explicitly labelled as illustrative; it is not presented as a live user state.

## 4. Visual hierarchy corrections

The landing page should use a three-level visual hierarchy:

- **Level 1 — focal:** hero/product visualization and one primary CTA.
- **Level 2 — structural:** problem, product thesis, journey model and evidence sections.
- **Level 3 — supporting:** metadata, labels, status chips and secondary navigation.

Avoid making every section a hero. Large type, oversized cards, heavy glows and animated elements must be reserved for focal moments.

## 5. Motion system

Motion should communicate product behavior rather than decorate every block.

Approved motion vocabulary:

- progressive reveal for section entrance;
- subtle pointer parallax for product surfaces;
- small hover elevation for interactive cards;
- restrained ambient movement in focal visual layers;
- animated connections only where they explain relationships;
- reduced-motion support through Framer Motion's `useReducedMotion`.

Avoid:

- constant floating of every element;
- animated letters/words without semantic purpose;
- repeated scale pulses;
- simultaneous entrance animations across an entire viewport;
- motion that competes with reading.

## 6. Color and depth

The current repository contains multiple bespoke OKLCH values across components. This is visually powerful but risks fragmentation.

Target design language:

- one primary green/teal signal;
- restrained secondary informational signal;
- neutral text hierarchy;
- three surface levels: base, raised, focal;
- borders used for structure rather than decoration;
- glow reserved for active/focal states.

Country intelligence currently uses a blue informational accent and a warm comparison accent. This should be retained only when it has semantic meaning; otherwise it should converge toward the core token system in the next pass.

## 7. Interaction architecture

Navigation is centralized in `page.tsx` through `navigateTo`.

Header navigation no longer performs its own `history.replaceState` operation. This avoids competing history mutations.

Pricing and vision CTAs now route through the same navigation controller.

The remaining public interaction audit should verify every button, anchor, external link, mobile control, focus state and keyboard path before production sign-off.

## 8. Claims / product truth

Do not present:

- fake live metrics;
- fabricated customer counts;
- unsigned partnerships as existing partnerships;
- static fixture data as real user data;
- illustrative screens as live account state;
- unsupported claims such as "most chosen" without evidence.

Future ecosystem and revenue language must remain explicitly future/strategic until real evidence exists.

## 9. Remaining engineering passes

### P0 — correctness

- production build verification after the latest landing commits;
- route verification for every public navigation item;
- authenticated-agent gate verification;
- mobile navigation verification;
- inspect recent production runtime errors after deployment.

### P1 — design system

- consolidate landing typography scale;
- consolidate surface/radius/border tokens;
- remove remaining bespoke visual values where they do not add semantic value;
- define consistent icon sizing and icon containers;
- standardise CTA hierarchy.

### P1 — landing sections

- rebalance `HomeShowcase` so the hero remains dominant;
- simplify section density and vertical rhythm;
- make the problem/product/evidence story visually distinct;
- audit `CountryRules` for information density and mobile overflow;
- replace footer hash anchors with the central navigation controller.

### P2 — responsive/accessibility

- verify keyboard focus visibility;
- verify reduced-motion behavior;
- verify contrast of faint labels and metadata;
- verify tap targets on mobile;
- verify headings form a coherent semantic hierarchy;
- verify decorative graphics remain hidden from assistive technology.

### P2 — media/visual system

Where imagery genuinely improves comprehension, use purposeful product screenshots, diagrams or editorial visuals. Do not add generic stock images simply to fill empty space.

## 10. Definition of done

The landing page is ready for production sign-off only when:

- every public navigation item has a clear informational purpose;
- every CTA has an intentional outcome;
- no visitor is unexpectedly forced into authentication by ordinary product education;
- visual hierarchy is obvious within the first viewport;
- motion reinforces the product story;
- mobile and desktop layouts remain coherent;
- no unsupported product/traction claims are presented as facts;
- build and runtime checks are clean for the current deployment;
- the public experience clearly explains why AbroadShield exists before asking the visitor to sign up.
