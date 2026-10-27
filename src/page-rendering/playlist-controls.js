import { renderPlayerIcons } from "../assets/icons.js";
import { Playlist } from "../playlist-data/playlist-data.js";
import { renderSongs } from "./list-render.js";

let searchTimeout;

export function renderPlaylist(playlist, player) {
  const controls = document.getElementById("view-controls");
  if (!controls || !playlist) return;
  clearTimeout(searchTimeout);

  const playId = String(playlist.id);
  const sortLabels = {
    none: "Unsorted",
    default: "Default order",
    reverse: "Reverse",
    alpha: "Alphabetical",
    album: "Album",
    artist: "Artist",
  };
  const sortOptions = Playlist.sortMethods
    .map(
      (method) => /* html */ `
        <button
          type="button"
          role="menuitem"
          data-action="sort-playlist"
          data-sort-method="${method}"
          data-play-id="${playId}"
          class="block w-full rounded-lg px-3 py-2 border-b border-blue-700 text-left text-sm text-white hover:bg-white/10"
        >${sortLabels[method]}</button>
      `,
    )
    .join("");

  controls.innerHTML = /* html */ `
    <div id="rendered-playlist-heading"></div>
    <div class="flex items-center gap-2 px-4 py-3">
      <input
        id="song-search"
        type="search"
        placeholder="Search songs in this playlist"
        aria-label="Search songs in this playlist"
        class="min-w-0 flex-1 rounded-lg border border-blue-800 bg-slate-950 px-4 py-2 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
      />
      <button
        type="button"
        data-action="play-playlist"
        data-play-id="${playId}"
        aria-label="Play playlist"
        title="Play playlist"
        class="player-icon-button text-cyan-400 hover:text-cyan-200"
      ><i data-lucide="play" aria-hidden="true"></i></button>
      <details class="relative shrink-0">
        <summary
          aria-label="Sort playlist"
          title="Sort playlist"
          class="player-icon-button cursor-pointer list-none text-cyan-400 hover:text-cyan-200 [&::-webkit-details-marker]:hidden"
        ><i data-lucide="list-chevrons-up-down" aria-hidden="true"></i></summary>
        <div
          role="menu"
          class="absolute right-0 top-full z-40 mt-1 min-w-40 rounded-xl border border-blue-700 bg-slate-950 p-2 shadow-xl"
        >
          ${sortOptions}
        </div>
      </details>
      <button
        type="button"
        data-action="playlist-options"
        data-play-id="${playId}"
        aria-label="Playlist options"
        aria-controls="playlist-options-details"
        aria-expanded="false"
        title="Playlist options"
        class="player-icon-button text-cyan-400 hover:text-cyan-200"
      ><i data-lucide="ellipsis-vertical" aria-hidden="true"></i></button>
    </div>
  `;
  renderPlayerIcons();

  const searchInput = controls.querySelector("#song-search");
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderSongs(playlist, player, searchInput.value);
    }, 1000);
  });

  renderSongs(playlist, player, searchInput.value);
}
