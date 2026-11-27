# Asset provenance

- `public/abhishek-cutout.png`: user-supplied portrait, background extracted with the built-in imagegen tool on 2026-10-23. Approved by the user. Exact prompt: “Use case: background-extraction. Edit the supplied portrait only by removing the entire green background to genuine transparency. Keep the person exactly as photographed: identical face, expression, glasses, hair including natural fine edges, skin, white shirt, pose, lighting, and framing. No stylization, retouching, added objects, text, or shadows. Preserve the full visible head and torso. Output a clean transparent PNG cutout for a portfolio main page.”
- `public/abhishek-cutout.webp`: web delivery encoding of that PNG, ImageMagick quality 88, preserves transparency.
- `public/audio/here-we-go-again.mp3`: supplied by the user for the first-scroll line; 2.76 seconds. Opt-in playback, not background music.
- `public/fonts/`: Barlow Condensed 800, Manrope 400/600, Kalam 400, DM Mono 400, downloaded from Google Fonts' official fonts.gstatic.com distribution. Local hosting avoids third-party runtime requests. Font license files accompany these distributions.
- Terrain, character and town artwork: authored code-native Three.js geometry and SVG for this project, not externally sourced imagery.

## Windows 98 desktop icons

The system icons in `public/win98-icons` come from https://win98.si/icons/. The pointer is an original pixel rendering of the classic black-outlined Windows arrow. Abhishek confirmed permission to reproduce the reference design.

The boot logos and splash use https://win98.si/splash/. The desktop uses https://win98.si/wallpapers/windows98.jpg. The project screenshots link to their pinned GitHub source files from their individual project windows.

The Windows 98 project icons in `public/win98-project-icons` use the upstream app artwork at 32 × 32 pixels. The Android adaptive icons combine the launcher foreground and background. DocuType uses the exact 32-pixel PNG registered by its extension manifest.

- [Voxlink](https://github.com/mrduhlol/Voxlink/blob/c96a056c8e2eb3e6b92fd715cfde8326fbee7599/android/app/src/main/res/drawable/voxlink_icon.png)
- [github-widget](https://github.com/mrduhlol/github-widget/blob/97020c5ca84da48e1f30c0837b25b9a5f00baab2/docs/assets/app-icon.svg)
- [Inkora](https://github.com/mrduhlol/Inkora/blob/f776ad306c8d48c44e18cd29dadd411c9871315b/app/src/main/res/drawable/ic_inkora_launcher_foreground.xml)
- [DocuType](https://github.com/mrduhlol/DocuType/blob/1828a238b52d3ed35c3587242c60a0f8c14eeb6d/icons/icon32.png)
- [stikr](https://github.com/mrduhlol/stikr/blob/3168315640e13307d553b6aaefb565327cedf3ec/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png)
- [black-jack](https://github.com/mrduhlol/black-jack/blob/db8c1f846e1bc3c1091cdb6fe95f3edf63252b89/public/favicon.svg)

[Orbit](https://github.com/mrduhlol/Orbit/tree/7c4e8df449bcd6bf14f87d5b1d2e88d4ad29351d) does not ship a dedicated mark. Its Windows 98 icon depicts a file conversion.
