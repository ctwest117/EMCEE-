import { renderPlayerIcons } from "../assets/icons.js";
import { createSongOptionsMenu } from "./song-options-menu.js";
import { createPlaylistOptionsMenu } from "./playlist-options-menu.js";

let miniPlayerResizeObserver;

// Build the mini-player's HTML. Keeping this separate from MusicPlayer lets
// the player manage audio while this module handles only the interface.
export function renderMini() {
  const miniPlayer = document.getElementById("mini-player");
  if (!miniPlayer) return;

  // The grid places song details on the left, transport controls in the
  // middle, and the extra-options button on the right. The progress row spans
  // the full width above them.
  miniPlayer.innerHTML = /* html */ `
    <section
      class="relative grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-1 gap-y-0 rounded-t-4xl border-t border-blue-600 bg-slate-950/90 px-2 py-4 text-white shadow-[0_0_24px_rgba(0,82,255,0.18)] backdrop-blur-lg sm:gap-x-2 sm:px-3 md:gap-x-8 md:px-10"
      aria-label="Music player"
    >
      <div class="col-span-3 min-w-0 items-center md:items-start">
        <input
          id="progress"
          type="range"
          min="0"
          max="1000"
          value="0"
          aria-label="Song progress"
          class="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          disabled
        />
        <div class="mt-2 flex justify-between text-sm tabular-nums text-slate-400">
          <span id="current-time" class='hidden md:block'>0:00</span>
          <span id="duration" class='hidden md:block'>0:00</span>
        </div>
      </div>

      <div class="flex min-w-0 items-center gap-2 md:gap-3">
        <img
          id="mini-song-cover"
          class="h-8 w-8 shrink-0 rounded-lg object-cover sm:h-10 sm:w-10 md:h-12 md:w-12"
          alt=""
        />
        <div class="min-w-0">
          <p id="mini-song-title" class="truncate text-sm font-semibold sm:text-base">Nothing playing</p>
          <p id="mini-song-artist" class="truncate text-xs text-slate-400 sm:text-sm">Choose a song to start listening</p>
        </div>
      </div>

      <div class="flex items-center justify-self-end gap-1 sm:gap-2 md:gap-6">
        <button
          id="previous-track"
          data-action="previous-track"
          type="button"
          class="player-icon-button text-cyan-400 hover:text-cyan-200"
          aria-label="Previous track"
          title="Previous track"
        ><i data-lucide="skip-back" aria-hidden="true"></i></button>
        <button
          id="play-pause"
          data-action="play-pause"
          type="button"
          class="player-icon-button player-primary-button text-fuchsia-400 hover:text-fuchsia-200"
          aria-label="Play"
          title="Play"
        ><i data-lucide="play" aria-hidden="true"></i></button>
        <button
          id="next-track"
          data-action="next-track"
          type="button"
          class="player-icon-button text-cyan-400 hover:text-cyan-200"
          aria-label="Next track"
          title="Next track"
        ><i data-lucide="skip-forward" aria-hidden="true"></i></button>
      </div>

      <div class="mini-player-side-controls flex w-full min-w-0 items-center justify-self-stretch justify-between gap-1 md:gap-2">
        <div class="flex shrink-0 items-center gap-0 sm:gap-1">
          <button
            id="toggle-loop"
            data-action="toggle-loop"
            data-icon="repeat-off"
            type="button"
            aria-label="Loop off"
            aria-pressed="false"
            title="Loop off"
            class="player-icon-button text-slate-400 hover:text-cyan-200"
          ><i data-lucide="repeat-off" aria-hidden="true"></i></button>
          <button
            id="toggle-shuffle"
            data-action="toggle-shuffle"
            type="button"
            aria-label="Turn shuffle on"
            aria-pressed="false"
            title="Turn shuffle on"
            class="player-icon-button text-slate-400 hover:text-cyan-200"
          ><i data-lucide="shuffle" aria-hidden="true"></i></button>
        </div>
        <div class="flex shrink-0 items-center gap-0 sm:gap-1">
          <button
            id="toggle-favorite"
            data-action="toggle-favorite"
            type="button"
            class="player-icon-button text-slate-400 hover:text-fuchsia-400"
            aria-label="Add to favorites"
            title="Add to favorites"
          ><i data-lucide="heart" aria-hidden="true"></i></button>
          <button
            id="player-more"
            type="button"
            data-action="song-options"
            data-song-id=""
            data-play-id=""
            aria-label="Song options"
            aria-controls="song-options-details"
            aria-expanded="false"
            title="Song options"
            class="player-icon-button text-cyan-400 hover:text-cyan-200"
          ><i data-lucide="ellipsis-vertical" aria-hidden="true"></i></button>
        </div>
      </div>
    </section>
  `;

  // Keep shared menus outside the fixed player so they can sit beside any trigger.
  document.querySelector("#shared-options-menus")?.remove();
  const optionsContainer = document.createElement("div");
  optionsContainer.id = "shared-options-menus";
  optionsContainer.append(createSongOptionsMenu(), createPlaylistOptionsMenu());
  document.body.append(optionsContainer);

  const updateMiniPlayerHeight = () => {
    document.documentElement.style.setProperty(
      "--mini-player-height",
      `${miniPlayer.offsetHeight}px`,
    );
  };
  updateMiniPlayerHeight();
  miniPlayerResizeObserver?.disconnect();
  miniPlayerResizeObserver = new ResizeObserver(updateMiniPlayerHeight);
  miniPlayerResizeObserver.observe(miniPlayer);

  // Lucide replaces each data-lucide placeholder with its SVG icon.
  renderPlayerIcons();
}
