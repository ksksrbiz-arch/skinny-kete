<script lang="ts">
  import { onMount } from "svelte";
  import type { Song } from "../lib/data";
  import { songs as defaultSongs } from "../lib/data";
  import { PLAYER_EVENT, type PlayerCommand } from "../lib/player";

  let audio: HTMLAudioElement | null = $state(null);
  let queue: Song[] = $state(defaultSongs);
  let index = $state(0);
  let playing = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);
  let volume = $state(0.9);
  let started = $state(false);
  let errorMsg = $state("");

  const current = $derived<Song | null>(queue[index] ?? null);

  function fmt(t: number): string {
    if (!isFinite(t) || t < 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function safePlay() {
    if (!audio) return;
    try {
      await audio.play();
    } catch (err) {
      // Most likely an autoplay-policy rejection; surface a friendly hint.
      errorMsg = "Tap play to start audio (browser autoplay blocked).";
    }
  }

  function loadAndPlay(newIndex: number) {
    if (!audio || !queue.length) return;
    index = Math.max(0, Math.min(newIndex, queue.length - 1));
    started = true;
    errorMsg = "";
    // Trigger reload of the new src then play.
    audio.load();
    safePlay();
  }

  function togglePlay() {
    if (!audio) return;
    if (!started) {
      loadAndPlay(index);
      return;
    }
    if (audio.paused) safePlay();
    else audio.pause();
  }

  function next() {
    if (!queue.length) return;
    loadAndPlay((index + 1) % queue.length);
  }

  function prev() {
    if (!queue.length) return;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    loadAndPlay((index - 1 + queue.length) % queue.length);
  }

  function onSeek(e: Event) {
    if (!audio) return;
    const v = Number((e.target as HTMLInputElement).value);
    audio.currentTime = v;
    currentTime = v;
  }

  function onVolume(e: Event) {
    const v = Number((e.target as HTMLInputElement).value);
    volume = v;
    if (audio) audio.volume = v;
  }

  function handleCommand(e: Event) {
    const cmd = (e as CustomEvent<PlayerCommand>).detail;
    if (!cmd) return;
    switch (cmd.type) {
      case "play":
        queue = cmd.queue.length ? cmd.queue : queue;
        loadAndPlay(cmd.index ?? 0);
        break;
      case "toggle":
        togglePlay();
        break;
      case "next":
        next();
        break;
      case "prev":
        prev();
        break;
      case "seek":
        if (audio) {
          audio.currentTime = cmd.time;
          currentTime = cmd.time;
        }
        break;
      case "volume":
        volume = cmd.value;
        if (audio) audio.volume = cmd.value;
        break;
    }
  }

  onMount(() => {
    if (audio) audio.volume = volume;
    window.addEventListener(PLAYER_EVENT, handleCommand);
    return () => window.removeEventListener(PLAYER_EVENT, handleCommand);
  });
</script>

<footer
  class="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-t border-emerald-500/30 text-white"
  aria-label="1Commerce music player"
>
  <audio
    bind:this={audio}
    src={current?.src ?? ""}
    preload="metadata"
    crossorigin="anonymous"
    onplay={() => (playing = true)}
    onpause={() => (playing = false)}
    onended={next}
    ontimeupdate={() => audio && (currentTime = audio.currentTime)}
    ondurationchange={() => audio && (duration = audio.duration || 0)}
    onerror={() => (errorMsg = "Could not load lossless source.")}
  ></audio>

  <div class="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-4">
    <!-- Track info -->
    <div class="flex items-center gap-3 min-w-0 w-1/4">
      {#if current}
        <img
          src={current.image}
          alt={current.title}
          class="h-12 w-12 rounded object-cover shadow-md"
        />
        <div class="min-w-0">
          <div class="truncate text-sm font-semibold">{current.title}</div>
          <div class="truncate text-xs text-zinc-400">
            {current.artists.join(", ")}
          </div>
        </div>
      {:else}
        <div class="text-xs text-zinc-500">No track selected</div>
      {/if}
    </div>

    <!-- Transport + scrubber -->
    <div class="flex-1 flex flex-col items-center gap-1">
      <div class="flex items-center gap-3">
        <button
          type="button"
          onclick={prev}
          aria-label="Previous track"
          class="text-zinc-300 hover:text-white"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"
            ><path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" /></svg
          >
        </button>
        <button
          type="button"
          onclick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          class="h-9 w-9 rounded-full bg-emerald-400 text-black flex items-center justify-center hover:scale-105 transition"
        >
          {#if playing}
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"
              ><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg
            >
          {:else}
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"
              ><path d="M8 5v14l11-7z" /></svg
            >
          {/if}
        </button>
        <button
          type="button"
          onclick={next}
          aria-label="Next track"
          class="text-zinc-300 hover:text-white"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"
            ><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" /></svg
          >
        </button>
      </div>

      <div class="flex items-center gap-2 w-full">
        <span class="text-[10px] text-zinc-400 tabular-nums w-9 text-right">
          {fmt(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          oninput={onSeek}
          aria-label="Seek"
          class="flex-1 accent-emerald-400 h-1"
        />
        <span class="text-[10px] text-zinc-400 tabular-nums w-9">
          {fmt(duration)}
        </span>
      </div>
    </div>

    <!-- Lossless badge + volume -->
    <div class="hidden md:flex items-center gap-3 w-1/4 justify-end">
      {#if current}
        <span
          class="text-[10px] tracking-widest uppercase font-bold px-2 py-1 rounded border border-emerald-400/60 text-emerald-300"
          title="Ultra hi-res lossless audio"
        >
          {current.format}
        </span>
      {/if}
      <label class="flex items-center gap-2 text-zinc-400">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor"
          ><path
            d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 8.05v7.9A4.5 4.5 0 0 0 16.5 12z"
          /></svg
        >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          oninput={onVolume}
          aria-label="Volume"
          class="w-24 accent-emerald-400 h-1"
        />
      </label>
    </div>
  </div>
  {#if errorMsg}
    <div class="px-4 pb-2 text-xs text-amber-300">{errorMsg}</div>
  {/if}
</footer>
