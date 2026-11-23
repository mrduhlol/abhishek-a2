# Portfolio design

The main site starts with Abhishek's name and a brief introduction. Each project has one row with its current app icon, platform, description, tech stack, and source link. Select a description to show or hide its image. Inkora uses the mockup from its project site and labels it as an app preview.

- Use Barlow Condensed for display headings and Manrope for body text. Both fonts are local.
- The canvas is `#f6f7f2`, the text is `#192020`, and secondary text is `#505c53`. Links and selected filters use `#154c39`.
- At widths up to 620px, the filters sit beneath the heading and each project's description sits below its name and source link.
- GSAP animates the name on arrival. Lenis smooths wheel input on fine-pointer devices. Both enhancements respect live changes to the system's reduced-motion setting. Anchor links and keyboard navigation use native browser behavior.

To refresh the standalone file, run `npm run build` followed by `node scripts/export-portfolio.mjs`. The export embeds the same application, styles, fonts, and project images used by the website. It opens from disk without a server.

Run `PORTFOLIO_URL="file://$PWD/portfolio.html" node scripts/portfolio-check.mjs` to check the offline file at four viewport widths and verify filters, images, and contact navigation.
