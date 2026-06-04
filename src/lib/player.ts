import type { Song } from "./data";

/**
 * Tiny event-bus backed player command channel.
 *
 * The actual <audio> element and reactive state live inside the global
 * `Player.svelte` island (mounted once in the Layout). Other parts of the
 * UI (Astro components, inline scripts, table rows, etc.) talk to it by
 * dispatching `CustomEvent`s on `window` — that way we don't need a
 * cross-island store and everything stays plain DOM.
 */

export type PlayerCommand =
  | { type: "play"; queue: Song[]; index: number }
  | { type: "toggle" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "seek"; time: number }
  | { type: "volume"; value: number };

export const PLAYER_EVENT = "1commerce:player";

export function dispatchPlayer(cmd: PlayerCommand): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<PlayerCommand>(PLAYER_EVENT, { detail: cmd }));
}

export function playSongs(queue: Song[], index = 0): void {
  dispatchPlayer({ type: "play", queue, index });
}
