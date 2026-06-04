# 1Commerce Audio

A functional **ultra hi-res lossless music player** branded for the
**1Commerce** business, built on Astro + Svelte + TailwindCSS.

## Features

- 🎵 Real HTML5 audio playback with a persistent bottom player bar
- 💿 Lossless source support (WAV / FLAC, up to 24-bit / 192 kHz)
- ▶️ Play / pause, next / previous, scrub-to-seek, volume control
- 📜 Click any row in a playlist's track list to start playing
- 🔁 Auto-advance through the queue when a track finishes
- �� 1Commerce branding (sidebar logo, page titles, lossless quality badges)
- ✨ Astro view transitions for fluid navigation between pages

## Run locally

```bash
npm install --legacy-peer-deps
npm run dev
```

Then open <http://localhost:4321>.

## How the player works

- `src/lib/player.ts` – tiny `window` event bus (`1commerce:player`) that
  any island/page can dispatch commands onto.
- `src/components/Player.svelte` – the single global player island. It owns
  the `<audio>` element and reactive playback state.
- `src/components/MusicsTable.astro` – every row dispatches a `play` command
  with the current song queue + index when clicked.
- `src/layouts/Layout.astro` – mounts the player once for the whole app via
  `<Player client:load />`.

## Lossless audio sources

The bundled demo tracks point at free PCM/WAV samples from
[samplelib.com](https://samplelib.com) so playback works out of the box.
Swap the `src` and `format` fields in `src/lib/data.ts` to point at your
own FLAC/WAV catalogue.
