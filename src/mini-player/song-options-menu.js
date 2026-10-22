// The mini-player owns one shared song-options menu. Ellipsis buttons elsewhere

import { renderPlayerIcons } from "../assets/icons";
import { Lib } from "../song-data/song-library";

// update this menu's song and playlist IDs before opening it.
export function createSongOptionsMenu() {
  const details = document.createElement("details");
  details.id = "song-options-details";
  details.className = "song-options-details";
  details.dataset.songId = "";
  details.dataset.playId = "";
  details.innerHTML = /* html */ `
    <summary class="sr-only">Song options</summary>
    <div
      role="menu"
      class="absolute bottom-[105%] right-1 z-50 min-w-48 rounded-xl border border-blue-700 bg-slate-950 p-2 shadow-xl"
    >
      <button
        type="button"
        role="menuitem"
        data-action="queue"
        class="block w-full rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm text-white hover:bg-white/10 "
      >
        <i data-lucide="FunnelPlus" aria-hidden="true" class="player-icon-button"></i> Add to queue 
      </button>
      <button
        type="button"
        role="menuitem"
        data-action="queueView"
        class="block w-full rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
      >
        <i data-lucide="Funnel" aria-hidden="true" class="player-icon-button"></i> View Queue
      </button>
      <button
        type="button"
        role="menuitem"
        data-action="add-to-playlist"
        class="block w-full rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
      >
        <i data-lucide="ListPlus" aria-hidden="true" class="player-icon-button"></i> Add to playlist 
      </button>
      <button
        type="button"
        role="menuitem"
        data-action="remove"
        class="block w-full rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
      >
        <i data-lucide="ListX" aria-hidden="true" class="player-icon-button"></i> Remove from playlist 
      </button>
    </div>
  `;
  renderPlayerIcons;
  return details;
}
