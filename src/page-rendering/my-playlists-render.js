import { Playlist } from "../playlist-data/playlist-data.js";
import { renderPlayerIcons } from "../assets/icons.js";

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

export function renderPlaylists(player, query = "") {
  const container = document.getElementById("song-container");
  if (!container) return;

  const searchQuery = String(query).trim().toLowerCase();
  const playlists = [...Playlist.myPlaylists.values()].filter((playlist) =>
    playlist.name.toLowerCase().includes(searchQuery),
  );
  const playlistCards = playlists
    .map((playlist) => {
      const playId = escapeHtml(playlist.id);
      const name = escapeHtml(playlist.name);
      const cover = escapeHtml(playlist.cover);
      const songCount = playlist.size;
      const songLabel = songCount === 1 ? "song" : "songs";
      const isCurrent = playlist === player?.currentPlaylist;

      return /* html */ `
        <article
          data-play-id="${playId}"
          class="min-w-0 cursor-pointer overflow-hidden rounded-xl border-b border-blue-600 bg-slate-950 p-2 text-white transition duration-200 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-lg hover:shadow-cyan-950/40 hover:text-shadow-white/50 hover:text-shadow-2xs"
        >
          <img
            src="${cover}"
            alt="${name} cover"
            class="aspect-square w-full rounded-lg object-cover"
          />
          <div class="flex items-center justify-between gap-2 px-1 pb-1 pt-3">
            <div class="min-w-0">
              <h2 class="truncate text-sm font-semibold ${isCurrent ? "text-gradient" : ""}">${name}</h2>
              <p class="text-xs text-slate-400">${songCount} ${songLabel}</p>
            </div>
            <button
              type="button"
              data-action="playlist-options"
              data-play-id="${playId}"
              aria-label="Options for ${name}"
              aria-controls="playlist-options-details"
              aria-expanded="false"
              title="Playlist options"
              class="player-icon-button shrink-0 text-cyan-300 hover:text-cyan-100"
            >
              <i data-lucide="ellipsis-vertical" aria-hidden="true"></i>
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  container.innerHTML = /* html */ `
    <div class="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
      ${playlistCards}
    </div>
  `;
  renderPlayerIcons();
}
