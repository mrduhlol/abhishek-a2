# Portfolio design

The portfolio opens with a short introduction and a cobalt acrylic illustration generated with ImageGen. The project section gives every app an icon, platform, description, technology list, and source link. Select a description to show or hide its screenshot. Inkora uses the mockup from its project site and labels it as an app preview.

- Manrope sets the headings and body text. The fonts are local.
- The canvas is `#fbfbf9`, the text is `#16181c`, and links use `#2345ba`.
- The hero artwork is a 74 KB WebP. The project screenshots load on demand.
- At 680px, the introduction and projects switch to one column.
- GSAP animates the artwork on arrival. Lenis smooths wheel input on fine-pointer devices. Both respect reduced-motion settings.

To refresh the standalone file, run `npm run build` followed by `node scripts/export-portfolio.mjs`. The export embeds the same application, styles, fonts, and project images used by the website. It opens from disk without a server.

Run `PORTFOLIO_URL="file://$PWD/portfolio.html" node scripts/portfolio-check.mjs` to check the offline file at four viewport widths and verify filters, images, and contact navigation.
