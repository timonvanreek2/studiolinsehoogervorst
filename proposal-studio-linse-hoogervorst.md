# Proposal: Brand Identity & Website
## Studio Linse Hoogervorst

Prepared by Timon van Reek
April 2026

---

## Introduction

This proposal outlines the scope for a new brand identity and website for Studio Linse Hoogervorst. The work reflects the studio's transition — Job Hoogervorst continuing the practice established by Paul Linse, with a renewed visual language that honours the studio's heritage while establishing Job's direction.

The identity and website should embody the studio's philosophy: spaces that honour their context, concerned with atmosphere, proportion and materiality. The design will be restrained, confident, and let the work speak.

---

## 1. Brand Identity

### Wordmark
A custom-kerned wordmark using HAL Timezone Mono — a typewriter mono serif that references craft and precision. Three-tier system:

- **Full wordmark** — STUDIO / LINSE HOOGERVORST (stagger layout)
- **Initials mark** — S / LH (compact form for small and large applications)
- **Animated transition** — scroll-driven typewriter deletion connecting the two forms

### Typography System
- **HAL Timezone Mono** — headings, wordmark, display
- **ABC Diatype** — body, navigation, UI elements

### Colour Palette
- Primary: #000000 (black)
- Background: #F7F3F2 (warm off-white)
- Muted: #999999
- Structural: #E0E0E0

### Deliverables
- Wordmark in SVG, PNG, and EPS (full + initials, black + white variants)
- Typography usage guidelines
- Colour specifications
- Minimum size and clear space rules
- Brand guidelines document (PDF)

---

## 2. Website — Pages

### 2.1 Homepage
Full-screen, scroll-driven portfolio presentation.

- **Selected work** — 8 featured projects shown as full-viewport images with varied portrait/landscape positioning. Scroll through to browse.
- **Project index** — complete project list below the selected work, showing title, location, category, and completion year. Acts as navigation to individual projects.
- **Meta bar** — persistent project information (title, location, category, year) that updates as the visitor scrolls between projects.
- **Animated logo** — full wordmark reduces to initials as the visitor scrolls past the opening image.

### 2.2 Project Detail
Individual project pages accessed from the homepage index or by clicking featured images.

- **Hero image** — full-width project photograph
- **Project information** — title, location, category, completion year, photographer credit
- **Description** — project narrative text
- **Image gallery** — curated sequence of project photographs in varied layout modules (full-width, double, triple, offset, portrait)
- **Next/previous navigation** — to browse between projects

### 2.3 About / Studio
Studio information and credentials.

- **About text** — studio philosophy and approach
- **Contact** — general enquiries, new business, phone, address
- **Press** — chronological list of publications and features
- **Awards** — chronological list of recognitions

### 2.4 Legal
- **Privacy policy**
- **Impressum / colophon** (if required)

---

## 3. Technical Implementation

### Platform
- **Framework**: SvelteKit (server-rendered, fast, modern)
- **CMS**: Sanity — headless content management for projects, studio content, press, and awards. Job can edit all content independently after launch.
- **Hosting**: Vercel — global CDN, automatic deployments, SSL
- **Domain**: to be configured (existing domain or new)

### Responsive Design
Fully responsive across desktop, tablet, and mobile. Mobile navigation with hamburger menu. Portrait images adapt to full-width on smaller screens.

### Performance
- Lazy-loaded images with optimised formats (WebP/AVIF via Sanity CDN)
- Server-side rendering for fast initial load and SEO
- Minimal JavaScript, no heavy frameworks or libraries

### SEO
- Semantic HTML, meta tags, Open Graph tags
- Sitemap generation
- Project pages with proper titles and descriptions

---

## 4. Content Requirements

The following content is needed from the studio:

- [ ] About text (studio description / philosophy)
- [ ] Contact details (email, phone, address, new business email)
- [ ] Project information for each project (title, location, category, year, photographer, description)
- [ ] Project photographs (high resolution, minimum 2000px wide)
- [ ] Press list (year + publication/title)
- [ ] Awards list (year + award name)
- [ ] Intro photograph for homepage
- [ ] Legal text (privacy policy, if applicable)

---

## 5. What's Not Included

- Photography or retouching
- Copywriting (structure and placeholder text provided; final copy to be supplied by studio)
- Print design (business cards, stationery, signage)
- Ongoing maintenance beyond the support period
- Additional pages beyond those listed in Section 2
- E-commerce or booking functionality
- Multilingual support

Any of the above can be added as a separate scope if needed.

---

## 6. Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Brand identity | ___ weeks | Wordmark finalisation, guidelines, asset export |
| Website design | ___ weeks | Page layouts, responsive design, interactions |
| Development | ___ weeks | Build, CMS integration, content entry |
| Review & launch | ___ week | Testing, feedback rounds, go-live |
| **Total** | **___ weeks** | |

---

## 7. Investment

| Deliverable | Fee |
|-------------|-----|
| Brand identity (wordmark, guidelines, assets) | EUR ___ |
| Website (design, development, CMS, hosting setup) | EUR ___ |
| **Total** | **EUR ___** |

Payment schedule: ___ % upon agreement, ___ % at design approval, ___ % at launch.

---

## 8. Post-Launch Support

- ___ months of bug fixes and minor adjustments included
- CMS training session (how to add/edit projects, update studio info)
- Hosting costs: covered by Vercel free tier (or Pro at ~EUR 20/month if needed)
- Font licensing: to be confirmed (HAL Timezone requires a web license)

---

## 9. Next Steps

1. Review this proposal
2. Discuss and align on scope, timeline, and budget
3. Sign off and begin work

---

*Looking forward to building this together.*

Timon van Reek
timon.vanreek@intercom.io
