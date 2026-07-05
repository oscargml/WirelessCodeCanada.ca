# WirelessCodeCanada.ca

A fully static, bilingual (EN/FR) website that helps Canadian consumers understand and enforce
their rights under the **CRTC Wireless Code**, the **Internet Code**, and the **October 2025
Telecom Act reforms**. It generates complaint letters, walks users through filing with the CCTS,
and monetizes via Google AdSense, affiliate links, and Gumroad digital products.

No database. No login. No build step. Just HTML, CSS, and vanilla JS.

---

## Tech stack

- **HTML5 + CSS3 + vanilla JS** — zero frameworks, zero npm, zero build step
- **jsPDF** (via CDN) for client-side PDF export of generated letters
- **Google Fonts**: Inter (UI) + Merriweather (letter previews)
- One global stylesheet (`assets/css/style.css`) and one global script (`assets/js/app.js`)

## File structure

```
wireless-code-canada/
├── index.html                 # browser-language redirect (navigator.language → /en or /fr)
├── en/                        # 13 English pages
│   ├── index.html
│   ├── complaint-letter-generator.html   # core tool (4-step wizard)
│   ├── wireless-code-rights.html
│   ├── ccts-complaint-guide.html
│   ├── bill-shock-guide.html
│   ├── switch-provider-guide.html
│   ├── internet-code-rights.html
│   ├── faq.html               # FAQPage schema
│   ├── shop.html              # Gumroad upsells
│   ├── privacy-policy.html
│   ├── terms-of-use.html
│   ├── disclaimer.html
│   └── about.html
├── fr/                        # 13 French mirror pages (same order, localized slugs)
├── assets/
│   ├── css/style.css          # full design system
│   └── js/app.js              # lang toggle, nav, wizard engine, jsPDF export
├── robots.txt
├── sitemap.xml                # all 26 pages with hreflang alternates
└── README.md
```

## Key features

- **Complaint-letter generator** — a 4-step client-side wizard. Inputs never leave the browser
  (nothing stored or transmitted). It cites the exact Wireless/Internet Code section for the
  selected issue and exports to PDF, copy, or print.
- **Issue deep-links** — homepage issue cards link to `complaint-letter-generator.html?issue=<key>`
  and pre-select the matching issue. Keys live in `ISSUES` in `app.js`:
  `switching-fee, bill-higher, data-overage, roaming, locked-phone, contract-change,
  refused-resolve, internet, other`.
- **Bilingual architecture** — every page has an EN and FR twin. The EN↔FR toggle routes to the
  *exact* equivalent page using the `EN_TO_FR` map in `app.js`, never to the homepage.
- **SEO** — per-page titles/descriptions, canonical + `hreflang` (en-CA / fr-CA / x-default),
  Open Graph, JSON-LD (WebSite, HowTo, FAQPage), `sitemap.xml`, `robots.txt`.
- **Accessibility** — skip links, semantic landmarks, labelled forms, focus styles, WCAG-AA palette.
- **Responsive** — mobile-first, 320px → 1280px, sidebar layout on desktop guide pages.

## Local preview

It's all static — open `index.html` directly, or serve the folder:

```bash
# Python
python -m http.server 8000
# then visit http://localhost:8000/

# or Node
npx serve .
```

## Deploy

- **Netlify** — drag-and-drop the `wireless-code-canada/` folder onto the Netlify dashboard.
- **GitHub Pages** — push to a repo and enable Pages on the root.
- **Vercel** — import the repo (no framework preset needed) or `vercel deploy`.

No server-side runtime is required.

## Before going live — configure these

1. **AdSense** — the loader script in each `<head>` is commented out. Uncomment it once your
   account is approved. Ad client is `ca-pub-8643026289824701`; replace the `data-ad-slot`
   placeholders (`SLOT_*`) with real slot IDs.
2. **Affiliate links** — replace `href="#"` on `[data-affiliate]` CTAs with your real referral URLs.
3. **Gumroad** — replace `https://gumroad.com/` placeholders on `[data-product]` buttons with your
   product URLs.
4. **Domain** — all canonical/hreflang/sitemap URLs assume `https://wirelesscodecanada.ca`.
   Update them if the domain differs.
5. **Contact emails** — `hello@` and `velmorpub@gmail.com` are referenced site-wide.

## Legal note

The site provides **general legal information, not legal advice**, and is **not affiliated** with
the CRTC, the CCTS, or any carrier. See `disclaimer.html` / `avis-juridique.html`.
