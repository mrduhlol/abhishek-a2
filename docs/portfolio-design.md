# Portfolio design

The site introduces Abhishek alongside a board of the eight app icons. Each icon jumps to its project, clearing a filter if needed. The gallery shows each app's platform, description, tech stack, and source link. Select a description to show or hide its screenshot. Inkora uses the mockup from its project site and labels it as an app preview.

- Barlow Condensed sets the headings, and Manrope sets the body text. Both fonts are local.
- The canvas is `#151421`, project cards are `#1e1c2b`, and the lilac accent is `#d6c7fc`.
- At widths up to 680px, the icon board sits below the introduction, filters sit below the Projects heading, and the gallery uses a single column.
- GSAP animates the name and icons on arrival. Lenis smooths wheel input on fine-pointer devices. Both respect live changes to reduced-motion settings. Anchor links and keyboard navigation use native browser behavior.

To refresh the standalone file, run `npm run build` followed by `node scripts/export-portfolio.mjs`. The export embeds the same application, styles, fonts, and project images used by the website. It opens from disk without a server.

Run `PORTFOLIO_URL="file://$PWD/portfolio.html" node scripts/portfolio-check.mjs` to check the offline file at four viewport widths and verify filters, images, and contact navigation.
