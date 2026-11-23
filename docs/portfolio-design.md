# Portfolio design

The project browser pairs a list of apps with a focused detail view. Each app has a cover, platform, description, tech stack, and source link. Select a description to show or hide its screenshot. Inkora uses the mockup from its project site and labels it as an app preview.

- Barlow Condensed sets the display headings, and Manrope sets the body text. Both fonts are local.
- The canvas is `#f7f7f1`, the toolbar is `#202820`, and each app has its own cover palette.
- At 680px the app picker moves above the detail view and uses two columns.
- GSAP animates the selected app icon on arrival. Lenis smooths wheel input on fine-pointer devices. Both respect reduced-motion settings.

To refresh the standalone file, run `npm run build` followed by `node scripts/export-portfolio.mjs`. The export embeds the same application, styles, fonts, and project images used by the website. It opens from disk without a server.

Run `PORTFOLIO_URL="file://$PWD/portfolio.html" node scripts/portfolio-check.mjs` to check the offline file at four viewport widths and verify filters, images, and contact navigation.
