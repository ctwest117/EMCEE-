import { renderPlayerIcons } from "../assets/icons.js";
import { createSongOptionsMenu } from "./song-options-menu.js";
import { createPlaylistOptionsMenu } from "./playlist-options-menu.js";

let miniPlayerResizeObserver;

// Build the mini-player's HTML. Keeping this separate from MusicPlayer lets
// the player manage audio while this module handles only the interface.
export function renderMini() {
  const miniPlayer = document.getElementById("mini-player");
  if (!miniPlayer) return;

  miniPlayer.innerHTML = /* html */ `
    <section
      class="mini-player-shell relative grid w-full min-w-0 items-center gap-2 border-t border-blue-600 bg-slate-950/90 px-2 py-3 text-white shadow-[0_0_24px_rgba(0,82,255,0.18)] backdrop-blur-lg sm:px-3 md:px-6"
      aria-label="Music player"
    >
      <button
        id="mini-player-collapse"
        type="button"
        aria-label="Collapse player"
        title="Collapse player"
        aria-expanded="false"
        class="mini-player-collapse player-icon-button text-cyan-300"
      ><i data-lucide="chevron-down" aria-hidden="true"></i></button>

      <div class="mini-player-cover-stage">
        <button
          id="mini-current-playlist"
          type="button"
          data-action="open-current-playlist"
          class="mini-player-current-playlist"
          hidden
        ></button>
        <img id="expanded-song-cover" class="expanded-song-cover" alt="" />
      </div>

      <div class="mini-player-track-row">
        <div class="mini-player-track-info">
          <img
            id="mini-song-cover"
            class="mini-song-cover h-8 w-8 shrink-0 rounded-lg object-cover sm:h-10 sm:w-10 md:h-12 md:w-12"
            alt=""
          />
          <div class="mini-player-song-copy min-w-0">
            <p id="mini-song-album" class="mini-song-album truncate text-xs text-slate-400"></p>
            <p id="mini-song-title" class="truncate text-sm font-semibold sm:text-base">Nothing playing</p>
            <p id="mini-song-artist" class="truncate text-xs text-slate-400 sm:text-sm">Choose a song to start listening</p>
          </div>
        </div>

        <div class="mini-player-side-controls flex shrink-0 items-center justify-end gap-0 sm:gap-1">
          <button
            id="toggle-favorite"
            data-action="toggle-favorite"
            type="button"
            class="player-icon-button text-slate-400"
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
            class="player-icon-button text-cyan-400"
          ><i data-lucide="ellipsis-vertical" aria-hidden="true"></i></button>
        </div>
      </div>

      <div class="mini-player-progress">
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
        <div class="mini-player-time mt-1 flex justify-between text-xs tabular-nums text-slate-400">
          <span id="current-time">0:00</span>
          <span id="duration">0:00</span>
        </div>
      </div>

      <div class="mini-player-transport flex items-center justify-center gap-1 sm:gap-2">
        <button
          id="toggle-loop"
          data-action="toggle-loop"
          data-icon="repeat-off"
          type="button"
          aria-label="Loop off"
          aria-pressed="false"
          title="Loop off"
          class="mini-player-expanded-control player-icon-button text-slate-400"
        ><i data-lucide="repeat-off" aria-hidden="true"></i></button>
        <button
          id="previous-track"
          data-action="previous-track"
          type="button"
          class="player-icon-button text-cyan-400"
          aria-label="Previous track"
          title="Previous track"
        ><i data-lucide="skip-back" aria-hidden="true"></i></button>
        <button
          id="play-pause"
          data-action="play-pause"
          type="button"
          class="player-icon-button player-primary-button text-fuchsia-400"
          aria-label="Play"
          title="Play"
        ><i data-lucide="play" aria-hidden="true"></i></button>
        <button
          id="next-track"
          data-action="next-track"
          type="button"
          class="player-icon-button text-cyan-400"
          aria-label="Next track"
          title="Next track"
        ><i data-lucide="skip-forward" aria-hidden="true"></i></button>
        <button
          id="toggle-shuffle"
          data-action="toggle-shuffle"
          type="button"
          aria-label="Turn shuffle on"
          aria-pressed="false"
          title="Turn shuffle on"
          class="mini-player-expanded-control player-icon-button text-slate-400"
        ><i data-lucide="shuffle" aria-hidden="true"></i></button>
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
    // Expanded mode overlays the page; keep the app's compact-player space reserved.
    if (miniPlayer.classList.contains("is-expanded")) return;
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
