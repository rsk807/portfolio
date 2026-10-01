# Sushant Kumar - Engineering Dossier & Personal Research Log

[![Live Portfolio](https://img.shields.io/badge/Live%20Dossier-GitHub%20Pages-2ea44f?style=for-the-badge&logo=github)](https://rsk807.github.io/portfolio/)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20Personal-blue?style=for-the-badge)](LICENSE)
[![Architecture](https://img.shields.io/badge/Architecture-Modular%20HTML%20%2B%20Vanilla%20CSS%2FJS-orange?style=for-the-badge)](scripts/build.js)
[![SEO & AEO](https://img.shields.io/badge/SEO%20%2F%20AEO-Schema.org%20JSON--LD%20%2B%20llms.txt-purple?style=for-the-badge)](src/components/schema.jsonld)

> **"Turning Ideas into Secure, Scalable and Meaningful Systems."**  
> Official interactive engineering dossier, research logbook, and portfolio of **Sushant Kumar** - Cyber Security Engineer, Digital Forensics Researcher, AI Systems Developer, and Founder of **TechDenLab**.

---

## 🌐 Live Access

| Platform | Deployment URL |
| :--- | :--- |
| **Primary (GitHub Pages)** | **[https://rsk807.github.io/portfolio/](https://rsk807.github.io/portfolio/)** |
| **Alternative Mirror** | [https://portfolio-beta-plum-95.vercel.app](https://portfolio-beta-plum-95.vercel.app) |

---

## 📖 Design Concept: The Engineer's Research Journal

This portfolio departs completely from generic cookie-cutter developer sites. Instead, it meticulously recreates the tactile, analog experience of an **authentic engineering research journal**:

* 📓 **Twin-Loop Wire Binding & Graph Paper**: Faint 28px coordinate ruled/grid paper with red margin guides and twin-loop wire binding.
* 📑 **Protruding Edge Tabs & Ribbon Bookmarks**: Color-coded right-edge notebook tabs for chapters 01–08 and swaying cloth bookmarks.
* 📌 **Pinned Sticky Notes & Field Cards**: Handcrafted research snapshot notes with authentic pushpin graphics, subtle paper drop-shadows, and organic rotation jitter.
* 🎨 **Interactive Beyond Engineering Accordion**: Archival sketchbook gallery, 3D sculpture studio, and katana swordsmanship drills with dynamic stamp drop physics (`OPENED`).
* 💿 **Music Corner CD Player**: Fully custom-engineered analog CD turntable player with realistic optical disc groove reflection, mechanical laser read arm, real-time audio oscilloscope signal visualizer, HTTP 206 range streaming, and tape position meter.
* 🛡️ **Archival Asset Protection**: Context-menu shields, drag suppression, dynamic lightbox watermarking, and toast notifications to safeguard intellectual property and creative assets.

---

## 🏗️ Modular Architecture

The codebase is split into isolated, maintainable partials compiled into a single production deliverable via a zero-dependency Node compiler:

```
portfolio/
├── index.html                      # Production compiled bundle (generated)
├── manifest.json                   # Web App Manifest
├── robots.txt                      # 2026 AI Bot Crawling Directives
├── sitemap.xml                     # XML Sitemap with Image Metadata
├── llms.txt                        # Structured Markdown Summary for AI Engines
├── llms-full.txt                   # Complete Deep Knowledge Graph for LLMs
├── css/
│   ├── bundle.css                  # Combined CSS bundle (generated)
│   ├── bundle.min.css              # Minified CSS bundle for production
│   ├── variables.css               # Design system tokens & CSS variables
│   ├── base.css                    # Typography, reset, 12-column grid
│   ├── navigation.css              # Slim sticky header, spine nav, drawer
│   ├── cover.css                   # Chapter 00 responsive 4-quadrant layout
│   ├── engineer.css                # Chapter 01 photo frame & sticky cluster
│   ├── beyond-engineering.css      # Chapter 02 accordion & media layouts
│   ├── case-files.css              # Chapter 03 blueprint cards & telemetry
│   ├── music-archive.css           # BE-03 turntable CD chassis & oscilloscope
│   ├── blueprint-viewer.css        # Archival lightbox overlay & watermark
│   └── components.css              # Washi tapes, buttons, polaroids, clips
├── js/
│   ├── notebook.js                 # Notebook navigation, tabs & organic jitter
│   ├── beyond-engineering.js       # Accordion state machine & stamp physics
│   ├── beyond-assets.js            # Media catalog index
│   ├── music-archive.js            # CD player, audio engine & oscilloscope
│   └── blueprint-viewer.js         # Technical blueprint inspection lightbox
├── src/
│   ├── chapters/                   # 9 Autonomous Chapter Partials
│   │   ├── 00-cover.html           # Chapter 00: Engineering Dossier Cover
│   │   ├── 01-engineer.html        # Chapter 01: The Engineer
│   │   ├── 02-beyond-eng.html      # Chapter 02: Beyond Engineering
│   │   ├── 03-case-files.html      # Chapter 03: Engineering Case Files
│   │   ├── 04-research.html        # Chapter 04: Research & Innovation
│   │   ├── 05-experience.html      # Chapter 05: Professional Experience
│   │   ├── 06-expertise.html       # Chapter 06: Technical Expertise
│   │   ├── 07-recognition.html     # Chapter 07: Leadership & Honors
│   │   └── 08-contact.html         # Chapter 08: Field Contact Memo Pad
│   └── components/                 # Reusable Layout Primitives
│       ├── head.html               # Head tags, meta, & schema placeholder
│       ├── schema.jsonld           # 20KB Schema.org Graph (AEO/GEO/SEO)
│       ├── loader.html             # Analog notebook loading screen
│       ├── spine-nav.html          # Left spine bookmark bar
│       ├── header.html             # Slim 48px sticky header
│       ├── drawer-nav.html         # Mobile chapter index drawer
│       ├── binder.html             # Outer notebook binder enclosure
│       ├── footer.html             # Page number indicator
│       └── lightbox.html           # Blueprint zoom/pan lightbox modal
├── assets/                         # Optimized binary media
│   ├── docs/                       # Sushant_Kumar_Resume.pdf
│   ├── icons/                      # Logos & favicons
│   ├── images/                     # Technical sketches & portraits
│   └── field_notes/                # Sketches & sculptures
├── raw_vocals/                     # Acoustic audio tracks & artwork
└── scripts/
    ├── build.js                    # Zero-dependency compiler & DOM ID validator
    └── serve.js                    # Local preview server with HTTP 206 streaming
```

---

## ⚡ Build System & Validation

The project uses a custom, zero-dependency Node compiler (`scripts/build.js`):

1. **CSS Compilation**: Reads 11 stylesheets in dependency order, deduplicates `@import` declarations, and produces both `css/bundle.css` and a minified `css/bundle.min.css`.
2. **Component Assembly**: Injects `schema.jsonld` into `head.html`, loads navigation components, stitches the 9 chapters into the notebook binder slot, and generates `index.html`.
3. **Anchor Target Validation**: Scans all 23 anchor references (`href="#..."`) against the 86 declared DOM IDs to guarantee zero broken in-page navigation links.

### Commands

```powershell
# Compile the entire project & validate DOM integrity
node scripts/build.js
# Or via npm
npm run build

# Start local server with HTTP 206 range streaming (auto-opens browser)
node scripts/serve.js --open
# Or via npm
npm start
```

---

## 🔍 SEO, AEO & GEO Knowledge Graph

Engineered for 2026 search engines, AI answer engines (Perplexity, ChatGPT, Claude, Gemini), and generative search overviews:

* **Schema.org JSON-LD**: Comprehensive graph including `Person`, `WebSite`, `ProfilePage`, Indian Patent (`Patent`), Springer/IEEE papers (`ScholarlyArticle`), `EducationalOccupationalCredential`, `ItemList` (Awards), `FAQPage` (8 Q&As), and `BreadcrumbList` across all 9 chapters.
* **`llms.txt` & `llms-full.txt`**: Standardized Markdown documentation detailing verified claims, metrics, academic performance (CGPA 9.16), publications, and project architectures for LLM crawlers.
* **`robots.txt`**: Explicitly permits AI bots (`GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `Meta-ExternalAgent`, `Cohere-ai`) to discover knowledge files.
* **OpenGraph & Twitter Cards**: High-resolution preview image cards and semantic tags.

---

## 👤 Author Credentials

* **Name**: Sushant Kumar
* **Degree**: B.Tech in CSE (Cyber Security & Digital Forensics), MIT World Peace University (CGPA 9.16 / 10.0)
* **Founder**: [TechDenLab](https://techdenlab.com)
* **Cloud Solutions Architect Engineer**: Technophiles Den
* **Patent**: Published Indian Patent (*Automated Emergency Vehicle Alert and Intelligent Traffic Coordination System*, Application No. 202521077464)
* **Publications**:
  * Springer Nature Journal (Applied Artificial Intelligence & Soft Computing)
  * IEEE ICCUBEA 2026 Best Research Paper Award (PCCOE Pune)
* **Profiles**:
  * [GitHub: @rsk807](https://github.com/rsk807)
  * [LinkedIn: sushant-kumar-csf](https://www.linkedin.com/in/sushant-kumar-csf/)

---

## 📄 License & Intellectual Property

All technical blueprints, code samples, personal essays, sculpture models, and field note sketches are the proprietary intellectual property of **Sushant Kumar**. © 2026 Sushant Kumar. All rights reserved.
