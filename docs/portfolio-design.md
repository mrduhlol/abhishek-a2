# Portfolio design

The main site starts with Abhishek's name and a brief introduction. Pulp leads the project list with its current icon and a decorative ten-band equalizer. The other projects use their current icons, plain descriptions, and direct links to their GitHub repositories. The layout has no portrait.

- Use Barlow Condensed for display headings and Manrope for body text. Both fonts are local.
- The canvas is `#f6f7f2`, the text is `#192020`, and secondary text is `#505c53`. Links use `#154c39`. The Pulp artwork pairs `#18251e` with the icon's `#d5fa7d` accent.
- At widths up to 620px, the project list becomes a single column and the filters sit beneath the heading.
- GSAP introduces the equalizer once per mount. Lenis smooths wheel input on fine-pointer devices. Both enhancements respect live changes to the system's reduced-motion setting. Anchor links and keyboard navigation use native browser behavior.

To refresh the standalone file, run `npm run build` followed by `node scripts/export-portfolio.mjs`. The export embeds the same application, styles, fonts, and icons used by the website. It opens from disk without a server.

Run `PORTFOLIO_URL="file://$PWD/portfolio.html" node scripts/portfolio-check.mjs` to check the offline file at four viewport widths and verify filters, images, and contact navigation.
