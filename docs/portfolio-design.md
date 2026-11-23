# Portfolio design

The app wall uses each project icon and color to make a selectable tile. Selecting a tile focuses the project detail below the wall. Each app has a cover, platform, description, tech stack, and source link. Select a description to show or hide its screenshot. Inkora uses the mockup from its project site and labels it as an app preview.

- Barlow Condensed sets the display headings, and Manrope sets the body text. Both fonts are local.
- The charcoal canvas is `#171613`, and each project uses its own tile and cover palette.
- At 680px the app wall switches to two columns.
- GSAP animates the selected app icon on arrival. Lenis smooths wheel input on fine-pointer devices. Both respect reduced-motion settings.

To refresh the standalone file, run `npm run build` followed by `node scripts/export-portfolio.mjs`. The export embeds the same application, styles, fonts, and project images used by the website. It opens from disk without a server.

Run `PORTFOLIO_URL="file://$PWD/portfolio.html" node scripts/portfolio-check.mjs` to check the offline file at four viewport widths and verify filters, images, and contact navigation.
