import { renderPlayerIcons } from "../assets/icons.js";
import { Lib } from "../song-data/song-library.js";
import Sortable from "sortablejs";

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
  const isPlaying = Boolean(player?.isPlaying);
  const playId = escapeHtml(playlist?.id);

  const songRows = songNodes
    .map((node) => {
      const song = node.song;
      const isCurrent = song.id === currentSongId;
      const isNowPlaying = isCurrent && isPlaying;
      const songId = escapeHtml(song.id);
      const title = escapeHtml(song.title ?? "Untitled");
      const artist = escapeHtml(song.artist ?? "Unknown artist");
      const cover = escapeHtml(song.cover);
      const album = escapeHtml(song.album ?? song.title ?? "Song");
      const isFavorite = Boolean(
        song.isFavorite || Lib.songs.get(song.id)?.isFavorite,
      );
      const rowStyle = isNowPlaying
        ? "border-l-4 border-fuchsia-400 bg-blue-900/80 ring-1 ring-fuchsia-400/50 shadow-lg shadow-fuchsia-950/20"
        : isCurrent
          ? "border-l-4 border-cyan-400 bg-blue-950/70"
          : "border-l-4 border-transparent bg-slate-900 text-white";

      return /* html */ `
        <li
          data-action="select-song"
          data-song-id="${songId}"
          data-play-id="${playId}"
          aria-current="${isCurrent}"
          class="song-row flex min-w-0 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${rowStyle}"
        >
          <img
            src="${cover}"
            alt="${album} album cover"
            class="h-12 w-12 shrink-0 rounded-md object-cover"
          />

          <div class="min-w-0 flex-1">
            ${isCurrent ? `<span data-song-status class="mb-0.5 inline-block rounded-full bg-fuchsia-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-200">${isNowPlaying ? "Now playing" : "Paused"}</span>` : ""}
            <p data-song-title class="truncate text-sm font-semibold ${isNowPlaying ? "text-gradient" : "text-white"}">
              ${title}
            </p>
            <p class="truncate text-xs text-slate-400">${artist}</p>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              data-action="song-drag-handle"
              data-song-id="${songId}"
              aria-label="Reorder ${title}"
              title="Reorder ${title}"
              class="player-icon-button cursor-grab text-slate-400 hover:text-white"
            >
              <i data-lucide="grip-horizontal" aria-hidden="true"></i>
            </button>
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

    const songList = container.querySelector("ul");
    if (songList && playlist && !playlist.isSearchResults && !searchQuery) {
      Sortable.create(songList, {
        animation: 150,
        direction: "vertical",
        draggable: 'li[data-action="select-song"]',
        handle: '[data-action="song-drag-handle"]',
        onEnd(event) {
          const node = event.item.songNode;
          if (node?.playlist === playlist) {
            playlist.moveSong(node, event.newIndex);
          }
        },
      });
    }

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

// Update the current-song treatment without rebuilding rows during audio events.
export function syncRenderedSongState(player) {
  const container = document.getElementById("song-container");
  if (!container?.querySelector("ul")) return;

  const currentSongId = player?.currentNode?.song?.id;
  const isPlaying = Boolean(player?.isPlaying);

  container.querySelectorAll('li[data-action="select-song"]').forEach((row) => {
    const isCurrent = Number(row.dataset.songId) === currentSongId;
    const isNowPlaying = isCurrent && isPlaying;
    row.setAttribute("aria-current", String(isCurrent));
    row.classList.toggle("border-fuchsia-400", isNowPlaying);
    row.classList.toggle("bg-blue-900/80", isNowPlaying);
    row.classList.toggle("ring-1", isNowPlaying);
    row.classList.toggle("ring-fuchsia-400/50", isNowPlaying);
    row.classList.toggle("shadow-lg", isNowPlaying);
    row.classList.toggle("shadow-fuchsia-950/20", isNowPlaying);
    row.classList.toggle("border-cyan-400", isCurrent && !isPlaying);
    row.classList.toggle("bg-blue-950/70", isCurrent && !isPlaying);
    row.classList.toggle("border-transparent", !isCurrent);
    row.classList.toggle("bg-slate-900", !isCurrent);

    const title = row.querySelector("[data-song-title]");
    title?.classList.toggle("text-gradient", isNowPlaying);
    title?.classList.toggle("text-white", !isNowPlaying);

    let status = row.querySelector("[data-song-status]");
    if (!isCurrent) {
      status?.remove();
      return;
    }

    if (!status) {
      status = document.createElement("span");
      status.dataset.songStatus = "";
      status.className =
        "mb-0.5 inline-block rounded-full bg-fuchsia-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-200";
      title?.before(status);
    }
    status.textContent = isNowPlaying ? "Now playing" : "Paused";
  });
}
