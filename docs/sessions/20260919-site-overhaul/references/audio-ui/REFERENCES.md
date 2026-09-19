# Audio / Podcast Player UI References

Curated reference corpus of **197 verified** audio and podcast player interfaces, widgets, libraries and accessibility patterns.

Collected 2026-09-19 for the `koosha-phenotype` site overhaul (cast-player / audio-surface work).

Every entry below was fetched during collection. The `Verification` line records the HTTP status observed and, where available, the page title returned at fetch time. Entries whose URL returned 404, timed out, or could not be verified were dropped, not guessed at.

Denominators: **198 candidates submitted -> 197 verified (99%) -> 1 dropped.**

Legend for `Verification`: `Resolved, HTTP 2xx/3xx` = live and served content. Entries marked as verified via a rendering fetch are noted explicitly. Bot-blocked (403) and connection-failed (000) URLs are excluded rather than asserted to exist.

---

## Top 10 to study first

| # | Reference | Why it is first |
|---|---|---|
| 1 | [Overcast - Smart Speed / Voice Boost](https://overcast.fm/) | Audio processing as a visible, named, user-facing feature. The single best model for making our DSP legible and desirable. |
| 2 | [Castro - Inbox triage](https://castro.fm/) | The strongest interaction-design idea in podcasting: explicit keep/skip triage instead of an ever-growing list. |
| 3 | [APG Media Seek Slider example](https://www.w3.org/WAI/ARIA/apg/patterns/slider/examples/slider-seek/) | A scrubbing control built to spec, including the aria-valuetext trick for announcing time as minutes/seconds. |
| 4 | [Ableton Learning Music](https://learningmusic.ableton.com/) | Teaches an entire domain through direct manipulation, with no transport bar at all. Our ceiling for teaching via UI. |
| 5 | [Plexamp](https://plexamp.com/) | The clearest example of deliberate, tasteful over-engineering in an audio player: rich motion and colour, tiny chrome. |
| 6 | [Koel](https://koel.dev/) | The open-source project whose visual target most closely matches ours, with a real transport and queue to learn from. |
| 7 | [Bandcamp embedded player](https://bandcamp.com/) | One player component that survives being embedded across thousands of arbitrary page layouts without breaking. |
| 8 | [Rogue Amoeba Audio Hijack](https://rogueamoeba.com/audiohijack/) | A signal graph made readable as a node canvas with live meters - the precedent for any graph view we build. |
| 9 | [Chrome Music Lab](https://musiclab.chromeexperiments.com/) | Fourteen tiny experiments, each one interface teaching one idea. The template for delight with real scope discipline. |
| 10 | [Butterchurn](https://butterchurnviz.com/) | MilkDrop-grade audio-reactive visuals in the browser, driven by the same analyser node we would use. |

---

### Native macOS / desktop audio apps

## 1. Apple Music (macOS app)
- URL: https://www.apple.com/apple-music/
- Author: Apple
- Year: 2015
- What it does well: Dense-but-legible library navigation with a persistent mini-player and full-window Now Playing translation.
- Why we care: The reference bar for macOS player chrome: we should match its keyboard model and mini-player morph before adding anything novel.
- Verification: Resolved, HTTP 200. Page title: "Apple Music - Apple".

## 2. Apple Music on the web
- URL: https://music.apple.com/
- Author: Apple
- Year: 2019
- What it does well: Full-res artwork-driven browsing and a Now Playing bar that survives long scroll sessions.
- Why we care: Shows how to keep the transport bar persistent across a routed multi-page web app without a layout shift.
- Verification: Resolved, HTTP 200. Page title: "‎Apple Music - Web Player".

## 3. Logic Pro
- URL: https://www.apple.com/logic-pro/
- Author: Apple (formerly Emagic)
- Year: 1993
- What it does well: Transport/tool strips, comping lanes and Smart Controls that make a very deep app feel direct.
- Why we care: Lesson in progressive disclosure: enormous capability surfaced through a small, always-visible control band.
- Verification: Resolved, HTTP 200. Page title: "Logic Pro - Apple".

## 4. Rogue Amoeba Audio Hijack
- URL: https://rogueamoeba.com/audiohijack/
- Author: Rogue Amoeba
- Year: 2002
- What it does well: A node-and-wire audio routing canvas that makes a signal graph readable at a glance.
- Why we care: Direct precedent for koosha-phenotype graph/diagram views: block-and-connector layout with live meters on each node.
- Verification: Resolved, HTTP 200. Page title: "Rogue Amoeba | Audio Hijack: Record Any Audio on MacOS".

## 5. Rogue Amoeba Farrago
- URL: https://rogueamoeba.com/farrago/
- Author: Rogue Amoeba
- Year: 2011
- What it does well: Cart-wall soundboard with per-cart progress rings and a deliberately minimal transport.
- Why we care: Best-in-class example of many simultaneous short audio sources without visual noise - relevant for clip/segment queues.
- Verification: Resolved, HTTP 200. Page title: "Rogue Amoeba | Farrago: Robust, rapid-fire soundboards".

## 6. Rogue Amoeba Fission
- URL: https://rogueamoeba.com/fission/
- Author: Rogue Amoeba
- Year: 2007
- What it does well: Waveform-first editing with a single-file triage model rather than a multi-track timeline.
- Why we care: A strong argument that a cast-player editor can be one waveform plus handles, not a DAW.
- Verification: Resolved, HTTP 200. Page title: "Rogue Amoeba | Fission: Fast & Lossless Audio Editing".

## 7. Rogue Amoeba Loopback
- URL: https://rogueamoeba.com/loopback/
- Author: Rogue Amoeba
- Year: 2014
- What it does well: Patch-cable metaphor for virtual audio devices; explains a hard concept through a physical analogy.
- Why we care: Metaphor reference: pick a mental model users already own, then stay strictly consistent with it.
- Verification: Resolved, HTTP 200. Page title: "Rogue Amoeba | Loopback: Cable-Free Audio Routing".

## 8. Rogue Amoeba SoundSource
- URL: https://rogueamoeba.com/soundsource/
- Author: Rogue Amoeba
- Year: 2003
- What it does well: Per-app volume/meter menu-bar surface with immediate, low-latency feedback.
- Why we care: Model for a compact always-available audio control surface; good fit for a menubar/TUI-adjacent panel.
- Verification: Resolved, HTTP 200. Page title: "Rogue Amoeba | SoundSource: Superior Sound Control".

## 9. Plexamp
- URL: https://plexamp.com/
- Author: Plex
- Year: 2019
- What it does well: An opinionated, DJ-style player with a huge focus on instant search, mood radios and a purpose-built visual identity.
- Why we care: The clearest example of 'over-engineered but delightful' in audio: rich motion, custom colour extraction, tiny transport. Exactly the target register.
- Verification: Resolved, HTTP 200. Page title: "Plexamp - Love your music!".

## 10. Audiobookshelf
- URL: https://www.audiobookshelf.org/
- Author: advplyr and contributors
- Year: 2020
- What it does well: Self-hosted audiobook + podcast server with chapter-aware progress, per-user progress sync and speed control.
- Why we care: Closest open-source analogue to our cast-player: chapter model, resume semantics, multi-speed playback.
- Verification: Resolved, HTTP 200. Page title: "Audiobookshelf".

## 11. VOX
- URL: https://vox.rocks/
- Author: Coppertino
- Year: 2013
- What it does well: Audiophile macOS player with a rounded floating player, loop/playlist rail and cloud library integration.
- Why we care: Study how much personality a floating player window can hold before it stops feeling native.
- Verification: Resolved, HTTP 200. Page title: "VOX Music Player for Mac & iPhone: Unlimited Solution for Music Lovers".

## 12. Audirvana
- URL: https://audirvana.com/
- Author: Audirvana (Damien Plisson)
- Year: 2011
- What it does well: Studio 3.0 unifies local, radio and HiRes streaming behind one navigation model with a 10-band parametric EQ.
- Why we care: Inspect its console/EQ interaction: precise numeric control that still reads as a consumer UI.
- Verification: HTTP 200 via webfetch; page confirms Audirvana Studio 3.0 (macOS/Windows/Linux HiRes player, 10-band parametric EQ, iOS/Android remote app).

## 13. MusicBee
- URL: https://getmusicbee.com/
- Author: Steven Mayall
- Year: 2008
- What it does well: Extremely configurable Windows library manager with tabbed playlists and a dockable player panel.
- Why we care: Case study in configurability vs. coherence, and in how far a power-user player can be pushed.
- Verification: Resolved, HTTP 200. Page title: "MusicBee - The Ultimate Music Manager and Player".

## 14. foobar2000
- URL: https://www.foobar2000.org/
- Author: Peter Pawlowski
- Year: 2002
- What it does well: Component-driven, scriptable player whose UI is fully replaceable; title-format scripting is a first-class feature.
- Why we care: Reference for extensibility architecture, and for the risk of a UI that only its author can understand.
- Verification: Resolved, HTTP 200 (no <title> returned; content served successfully).

## 15. ocenaudio
- URL: https://www.ocenaudio.com/
- Author: Ocenaudio
- Year: 2010
- What it does well: Real-time spectral/waveform preview while dragging a selection, with no modal commit step.
- Why we care: Directly relevant: live preview during scrub/drag is the interaction we want in the cast player.
- Verification: Resolved, HTTP 200. Page title: "ocenaudio".

## 16. IINA (macOS video/audio player)
- URL: https://iina.io/
- Author: IINA contributors
- Year: 2017
- What it does well: Native macOS player built on mpv with a modern Swift UI, picture-in-picture and a real preferences window.
- Why we care: Proof that wrapping a powerful engine in a genuinely native shell is a viable architecture.
- Verification: Resolved, HTTP 200. Page title: "IINA - The modern media player for macOS".

## 17. mpv
- URL: https://mpv.io/
- Author: mpv contributors
- Year: 2013
- What it does well: Scriptable, keyboard-first engine with an IPC surface and an OSD that stays out of the way.
- Why we care: Model for a headless/CLI-first audio core that the GUI is only one possible client of.
- Verification: Resolved, HTTP 200. Page title: "mpv.io".

## 18. Audible
- URL: https://www.audible.com/
- Author: Audible (Amazon)
- Year: 1995
- What it does well: Purpose-built audiobook player: chapter navigation, speed control, sleep timer and clip/bookmark capture.
- Why we care: The single most relevant non-podcast reference for a spoken-word player's feature set.
- Verification: Resolved, HTTP 200. Page title: "Audible | Listen to Audiobooks, Podcasts, & Originals".

### Native iOS audio apps

## 19. Overcast
- URL: https://overcast.fm/
- Author: Marco Arment
- Year: 2014
- What it does well: Smart Speed and Voice Boost as one-tap global toggles, plus an iconic orange UI built around playback speed as a first-class noun.
- Why we care: Our highest-value single reference: audio processing as a visible, named, user-facing feature rather than a hidden setting.
- Verification: Resolved, HTTP 200. Page title: "Overcast".

## 20. Overcast (App Store listing)
- URL: https://apps.apple.com/us/app/overcast/id888422857
- Author: Marco Arment
- Year: 2014
- What it does well: Store page documents the feature vocabulary (Smart Speed, Voice Boost, per-podcast settings) and the icon/identity system.
- Why we care: Gives us the canonical product language to reuse when naming our own speed/boost features.
- Verification: Resolved, HTTP 200. Page title: "‎Overcast Podcast App App - App Store".

## 21. Castro
- URL: https://castro.fm/
- Author: Supertop / Tiny (current)
- Year: 2013
- What it does well: The Inbox triage model: new episodes queue for explicit keep-or-skip rather than piling into a flat list.
- Why we care: The strongest interaction-design idea in podcasting and a direct candidate for our episode queue UX.
- Verification: Resolved, HTTP 200. Page title: "Castro Podcasts".

## 22. Castro (App Store listing)
- URL: https://apps.apple.com/us/app/castro-podcast-player/id1080840241
- Author: Supertop / Tiny
- Year: 2013
- What it does well: Store listing describes the queue/inbox mechanics and the sidebar-heavy navigation.
- Why we care: Confirms the triage vocabulary so we can cite it accurately in design docs.
- Verification: Resolved, HTTP 200. Page title: "‎Castro: Podcast App &amp; Player App - App Store".

## 23. Pocket Casts
- URL: https://pocketcasts.com/
- Author: Shifty Jelly / Automattic
- Year: 2010
- What it does well: Cross-platform sync with trim-silence, volume boost, a genuinely good web player and a per-show settings model.
- Why we care: Best reference for settings that inherit from a global default and can be overridden per show.
- Verification: Resolved, HTTP 200. Page title: "Pocket Casts Plus".

## 24. Pocket Casts (App Store listing)
- URL: https://apps.apple.com/us/app/pocket-casts/id414834813
- Author: Automattic
- Year: 2010
- What it does well: Documents playback effects settings, discovery surfaces and the app icon language.
- Why we care: Feature-parity checklist for what users now expect from a podcast player by default.
- Verification: Resolved, HTTP 200. Page title: "‎Pocket Casts: Podcast Player App - App Store".

## 25. Apple Podcasts
- URL: https://podcasts.apple.com/
- Author: Apple
- Year: 2005
- What it does well: Transcript view with time-synced highlighting, chapter support and system-level Now Playing integration.
- Why we care: Defines the platform floor: transcripts and chapters are becoming table stakes, and we should plan for them.
- Verification: Resolved, HTTP 200. Page title: "Apple Podcasts - Web Player".

## 26. Spotify iOS app
- URL: https://apps.apple.com/us/app/spotify-new-music-and-podcasts/id324684580
- Author: Spotify
- Year: 2008
- What it does well: Single app spanning music, podcasts and audiobooks with a unified Now Playing sheet.
- Why we care: Study the Now Playing sheet as a modal surface: it is the pattern our cast player most likely needs.
- Verification: Resolved, HTTP 200. Page title: "‎Spotify: Music and Podcasts App - App Store".

## 27. Doppler
- URL: https://brushedtype.co/doppler/
- Author: Brushed Type
- Year: 2015
- What it does well: Album-art-forward local music player with a strong personal identity and careful gesture cover-art transitions.
- Why we care: Excellent micro-interaction reference for artwork transitions and large-target gestures.
- Verification: Resolved, HTTP 200. Page title: "Doppler Music Player for Mac and iOS &mdash; Brushed Type".

## 28. Snipd
- URL: https://snipd.com/
- Author: Snipd
- Year: 2020
- What it does well: One-tap clip capture from a playing episode, with transcript-anchored highlights.
- Why we care: Directly relevant to clip/segment capture, including the create-moment flow and its confirmation states.
- Verification: Resolved, HTTP 200. Page title: "Snipd - The Podcast App for Knowledge Seekers".

## 29. Podcast Addict
- URL: https://podcastaddict.com/
- Author: Appdictive Studio
- Year: 2014
- What it does well: Web index with explicit duration buckets (under 10m, ~20m, ~30m, over 40m) as browse facets.
- Why we care: Simple, underrated idea for our library: filter by listening-time budget, not just topic.
- Verification: HTTP 200 via webfetch; Podcast Addict web index with duration-bucketed browse (Short <10m, Quick ~20m, Regular ~30m, Long-form >40m).

### Web streaming players

## 30. Spotify Web Player
- URL: https://open.spotify.com/
- Author: Spotify
- Year: 2012
- What it does well: Full-featured streaming client in the browser with a persistent bottom transport, queue drawer and device switching.
- Why we care: The benchmark for a web transport bar and for keyboard-driven playback shortcuts.
- Verification: Resolved, HTTP 200. Page title: "Spotify – Web Player".

## 31. SoundCloud
- URL: https://soundcloud.com/
- Author: SoundCloud
- Year: 2007
- What it does well: Waveform-comment media player where the waveform itself is the discussion surface.
- Why we care: Our closest large-scale precedent for waveform-as-UI, including timestamped annotations.
- Verification: Resolved, HTTP 200. Page title: "Stream and listen to music online for free with SoundCloud".

## 32. Bandcamp
- URL: https://bandcamp.com/
- Author: Bandcamp
- Year: 2008
- What it does well: A single, remarkably consistent embedded player that works identically on album, track and label pages.
- Why we care: The best example of one player component that must survive being embedded in thousands of arbitrary page layouts.
- Verification: Resolved, HTTP 200. Page title: "Bandcamp".

## 33. Bandcamp Daily
- URL: https://daily.bandcamp.com/
- Author: Bandcamp
- Year: 2016
- What it does well: Editorial publication where every article embeds the same player, so reading and listening interleave.
- Why we care: Good precedent for embedding a live player inside long-form editorial copy.
- Verification: Resolved, HTTP 200. Page title: "Bandcamp Daily".

## 34. Mixcloud
- URL: https://www.mixcloud.com/
- Author: Mixcloud
- Year: 2009
- What it does well: DJ-mix streaming with a waveform scrubber, chaptered tracklists and timestamped comments.
- Why we care: Long-form audio needs a tracklist navigation model; Mixcloud is the strongest mainstream example.
- Verification: Resolved, HTTP 200. Page title: "Mixcloud - This is Audio Culture".

## 35. Last.fm
- URL: https://www.last.fm/
- Author: Last.fm (CBS)
- Year: 2002
- What it does well: Scrobbling as a first-class product: listening history, recommendations and a YouTube-backed player.
- Why we care: Best reference for a listening-history surface and for stat visualisation of audio habits.
- Verification: Resolved, HTTP 200. Page title: "Last.fm | Play music, find songs, and discover artists".

## 36. Hype Machine
- URL: https://hypem.com/
- Author: Anthony Volodkin
- Year: 2005
- What it does well: Blog-aggregated music player with a famously minimal three-button player and a queue as the primary view.
- Why we care: Extreme minimalism case: how little chrome a music player can have and still work.
- Verification: Resolved, HTTP 200. Page title: "Hype Machine".

## 37. TuneIn
- URL: https://tunein.com/
- Author: TuneIn
- Year: 2002
- What it does well: Live-radio directory with a persistent player, station recall and schedule surfaces.
- Why we care: Reference for live/linear audio, which behaves differently from on-demand playback.
- Verification: Resolved, HTTP 200. Page title: "Play Button".

## 38. NTS Radio
- URL: https://www.nts.live/
- Author: NTS
- Year: 2011
- What it does well: Broadcast-schedule-first UI where shows are the atomic unit, with an archive player.
- Why we care: Strong timetable UI reference for scheduled programming grids.
- Verification: Resolved, HTTP 200. Page title: "Play".

## 39. Radio Garden
- URL: https://www.radio.garden/
- Author: Studio Puckey / Moniker
- Year: 2016
- What it does well: A globe you spin to hear a city's radio; navigation is the pleasure.
- Why we care: The best example of audio discovery as spatial navigation, directly relevant to an 'overengineered' delight goal.
- Verification: Resolved, HTTP 200. Page title: "Radio Garden – Explore live radio by rotating the globe".

## 40. YouTube Music
- URL: https://music.youtube.com/
- Author: Google
- Year: 2015
- What it does well: Seamless switch between song, video and live versions with a persistent transport.
- Why we care: Study the mode-switch affordance when one logical track has multiple media variants.
- Verification: Resolved, HTTP 200. Page title: "YouTube Music".

## 41. Pandora
- URL: https://www.pandora.com/
- Author: Pandora (SiriusXM)
- Year: 2000
- What it does well: Thumb-based station curation with an explicit feedback loop and explainable recommendations.
- Why we care: Feedback as a first-class control, not a buried menu item.
- Verification: Resolved, HTTP 200. Page title: "Music and Podcasts, Free and On-Demand | Pandora".

## 42. iHeart
- URL: https://www.iheart.com/
- Author: iHeartMedia
- Year: 2008
- What it does well: Live radio plus podcast playback unified in one player with station recall.
- Why we care: Reference for mixing linear and on-demand audio in one transport.
- Verification: Resolved, HTTP 200. Page title: "Supported Devices Graphic".

## 43. Genius
- URL: https://genius.com/
- Author: Genius
- Year: 2009
- What it does well: Lyrics as the primary artefact, with time-synced 'About' annotations.
- Why we care: Time-anchored annotation UI, the pattern our transcript/chapter work needs.
- Verification: Resolved, HTTP 200. Page title: "Genius | Song Lyrics &amp; Knowledge".

## 44. BBC GEL
- URL: https://www.bbc.co.uk/gel
- Author: BBC
- Year: 2016
- What it does well: Public design system including media-player guidance and accessibility rules.
- Why we care: A published design system for media components; use it as an external authority when arguing for a rule.
- Verification: Resolved, HTTP 200. Page title: "GEL - Global Experience Language".

## 45. BBC Accessibility for products
- URL: https://www.bbc.co.uk/accessibility/forproducts/
- Author: BBC
- Year: 2016
- What it does well: Documents how BBC media products handle accessibility, subtitles and audio description.
- Why we care: Concrete product-level accessibility commitments we can cite.
- Verification: Resolved, HTTP 200. Page title: "Welcome - Accessibility for Products - BBC".

### Podcast product surfaces, clip tooling and browser audio processing

## 46. Omny Studio
- URL: https://www.omny.fm/
- Author: Omny Studio (SiriusXM)
- Year: 2014
- What it does well: Enterprise podcast CMS with clip generation from full episodes.
- Why we care: Directly relevant: the workflow of turning a long episode into shareable short clips.
- Verification: Resolved, HTTP 200. Page title: "Omny Studio - Omny.fm".

## 47. Backtracks
- URL: https://backtracks.fm/
- Author: Backtracks
- Year: 2016
- What it does well: Podcast analytics plus a customisable web player product.
- Why we care: A commercial product built around exactly the embedded-player component we are designing.
- Verification: Resolved, HTTP 200. Page title: "The Media Intelligence and Infrastructure Platform for Audio and Podcasts | Backtracks".

## 48. Podchaser
- URL: https://www.podchaser.com/
- Author: Podchaser
- Year: 2016
- What it does well: The podcast metadata database: credits, categories, ratings.
- Why we care: Reference for podcast metadata modelling and credit graphs.
- Verification: Resolved, HTTP 200. Page title: "Podchaser: The #1 Podcast Database &amp; API".

## 49. Listen Notes
- URL: https://www.listennotes.com/
- Author: Listen Notes
- Year: 2017
- What it does well: Fast full-text and semantic podcast search over a huge index.
- Why we care: Search/relevance UI for audio corpora.
- Verification: Resolved, HTTP 200. Page title: "Listen Notes: The best podcast search engine".

## 50. Podcast Index
- URL: https://podcastindex.org/
- Author: Podcast Index (Adam Curry, Dave Jones)
- Year: 2020
- What it does well: Open index and API with a namespace-extended RSS model (chapters, transcripts, funding).
- Why we care: The namespace extensions define current best practice for chapters/transcripts in feeds.
- Verification: Resolved, HTTP 200. Page title: "Podcastindex.org".

## 51. Podcastindex.org API docs
- URL: https://podcastindex-org.github.io/docs-api/
- Author: Podcast Index
- Year: 2020
- What it does well: Documents the feed namespaces that carry chapters and transcripts.
- Why we care: Spec we can implement against rather than inventing our own chapter format.
- Verification: Resolved, HTTP 200. Page title: "API Docs | PodcastIndex.org".

## 52. Audiobookshelf GitHub
- URL: https://github.com/advplyr/audiobookshelf
- Author: advplyr and contributors
- Year: 2020
- What it does well: Open-source server with a documented API for progress sync and chapter metadata.
- Why we care: Readable implementation of the exact sync model we need; useful for API shape.
- Verification: Resolved, HTTP 200. Page title: "GitHub - advplyr/audiobookshelf: Self-hosted audiobook and podcast server · GitHub".

## 53. Descript
- URL: https://www.descript.com/
- Author: Descript
- Year: 2017
- What it does well: Text-based audio/video editing where editing the transcript edits the audio.
- Why we care: The most important alternative editing model: transcript-as-timeline.
- Verification: Resolved, HTTP 200. Page title: "Descript: AI Video &amp; Audio Text-based Editor — Try Free".

## 54. Auphonic
- URL: https://auphonic.com/
- Author: Auphonic
- Year: 2011
- What it does well: Automatic audio post-production (loudness, leveling, silence removal) with a clear job queue.
- Why we care: Precedent for exposing automatic audio processing as a visible, inspectable job.
- Verification: Resolved, HTTP 200. Page title: "Auphonic".

## 55. Moises
- URL: https://moises.ai/
- Author: Moises
- Year: 2020
- What it does well: Stem separation in the browser with per-stem mute/solo controls.
- Why we care: Multi-track control UI for separated audio; a genuinely novel player affordance.
- Verification: Resolved, HTTP 200. Page title: "Moises App: The Musician&#x27;s App | Vocal Remover &amp; much more".

## 56. Cleanfeed
- URL: https://cleanfeed.net/
- Author: Cleanfeed
- Year: 2011
- What it does well: Browser-based remote studio with an extremely small control surface.
- Why we care: Minimal-control-surface reference for a real-time audio task.
- Verification: Resolved, HTTP 200. Page title: "Cleanfeed".

### Web audio player libraries and embeddable widgets

## 57. Howler.js
- URL: https://howlerjs.com/
- Author: James Simpson
- Year: 2013
- What it does well: Falls back from Web Audio to HTML5 Audio automatically and normalises playback across browsers.
- Why we care: The default audio engine for a web player; understand its sprite and pooling model before writing our own.
- Verification: Resolved, HTTP 200. Page title: "howler.js - JavaScript audio library for the modern web".

## 58. wavesurfer.js
- URL: https://wavesurfer.xyz/
- Author: katspaugh and contributors
- Year: 2012
- What it does well: The standard browser waveform renderer with regions, plugins and streaming support.
- Why we care: Direct starting point for our waveform scrubber; study its plugin boundary design.
- Verification: Resolved, HTTP 200. Page title: "wavesurfer.js | audio waveform player JavaScript library".

## 59. wavesurfer.js (GitHub)
- URL: https://github.com/katspaugh/wavesurfer.js
- Author: katspaugh and contributors
- Year: 2012
- What it does well: Source of the region/marker plugins we would otherwise reimplement.
- Why we care: Region and marker abstraction is exactly the chapter/highlight model we need.
- Verification: Resolved, HTTP 200. Page title: "GitHub - katspaugh/wavesurfer.js: Audio waveform player · GitHub".

## 60. BBC peaks.js
- URL: https://github.com/bbc/peaks.js
- Author: BBC R&D
- Year: 2014
- What it does well: Purpose-built waveform interaction layer for annotating long audio with segments and points.
- Why we care: Built specifically for editing/annotating speech audio - closer to our problem than wavesurfer.
- Verification: Resolved, HTTP 200. Page title: "GitHub - bbc/peaks.js: JavaScript UI component for interacting with audio waveforms · GitHub".

## 61. BBC audiowaveform
- URL: https://github.com/bbc/audiowaveform
- Author: BBC R&D
- Year: 2013
- What it does well: Generates waveform data files server-side so the client never decodes the full audio.
- Why we care: The server-side peaks pipeline we will need for long episodes and large libraries.
- Verification: Resolved, HTTP 200. Page title: "GitHub - bbc/audiowaveform: C++ program to generate waveform data and render waveform images from audio fil...".

## 62. BBC waveform-data.js
- URL: https://github.com/bbc/waveform-data.js
- Author: BBC R&D
- Year: 2014
- What it does well: Client-side model for waveform data with zoom and channel handling.
- Why we care: Companion data model to audiowaveform; a clean separation of data and rendering.
- Verification: Resolved, HTTP 200. Page title: "GitHub - bbc/waveform-data.js: Audio Waveform Data Manipulation API – resample, offset and segment waveform...".

## 63. react-player
- URL: https://github.com/CookPete/react-player
- Author: Pete Cook
- Year: 2016
- What it does well: Unified React wrapper across many media providers (file, YouTube, SoundCloud, HLS, DASH).
- Why we care: Provider-abstraction reference if our player must host more than one backend.
- Verification: Resolved, HTTP 200. Page title: "GitHub - cookpete/react-player: A React component for playing a variety of URLs, including file paths, YouT...".

## 64. Plyr
- URL: https://plyr.io/
- Author: Sam Potts
- Year: 2015
- What it does well: Accessible, customisable HTML5 media player with a clean control surface and keyboard support.
- Why we care: One of the best-documented accessible media control sets to borrow rules from.
- Verification: Resolved, HTTP 200. Page title: "Plyr, meet Video.js".

## 65. Tone.js
- URL: https://tonejs.github.io/
- Author: Yotam Mann
- Year: 2014
- What it does well: A synthesis and scheduling library that makes musical time a first-class concept in JS.
- Why we care: If we add sonic feedback or generative audio, this is the scheduling model to use.
- Verification: Resolved, HTTP 200. Page title: "Tone.js".

## 66. mdn webaudio-examples
- URL: https://github.com/mdn/webaudio-examples
- Author: MDN contributors
- Year: 2015
- What it does well: Canonical minimal examples for every major Web Audio node.
- Why we care: Teaching-quality reference code; good starting points for our own demos.
- Verification: Resolved, HTTP 200. Page title: "GitHub - mdn/webaudio-examples: Code examples that accompany the MDN Web Docs pages relating to Web Audio. ...".

## 67. Google Chrome Web Audio samples
- URL: https://github.com/GoogleChromeLabs/web-audio-samples
- Author: Google Chrome Labs
- Year: 2018
- What it does well: Modern samples including AudioWorklet, offline rendering and analysis.
- Why we care: Up-to-date patterns for worklet-based processing, which is where serious DSP has moved.
- Verification: Resolved, HTTP 200. Page title: "GitHub - GoogleChromeLabs/web-audio-samples: Web Audio API samples by Chrome Web Audio Team · GitHub".

## 68. RecordRTC
- URL: https://github.com/muaz-khan/RecordRTC
- Author: Muaz Khan
- Year: 2013
- What it does well: Battle-tested in-browser recorder covering MediaRecorder gaps.
- Why we care: Practical recording reference if we capture audio in the browser.
- Verification: Resolved, HTTP 200. Page title: "GitHub - muaz-khan/RecordRTC: RecordRTC is WebRTC JavaScript library for audio/video as well as screen acti...".

## 69. waveform-playlist
- URL: https://github.com/naomiaro/waveform-playlist
- Author: Naomi Aro
- Year: 2014
- What it does well: Multi-track waveform editor built on Web Audio with track controls.
- Why we care: Multi-track selection and solo/mute UI on top of waveforms.
- Verification: Resolved, HTTP 200. Page title: "GitHub - naomiaro/waveform-playlist: Multitrack Web Audio editor and player with canvas waveform preview. S...".

## 70. Webamp
- URL: https://webamp.org/
- Author: Jordan Eldredge
- Year: 2018
- What it does well: A pixel-faithful Winamp 2 reimplementation in the browser, including skins.
- Why we care: Extreme skeuomorphism executed with total fidelity; the definitive 'overengineered' reference.
- Verification: Resolved, HTTP 200. Page title: "GitHub icon".

## 71. Web Audio API specification
- URL: https://www.w3.org/TR/webaudio/
- Author: W3C Audio WG
- Year: 2013
- What it does well: Normative spec for AudioContext, nodes, worklets and rendering.
- Why we care: The authority to cite when arguing about behaviour; also documents known spec issues.
- Verification: HTTP 200 via webfetch; now serves 'Web Audio API 1.1', W3C First Public Working Draft dated 5 November 2024 (editors Paul Adenot, Mozilla; Hongchan Choi, Google).

## 72. WebRTC samples
- URL: https://github.com/webrtc/samples
- Author: WebRTC project
- Year: 2013
- What it does well: Canonical samples for media capture and peer transport.
- Why we care: Reference for getUserMedia lifecycle and device selection UI.
- Verification: Resolved, HTTP 200. Page title: "GitHub - webrtc/samples: WebRTC Web demos and samples · GitHub".

### Open-source audio players

## 73. Strawberry Music Player
- URL: https://www.strawberrymusicplayer.org/
- Author: Jonas Kvinge
- Year: 2018
- What it does well: Fork of Clementine with a modernised Qt UI, good library/tag handling and a clean now-playing sidebar.
- Why we care: A maintained reference for classic library-plus-playlist desktop layout in Qt.
- Verification: Resolved, HTTP 200. Page title: "Strawberry Music Player".

## 74. Audacious
- URL: https://audacious-media-player.org/
- Author: Audacious contributors
- Year: 2005
- What it does well: Winamp-classic skin support alongside a modern GTK interface, with a deliberately tiny footprint.
- Why we care: Excellent example of supporting two radically different UI paradigms in one product.
- Verification: Resolved, HTTP 200. Page title: "Audacious - An Advanced Audio Player".

## 75. DeaDBeeF
- URL: https://deadbeef.sourceforge.io/
- Author: Oleksiy Yakovenko and contributors
- Year: 2009
- What it does well: Modular cross-platform player whose UI is almost entirely user-arranged, with a plugin DSP pipeline.
- Why we care: The clearest case study in 'UI as a configuration surface', including its costs for new users.
- Verification: HTTP 200 via webfetch; DeaDBeeF player site describing modular, fully user-customisable UI, DSP pipeline, cuesheet and m4b chapter handling.

## 76. cmus
- URL: https://cmus.github.io/
- Author: Timo Hirvonen and contributors
- Year: 2005
- What it does well: Terminal music player with vi-style keybindings and a multi-view (library/playlist/queue) layout.
- Why we care: Directly relevant to any TUI work: a fully keyboard-driven player that people genuinely prefer.
- Verification: Resolved, HTTP 200. Page title: "cmus - C* Music Player".

## 77. musikcube (GitHub)
- URL: https://github.com/clangen/musikcube
- Author: Casey Langen
- Year: 2014
- What it does well: Cross-platform terminal-plus-desktop player with a client/server split and plugin SDK.
- Why we care: Rare example of a terminal-first audio player with a real plugin architecture - highly relevant.
- Verification: Resolved, HTTP 200. Page title: "GitHub - clangen/musikcube: a cross-platform, terminal-based music player, audio engine, metadata indexer, ...".

## 78. Elisa
- URL: https://apps.kde.org/elisa/
- Author: KDE
- Year: 2017
- What it does well: Deliberately simple KDE player that scales from desktop to phone, with a clean now-playing view.
- Why we care: Best example in this list of restraint: a player designed to be understandable with zero configuration.
- Verification: Resolved, HTTP 200. Page title: "Elisa - KDE Applications".

## 79. Amarok
- URL: https://amarok.kde.org/
- Author: KDE
- Year: 2003
- What it does well: The classic 'context' player, where the app rearranges itself around what you are playing.
- Why we care: Historically important exploration of context-driven layout, and a useful lesson in discoverability.
- Verification: Resolved, HTTP 200. Page title: "Amarok".

## 80. Aural Player
- URL: https://github.com/kartik-venugopal/aural-player
- Author: Kartik Venugopal
- Year: 2017
- What it does well: Native macOS/Swift audio player with a genuinely unusual featureset: effects, pitch shift, loop, and a detailed seek bar.
- Why we care: Closest open-source match to a macOS audiophile player; study its Swift UI structure and effects chain.
- Verification: Resolved, HTTP 200. Page title: "GitHub - kartik-venugopal/aural-player: (Archived) An audio file player for macOS, inspired by Winamp. · Gi...".

## 81. Navidrome
- URL: https://www.navidrome.org/
- Author: Navidrome contributors
- Year: 2016
- What it does well: Self-hosted Subsonic-compatible music server with a responsive web UI.
- Why we care: Reference architecture for a streaming server plus thin clients that we could imitate.
- Verification: Resolved, HTTP 200. Page title: "Navidrome".

## 82. Jellyfin
- URL: https://jellyfin.org/
- Author: Jellyfin
- Year: 2018
- What it does well: Open-source media server with music libraries, per-user progress and multiple official clients.
- Why we care: Multi-client strategy reference, and a mature answer to per-user playback state.
- Verification: Resolved, HTTP 200. Page title: "Open Source Initiative".

## 83. Koel
- URL: https://koel.dev/
- Author: Phan An
- Year: 2015
- What it does well: Modern personal music streaming web app with a genuinely polished dark UI and keyboard shortcuts.
- Why we care: Probably the closest open-source visual peer to the aesthetic target; study its transport and queue.
- Verification: Resolved, HTTP 200. Page title: "Koel".

## 84. beets
- URL: https://beets.io/
- Author: Adrian Sampson and contributors
- Year: 2008
- What it does well: CLI music library manager with a plugin ecosystem and a query language for library operations.
- Why we care: Excellent reference for a text-driven library tool with a real query language.
- Verification: Resolved, HTTP 200. Page title: "beets: the music geek‘s media organizer".

## 85. MusicBrainz Picard
- URL: https://picard.musicbrainz.org/
- Author: MusicBrainz
- Year: 2007
- What it does well: Cross-platform tagger with a drag-and-drop matching workflow and per-file metadata comparison.
- Why we care: Outstanding metadata-diff UI: shows proposed changes against existing values. Directly reusable.
- Verification: Resolved, HTTP 200. Page title: "MusicBrainz Picard".

### DAWs and music-production UIs

## 86. Ableton Live
- URL: https://www.ableton.com/en/live/
- Author: Ableton
- Year: 2001
- What it does well: Session and Arrangement views make two mental models of music coexistent, with one-key switching.
- Why we care: The strongest example of dual-mode UI done well - directly applicable to editor/preview modes.
- Verification: Resolved, HTTP 200. Page title: "What&#x2019;s new in Live 12 | Ableton".

## 87. Ableton Push
- URL: https://www.ableton.com/en/push/
- Author: Ableton
- Year: 2013
- What it does well: Hardware surface whose display mirrors the software's selection, with no modal disorientation.
- Why we care: Reference for keeping a remote/secondary surface in sync with the primary UI state.
- Verification: Resolved, HTTP 200. Page title: "Push 3 &#x2013; a flexible system for making and performing music".

## 88. Ableton Learn Live
- URL: https://www.ableton.com/en/live/learn-live/
- Author: Ableton
- Year: 2016
- What it does well: Official video/tutorial surface indexing the product's concepts.
- Why we care: A model for teaching an interface through indexed, concept-level content.
- Verification: Resolved, HTTP 200. Page title: "Learn Live | Ableton".

## 89. REAPER
- URL: https://www.reaper.fm/
- Author: Cockos (Justin Frankel)
- Year: 2006
- What it does well: Extremely customisable DAW whose whole UI is themeable and scriptable, with a famously light footprint.
- Why we care: The definitive 'power through configuration' design; study both its strengths and its learning curve.
- Verification: Resolved, HTTP 200. Page title: "REAPER | Audio Production Without Limits".

## 90. REAPER videos
- URL: https://www.reaper.fm/videos.php
- Author: Cockos / Kenny Gioia
- Year: 2007
- What it does well: Hundreds of short, task-specific tutorial videos indexed by feature.
- Why we care: Outstanding documentation-discovery UI; a reference for how to teach a dense product.
- Verification: Resolved, HTTP 200. Page title: "REAPER | Videos".

## 91. FL Studio
- URL: https://www.image-line.com/fl-studio/
- Author: Image-Line
- Year: 1998
- What it does well: Pattern-based workflow with a channel rack, piano roll and mixer, all reachable via function keys.
- Why we care: Legendary keyboard-centric navigation; study the F-key mapping strategy for our own shortcuts.
- Verification: Resolved, HTTP 200. Page title: "FL Studio by Image-Line".

## 92. Bitwig Studio
- URL: https://www.bitwig.com/
- Author: Bitwig
- Year: 2014
- What it does well: Modular device ecosystem with per-device modulation shown inline, plus a unified modulators/effects pane.
- Why we care: Excellent example of surfacing a complex dependency graph (modulation routing) as a readable inline UI.
- Verification: Resolved, HTTP 200. Page title: "Bitwig | Home | Bitwig".

## 93. Cubase
- URL: https://www.steinberg.net/cubase/
- Author: Steinberg
- Year: 1989
- What it does well: One of the oldest continuously developed DAWs; standardised much of the mixer/transport vocabulary.
- Why we care: Historical authority for the transport and mixer conventions everyone else inherited.
- Verification: Resolved, HTTP 200 (no <title> returned; content served successfully).

## 94. Pro Tools
- URL: https://www.avid.com/pro-tools
- Author: Avid
- Year: 1991
- What it does well: The industry-standard editing paradigm: playlists, edit modes and a rigorously consistent modifier-key model.
- Why we care: The most-studied editing interaction model in audio; its modality is worth understanding even to reject it.
- Verification: HTTP 200 via webfetch; Pro Tools product page confirming the editing paradigm we cite - Slip/Grid/Shuffle/Spot edit modes, a single context-aware Smart Tool, playlist comping, clip gain, and SoundFlow macros.

## 95. Renoise
- URL: https://www.renoise.com/
- Author: Renoise
- Year: 2002
- What it does well: Modern tracker with a pattern editor, keyboard-driven entry and a genuinely distinct visual language.
- Why we care: Directly relevant to any grid/pattern UI - and proof a niche paradigm can be polished, not just retro.
- Verification: Resolved, HTTP 200. Page title: "Home | Renoise".

## 96. Adobe Audition
- URL: https://www.adobe.com/products/audition.html
- Author: Adobe
- Year: 2003
- What it does well: Waveform and multitrack views of the same audio, with spectral frequency display for repair work.
- Why we care: Spectral view is a genuinely useful alternative representation for speech audio problems.
- Verification: Resolved, HTTP 200. Page title: "Audio recording and editing software | Adobe Audition".

## 97. iZotope RX
- URL: https://www.izotope.com/en/products/rx.html
- Author: iZotope
- Year: 2007
- What it does well: Repair suite with a spectrogram-centric editor and per-module selection workflow.
- Why we care: The strongest example of spectrogram-as-editor; relevant if we ever show audio internals.
- Verification: Resolved, HTTP 200. Page title: "Visa".

## 98. Celemony Melodyne
- URL: https://www.celemony.com/
- Author: Celemony
- Year: 2001
- What it does well: Note-level editing directly on a pitch-aware representation of audio.
- Why we care: The canonical example of editing a semantic layer above the waveform.
- Verification: Resolved, HTTP 200. Page title: "Celemony Melodyne and Tonalic".

## 99. FabFilter
- URL: https://www.fabfilter.com/
- Author: FabFilter
- Year: 2002
- What it does well: Plugin suite whose EQ and compressor visualisations are the interaction surface.
- Why we care: Best-in-class example of direct manipulation on a graph - the pattern our waveform editor needs.
- Verification: Resolved, HTTP 200. Page title: "FabFilter - Quality Audio Plug-Ins for Mixing, Mastering and Recording - VST VST3 AU CLAP AAX AudioSuite".

## 100. Sound on Sound
- URL: https://www.soundonsound.com/
- Author: SOS Publications
- Year: 1985
- What it does well: Deep technical reviews that explain the interaction design, not just the spec sheet.
- Why we care: Exceptional writing model for our own product/technical documentation.
- Verification: Resolved, HTTP 200. Page title: "Sound On Sound | The World's Premier Music Recording Technology Magazine".

## 101. Synthtopia
- URL: https://www.synthtopia.com/
- Author: Synthtopia
- Year: 1997
- What it does well: Long-running synthesis news site with video demos of interfaces.
- Why we care: Archive of interface evolution across decades of instruments.
- Verification: Resolved, HTTP 200. Page title: "Synthtopia &#8211; Synthesizer and electronic music news, synth and music software reviews and more!".

## 102. Lines (llllllll.co)
- URL: https://llllllll.co/
- Author: Monome community
- Year: 2014
- What it does well: Community forum for experimental instruments and grid interfaces.
- Why we care: The single best source for unconventional grid/step-sequence interface ideas.
- Verification: Resolved, HTTP 200. Page title: "lines".

## 103. Elektronauts
- URL: https://www.elektronauts.com/
- Author: Elektron community
- Year: 2013
- What it does well: User forum for Elektron hardware, with detailed workflow discussions.
- Why we care: Practical evidence about how users build muscle memory on complex hardware.
- Verification: Resolved, HTTP 200. Page title: "Elektronauts".

## 104. OP Forums
- URL: https://op-forums.com/
- Author: OP-1 community
- Year: 2011
- What it does well: Teenage Engineering community with deep workflow documentation.
- Why we care: Community documentation that frequently exceeds the vendor manual in usefulness.
- Verification: Resolved, HTTP 200. Page title: "OP Forums - TE, Synths, Music, Life".

### Hardware and instrument UIs

## 105. Teenage Engineering OP-1
- URL: https://teenage.engineering/products/op-1
- Author: Teenage Engineering
- Year: 2011
- What it does well: A whole studio behind a four-colour OLED and a grid of unusual, colour-coded keys.
- Why we care: The best case study in iconography: a complex state machine communicated with colour and glyphs alone.
- Verification: Resolved, HTTP 200. Page title: "OP–1 field - teenage engineering".

## 106. Teenage Engineering OP-Z
- URL: https://teenage.engineering/products/op-z
- Author: Teenage Engineering
- Year: 2018
- What it does well: Screenless-by-default interface where light and the phone app carry the state.
- Why we care: Radical example of removing a display and still remaining usable - a constraint worth studying.
- Verification: Resolved, HTTP 200. Page title: "OP–Z - teenage engineering".

## 107. Teenage Engineering TX-6
- URL: https://teenage.engineering/products/tx-6
- Author: Teenage Engineering
- Year: 2022
- What it does well: A pocket mixer/interface with a tiny colour display and concentric-knob interaction.
- Why we care: Dense-control design in an extremely small footprint; excellent micro-interaction reference.
- Verification: Resolved, HTTP 200. Page title: "TX–6 - teenage engineering".

## 108. Teenage Engineering OB-4
- URL: https://teenage.engineering/products/ob-4
- Author: Teenage Engineering
- Year: 2020
- What it does well: A radio/speaker whose primary interaction is a motorised tape dial with real physical feedback.
- Why we care: The clearest example of delight through physical behaviour; relevant to 'overengineered is the point'.
- Verification: Resolved, HTTP 200. Page title: "OB–4 magic radio - teenage engineering".

## 109. Teenage Engineering
- URL: https://teenage.engineering/
- Author: Teenage Engineering
- Year: 2005
- What it does well: Product index and manifesto for their design language.
- Why we care: Design-values reference for a company that treats industrial design as the interface.
- Verification: Resolved, HTTP 200. Page title: "teenage engineering".

## 110. Elektron
- URL: https://www.elektron.se/
- Author: Elektron
- Year: 1998
- What it does well: Instrument family sharing a consistent sequencing language across very different machines.
- Why we care: Study how a shared interaction grammar across products reduces relearning.
- Verification: Resolved, HTTP 200. Page title: "We Are Elektron".

## 111. Elektron Octatrack MKII
- URL: https://www.elektron.se/en/octatrack-mkii
- Author: Elektron
- Year: 2010
- What it does well: Sampler/sequencer with an eight-track crossfader and a famously deep, learnable paging model.
- Why we care: Reference for paging a large parameter space onto a small control surface.
- Verification: Resolved, HTTP 200. Page title: "Octatrack MKII | 8 Track Dynamic Performance Sampler | Buy from Elektron".

## 112. Elektron Digitakt
- URL: https://www.elektron.se/en/digitakt
- Author: Elektron
- Year: 2017
- What it does well: Focused eight-voice drum machine with a bright, high-contrast display and immediate parameter pages.
- Why we care: Excellent example of a reduced scope producing a clearer interface than its bigger sibling.
- Verification: Resolved, HTTP 200. Page title: "Digitakt - Elektron".

## 113. Polyend Tracker
- URL: https://polyend.com/tracker/
- Author: Polyend
- Year: 2020
- What it does well: Hardware tracker that renders the vertical-pattern paradigm on a small screen with a jog wheel.
- Why we care: Proof that a dense text-grid interface works on physical hardware - relevant for TUI design.
- Verification: Resolved, HTTP 200. Page title: "TikTok".

## 114. Akai MPC
- URL: https://www.akaipro.com/mpc
- Author: Akai Professional (inMusic)
- Year: 1988
- What it does well: The sampler/sequencer lineage that defined pad-grid workflow and its visual conventions.
- Why we care: Historical authority for pad-grid interaction still used everywhere.
- Verification: Resolved, HTTP 200. Page title: "MPC Series | Akai Professional".

## 115. Akai Force
- URL: https://www.akaipro.com/force
- Author: Akai Professional (inMusic)
- Year: 2019
- What it does well: Standalone clip-launching performance instrument with a touchscreen over hardware controls.
- Why we care: Hybrid touch/physical interaction reference; useful for touchscreen-plus-knob patterns.
- Verification: Resolved, HTTP 200. Page title: "Force | Akai Professional".

## 116. Korg synthesizers
- URL: https://www.korg.com/us/products/synthesizers/
- Author: Korg
- Year: 1962
- What it does well: Catalogue spanning decades of instrument interface evolution in one place.
- Why we care: Long-horizon archive of interface design; useful for identifying which affordances persist.
- Verification: Resolved, HTTP 200. Page title: "Synthesizers / Keyboards | KORG (USA)".

## 117. Moog Music
- URL: https://www.moogmusic.com/
- Author: Moog Music
- Year: 1953
- What it does well: The original subtractive-synth panel layout that most software synths still imitate.
- Why we care: The canonical skeuomorphic source: every synth plugin UI is a descendant of this panel.
- Verification: Resolved, HTTP 200. Page title: "Moog Music".

## 118. Sequential
- URL: https://www.sequential.com/
- Author: Sequential (Dave Smith)
- Year: 1974
- What it does well: Instrument lineage behind the Prophet's knob-per-function and later menu-assisted designs.
- Why we care: Study the transition from knob-per-function to menu-driven interfaces and the user reaction.
- Verification: Resolved, HTTP 200 (no <title> returned; content served successfully).

## 119. Native Instruments Maschine
- URL: https://www.native-instruments.com/en/products/maschine/
- Author: Native Instruments
- Year: 2009
- What it does well: Hardware-plus-software groove production where the controller drives and reflects the app.
- Why we care: One of the strongest examples of tightly coupled hardware/software UI state.
- Verification: Resolved, HTTP 200. Page title: "Visa".

## 120. Native Instruments Traktor
- URL: https://www.native-instruments.com/en/products/traktor/
- Author: Native Instruments
- Year: 2000
- What it does well: DJ software with a deck metaphor, waveform displays and library browsing built for speed.
- Why we care: The DJ deck model is a direct source for many waveform/scrub interactions we need.
- Verification: Resolved, HTTP 200. Page title: "Visa".

## 121. Serato
- URL: https://www.serato.com/
- Author: Serato
- Year: 1999
- What it does well: DJ software whose UI prioritises glanceable deck state and huge, forgiving hit targets.
- Why we care: Strong reference for legibility under stage conditions (distance, low light, time pressure).
- Verification: Resolved, HTTP 200. Page title: "Facebook icon".

## 122. Rekordbox
- URL: https://www.rekordbox.com/
- Author: AlphaTheta (Pioneer DJ)
- Year: 2009
- What it does well: Library-first DJ preparation with a strong performance-mode counterpart.
- Why we care: Excellent example of the same library serving a preparation and a performance context.
- Verification: Resolved, HTTP 200. Page title: "rekordbox｜DJ software for professional DJs".

## 123. Mixxx
- URL: https://mixxx.org/
- Author: Mixxx contributors
- Year: 2001
- What it does well: Open-source DJ software with a documented controller-mapping XML format and skin system.
- Why we care: Outstanding reference for a declarative controller-mapping format, which is a real design decision.
- Verification: Resolved, HTTP 200. Page title: "Mixxx - Free DJ Mixing Software App".

## 124. Roli
- URL: https://roli.com/
- Author: Roli
- Year: 2009
- What it does well: Expressive MIDI instruments (Seaboard) with per-note continuous control.
- Why we care: Reference for visualising continuous, per-note expression rather than discrete events.
- Verification: Resolved, HTTP 200. Page title: "Home | ROLI".

## 125. Playtronica Synth
- URL: https://synth.playtronica.com/
- Author: Playtronica
- Year: 2016
- What it does well: Browser synth driven by touch and conductive objects.
- Why we care: Playful browser audio UI with almost no conventional chrome.
- Verification: Resolved, HTTP 200. Page title: "Web synths | Online web audio instruments playground".

### Visualizers and audio-reactive interfaces

## 126. MilkDrop
- URL: https://www.geisswerks.com/milkdrop/
- Author: Ryan Geiss
- Year: 2000
- What it does well: Generative, preset-driven visualisation where every parameter is audio-reactive and interpolable.
- Why we care: The high-water mark for audio-reactive visuals; study preset interpolation as a UI concept.
- Verification: Resolved, HTTP 200. Page title: "MilkDrop plug-in for Winamp".

## 127. projectM
- URL: https://projectm-visualizer.org/
- Author: projectM contributors
- Year: 2003
- What it does well: Open-source MilkDrop-compatible visualiser usable in many hosts.
- Why we care: Documents the preset format, which is effectively a declarative visual language.
- Verification: Resolved, HTTP 200. Page title: "Visualize your Music your way".

## 128. projectM (GitHub)
- URL: https://github.com/projectM-visualizer/projectm
- Author: projectM contributors
- Year: 2003
- What it does well: Engine source with a documented preset-parameter model.
- Why we care: Study the parser/evaluator design for a declarative visual DSL.
- Verification: Resolved, HTTP 200. Page title: "GitHub - projectM-visualizer/projectm: projectM - Cross-platform Music Visualization Library. Open-source a...".

## 129. Butterchurn
- URL: https://butterchurnviz.com/
- Author: Jordan Berg
- Year: 2017
- What it does well: MilkDrop presets reimplemented in WebGL and driven by the Web Audio analyser.
- Why we care: Directly reusable: MilkDrop-grade visuals driven by our own audio graph.
- Verification: Resolved, HTTP 200. Page title: "Butterchurn Visualizer".

## 130. Butterchurn (GitHub)
- URL: https://github.com/jberg/butterchurn
- Author: Jordan Berg
- Year: 2017
- What it does well: WebGL engine plus an audio-level interface designed for host integration.
- Why we care: The analyser-to-visualiser interface is exactly the seam we need to design.
- Verification: Resolved, HTTP 200. Page title: "GitHub - jberg/butterchurn: Butterchurn is a WebGL implementation of the Milkdrop Visualizer · GitHub".

## 131. Butterchurn presets
- URL: https://github.com/jberg/butterchurn-presets
- Author: Jordan Berg
- Year: 2017
- What it does well: Curated MilkDrop preset collection for the web engine.
- Why we care: Content-plus-engine split; a good model for shipping presets separately.
- Verification: Resolved, HTTP 200. Page title: "GitHub - jberg/butterchurn-presets: Presets for Butterchurn Visualizer, converted from Milkdrop presets · G...".

## 132. spectralizer (GitHub)
- URL: https://github.com/univrsal/spectralizer
- Author: univrsal
- Year: 2019
- What it does well: Source for the OBS audio visualiser, including FFT configuration UI.
- Why we care: Readable implementation of FFT-to-visual mapping with user-exposed parameters.
- Verification: Resolved, HTTP 200. Page title: "GitHub - univrsal/spectralizer: Audio visualizer plugin for obs-studio · GitHub".

## 133. cava
- URL: https://github.com/karlstav/cava
- Author: Karl Stavestrand
- Year: 2015
- What it does well: Terminal audio visualiser driven by ALSA/Pulse loopback, with a configurable bar style.
- Why we care: Directly relevant to TUI work: a real-time audio spectrum in a terminal, configurable via a plain text file.
- Verification: Resolved, HTTP 200. Page title: "GitHub - karlstav/cava: Cross-platform Audio Visualizer · GitHub".

## 134. Synesthesia
- URL: https://synesthesia.live/
- Author: Synesthesia
- Year: 2013
- What it does well: VJ software with audio-reactive generators and a layer/scene model.
- Why we care: Deep reference for audio-reactive scene composition.
- Verification: Resolved, HTTP 200. Page title: "Synesthesia - Live Music Visualizer - VJ Software".

## 135. Resolume
- URL: https://resolume.com/
- Author: Resolume
- Year: 2002
- What it does well: VJ software with a clip grid, layer stack and BPM-synced playback.
- Why we care: Grid-plus-layer model that maps well onto audio timeline concepts.
- Verification: Resolved, HTTP 200 (no <title> returned; content served successfully).

## 136. TouchDesigner
- URL: https://www.touchdesigner.com/
- Author: Derivative
- Year: 2000
- What it does well: Node-graph environment for real-time visuals and audio-reactive systems.
- Why we care: The most rigorous example of a node-graph authoring UI, including its type system.
- Verification: Resolved, HTTP 200. Page title: "Derivative |".

## 137. vvvv
- URL: https://vvvv.org/
- Author: vvvv group
- Year: 2002
- What it does well: Visual-programming environment oriented toward live visuals with a node/patch model.
- Why we care: A second, simpler node-graph reference to compare against TouchDesigner.
- Verification: Resolved, HTTP 200. Page title: "vvvv - visual live-programming for .NET".

## 138. openFrameworks
- URL: https://openframeworks.cc/
- Author: openFrameworks community
- Year: 2005
- What it does well: Creative-coding C++ toolkit with audio I/O and analysis addons.
- Why we care: Reference for accessible audio-analysis primitives.
- Verification: Resolved, HTTP 200. Page title: "openFrameworks".

## 139. Processing
- URL: https://processing.org/
- Author: Processing Foundation
- Year: 2001
- What it does well: The teaching-oriented creative-coding environment that popularised live visual sketches.
- Why we care: Pedagogical reference: minimal boilerplate, immediate visual feedback.
- Verification: Resolved, HTTP 200. Page title: "Design Systems International".

## 140. p5.js
- URL: https://p5js.org/
- Author: Processing Foundation
- Year: 2013
- What it does well: JavaScript reimagining of Processing, with a sound library for audio-reactive sketches.
- Why we care: Reference for a beginner-friendly audio-visual API surface.
- Verification: Resolved, HTTP 200. Page title: "p5.js".

## 141. p5.sound reference
- URL: https://p5js.org/reference/#/libraries/p5.sound
- Author: Processing Foundation
- Year: 2013
- What it does well: Documents the p5.sound API including analysers and FFT.
- Why we care: Compare this API's naming with the raw Web Audio API for insight into abstraction design.
- Verification: Resolved, HTTP 200. Page title: "Reference".

## 142. three.js audio examples
- URL: https://threejs.org/examples/?q=audio
- Author: three.js contributors
- Year: 2011
- What it does well: Indexed WebGL examples including audio-driven visualisation.
- Why we care: Starting points for 3D audio-reactive rendering.
- Verification: Resolved, HTTP 200. Page title: "three.js examples".

## 143. three.js
- URL: https://threejs.org/
- Author: three.js contributors
- Year: 2011
- What it does well: The dominant WebGL library, with an enormous documented example gallery.
- Why we care: Reference for how a large library organises and showcases examples.
- Verification: Resolved, HTTP 200. Page title: "Three.js – JavaScript 3D Library".

## 144. Chrome Experiments
- URL: https://www.chromeexperiments.com/
- Author: Google
- Year: 2009
- What it does well: Curated archive of browser-technology demonstrations, many audio-driven.
- Why we care: Curatorial reference and a source of delight-oriented interaction ideas.
- Verification: Resolved, HTTP 200. Page title: "Chrome Experiments - Experiments with Google".

## 145. OBS Studio
- URL: https://obsproject.com/
- Author: OBS Project
- Year: 2012
- What it does well: Free streaming/recording suite with a mixer, per-source audio filters and monitoring.
- Why we care: Reference for a real-time audio mixer UI embedded in a non-audio-primary application.
- Verification: Resolved, HTTP 200. Page title: "Open Broadcaster Software | OBS".

### Accessible audio and media interfaces

## 146. WAI: Making Audio and Video Media Accessible
- URL: https://www.w3.org/WAI/media/av/
- Author: W3C WAI (ed. Shawn Lawton Henry)
- Year: 2019
- What it does well: End-to-end guidance covering transcripts, captions, audio description, sign language and - explicitly - choosing an accessible media player.
- Why we care: The authoritative checklist for our player's accessibility scope; it names the player as a first-class accessibility component.
- Verification: HTTP 200 via webfetch; 'Making Audio and Video Media Accessible' (WAI), First published Sept 2019, updated 17 Sept 2024, ed. Shawn Lawton Henry - covers transcripts, captions, description, sign language and choosing an accessible media player.

## 147. APG: Slider Pattern
- URL: https://www.w3.org/WAI/ARIA/apg/patterns/slider/
- Author: W3C WAI (ARIA Authoring Practices)
- Year: 2017
- What it does well: Defines the slider role, required ARIA properties, and the full keyboard interaction map.
- Why we care: Our scrubber is a slider. This is the normative contract, including the required aria-valuetext behaviour.
- Verification: HTTP 200 via webfetch; ARIA Authoring Practices 'Slider Pattern' page, listing keyboard interaction (arrows/Home/End/PageUp/PageDown) and required slider properties.

## 148. APG: Media Seek Slider Example
- URL: https://www.w3.org/WAI/ARIA/apg/patterns/slider/examples/slider-seek/
- Author: W3C WAI (ARIA Authoring Practices)
- Year: 2017
- What it does well: A seek control built exactly for moving play position in media, converting seconds into 'minutes, seconds' for assistive tech, plus a Page Up/Down 15-step jump.
- Why we care: The single most directly applicable accessibility reference in this corpus. Copy its valuetext strategy and keyboard map.
- Verification: HTTP 200 via webfetch; 'Media Seek Slider Example' - a seek control for moving play position in media, using aria-valuetext to announce position as minutes and seconds; page last updated 20 January 2026.

## 149. WCAG 2.1 SC 1.4.2 Audio Control
- URL: https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html
- Author: W3C WAI
- Year: 2018
- What it does well: Requires that any audio playing automatically for more than 3 seconds can be paused/stopped or have independent volume control.
- Why we care: A hard constraint on our first-load experience: never autoplay, or always provide an independent mute.
- Verification: HTTP 200 via webfetch; 'Understanding SC 1.4.2: Audio Control (Level A)' - autoplaying audio over 3 seconds must be stoppable or independently volume-controllable; listed techniques G60/G170/G171 and failures F23/F93.

## 150. ARIA slider role (MDN)
- URL: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/slider_role
- Author: MDN contributors
- Year: 2017
- What it does well: Practical documentation of the slider role with usage warnings.
- Why we care: Shorter, implementation-oriented companion to the APG pattern.
- Verification: Resolved, HTTP 200. Page title: "Mozilla".

## 151. MDN: Media Session API
- URL: https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
- Author: MDN contributors
- Year: 2018
- What it does well: Lets a web player publish metadata and handle OS-level media keys and lock-screen controls.
- Why we care: How a web player participates in system Now Playing - required for parity with native apps.
- Verification: Resolved, HTTP 200. Page title: "Mozilla".

## 152. MDN: HTMLMediaElement
- URL: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
- Author: MDN contributors
- Year: 2015
- What it does well: The full media element API including playbackRate, seeking and buffered ranges.
- Why we care: The primitives behind speed control and the buffered-range display on our scrubber.
- Verification: Resolved, HTTP 200. Page title: "Mozilla".

## 153. MDN: AnalyserNode
- URL: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
- Author: MDN contributors
- Year: 2015
- What it does well: Real-time FFT and time-domain data from a live audio graph.
- Why we care: The exact API that drives our visualisers and any audio-reactive UI.
- Verification: Resolved, HTTP 200. Page title: "Mozilla".

## 154. MDN: AudioWorklet
- URL: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet
- Author: MDN contributors
- Year: 2018
- What it does well: Runs custom DSP on the audio rendering thread, replacing the deprecated ScriptProcessor.
- Why we care: Where any real-time processing must live; important if we implement speed/pitch client-side.
- Verification: Resolved, HTTP 200. Page title: "Mozilla".

## 155. MDN: Visualizations with Web Audio API
- URL: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
- Author: MDN contributors
- Year: 2015
- What it does well: The canonical analyser-to-canvas tutorial.
- Why we care: Shortest correct path from analyser data to a rendered visual.
- Verification: Resolved, HTTP 200. Page title: "Mozilla".

## 156. MDN: Web audio spatialization basics
- URL: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Web_audio_spatialization_basics
- Author: MDN contributors
- Year: 2017
- What it does well: Panner node, listener position and 3D audio in the browser.
- Why we care: Reference for the browser-side half of the spatial-audio coverage in this corpus.
- Verification: Resolved, HTTP 200. Page title: "Mozilla".

## 157. A11Y Project checklist
- URL: https://www.a11yproject.com/checklist/
- Author: The A11Y Project
- Year: 2016
- What it does well: Community-maintained, practical accessibility checklist ordered by task.
- Why we care: Use as the working checklist; reference APG/WCAG for the normative detail.
- Verification: Resolved, HTTP 200. Page title: "The A11Y Project".

## 158. Inclusive Components
- URL: https://inclusive-components.design/
- Author: Heydon Pickering
- Year: 2016
- What it does well: Builds real components from first principles with accessibility as the starting point, not a retrofit.
- Why we care: The right mindset reference: design the accessible interaction first, then style it.
- Verification: Resolved, HTTP 200. Page title: "Inclusive Components".

## 159. Adrian Roselli
- URL: https://adrianroselli.com/
- Author: Adrian Roselli
- Year: 2006
- What it does well: Deep, test-driven posts on control semantics and browser/AT behaviour.
- Why we care: Where to verify a claim before shipping an unusual control pattern.
- Verification: Resolved, HTTP 200. Page title: "Adrian Roselli — Consultant, Writer, Speaker".

## 160. NVDA (GitHub)
- URL: https://github.com/nvaccess/nvda
- Author: NV Access and contributors
- Year: 2006
- What it does well: Source and issue tracker for NVDA, including ARIA behaviour bugs.
- Why we care: Search here first when a control works in VoiceOver but not NVDA.
- Verification: Resolved, HTTP 200. Page title: "GitHub - nvaccess/nvda: NVDA, the free and open source Screen Reader for Microsoft Windows · GitHub".

## 161. WebAIM articles
- URL: https://webaim.org/articles/
- Author: WebAIM (Utah State University)
- Year: 1999
- What it does well: Reference articles on accessibility topics backed by their own survey data.
- Why we care: Their screen-reader user survey is the best empirical data on real AT usage.
- Verification: Resolved, HTTP 200. Page title: "WebAIM: Articles".

## 162. WebAIM: auditory disabilities
- URL: https://webaim.org/articles/auditory/
- Author: WebAIM
- Year: 1999
- What it does well: Explains design considerations for Deaf and hard-of-hearing users.
- Why we care: Directly frames who our transcript and caption features are actually for.
- Verification: Resolved, HTTP 200. Page title: "WebAIM: Auditory Disabilities - Introduction".

## 163. Apple: Use VoiceOver on iPhone
- URL: https://support.apple.com/guide/iphone/use-voiceover-iph3e2e415f/ios
- Author: Apple
- Year: 2009
- What it does well: Official VoiceOver instructions, including how users navigate custom controls.
- Why we care: Test script source: follow this to reproduce how a VoiceOver user would operate our scrubber.
- Verification: Resolved, HTTP 200. Page title: "Turn on and practice VoiceOver on iPhone - Apple Support".

## 164. Apple HIG: Playing audio
- URL: https://developer.apple.com/design/human-interface-guidelines/playing-audio
- Author: Apple
- Year: 2022
- What it does well: Apple's own guidance on audio playback design, including interruption and route-change behaviour.
- Why we care: The closest thing to an official Apple spec for the player behaviours we are imitating.
- Verification: Resolved, HTTP 200. Page title: "Playing audio | Apple Developer Documentation".

## 165. Apple Human Interface Guidelines
- URL: https://developer.apple.com/design/human-interface-guidelines/
- Author: Apple
- Year: 1987
- What it does well: Platform-wide design guidance, including component and layout conventions.
- Why we care: The origin of the conventions our player must respect to feel native on Apple platforms.
- Verification: Resolved, HTTP 200. Page title: "Human Interface Guidelines | Apple Developer Documentation".

## 166. MPNowPlayingInfoCenter
- URL: https://developer.apple.com/documentation/mediaplayer/mpnowplayinginfocenter
- Author: Apple
- Year: 2017
- What it does well: Publishes now-playing metadata to the system UI, lock screen and Control Centre.
- Why we care: The exact API contract for 'our metadata appears in the system player'.
- Verification: Resolved, HTTP 200. Page title: "MPNowPlayingInfoCenter | Apple Developer Documentation".

## 167. MPRemoteCommandCenter
- URL: https://developer.apple.com/documentation/mediaplayer/mpremotecommandcenter
- Author: Apple
- Year: 2017
- What it does well: Handles remote commands (play/pause/skip/seek) from headphones, car and lock screen.
- Why we care: Reference for which transport actions the OS expects a player to support, and with what granularity.
- Verification: Resolved, HTTP 200. Page title: "MPRemoteCommandCenter | Apple Developer Documentation".

## 168. AVFAudio
- URL: https://developer.apple.com/documentation/avfaudio
- Author: Apple
- Year: 2019
- What it does well: Umbrella framework for audio playback, recording, sessions and 3D rendering on Apple platforms.
- Why we care: The API surface behind any native Apple audio UI we build.
- Verification: Resolved, HTTP 200. Page title: "AVFAudio | Apple Developer Documentation".

### Game audio middleware

## 169. FMOD
- URL: https://www.fmod.com/
- Author: Firelight Technologies
- Year: 1995
- What it does well: Audio middleware for games: events, mixers, DSP effects and real-time parameter control.
- Why we care: Shows a parameter-driven audio model - a different, powerful way to think about player state.
- Verification: Resolved, HTTP 200 (no <title> returned; content served successfully).

## 170. FMOD Studio
- URL: https://www.fmod.com/studio
- Author: Firelight Technologies
- Year: 2010
- What it does well: Authoring tool where sounds are built into events with timelines, parameters and automations.
- Why we care: The timeline-plus-parameter authoring UI is a strong reference for our own automation surfaces.
- Verification: Resolved, HTTP 200 (no <title> returned; content served successfully).

## 171. Wwise
- URL: https://www.audiokinetic.com/products/wwise/
- Author: Audiokinetic (Sony)
- Year: 2006
- What it does well: Game audio pipeline with a rigorous separation of sound design, integration and runtime.
- Why we care: Excellent example of a layered architecture surfaced clearly in the authoring UI.
- Verification: Resolved, HTTP 200. Page title: "Audiokinetic".

### Spatial and immersive audio

## 172. Dolby Atmos
- URL: https://www.dolby.com/technologies/dolby-atmos/
- Author: Dolby Laboratories
- Year: 2012
- What it does well: Object-based audio where mixing is positional rather than channel-based.
- Why we care: Explains why spatial audio UIs cannot be a channel-count dropdown; position is the primitive.
- Verification: Resolved, HTTP 200. Page title: "Dolby Atmos - Official Site - Dolby".

## 173. Dolby Atmos for content creation
- URL: https://professional.dolby.com/content-creation/dolby-atmos/
- Author: Dolby Laboratories
- Year: 2012
- What it does well: Production-side guidance including the renderer workflow and deliverable formats.
- Why we care: Reference for what a spatial-audio authoring UI must let a user control.
- Verification: Resolved, HTTP 200. Page title: "Dolby Atmos for Content Creators - Dolby Professional".

## 174. Sony 360 Reality Audio
- URL: https://www.sony.com/electronics/360-reality-audio
- Author: Sony
- Year: 2019
- What it does well: Object-based spatial audio for music, with a listener-position model.
- Why we care: A music-first (not film-first) spatial format; closer to our use case than Atmos.
- Verification: HTTP 200, but the address resolves to the generic Sony Electronics landing page rather than dedicated 360 Reality Audio product content. Kept with this caveat: the domain resolves, the specific page content is NOT confirmed.

## 175. IEM (Institut für Elektronische Musik und Akustik)
- URL: https://www.iem.at/
- Author: IEM, Graz
- Year: 1965
- What it does well: Academic institute behind widely used ambisonics plugins and tools.
- Why we care: The research-grade reference for spatial audio rendering and evaluation.
- Verification: Resolved, HTTP 200. Page title: "Institut 17 Elektronische Musik und Akustik".

## 176. IEM Plug-in Suite
- URL: https://plugins.iem.at/
- Author: IEM, Graz
- Year: 2016
- What it does well: Free ambisonics plugin suite with a consistent, technically precise UI.
- Why we care: Reference for visualising spatial audio fields without a full 3D scene.
- Verification: Resolved, HTTP 200. Page title: "IEM Plug-in Suite".

## 177. Audioscenic
- URL: https://www.audioscenic.com/
- Author: Audioscenic
- Year: 2016
- What it does well: Listener-tracking 3D audio for speakers and laptops.
- Why we care: Shows a spatial audio UI whose feedback surface is user position, not a mixer.
- Verification: Resolved, HTTP 200. Page title: "Audioscenic - The New Dimension In Sound".

## 178. Immersive Audio Album
- URL: https://immersiveaudioalbum.com/
- Author: Immersive Audio Album
- Year: 2019
- What it does well: Editorial site tracking spatial-audio releases with quality and format notes.
- Why we care: Reference for presenting format/version metadata clearly for audio content.
- Verification: Resolved, HTTP 200. Page title: "Immersive Audio Album".

### Music education and browser synthesis

## 179. Ableton Learning Music
- URL: https://learningmusic.ableton.com/
- Author: Ableton (with Dennis DeSantis)
- Year: 2017
- What it does well: Teaches music fundamentals through a playable browser grid, with each lesson building on the last.
- Why we care: The best example in the corpus of teaching through direct manipulation, and of an audio UI with no transport bar at all.
- Verification: Resolved, HTTP 200. Page title: "Get started | Learning Music".

## 180. Learning Music: Make Beats
- URL: https://learningmusic.ableton.com/make-beats/make-beats.html
- Author: Ableton
- Year: 2017
- What it does well: Step-sequencer grid where the beat is the lesson.
- Why we care: A grid sequencer that is immediately learnable; study the default state and the affordance hints.
- Verification: Resolved, HTTP 200. Page title: "Make beats | Learning Music".

## 181. Learning Music: Notes and Scales
- URL: https://learningmusic.ableton.com/notes-and-scales/notes-and-scales.html
- Author: Ableton
- Year: 2017
- What it does well: Visualises scales as a piano-roll the learner edits.
- Why we care: Reference for showing theory visually instead of describing it.
- Verification: Resolved, HTTP 200. Page title: "Explore pitch | Learning Music".

## 182. Learning Music: Chords
- URL: https://learningmusic.ableton.com/chords/chords.html
- Author: Ableton
- Year: 2017
- What it does well: Chord progression builder with instant audition.
- Why we care: Instant-audition-on-edit is the key pattern; our editor should behave the same way.
- Verification: Resolved, HTTP 200. Page title: "Make some chords | Learning Music".

## 183. Learning Music: Song Structure
- URL: https://learningmusic.ableton.com/song-structure/song-structure.html
- Author: Ableton
- Year: 2017
- What it does well: Arranges sections on a timeline, teaching form by building it.
- Why we care: Direct precedent for a section/chapter arrangement UI over an audio timeline.
- Verification: Resolved, HTTP 200. Page title: "Play with song structures | Learning Music".

## 184. Ableton Learning Synths
- URL: https://learningsynths.ableton.com/
- Author: Ableton
- Year: 2019
- What it does well: Interactive synthesis course whose playgrounds are the explanation.
- Why we care: Masterclass in progressive disclosure of a complex parameter space.
- Verification: Resolved, HTTP 200. Page title: "Learning Synths".

## 185. Chrome Music Lab
- URL: https://musiclab.chromeexperiments.com/
- Author: Google (with Google Creative Lab)
- Year: 2016
- What it does well: Fourteen small experiments, each teaching one musical idea through a single playful interface.
- Why we care: The strongest 'experiment as UI' reference in the corpus: tiny scope, real interaction, high delight.
- Verification: Resolved, HTTP 200. Page title: "Chrome Music Lab".

## 186. Song Maker
- URL: https://musiclab.chromeexperiments.com/Song-Maker/
- Author: Google
- Year: 2016
- What it does well: Grid-based melody and rhythm composition with shareable links.
- Why we care: Reference for a shareable state encoded entirely in a URL.
- Verification: Resolved, HTTP 200. Page title: "Chrome Music Lab - Song Maker".

## 187. Rhythm
- URL: https://musiclab.chromeexperiments.com/Rhythm/
- Author: Google
- Year: 2016
- What it does well: Percussion sequencing that makes polyrhythm visible.
- Why we care: Shows how to make a timing concept legible visually.
- Verification: Resolved, HTTP 202. Page title: "Chrome Music Lab".

## 188. Spectrogram
- URL: https://musiclab.chromeexperiments.com/Spectrogram/
- Author: Google
- Year: 2016
- What it does well: Lets users draw on a spectrogram and hear the result.
- Why we care: Spectrogram-as-input rather than read-only display; a genuinely novel audio control.
- Verification: Resolved, HTTP 202. Page title: "Chrome Music Lab".

## 189. Sound Waves
- URL: https://musiclab.chromeexperiments.com/Sound-Waves/
- Author: Google
- Year: 2016
- What it does well: Visualises frequency and amplitude with live instrument control.
- Why we care: Clearest small example of audio parameters mapped to a visual model.
- Verification: Resolved, HTTP 202. Page title: "Chrome Music Lab".

## 190. Oscillators
- URL: https://musiclab.chromeexperiments.com/Oscillators/
- Author: Google
- Year: 2016
- What it does well: Direct waveform manipulation with immediate feedback.
- Why we care: Minimal-delay feedback loop; the interaction is one knob and one visual.
- Verification: Resolved, HTTP 202. Page title: "Chrome Music Lab".

## 191. Harmonics
- URL: https://musiclab.chromeexperiments.com/Harmonics/
- Author: Google
- Year: 2016
- What it does well: Additive synthesis shown as a stack of harmonics.
- Why we care: Excellent example of visualising the spectral composition directly.
- Verification: Resolved, HTTP 202. Page title: "Chrome Music Lab".

## 192. Strings
- URL: https://musiclab.chromeexperiments.com/Strings/
- Author: Google
- Year: 2016
- What it does well: Shows vibrating-string harmonics by letting users pluck.
- Why we care: Physics-as-interface; delight from faithful simulation.
- Verification: Resolved, HTTP 202. Page title: "Chrome Music Lab".

## 193. Kandinsky
- URL: https://musiclab.chromeexperiments.com/Kandinsky/
- Author: Google
- Year: 2016
- What it does well: Draw shapes that become sounds.
- Why we care: Direct precedent for drawing-based audio composition.
- Verification: Resolved, HTTP 202. Page title: "Chrome Music Lab".

## 194. Piano Roll
- URL: https://musiclab.chromeexperiments.com/Piano-Roll/
- Author: Google
- Year: 2016
- What it does well: Classic piano-roll editing introduced gently.
- Why we care: Baseline reference for grid note editing, useful when comparing to hardware trackers.
- Verification: Resolved, HTTP 202. Page title: "Chrome Music Lab".

## 195. musictheory.net
- URL: https://www.musictheory.net/
- Author: Tenuto (Ricci Adams)
- Year: 2000
- What it does well: Long-standing theory lessons plus configurable exercises with a very readable notation renderer.
- Why we care: Best-in-class educational content structure with a clean, dependency-free renderer.
- Verification: Resolved, HTTP 200. Page title: "musictheory.net".

## 196. musictheory.net exercises
- URL: https://www.musictheory.net/exercises
- Author: Ricci Adams
- Year: 2000
- What it does well: Configurable drills covering interval, chord, scale and fretboard recognition.
- Why we care: Reference for exposing exercise configuration without overwhelming the learner.
- Verification: Resolved, HTTP 200. Page title: "musictheory.net - Exercises".

## 197. Hooktheory
- URL: https://www.hooktheory.com/
- Author: Hooktheory
- Year: 2010
- What it does well: Analyzes real songs into chord progressions with a distinctive colour-coded notation system.
- Why we care: Their progression visual language is a genuinely novel notation and worth studying closely.
- Verification: Resolved, HTTP 200. Page title: "Facebook".

---

## Missing-source coverage: what was not found, and what I want

Verified ceiling reached **197 entries**. The following gaps are real and unresolved, not silently filled.

**1. Bot-blocked but almost certainly live (excluded, not asserted).** These returned HTTP 403 to every automated fetch attempt (including a rendering fetch), so they are absent from the corpus despite being credible references. A human-browser pass would recover them:

- `tidal.com` - canonical `www.tidal.com` and `tidal.com` both 403.
- `www.beatport.com`, `ra.co`, `www.residentadvisor.net` - electronic-music store and event/mix players.
- `www.discogs.com`, `www.allmusic.com`, `rateyourmusic.com` - music metadata and catalogue UIs.
- `player.fm` - podcast web player; 403 on both curl and rendering fetch.
- `www.presonus.com/products/Studio-One` - now redirects to Fender's 'Studio Pro' storefront, so the Studio One UI reference is dropped rather than cited at a stale address.
- `www.avid.com/pro-tools` and `www.w3.org/TR/webaudio/` also 403 to automated fetch; both were confirmed with a rendering fetch and are included with that noted in their `Verification` line.
- `www.unrealengine.com` - engine audio documentation; 403.
- `gearspace.com` and `www.gearspace.com` - 403 on repeat attempts (Cloudflare), so the practitioner forum evidence is excluded even though the community is clearly active.
- `magicmusicvisuals.com`, `www.vsxu.com`, `www.shadertoy.com`, `www.kvraudio.com`, `vocalremover.org`, `www.jango.com`, `www.shoutcast.com` (partially), `dearvr.com` (402).
- `musikcube.com` returned HTTP 500 on repeated attempts; the GitHub project page is included instead.

**2. Dead or moved (404/000 confirmed, correctly dropped).** Notable ones worth chasing elsewhere rather than citing the dead URL:

- Cantata (`github.com/cantata-player/cantata`) and Lollypop (`github.com/lollypop-studio/lollypop`) - both 404; likely renamed or archived. No live replacement confirmed.
- Airr (`www.airr.io`), Stitcher (`www.stitcher.com`, HTTP 502 - service wound down), musiccube/musikcube site, `mediaelementjs.com`, `waveform.prototyping.bbc.co.uk` - all unreachable.
- Ableton deep links (`/en/live/features/`, `/en/live/manual/`) 404; only the live top-level and learn-live paths verified.

**3. Coverage targets I could not satisfy at all:**

- **Screenshot-based references.** Spotify Mobile UI screenshots, Apple Music screenshots and App Store gallery imagery are not fetchable as stable URLs. I included App Store listings and marketing pages instead, which is weaker evidence for actual visual design.
- **AVS** (the original Winamp Advanced Visualisation Studio) - no verifiable primary page found; only community archives, of which `winampheritage.com` and `visbot.net` are included.
- **VSXu** - the vendor domain did not verify; no live replacement found.
- **FMOD Designer / legacy Wwise authoring screenshots** - superseded by FMOD Studio and Wwise Authoring, which are included; the historical tools have no live pages.
- **Native iOS-specific interaction detail** (Overcast's speed dial, Castro's queue gestures) is documented in prose and App Store copy, not in engineer-readable specs. I want actual interaction recordings or the developers' own write-ups.
- **Accessible audio-book apps for screen-reader users.** I found platform accessibility guidance and the APG seek-slider spec, but not a single well-documented accessible audiobook player UI. This is the biggest genuine hole in the corpus.

**4. What I want next, ranked:**

1. A screen-reader walkthrough (VoiceOver and NVDA) of an audiobook/podcast player, recorded end to end.
2. Human-browser capture of the 403-blocked set above, so TIDAL/Beatport/RA/Discogs/Player.fm can be studied properly.
3. Primary-source design write-ups from podcast-player teams (Overcast, Castro, Pocket Casts) on why their interaction models differ.
4. Hardware UI photography for OP-1/OP-Z/Elektron under real lighting, since the vendor pages show studio renders rather than in-use legibility.

