import { renderPlayerIcons } from "../assets/icons.js";

let lastRenderedPlaylist = null;
let lastRenderedPlayer = null;
let lastRenderedQuery = "";

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

// Render songs as rows with artwork, details, and the shared options trigger.
export function renderSongs(playlist, player, query = "") {
  const searchQuery = String(query).trim();
  const songNodes = searchQuery
    ? playlist.findByStr(searchQuery)
    : playlist.toArray();
  const currentSongId = player?.currentNode?.song?.id;
  const playId = escapeHtml(playlist?.id);

  const songRows = songNodes
    .map((node) => {
      const song = node.song;
      const isCurrent = song.id === currentSongId;
      const songId = escapeHtml(song.id);
      const title = escapeHtml(song.title ?? "Untitled");
      const artist = escapeHtml(song.artist ?? "Unknown artist");
      const cover = escapeHtml(song.cover);
      const album = escapeHtml(song.album ?? song.title ?? "Song");
      const isFavorite = Boolean(song.isFavorite);
      const rowStyle = isCurrent
        ? "bg-blue-900/70 ring-1 ring-blue-500/50 text-gradient"
        : "bg-slate-900 text-white";

      return /* html */ `
        <li
          data-action="select-song"
          data-song-id="${songId}"
          data-play-id="${playId}"
          aria-current="${isCurrent}"
          class="flex min-w-0 items-center gap-3 rounded-lg px-3 py-2 ${rowStyle}"
        >
          <img
            src="${cover}"
            alt="${album} album cover"
            class="h-12 w-12 shrink-0 rounded-md object-cover"
          />

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">
              ${title}
            </p>
            <p class="truncate text-xs text-slate-400">${artist}</p>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              data-action="toggle-favorite"
              data-song-id="${songId}"
              aria-pressed="${isFavorite}"
              aria-label="${isFavorite ? "Remove from" : "Add to"} favorites: ${title}"
              title="${isFavorite ? "Remove from" : "Add to"} favorites"
              class="player-icon-button ${isFavorite ? "text-fuchsia-400" : "text-slate-400 hover:text-fuchsia-400"}"
            >
              <i data-lucide="heart" aria-hidden="true" class="${isFavorite ? "fill-current" : ""}"></i>
            </button>
            <button
              type="button"
              data-action="song-options"
              data-song-id="${songId}"
              data-play-id="${playId}"
              data-search-results="${Boolean(playlist.isSearchResults)}"
              aria-label="Options for ${title}"
              aria-controls="song-options-details"
              aria-expanded="false"
              title="Options for ${title}"
              class="player-icon-button text-cyan-400 hover:text-cyan-200"
            >
              <i data-lucide="ellipsis" aria-hidden="true"></i>
            </button>
          </div>
        </li>
      `;
    })
    .join("");

  const html = /* html */ `
    <ul class="w-full divide-y divide-blue-900/70">
      ${songRows}
    </ul>
  `;

  const container = document.getElementById("song-container");
  if (container) {
    lastRenderedPlaylist = playlist;
    lastRenderedPlayer = player;
    lastRenderedQuery = searchQuery;
    container.innerHTML = html;
    container
      .querySelectorAll('li[data-action="select-song"]')
      .forEach((row, index) => {
        row.songNode = songNodes[index];
      });
    renderPlayerIcons();
  }

  return html;
}

export function refreshRenderedSongs(event) {
  const container = document.getElementById("song-container");
  if (!container?.querySelector("ul") || !lastRenderedPlaylist) return;

  const changedPlaylist = event?.detail?.playlist;
  if (changedPlaylist && changedPlaylist !== lastRenderedPlaylist) return;

  if (event?.detail?.removed) {
    container.replaceChildren();
    lastRenderedPlaylist = null;
    lastRenderedPlayer = null;
    lastRenderedQuery = "";
    return;
  }

  renderSongs(lastRenderedPlaylist, lastRenderedPlayer, lastRenderedQuery);
}
