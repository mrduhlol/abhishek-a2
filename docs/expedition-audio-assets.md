# Expedition audio assets

Acquired and license-checked on **2026-10-23**. This delivery contains actual downloaded recordings and sound effects, plus one explicitly documented transition edit. No UI or audio-engine code is included.

**22 MP3 files; 2,384,232 bytes (2.27 MiB) total audio.** All audio lives in `public/expedition/audio/`; browser URLs begin `/expedition/audio/`. `ATTRIBUTION.txt` is a distributable credit file and `provenance.json` maps every export to its sources, exact processing filter, source/download hashes and output SHA-256.

## Files and intended mapping

All files use 44.1 kHz MP3. Ambient beds and the transition are stereo at 96 kb/s; footsteps and NPC voices are mono at 64 kb/s. Duration below is decoded audio duration, excluding MP3 encoder padding.

| File | Intended use | Seconds | KiB | Source / license |
| --- | --- | ---: | ---: | --- |
| `ambient-mountain.mp3` | Mountain wind | 23.000 | 270.5 | [mountain](#source-mountain); CC0-1.0 |
| `ambient-forest.mp3` | Forest birds and wind | 23.000 | 270.5 | [forest](#source-forest); CC0-1.0 |
| `ambient-grass.mp3` | Grassland rustle | 23.000 | 270.5 | [grass](#source-grass); CC0-1.0 |
| `ambient-desert.mp3` | Desert wind | 23.000 | 270.5 | [desert](#source-desert); CC0-1.0 |
| `ambient-ocean.mp3` | Ocean water | 23.000 | 270.5 | [ocean](#source-ocean); CC0-1.0 |
| `ambient-cave.mp3` | Cave drips | 23.000 | 270.5 | [cave](#source-cave); CC-BY-4.0 |
| `ambient-volcano.mp3` | Volcano rumble | 23.000 | 270.5 | [volcano](#source-volcano); CC0-1.0 |
| `ambient-town.mp3` | Town bustle | 23.000 | 270.5 | [town](#source-town); CC0-1.0 |
| `footstep-wood01.mp3` | Footstep wood01 | 0.242 | 2.7 | [steps](#source-steps); CC0-1.0 |
| `footstep-wood02.mp3` | Footstep wood02 | 0.242 | 2.7 | [steps](#source-steps); CC0-1.0 |
| `footstep-wood03.mp3` | Footstep wood03 | 0.318 | 3.3 | [steps](#source-steps); CC0-1.0 |
| `footstep-stone01.mp3` | Footstep stone01 | 0.293 | 3.1 | [steps](#source-steps); CC0-1.0 |
| `footstep-mud02.mp3` | Footstep mud02 | 0.260 | 2.7 | [steps](#source-steps); CC0-1.0 |
| `footstep-leaves01.mp3` | Footstep leaves01 | 0.391 | 3.7 | [steps](#source-steps); CC0-1.0 |
| `footstep-leaves02.mp3` | Footstep leaves02 | 0.474 | 4.5 | [steps](#source-steps); CC0-1.0 |
| `footstep-gravel.mp3` | Footstep gravel | 0.704 | 6.2 | [steps](#source-steps); CC0-1.0 |
| `npc-greeting-male.mp3` | NPC greeting (male) | 0.565 | 5.1 | [male](#source-male); CC0-1.0 |
| `npc-shout.mp3` | NPC nonverbal shout | 1.094 | 9.2 | [male](#source-male); CC0-1.0 |
| `npc-greeting-female.mp3` | NPC greeting (female) | 1.010 | 8.6 | [female](#source-female); CC-BY-3.0 |
| `npc-laugh.mp3` | NPC laugh | 3.574 | 28.6 | [laugh](#source-laugh); CC0-1.0 |
| `npc-annoyed.mp3` | NPC annoyed sigh | 5.090 | 40.4 | [sigh](#source-sigh); CC0-1.0 |
| `cave-transition.mp3` | Cave entrance transition | 3.600 | 43.2 | [mountain](#source-mountain), [drip](#source-drip); CC-BY-3.0 |

## Integration notes

- The eight `ambient-*.mp3` files each use a 24-second source excerpt and a baked one-second tail/head crossfade, producing 23 seconds of cyclic audio. The full filter graphs and excerpt times are in the manifest. At integration, audition the seam in the chosen browser and use a short playback crossfade if needed; MP3 gap handling depends on the player. These have no silence fade at every repeat.
- Footsteps are individual events, not prerecorded walking loops. `wood01`–`wood03` and `leaves01`–`leaves02` provide variants; stone, gravel and mud each have one texture. Sand-specific footsteps are not included; gravel is a coarse-ground option, not a claim of recorded sand.
- `npc-annoyed.mp3` is a sigh for mild annoyance/disappointment; `npc-shout.mp3` is a separate short nonverbal exertion reaction. Greetings are recorded speech. No voice imitation or generated speech is included.
- `cave-transition.mp3` is a 3.6-second authored entrance cue, made from a filtered rising wind excerpt with a delayed water drip and echo decay. It is a one-shot, not a loop or recording of an actual transition.
- Ambient files are peak-normalized to −9 dBFS, footsteps to −12 dBFS, and voices/transition to −6 dBFS before encoding. These are preparation levels, not final scene mix volumes. Lossy encoding can shift measured peaks slightly.
- Grassland includes a distant waterfall; town includes real market voices and covered-space reflections; cave and volcano are designed effects. No claim is made that these are geographically/ecologically matched to the fictional world. Audition in context before choosing final scene gains and repetition timing.

## Source and license record

Each individual primary asset page was retrieved and its actual Creative Commons license link checked. Freesound acquisitions use the publicly linked **full-length HQ MP3 previews**, not the original uploaded WAV/FLAC masters; the manifest records the exact CDN URL and SHA-256 of the downloaded preview. They are edited/transcoded again for this bundle, so upstream originals are preferable for future remastering. OpenGameArt acquisitions use the original listed downloads. Large raw sources and temporary working WAVs are not committed.

Research used Freesound, OpenGameArt and the creator’s Nox Sound itch.io listing. The latter independently states CC0 for its Essentials series, but this bundle’s forest license was verified on its individual Freesound page. Internet Archive mirrors were unnecessary because primary downloads and asset-specific licenses were available. No asset was accepted solely because it was labeled “free” or “royalty free.”

<a id="source-mountain"></a>
### mountain: mountain wind heavy strong gusts Swiss Alps.flac

- Creator/credit: **kyles**.
- Primary source: [mountain wind heavy strong gusts Swiss Alps.flac](https://freesound.org/people/kyles/sounds/454092/).
- Verified license: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/); source-page label: Creative Commons 0.
- Acquisition: Freesound public full-length HQ MP3 preview. [Exact download](https://cdn.freesound.org/previews/454/454092_612689-hq.mp3).
- Fit: Swiss Alps gusts; field recording.

<a id="source-forest"></a>
### forest: Ambiance_Natural_Forest_Birds_Wind_Loop_Stereo.wav

- Creator/credit: **Nox_Sound**.
- Primary source: [Ambiance_Natural_Forest_Birds_Wind_Loop_Stereo.wav](https://freesound.org/people/Nox_Sound/sounds/570492/).
- Verified license: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/); source-page label: Creative Commons 0.
- Acquisition: Freesound public full-length HQ MP3 preview. [Exact download](https://cdn.freesound.org/previews/570/570492_9250976-hq.mp3).
- Fit: Forest birds with wind; field recording.

<a id="source-grass"></a>
### grass: Tall Grass Brushing Together in the Wind with Small Waterfall master

- Creator/credit: **BenHarmSound (Ben Harmeyer)**.
- Primary source: [Tall Grass Brushing Together in the Wind with Small Waterfall master](https://freesound.org/people/BenHarmSound/sounds/818505/).
- Verified license: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/); source-page label: Creative Commons 0.
- Acquisition: Freesound public full-length HQ MP3 preview. [Exact download](https://cdn.freesound.org/previews/818/818505_17258992-hq.mp3).
- Fit: Close grass rustle with a distant small waterfall already present in the recording; use near a grassland stream or mix quietly.

<a id="source-desert"></a>
### desert: Desert wind stereo

- Creator/credit: **KasDonatov**.
- Primary source: [Desert wind stereo](https://freesound.org/people/KasDonatov/sounds/402710/).
- Verified license: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/); source-page label: Creative Commons 0.
- Acquisition: Freesound public full-length HQ MP3 preview. [Exact download](https://cdn.freesound.org/previews/402/402710_7791228-hq.mp3).
- Fit: Wind asset labeled for desert use by its creator; recording location / production method unspecified.

<a id="source-ocean"></a>
### ocean: WATER OCEAN WAVES 01.wav

- Creator/credit: **sengjinn**.
- Primary source: [WATER OCEAN WAVES 01.wav](https://freesound.org/people/sengjinn/sounds/174581/).
- Verified license: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/); source-page label: Creative Commons 0.
- Acquisition: Freesound public full-length HQ MP3 preview. [Exact download](https://cdn.freesound.org/previews/174/174581_2979997-hq.mp3).
- Fit: Gentle sea waves recorded at night in Thailand.

<a id="source-cave"></a>
### cave: Cave Drips

- Creator/credit: **everythingsounds**.
- Primary source: [Cave Drips](https://freesound.org/people/everythingsounds/sounds/199515/).
- Verified license: [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/); source-page label: Attribution 4.0.
- Acquisition: Freesound public full-length HQ MP3 preview. [Exact download](https://cdn.freesound.org/previews/199/199515_3272432-hq.mp3).
- Fit: Designed cave-drip Foley using water, bucket, towel and reverberation; not a recording inside a natural cave.

<a id="source-volcano"></a>
### volcano: Volcano.wav

- Creator/credit: **morganpurkis**.
- Primary source: [Volcano.wav](https://freesound.org/people/morganpurkis/sounds/385098/).
- Verified license: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/); source-page label: Creative Commons 0.
- Acquisition: Freesound public full-length HQ MP3 preview. [Exact download](https://cdn.freesound.org/previews/385/385098_5937039-hq.mp3).
- Fit: Creator-designed volcanic rumble and bubbling made in Audacity; not a field recording of an eruption.

<a id="source-town"></a>
### town: 140802_Greenwich_FoodMarket_F.wav

- Creator/credit: **blaukreuz**.
- Primary source: [140802_Greenwich_FoodMarket_F.wav](https://freesound.org/people/blaukreuz/sounds/252697/).
- Verified license: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/); source-page label: Creative Commons 0.
- Acquisition: Freesound public full-length HQ MP3 preview. [Exact download](https://cdn.freesound.org/previews/252/252697_623488-hq.mp3).
- Fit: Real Greenwich food-market hubbub, walking and chatter inside an arcade; useful as a market/town bed rather than an empty rural street.

<a id="source-steps"></a>
### steps: Different steps on wood, stone, leaves, gravel and mud

- Creator/credit: **TinyWorlds**.
- Primary source: [Different steps on wood, stone, leaves, gravel and mud](https://opengameart.org/content/different-steps-on-wood-stone-leaves-gravel-and-mud).
- Verified license: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/); source-page label: CC0.
- Acquisition: Original OpenGameArt ZIP; selected OGG members. [Exact download](https://opengameart.org/sites/default/files/%5Bkdd%5DDifferentSteps_0.zip).
- Fit: Eight source footstep textures; leaves is the grass/forest path option, gravel covers coarse ground, stone covers cave/town paving.

<a id="source-male"></a>
### male: Voice Clip Pack - Male Adventurer RPG

- Creator/credit: **Brandon Song (wolfwoot)**.
- Primary source: [Voice Clip Pack - Male Adventurer RPG](https://opengameart.org/content/voice-clip-pack-male-adventurer-rpg).
- Verified license: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/); source-page label: CC0.
- Acquisition: Original OpenGameArt ZIP; selected WAV members. [Exact download](https://opengameart.org/sites/default/files/RPG%20Male%20Adventurer.zip).
- Fit: Recorded male acting. Greeting from greet0.wav; attackbig0.wav supplies the brief nonverbal exertion/shout, repurposed as an NPC reaction.

<a id="source-female"></a>
### female: Female RPG Character voice pack

- Creator/credit: **RiddlesYouThis**.
- Primary source: [Female RPG Character voice pack](https://opengameart.org/content/female-rpg-character-voice-pack).
- Verified license: [CC-BY-3.0](https://creativecommons.org/licenses/by/3.0/); source-page label: CC-BY 3.0.
- Acquisition: Original OpenGameArt OGG download. [Exact download](https://opengameart.org/sites/default/files/hello.ogg).
- Fit: Recorded female greeting, hello.ogg.

<a id="source-laugh"></a>
### laugh: Laughing (male)

- Creator/credit: **Daniel Alvarez (dastudiospr)**.
- Primary source: [Laughing (male)](https://freesound.org/people/dastudiospr/sounds/529818/).
- Verified license: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/); source-page label: Creative Commons 0.
- Acquisition: Freesound public full-length HQ MP3 preview. [Exact download](https://cdn.freesound.org/previews/529/529818_10761583-hq.mp3).
- Fit: Recorded male laugh.

<a id="source-sigh"></a>
### sigh: Sigh, male

- Creator/credit: **giddster**.
- Primary source: [Sigh, male](https://freesound.org/people/giddster/sounds/336539/).
- Verified license: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/); source-page label: Creative Commons 0.
- Acquisition: Freesound public full-length HQ MP3 preview. [Exact download](https://cdn.freesound.org/previews/336/336539_1738686-hq.mp3).
- Fit: Recorded despondent sigh, repurposed as mild annoyance/disappointment; not an angry spoken line.

<a id="source-drip"></a>
### drip: Ambient Water Drips

- Creator/credit: **Blender Foundation; submitted by Lamoot**.
- Primary source: [Ambient Water Drips](https://opengameart.org/content/ambient-water-drips).
- Verified license: [CC-BY-3.0](https://creativecommons.org/licenses/by/3.0/); source-page label: CC-BY 3.0.
- Acquisition: Original OpenGameArt FLAC download. [Exact download](https://opengameart.org/sites/default/files/amb_waterdrip_1.flac).
- Fit: Yo Frankie! water-drip one-shot used in the cave transition.

## Attribution to retain

Keep the following credits with the files. When sound is integrated into the site, make these available in its credits/asset information; the public `ATTRIBUTION.txt` already contains these notices and voluntary CC0 credits.

“Cave Drips” by everythingsounds, from [Freesound](https://freesound.org/people/everythingsounds/sounds/199515/), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Edited into a 23-second cyclic crossfade, gain adjusted and transcoded as `ambient-cave.mp3`.

“Female RPG Character voice pack” by RiddlesYouThis, from [OpenGameArt](https://opengameart.org/content/female-rpg-character-voice-pack), licensed [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). `hello.ogg` was trimmed, downmixed, gain adjusted and transcoded as `npc-greeting-female.mp3`.

“Ambient Water Drips” from *Yo Frankie!* by Blender Foundation (submitted by Lamoot), from [OpenGameArt](https://opengameart.org/content/ambient-water-drips), licensed [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). `amb_waterdrip_1.flac` was mixed with CC0 wind by kyles, delayed, echoed, faded, gain adjusted and transcoded as `cave-transition.mp3`. The new arrangement/processing is also offered under CC BY 3.0.

[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) permits copying, modification and commercial redistribution without attribution. The CC BY assets permit commercial reuse and adaptation with credit, source/license links and notice of changes. Preserve applicable notices and avoid additional legal/technical restrictions on those assets. None of these credits imply creator endorsement.

## Verification

All 22 files passed FFprobe metadata checks, full FFmpeg decode, non-silence/peak measurements, SHA-256 verification and exact file/manifest coverage. Measured decoded peaks range from −13.4 to −5.9 dBFS; mean levels range from −39.8 to −18.2 dBFS. Per-file measurements are recorded in `provenance.json`. Objective checks do not replace listening on headphones/speakers or checking spatial/mix fit in the future scene. This task does not implement browser playback, so no browser audio-engine compatibility or subjective audition is claimed.

## Existing supplied line

`public/audio/here-we-go-again.mp3` remains in place and unchanged. It is user-supplied, outside this asset collection, and is **not** represented as CC0/CC BY or independently licensed by this research. Its SHA-256 at acquisition time was `049b25c5ec2c0d9aa2b0bb658fad3fa361b707d50f9852c2137da7eb51179b4b`.
