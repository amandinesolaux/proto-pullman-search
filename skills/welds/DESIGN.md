---
name: "welDS"
version: "alpha"
description: "Welcome Design System — Accor / ALL (brandbook defaults, atoms only). Full library via the welDS MCP server."
colors:
  primary: "#050033"
  on-primary: "#F9F9FF"
  primary-container-hi: "#E8EDFF"
  primary-container-low: "#F9F9FF"
  on-primary-container: "#1F1B4B"
  accent: "#2D4CD5"
  on-accent: "#FFFFFF"
  accent-container-hi: "#CCD2FF"
  accent-container-low: "#F7F5FF"
  on-accent-container: "#001159"
  surface: "#FFFFFF"
  on-surface-hi: "#232136"
  on-surface-mid: "#38364D"
  on-surface-low: "#5E5B73"
  surface-container-low: "#FFFFFF"
  surface-container-mid: "#F7F9FB"
  surface-container-hi: "#FFFFFF"
  outline-low: "#D9DADC"
  outline-mid: "#AFB1B3"
  outline-hi: "#898C8E"
  link: "#0051AE"
  success: "#006A53"
  on-success: "#FFFFFF"
  danger: "#BE003C"
  on-danger: "#FFFFFF"
  warning: "#F2D166"
  on-warning: "#070518"
  focus: "#2A71DB"
  neutral-container: "#6D7072"
  on-neutral-container: "#FFFFFF"
typography:
  display-xl:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: "32px"
    fontWeight: "700"
    lineHeight: "40px"
    letterSpacing: "0px"
  display-lg:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: "28px"
    fontWeight: "700"
    lineHeight: "36px"
    letterSpacing: "0px"
  display-md:
    fontFamily: "'Montserrat', sans-serif"
    fontSize: "24px"
    fontWeight: "700"
    lineHeight: "32px"
    letterSpacing: "0px"
  title-01:
    fontFamily: "'Roboto', sans-serif"
    fontSize: "20px"
    fontWeight: "500"
    lineHeight: "20px"
    letterSpacing: "0px"
  title-02:
    fontFamily: "'Roboto', sans-serif"
    fontSize: "18px"
    fontWeight: "500"
    lineHeight: "20px"
    letterSpacing: "0px"
  title-03:
    fontFamily: "'Roboto', sans-serif"
    fontSize: "16px"
    fontWeight: "500"
    lineHeight: "20px"
    letterSpacing: "0px"
  subtitle-md:
    fontFamily: "'Unna', sans-serif"
    fontSize: "18px"
    fontWeight: "400"
    lineHeight: "24px"
    letterSpacing: "0px"
    fontStyle: "italic"
  body-md:
    fontFamily: "'Roboto', sans-serif"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "24px"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "'Roboto', sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "20px"
    letterSpacing: "0px"
  label-md:
    fontFamily: "'Roboto', sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "20px"
    letterSpacing: "0px"
  caption:
    fontFamily: "'Roboto', sans-serif"
    fontSize: "12px"
    fontWeight: "400"
    lineHeight: "16px"
    letterSpacing: "0px"
  detail:
    fontFamily: "'Roboto', sans-serif"
    fontSize: "12px"
    fontWeight: "400"
    lineHeight: "16px"
    letterSpacing: "0px"
rounded:
  none: "0px"
  xs: "2px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "100px"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "12px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  3xl: "28px"
  4xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-container-hi}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-hi}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    height: "48px"
  button-tertiary:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface-hi}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    height: "48px"
  button-icon:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface-hi}"
    rounded: "{rounded.full}"
    padding: "12px"
    height: "48px"
    width: "48px"
  link:
    textColor: "{colors.link}"
    typography: "{typography.body-md}"
  input-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-hi}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "48px"
  checkbox:
    rounded: "{rounded.sm}"
    size: "20px"
  radio:
    rounded: "{rounded.full}"
    size: "20px"
  toggle:
    rounded: "{rounded.full}"
    height: "24px"
    width: "44px"
  select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-hi}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "48px"
  badge:
    backgroundColor: "{colors.accent-container-low}"
    textColor: "{colors.on-accent-container}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  chip:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface-hi}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    height: "36px"
  avatar:
    rounded: "{rounded.full}"
    size: "40px"
  rating:
    typography: "{typography.label-md}"
  banner:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface-hi}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "16px"
  message:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface-hi}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  tooltip:
    backgroundColor: "{colors.on-surface-hi}"
    textColor: "{colors.surface}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-hi}"
    rounded: "{rounded.xl}"
    padding: "24px"
  separator:
    backgroundColor: "{colors.outline-low}"
    height: "1px"
  modal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-hi}"
    rounded: "{rounded.xl}"
    padding: "32px"
---

## Overview

welDS (Welcome Design System) powers the digital experiences of Accor / ALL — Sofitel,
Fairmont, Pullman, Raffles, Movenpick, Ibis, Novotel, MGallery, Handwritten, Swissotel,
and brandbook (the neutral default). This DESIGN.md snapshots the **brandbook** defaults;
the full system supports 12 brand modes that swap colors, fonts, and component tokens via
a single variable-collection switch.

**Design personality** — calibrated, accessible, brand-neutral at the foundation, expressive
at the brand layer. Typography leads (Montserrat display, Unna italic subtitle, Roboto body).
Colors are restrained, high-contrast, WCAG AA compliant. Motion is subtle.

**Density & touch** — 48px minimum interactive height (buttons, inputs, selects). Generous
vertical rhythm using the spacing scale. Radii are functional (sm for chips, full for pills,
xl for cards).

## Colors

Tokens are organized by semantic role, not by hue:

- **`primary` / `on-primary`** — brand ink #050033, for strong text, primary action backgrounds, high-emphasis surfaces.
- **`accent` / `on-accent`** — vivid #2D4CD5, reserved for focus moments (selected states, emphasis borders, highlight chips).
- **`surface` / `on-surface-hi|mid|low`** — #FFFFFF with 3 text intensities (hi for titles, mid for body, low for captions/metadata).
- **`surface-container-low|mid|hi`** — layered neutrals for card/banner/chip backgrounds, never solid white on white.
- **`outline-low|mid|hi`** — stroke hierarchy for borders/dividers.
- **`link`** — #0051AE, interactive blue, always underlined by default variant.
- **`success` / `danger` / `warning`** — semantic signals with matching `on-*` and `*-container` pairs.
- **`focus`** — dedicated color for keyboard focus rings (distinct from accent/link).

**Multi-brand note** — when `.brand-sofitel` / `.brand-fairmont` / etc. is applied, all
`--color-*` variables resolve to that brand's palette. Never hardcode a brand hex; rely on
the CSS variable so brand switch propagates automatically.

## Typography

Three font families:

- **Montserrat** (`--font-family-display`) — titles, kickers, emphatic UI copy.
- **Roboto** (`--font-family-body` / `--font-family-label` / `--font-family-link`) — body, labels, inline links, caption.
- **Unna** (`--font-family-subtitle`) — italic editorial subtitle only. Paired with display titles to soften the masthead.

The scale is semantic: titles use `display-xl → display-md`, intros use `subtitle-md`,
body uses `body-md` / `body-sm`, interactive labels use `label-md`, small metadata uses
`caption` or `detail` (uppercase).

**Never bind typography properties individually.** Always apply a complete text style — either
via the provided token set or a text-style class. The full bundle (family + size + weight +
line-height + letter-spacing) reacts to brand switches as a unit.

## Layout

Four breakpoints:

| Breakpoint | Range | Grid margin |
|:---|:---|:---|
| mobile | 320–767 | 16px |
| tablet | 768–1023 | 32px |
| desktop-sm | 1024–1279 | 32px |
| desktop-md | 1280–1439 | 32px |

**Spacing scale** uses semantic names (`2xs` = 4px → `4xl` = 56px). Three flavors exist in
the full system (`stack`, `inline`, `inset`) but DESIGN.md exposes only the `stack` scale
— identical values, just category prefix differs.

## Elevation & Depth

welDS is intentionally flat. Use `surface-container-low|mid|hi` layering (brightness steps)
to establish hierarchy, not shadows. The only shadow in the system is `--shadow-modal` for
elevated overlays (modals, popovers). No card shadows, no hover elevation.

## Shapes

Radii follow a purposeful scale:

- `xs` (2px) — focus ring inner offset
- `sm` (4px) — inputs, text area
- `md` (8px) — cards, banners, message
- `lg` (12px) — large containers
- `xl` (16px) — cards, modals
- `full` (9999px) — buttons, chips, badges, avatars (welDS uses pill buttons by default)

## Components

The 18 atoms below are the core welDS building blocks. For organisms (heading-hero, billboard,
callout-hotel, card-offer, etc.), use the full welDS MCP (`welds_install_components`). This
DESIGN.md is intentionally limited to atoms — suitable for exploration/prototyping, not for
implementing real screens from Figma.

- **button-bb** (`aem.button-bb`) — CTA. Variants: `function: primary | secondary | tertiary`, `size: xs | sm | md | lg`. Always `label`. Optional `leftIcon` / `rightIcon`. **One primary per screen.**
- **button-icon-bb** (`aem.button-icon-bb`) — icon-only variant. Same `function` / `size`. Square 48px at `md`.
- **link** (`web.link`) — inline navigation. Variants: `default` (underlined) / `icon` (with right arrow).
- **input-text** (`web.input-text`) — text / email / password / tel. Use this (not `input-password`) for login forms.
- **checkbox**, **radio**, **toggle** — binary selections. 20px control, 48px tap target.
- **select** (`web.select`) — dropdown, 48px height.
- **badge** (`web.badge`) — inline status tag (accent container low + on-accent-container). Small padding.
- **chip** (`web.chip`) — filter / tag. Pill, 36px. Dismissable variant via `chip-dismissable`.
- **avatar** (`web.avatar`) — user image / initials. 40px default.
- **rating** (`web.rating`) — star rating, label/md.
- **banner** (`web.banner`) — page-level message. Variants: `type: neutral | offer | success | danger | warning`, `emphasis: low | hi`.
- **message** (`web.message`) — inline form message (error, info).
- **tooltip** (`web.tooltip`) — contextual hint on hover/focus.
- **card** (`web.card`) — generic container. Radius xl, padding 24px, surface background.
- **separator** (`web.separator`) — horizontal/vertical divider via outline-low.
- **modal** (`web.modal`) — overlay dialog. Radius xl, padding 32px.

## Do's and Don'ts

**Do**

- ✅ Always apply a complete **text style** via the provided tokens (family + size + weight + line-height + letter-spacing as a unit).
- ✅ Use the **brandbook** brand by default. `all` is a generic brand, not the default.
- ✅ For login forms, use **`input-text` with `type="password"`** — not `input-password` (which is for registration only).
- ✅ Use **`button-bb`** (with label) and **`button-icon-bb`** (icon-only). Both use component tokens `--color-btn-*` with gradient fills.
- ✅ One **primary** button per screen. Others go secondary / tertiary.
- ✅ Respect the 48px minimum interactive height across buttons, inputs, selects.
- ✅ Use **surface-container-low → mid → hi** for layered neutrals (cards on surface, banners on cards, chips on banners).
- ✅ Use the **`focus`** color for keyboard focus rings (distinct from accent/link).
- ✅ Rely on CSS variables so brand switch (via `.brand-*` class) propagates automatically.

**Don't**

- ❌ Never hardcode a hex value — always use `var(--color-*)`. Exception: values < 4px not in the token scale.
- ❌ Never bind `fontFamily` / `fontSize` / `lineHeight` / `fontWeight` / `letterSpacing` individually — use a complete text style.
- ❌ `web.button` is **obsolete** — use `web.button-bb` or `web.button-icon-bb` instead.
- ❌ Don't put typography content in the `subtitle` field — SEO/GEO content goes in the `description` field.
- ❌ Don't apply shadows for hover / elevation — welDS is intentionally flat. Use surface-container layering instead.
- ❌ Don't construct custom components when an atom exists. For organisms (card-offer, heading-hero, booking-engine, etc.), go through the full welDS MCP, not this DESIGN.md.
- ❌ Don't use `.brand-all` as the default. Default is `.brand-brandbook`.

---

*This DESIGN.md is auto-generated from the welDS MCP. Source: [welcome-design-accor-mcp](https://github.com/adjbrt/welcome-design-accor-mcp). Full component library (155+) accessible via the `welDS` MCP server.*
