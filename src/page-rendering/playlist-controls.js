import { renderPlayerIcons } from "../assets/icons.js";
import { Playlist } from "../playlist-data/playlist-data.js";
import { renderSongs } from "./list-render.js";

let searchTimeout;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function renderPlaylist(playlist, player) {
  const controls = document.getElementById("view-controls");
  if (!controls || !playlist) return;
  if (player) player.lastRenderedView = { type: "playlist", id: playlist.id };
  clearTimeout(searchTimeout);

  const playId = String(playlist.id);
  const playlistName = escapeHtml(playlist.name);
  const playlistCover = escapeHtml(playlist.cover);
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
    <section class="flex min-w-0 flex-col gap-4 px-4 pt-4 pb-5 md:min-h-48 md:flex-row md:items-stretch md:gap-6 border-b-2 rounded-lg border-cyan-400">
      ${
        playlist.cover && playlist.cover !== "none"
          ? `
        <img
          src="${playlistCover}"
          alt="${playlistName} cover"
          class="aspect-square w-full min-w-80 shrink-0 rounded-xl object-cover shadow-lg shadow-cyan-950/40 md:w-48"
        />
      `
          : ""
      }
      <div class="flex min-w-0 flex-1 flex-col justify-end gap-3">
        <h1 class="min-w-0 truncate text-3xl font-semibold text-white md:text-6xl">${playlistName}</h1>
        <div class="flex min-w-0 items-center gap-2">
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
      </div>
    </section>
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
