---
name: Kinetic Logic
colors:
  surface: "#131313"
  surface-dim: "#131313"
  surface-bright: "#3a3939"
  surface-container-lowest: "#0e0e0e"
  surface-container-low: "#1c1b1b"
  surface-container: "#201f1f"
  surface-container-high: "#2a2a2a"
  surface-container-highest: "#353534"
  on-surface: "#e5e2e1"
  on-surface-variant: "#c4c7c8"
  inverse-surface: "#e5e2e1"
  inverse-on-surface: "#313030"
  outline: "#8e9192"
  outline-variant: "#444748"
  surface-tint: "#c6c6c7"
  primary: "#ffffff"
  on-primary: "#2f3131"
  primary-container: "#e2e2e2"
  on-primary-container: "#636565"
  inverse-primary: "#5d5f5f"
  secondary: "#c8c6c6"
  on-secondary: "#303030"
  secondary-container: "#474747"
  on-secondary-container: "#b6b5b4"
  tertiary: "#ffffff"
  on-tertiary: "#313030"
  tertiary-container: "#e5e2e1"
  on-tertiary-container: "#656464"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#e2e2e2"
  primary-fixed-dim: "#c6c6c7"
  on-primary-fixed: "#1a1c1c"
  on-primary-fixed-variant: "#454747"
  secondary-fixed: "#e4e2e1"
  secondary-fixed-dim: "#c8c6c6"
  on-secondary-fixed: "#1b1c1c"
  on-secondary-fixed-variant: "#474747"
  tertiary-fixed: "#e5e2e1"
  tertiary-fixed-dim: "#c8c6c5"
  on-tertiary-fixed: "#1c1b1b"
  on-tertiary-fixed-variant: "#474746"
  background: "#131313"
  on-background: "#e5e2e1"
  surface-variant: "#353534"
typography:
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: "600"
    lineHeight: "1.2"
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: "500"
    lineHeight: "1.2"
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.5"
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: "500"
    lineHeight: "1.2"
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: "400"
    lineHeight: "1.1"
    letterSpacing: 0.02em
  code-snippet:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: "400"
    lineHeight: "1.4"
spacing:
  grid-unit: 8px
  major-grid: 40px
  gutter: 16px
  margin-safe: 24px
---

## Brand & Style

The design system is engineered for the rigors of computer science, mathematics, and complex system visualization. It adopts a **Technical Minimalism** aesthetic, drawing inspiration from blueprint schematics, terminal interfaces, and academic graphing software.

The brand personality is precise, analytical, and uncompromisingly functional. It aims to evoke a sense of clarity amidst complexity, providing a "workspace" feel rather than a "consumer" feel. Key visual hallmarks include high-contrast monochromatic elements, sharp geometric primitives, and a persistent background grid that serves as both a literal and metaphorical anchor for information.

## Colors

This design system utilizes a "Void and Wireframe" palette. The foundation is a deep, near-black neutral (`#0F0F0F`) which eliminates glare and provides a high-contrast base for technical data.

- **Primary:** Pure White (`#FFFFFF`) is used exclusively for active data points, transitions, and primary labels.
- **Secondary:** Mid-Gray (`#333333`) is reserved for the background grid and non-interactive structural elements.
- **Tertiary:** Dark Gray (`#1A1A1A`) is used for surface containers to create subtle depth without breaking the dark-mode immersion.
- **Accents:** Functional colors (success/error) should be highly desaturated but distinct (e.g., a pale mint for success, a desaturated coral for errors) to maintain the technical rigor.

## Typography

The typography is split between two distinct roles: **Systemic Data** and **Content Hierarchy.**

- **JetBrains Mono** is utilized for all math, logic, labels, and interface controls. Its monospaced nature ensures that logical expressions and coordinates align perfectly.
- **Geist** provides a clean, neutral grotesque for descriptive text and documentation, offering a slight humanist relief to the otherwise rigid interface.

All text should be rendered with high-contrast (White or very light gray) to ensure legibility against the dark background. Letter spacing is slightly increased for monospaced labels to prevent "clumping" of characters in technical diagrams.

## Layout & Spacing

The layout is governed by a strict **8px Grid System**. Every element, from node diameter to sidebar width, must be a multiple of this unit.

- **Canvas/Visualization:** Features a persistent background grid. A faint line every 8px (Secondary color at 10% opacity) and a stronger line every 40px (Secondary color at 30% opacity).
- **Control Panels:** Fixed-width sidebars (usually 320px) allow the main visualization area to remain fluid and expansive.
- **Responsive Behavior:** On smaller screens, sidebars transition into bottom-sheets. The central canvas remains fluid, utilizing pinch-to-zoom and pan interactions rather than reflowing elements, preserving the integrity of the visualized logic.

## Elevation & Depth

In this design system, depth is achieved through **Tonal Layering** and **Outline Precision** rather than shadows.

1. **Base Layer:** The grid canvas (`#0F0F0F`).
2. **Surface Layer:** Toolbars and panels use `#1A1A1A` with a 1px solid border of `#333333`.
3. **Active Elements:** Nodes or focused inputs are "elevated" by increasing their stroke weight or switching from a gray stroke to a pure white stroke.

Avoid blurs and soft shadows. Use "Hard Depth"—if an element is above another, separate it with a crisp 1px border or a subtle color step. This reinforces the technical, blueprint-like quality of the interface.

## Shapes

The shape language is strictly **Geometric and Sharp**.

- **Containers & Inputs:** Use 90-degree corners (0px radius). This mirrors terminal windows and traditional engineering diagrams.
- **Nodes/States:** Use perfect circles to differentiate data points from interface containers. Circles should have a 2px stroke.
- **Connectors:** Lines and arrows should be 1px or 2px thick with sharp "Stealth" arrowheads (not rounded).

The absence of rounded corners emphasizes the mathematical precision of the product.

## Components

- **Buttons:** Rectangular with 1px borders. Primary buttons are White with Black text. Ghost buttons are Transparent with White borders and White text.
- **Nodes (Graphing):** Circular elements with a center-aligned label. Use a 2px stroke. Transitioning states are shown with dashed strokes.
- **Input Fields:** Bottom-border only or full 1px border. Use monospaced font for all technical input.
- **Chips/Labels:** Small, sharp-edged rectangles used for metadata (e.g., transition weights like `0,1`).
- **Scrollbars:** Ultra-thin (4px), dark gray sliders that only appear on hover to minimize visual noise.
- **Data Tables:** No vertical borders. Horizontal borders are 1px `#333333`. Header text is always in `label-sm` monospaced style.
