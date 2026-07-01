# Design System Manual: "An Engineer's Personal Research Notebook"

This document establishes the official visual language, design system, coding standards, and interactive principles for the website. Every future page, section, or asset must adhere strictly to these guidelines to maintain a handcrafted, cohesive aesthetic.

---

## 📖 Design Concept
**"An Engineer's Personal Research Notebook"**
The interface mimics a physical engineering journal, lab logbook, or researcher's log. It communicates craftsmanship, meticulousness, and scientific curiosity.

### 🚫 Core Constraints (What This is NOT)
* **Not Cyberpunk / Not Terminal:** No green neon text on solid black screens, no scanlines, no pixel fonts, and no interactive Unix terminals.
* **Not Futuristic:** No glowing borders, neon drop-shadows, canvas particles, webgl background loops, or fast flashing elements.
* **No Stock Placeholders:** Every image must appear paper-clipped, taped, or framed like a Polaroid, using organic margins.

---

## 🎨 Color System Tokens
All CSS variables are declared in `css/variables.css`.

| Variable | Token Name | Color Spec | Purpose |
| :--- | :--- | :--- | :--- |
| `--color-paper-light` | Page White | `hsl(43, 35%, 98%)` | Primary notebook page surface |
| `--color-paper-base` | Warm Beige | `hsl(43, 30%, 96%)` | Outer notebook body / background accent |
| `--color-paper-dark` | Desk Surface | `hsl(43, 20%, 91%)` | Ambient desk background surrounding binder |
| `--color-ink-primary` | Charcoal Black | `hsl(0, 0%, 13%)` | Body headings, primary log text, main rules |
| `--color-ink-secondary`| Graphite Gray | `hsl(0, 0%, 38%)` | Metadata, tags, layout boundaries, subtitles |
| `--color-accent-blue` | Blue Ink | `hsl(214, 60%, 42%)` | Anchor links, tags, success states, signatures |
| `--color-accent-red` | Red Pen | `hsl(354, 70%, 46%)` | Dates, highlights, alert boundaries, bookmarks |
| `--color-accent-highlighter` | Yellow Marker | `hsla(54, 95%, 75%, 0.5)` | Highlighted inline text spans, custom warnings |

---

## ✍️ Typography Guidelines

Imported Google Fonts must map to specific system roles:

1. **IBM Plex Mono** (`var(--font-notebook)`)
   * **Role:** Headers (`H1`, `H2`, `H3`), metadata badges, notebook navigation tabs.
   * **Rationale:** Clean, mechanical, high-legibility monospaced typeface that simulates typewriter records or ledger prints.
2. **Inter** (`var(--font-sans)`)
   * **Role:** Primary body paragraphs, tabular lists, text descriptions.
   * **Rationale:** A clean sans-serif optimized for long-form reading comfort on digital screens.
3. **JetBrains Mono** (`var(--font-mono)`)
   * **Role:** Technical code blocks (`<pre>`, `<code>`), output panels, configuration specs.
   * **Rationale:** Engineered for maximum clarity and structural layout consistency when displaying technical snippets.
4. **Special Elite** (`var(--font-handwritten)`)
   * **Role:** Date stamps, handwritten sidebar annotations, signed-off signatures.
   * **Rationale:** Typewriter-wobble style font representing personal margins additions, ink markings, and handwriting.

---

## 📐 Layout & Spacing Rules

* **12-Column Responsive Grid (`.grid-12`):** Columns map dynamically based on screen sizing, defaulting to stacked columns on mobile viewports.
* **Rule of 8px:** All paddings, margins, gutters, and structural heights must scale in increments of `8px` (`0.5rem`).
* **Notebook Margins:** Page wraps must preserve the left binder margin space:
  * Desktop: `padding-left: calc(var(--space-4xl) + var(--space-xl))` (gives room for spine and margins).
  * Mobile: `padding-left: calc(var(--space-2xl) + var(--space-lg))`.
* **Ruler Crease:** Do not place content over the left double margin line (`.notebook-page::before`). This line mimics the red margin line of lab pads.

---

## 🛠️ Reusable Component Library

| Class Selector | Physical Object | Visual Description |
| :--- | :--- | :--- |
| `.notebook-binder` | Binder Ring Book | Border frame enclosing the paper stack, wire spine on the left. |
| `.notebook-page` | Ruled Grid Page | Styled with faint grid lines (`var(--color-paper-ruled)`) and a red margin separator. |
| `.btn` | Mechanical Button | Hard thick charcoal border, click shadow offset. |
| `.paper-card` | Sheet Paper Overlay | Floating document cards, styled with subtle border and page lift. |
| `.sticky-note` | Sticky Post-it | Rotated slightly (`transform: rotate`), yellow/blue/pink variations. |
| `.washi-tape` | Frost Tape Strip | Semi-translucent tape used to clip corners or center elements. |
| `.paper-clip` | Steel Paper Clip | Simulated wire paper clip anchored to the top of components. |
| `.notebook-tab` | Document Index Tab | Index folders sticking out of the right page border to navigate sheets. |
| `.bookmark-ribbon` | Red Marker Ribbon | Ribbon hanging from top binder edge. Hovering increases ribbon drop length. |
| `.code-block` | Terminal Printout | Inset gray paper, monospaced text, with language labels. |
| `.log-entry` | Scientific Record | Chronological item featuring a handwritten date and signed-off signature. |
| `.image-frame` | Polaroid Photograph | Thick paper margin around images, held down with frosted corner tapes. |
| `.badge` | Ink Rubber Stamp | Outline stamps representing log states (`Passed`, `Draft`, `Failed`). |

---

## 🔄 Interaction Principles
Animations should feel subtle and tactile, as if interacting with objects on a desk:
1. **Hover Elevation:** Hovering `.paper-card` or `.sticky-note` lifts them slightly (`transform: translateY(-2px)`) and expands shadows.
2. **Page Swiping Transitions:** Switching tabs fades out opacity slightly and skews the page (`transform: skewY(-0.5deg)`) to mimic flipping a page.
3. **Buttons:** Pressing active elements shifts them down and left by `1px` or `2px`, neutralizing the flat offset shadow for dynamic feedback.
4. **Organic Randomization:** Elements placed by hand (e.g., sticky notes, photo corners, tapes) use `notebook.js` to randomize their rotation angles slightly upon DOM load.
