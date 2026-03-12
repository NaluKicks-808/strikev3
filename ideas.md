# Project STRIKE — Design Brainstorm

## Approach A: "Swiss Precision"
<response>
<text>
**Design Movement:** Swiss International Typographic Style meets modern fintech minimalism
**Core Principles:** Rigid grid discipline, typographic hierarchy as the primary visual element, data density without clutter, monochromatic restraint with single accent
**Color Philosophy:** Near-white (#F8FAFC) backgrounds, deep slate (#1E293B) for all text and structure, a single mint green (#10B981) reserved exclusively for positive financial actions (strikes, progress, CTAs), and muted crimson (#EF4444) for debt threat indicators. Color is earned, not decorative.
**Layout Paradigm:** Asymmetric editorial grid — hero sections use a 60/40 split with text left and a live data visualization right. Dashboard uses a left-rail sidebar with a 3-column card grid. No centered hero blobs.
**Signature Elements:** Thin horizontal rule dividers (1px slate-200) between sections; monospaced numerals for all financial figures (font-variant-numeric: tabular-nums); a subtle diagonal "strike" motif (a thin 1px line crossing debt figures when eliminated)
**Interaction Philosophy:** Micro-animations on data changes only — numbers count up, progress bars fill on mount, cards slide in from left. No decorative motion.
**Animation:** Framer Motion layout animations for debt card reordering (Avalanche/Snowball toggle); spring-based number counters; subtle fade-in-up on page entry (0.3s, ease-out)
**Typography System:** "Space Grotesk" (700) for headlines and financial figures; "Inter" (400/500) for body and labels. Strict size scale: 48px hero, 32px section, 20px card title, 14px label, 12px caption.
</text>
<probability>0.08</probability>
</response>

## Approach B: "Dark War Room"
<response>
<text>
**Design Movement:** Military operations center meets Bloomberg Terminal — dark, data-dense, authoritative
**Core Principles:** Dark backgrounds create urgency and focus; glowing mint accents feel like active system signals; every pixel serves a data purpose; the UI communicates "this is serious infrastructure"
**Color Philosophy:** Deep charcoal (#0F172A) base, slate-800 cards, mint green (#10B981) as glowing accent for live indicators, crimson (#EF4444) for threat-level debt rates. The darkness makes the green "strikes" feel electric and alive.
**Layout Paradigm:** Terminal-style dashboard with a persistent left sidebar (icon + label nav), main content area with a top stats bar, and a scrollable card grid. Landing page uses a full-bleed dark hero with animated particle background.
**Signature Elements:** Pulsing green dot indicators for "live" status; thin green border-left on active debt cards; monospaced terminal-style number readouts
**Interaction Philosophy:** Every action feels like executing a command. Buttons have a subtle press-down effect. Modals slide in from the right like a command panel.
**Animation:** Subtle scanline animation on hero; number odometer effect for financial figures; card entrance with staggered fade from bottom
**Typography System:** "JetBrains Mono" for financial figures and data; "Inter" for UI labels and body copy. Creates a deliberate tension between machine precision and human readability.
</text>
<probability>0.07</probability>
</response>

## Approach C: "Trusted Fintech Editorial" ← SELECTED
<response>
<text>
**Design Movement:** Premium editorial finance publication meets Apple product page — clean, confident, and authoritative without being cold
**Core Principles:** Generous whitespace as a luxury signal; typographic contrast (heavy display + light body) creates visual rhythm; data is the hero, not decoration; every section earns its space
**Color Philosophy:** Pure white (#FFFFFF) and off-white (#F8FAFC) backgrounds signal cleanliness and trust. Deep slate (#1E293B) anchors all text with authority. Mint green (#10B981) is used sparingly for CTAs and positive financial events — it should feel like a reward. Muted crimson (#EF4444) marks debt threat levels. No gradients on backgrounds; gradients only on progress bars and data visualizations.
**Layout Paradigm:** Left-aligned editorial layout for landing page (not centered). App views use a mobile-first card-stack interface with a fixed bottom navigation bar (mimicking native iOS/Android). Dashboard uses a single-column scrollable layout with sticky header — optimized for the phone viewport.
**Signature Elements:** (1) A thin mint-green left-border accent on "active strike" cards; (2) A bold, oversized financial figure displayed in a heavier weight as the focal point of each card; (3) A progress bar that transitions from crimson (high debt) to mint (low debt) as balance decreases
**Interaction Philosophy:** Interactions should feel native and physical — cards have a subtle lift on hover (translateY -2px, shadow increase), toggles snap with haptic-like transitions, the MFA input has a satisfying fill animation per digit
**Animation:** Page transitions use a clean fade (200ms); debt card reorder uses Framer Motion layout with spring physics; number counters animate on mount using a requestAnimationFrame loop; the "Strike" button has a pulse animation when a surplus is detected
**Typography System:** "Space Grotesk" (800) for hero headlines and large financial figures; "Inter" (400/500/600) for all body, labels, and UI text. This pairing gives authority without sterility. Financial numbers use tabular-nums for alignment.
</text>
<probability>0.09</probability>
</response>

## Selected Approach: C — "Trusted Fintech Editorial"

This approach best matches the "Swiss Bank meets Apple" directive from the spec. It is light, premium, and data-focused without feeling cold or gamified. The mobile-first card stack is ideal for the app views, and the editorial left-aligned layout differentiates the landing page from generic SaaS templates.
