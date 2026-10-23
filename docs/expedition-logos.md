# Expedition project logo sources

Researched on 2026-10-23 from the repository URLs in `src/data/projects.js`, using GitHub repository metadata, complete recursive file trees, source files, and manifests. Downloaded assets are pinned to the commits below. All seven repositories report owner `mrduhlol` and `fork: false` in GitHub metadata. The user states that these are their repositories and authorizes embedding their project logos in the terrain.

Six existing project marks are available. Orbit has no project logo asset in its current repository or releases. No monograms or generated logos were added.

## Integration paths

Use the existing project IDs without renaming:

- `orbit`: absent; the parent implementation must choose and clearly label any fallback.
- `voxlink`: `/expedition/logos/voxlink.png`
- `github-widgets`: `/expedition/logos/github-widgets.svg`
- `inkora`: `/expedition/logos/inkora.svg`
- `docutype`: `/expedition/logos/docutype.svg`
- `stikr`: `/expedition/logos/stikr.png`
- `black-jack`: `/expedition/logos/black-jack.svg`

The six images total 170,618 bytes (about 167 KiB). Five are exact upstream files; Inkora is a verbatim SVG extraction from its project website. No recoloring, tracing, rasterization, cropping, or AI generation was performed.

## Sources and selection evidence

### Voxlink

- Local file: `public/expedition/logos/voxlink.png`
- Source path: `android/app/src/main/res/drawable/voxlink_icon.png` in [`mrduhlol/Voxlink`](https://github.com/mrduhlol/Voxlink).
- Pinned source: [GitHub file](https://github.com/mrduhlol/Voxlink/blob/c44813ce885253f3afa097b4118bc8b5f10a5d5e/android/app/src/main/res/drawable/voxlink_icon.png) · [raw download](https://raw.githubusercontent.com/mrduhlol/Voxlink/c44813ce885253f3afa097b4118bc8b5f10a5d5e/android/app/src/main/res/drawable/voxlink_icon.png).
- Commit: `c44813ce885253f3afa097b4118bc8b5f10a5d5e`
- Format: 512 × 512 PNG, RGBA. Green waveform on a dark rounded square.
- Evidence: The Android application manifest sets both android:icon and android:roundIcon to @drawable/voxlink_icon. The desktop Tauri bundle uses icons/icon.png, which is byte-identical to the selected Android image. [Source](https://github.com/mrduhlol/Voxlink/blob/c44813ce885253f3afa097b4118bc8b5f10a5d5e/android/app/src/main/AndroidManifest.xml).
- Transformation: None; exact upstream bytes.
- SHA-256: `ee17f26c0299ef0fa038509f39821a9e0e599beefe5dd4db6cd81576f1361dcc`

### github-widgets

- Local file: `public/expedition/logos/github-widgets.svg`
- Source path: `site/assets/img/favicon.svg` in [`mrduhlol/github-widget`](https://github.com/mrduhlol/github-widget).
- Pinned source: [GitHub file](https://github.com/mrduhlol/github-widget/blob/49c33c8bfe64dc888809e6006b1f4fc1d7ab7bab/site/assets/img/favicon.svg) · [raw download](https://raw.githubusercontent.com/mrduhlol/github-widget/49c33c8bfe64dc888809e6006b1f4fc1d7ab7bab/site/assets/img/favicon.svg).
- Commit: `49c33c8bfe64dc888809e6006b1f4fc1d7ab7bab`
- Format: SVG, viewBox 0 0 32 32. Four green contribution cells on navy.
- Evidence: The project website site/index.html explicitly references assets/img/favicon.svg as its favicon. Chosen over the alternate docs/assets/favicon.svg. This is the project’s own website mark, not a substituted GitHub corporate logo. [Source](https://github.com/mrduhlol/github-widget/blob/49c33c8bfe64dc888809e6006b1f4fc1d7ab7bab/site/index.html).
- Transformation: None; exact upstream bytes.
- SHA-256: `50318bc82b8085da858a6724b978f2c4c9f22574612a850f5529a0b1ccd2fbdd`

### Inkora

- Local file: `public/expedition/logos/inkora.svg`
- Source path: `site/index.html (first logo-mark inline SVG)` in [`mrduhlol/Inkora`](https://github.com/mrduhlol/Inkora).
- Pinned source: [GitHub file](https://github.com/mrduhlol/Inkora/blob/f776ad306c8d48c44e18cd29dadd411c9871315b/site/index.html) · [raw download](https://raw.githubusercontent.com/mrduhlol/Inkora/f776ad306c8d48c44e18cd29dadd411c9871315b/site/index.html).
- Commit: `f776ad306c8d48c44e18cd29dadd411c9871315b`
- Format: SVG, viewBox 0 0 108 108, transparent background. Coral notebook with a cream heart.
- Evidence: The current project website uses this exact inline SVG in its header and footer logo-mark. The Android adaptive launcher references the corresponding notebook vector in app/src/main/res/drawable/ic_inkora_launcher_foreground.xml with a cream background from app/src/main/res/values/icon_colors.xml. The older 1.7 MB feather PNG remains in drawable-xxxhdpi but is not referenced by the current adaptive launcher, so it was not selected. The extracted website SVG keeps its original padding and transparency. [Source](https://github.com/mrduhlol/Inkora/blob/f776ad306c8d48c44e18cd29dadd411c9871315b/site/index.html).
- Transformation: Extracted the first logo-mark SVG verbatim from the website header; added a final newline only. No shapes, colors, dimensions, or background added.
- SHA-256: `b2680d9d7ab685071df7a267199e2364123838120c488281aea6cb7e33ddbdb6`

### DocuType

- Local file: `public/expedition/logos/docutype.svg`
- Source path: `icons/docutype.svg` in [`mrduhlol/DocuType`](https://github.com/mrduhlol/DocuType).
- Pinned source: [GitHub file](https://github.com/mrduhlol/DocuType/blob/6a7e1f67b70a4eb1edfab25e1397dba60d3b21a7/icons/docutype.svg) · [raw download](https://raw.githubusercontent.com/mrduhlol/DocuType/6a7e1f67b70a4eb1edfab25e1397dba60d3b21a7/icons/docutype.svg).
- Commit: `6a7e1f67b70a4eb1edfab25e1397dba60d3b21a7`
- Format: SVG, 128 × 128. Cream document lines and orange caret on charcoal.
- Evidence: The repository supplies icons/docutype.svg with aria-label="DocuType" alongside icon16.png, icon32.png, icon48.png, and icon128.png. manifest.json registers those PNG variants as the extension and action icons. The original SVG was selected for scalable rendering. [Source](https://github.com/mrduhlol/DocuType/blob/6a7e1f67b70a4eb1edfab25e1397dba60d3b21a7/manifest.json).
- Transformation: None; exact upstream bytes.
- SHA-256: `e4c64e4d2e487e2a1665f19c59d512018e3b74015d9dc94090070c8b06462f24`

### Stikr

- Local file: `public/expedition/logos/stikr.png`
- Source path: `docs/site/assets/logo.png` in [`mrduhlol/stikr`](https://github.com/mrduhlol/stikr).
- Pinned source: [GitHub file](https://github.com/mrduhlol/stikr/blob/19305c4eaca45d66a3d5e984c6e790643f02879e/docs/site/assets/logo.png) · [raw download](https://raw.githubusercontent.com/mrduhlol/stikr/19305c4eaca45d66a3d5e984c6e790643f02879e/docs/site/assets/logo.png).
- Commit: `19305c4eaca45d66a3d5e984c6e790643f02879e`
- Format: 1254 × 1254 PNG, RGB. White peeled-sticker S on purple.
- Evidence: docs/site/index.html uses assets/logo.png as the favicon, navigation brand, and hero logo, with alt text identifying the white sticker S. It is byte-identical to docs/brand/logo.png. This complete website logo was selected instead of the white-only Android adaptive foreground layer. [Source](https://github.com/mrduhlol/stikr/blob/19305c4eaca45d66a3d5e984c6e790643f02879e/docs/site/index.html).
- Transformation: None; exact upstream bytes.
- SHA-256: `6c36281bb635465760432f0b77b7c12bc8206646b44366eb91c58ff898a559e8`

### Black Jack

- Local file: `public/expedition/logos/black-jack.svg`
- Source path: `public/favicon.svg` in [`mrduhlol/black-jack`](https://github.com/mrduhlol/black-jack).
- Pinned source: [GitHub file](https://github.com/mrduhlol/black-jack/blob/db8c1f846e1bc3c1091cdb6fe95f3edf63252b89/public/favicon.svg) · [raw download](https://raw.githubusercontent.com/mrduhlol/black-jack/db8c1f846e1bc3c1091cdb6fe95f3edf63252b89/public/favicon.svg).
- Commit: `db8c1f846e1bc3c1091cdb6fe95f3edf63252b89`
- Format: SVG, viewBox 0 0 64 64. Cream spade and gold 21 on a green tile.
- Evidence: public/index.html explicitly references favicon.svg for both its favicon and apple-touch-icon. This is the application’s own icon. Unrelated captured video-page assets were not used. [Source](https://github.com/mrduhlol/black-jack/blob/db8c1f846e1bc3c1091cdb6fe95f3edf63252b89/public/index.html).
- Transformation: None; exact upstream bytes.
- SHA-256: `16a076df8ea5012f2a82e9314ec27d7b0751ed5cbcb7d3fa998dee8287affd34`

### Orbit — absent

The [complete repository tree](https://github.com/mrduhlol/Orbit/tree/c7fa23e828006b93b8b7f0105cd80d54fa3dbfde) contains Python modules, scripts, tests, a workflow, and the README, with no image, SVG, icon, branding folder, or embedded logo asset. [scripts/installer.py](https://github.com/mrduhlol/Orbit/blob/c7fa23e828006b93b8b7f0105cd80d54fa3dbfde/scripts/installer.py#L137) installs a desktop entry with `Icon=document-save-as`, a generic system icon name rather than an Orbit logo. The GitHub [releases API](https://api.github.com/repos/mrduhlol/Orbit/releases) returned an empty list at research time. No `orbit.*` image was added.

## Ownership and licensing

GitHub repository ownership is recorded above; it is not a claim that every asset in each repository has an independently verified authorship history. The user’s ownership statement and request authorize this site integration.

- **Voxlink, github-widgets, Inkora, DocuType, Stikr, and Orbit:** GitHub reports no detected repository license, and their current trees contain no general repository or logo license. Do not describe these logos as MIT, public domain, or generally licensed for third-party redistribution. Inkora’s `licenses/Outfit-OFL.txt` and Stikr’s font OFL files apply to fonts, not these logos.
- **Black Jack:** the repository [LICENSE](https://github.com/mrduhlol/black-jack/blob/db8c1f846e1bc3c1091cdb6fe95f3edf63252b89/LICENSE) is MIT, copyright (c) 2026 Abhishek. The complete original notice is preserved alongside the asset in [`public/expedition/logos/black-jack.LICENSE.txt`](../public/expedition/logos/black-jack.LICENSE.txt). No separate logo license or trademark permission was found.

## Validation

- Verified every selected upstream file against its Git blob SHA from the recursive repository tree.
- Verified Inkora’s output is the exact first header logo SVG substring from the pinned website source, plus one final newline.
- Parsed all four SVGs as XML and checked that they have no scripts, event handlers, foreign objects, or external dependencies.
- Fully decoded both PNGs and checked their format and dimensions.
- No runtime/site source files are part of this change.

## WebGL texture preparation

For integration, `github-widgets.svg`, `inkora.svg`, and `black-jack.svg` received explicit `width="256" height="256"` attributes. Their original viewBox and artwork are unchanged. ViewBox-only SVG images reported zero intrinsic dimensions to the texture loader, collapsing the corresponding geometry; explicit dimensions make the supplied artwork render correctly. Acquisition hashes above describe the source downloads before this two-attribute preparation.
