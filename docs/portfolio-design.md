# Professional portfolio

The main entry now renders `src/Portfolio.jsx`. The earlier pixel adventure source is retained. This redesign introduces a readable, document-scrolling portfolio whose primary action is exploring verified project source repositories.

## Visual system

- Canvas: `#fafbf8`; foreground: `#222820`; secondary text: `#5b6358`.
- Accent: `#375a2b`; quiet surface: `#e9eedf`; dividers: `#dce1d6`.
- Locally hosted Manrope, regular and semibold. Display type uses fluid sizes capped at 78px, with a 1.08 line height and -0.04em tracking.
- Content width: 1160px. Desktop gutters: 48px; tablet: 28px; phone: 20px.
- Project rows use original marks, verified descriptions, technology lists, and direct source links. Filters expose their selected state and announce result counts.
- Rounded portrait arch provides the main visual gesture. The page uses quiet horizontal separators rather than a grid of enclosed cards.
- Breakpoints: 900px and 600px. Phone content uses a single column and keeps every project accessible.
- Focus indicators, skip navigation, native anchor links, reduced motion, and explicit image dimensions are included. Portrait and project assets are reused from the repository; no new generated imagery or external font requests are introduced.

## Verification

Run `npm run build`, `npx oxlint src/Portfolio.jsx src/main.jsx scripts/portfolio-check.mjs`, and `npm test`. With the Vite server running, `node scripts/portfolio-check.mjs` checks four viewport sizes, overflow, project filtering, image decoding, contact navigation, and browser errors. It writes review captures to `/tmp`, outside the repository.

The pre-existing PRODUCT.md, DESIGN.md, and Impeccable configuration had uncommitted work before this task. They remain untouched; this document records the replacement surface without including those unrelated edits in a commit.
