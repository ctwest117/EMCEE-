import { renderPlayerIcons } from "../assets/icons.js";
import { searchSongs } from "../api-data/api-query.js";
import { Playlist } from "../playlist-data/playlist-data.js";
import { Song } from "../song-data/song-data.js";
import { Lib } from "../song-data/song-library.js";
import { renderSongs } from "./list-render.js";

let searchTimeout;
let latestSearch = 0;

function createSongsFromApi(results) {
  return results
    .filter(Boolean)
    .map(
      ([
        id,
        title,
        artist,
        album,
        cover,
        albumIndex,
        genre,
        audioSrc,
        duration,
        kind,
      ]) =>
        new Song(
          id,
          title,
          artist,
          album,
          cover,
          albumIndex,
          genre,
          audioSrc,
          duration,
          kind,
        ),
    );
}

export function renderSearch(player) {
  const controls = document.getElementById("view-controls");
  if (!controls) return;

  clearTimeout(searchTimeout);
  latestSearch++;
  controls.innerHTML = /* html */ `
    <div class="flex items-center gap-2 px-4 py-3">
      <input
        id="song-search"
        type="search"
        placeholder="Search songs"
        aria-label="Search songs"
        class="min-w-0 flex-1 rounded-lg border border-blue-800 bg-slate-950 px-4 py-2 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
      />
      <input
        id="api-search-limit"
        type="number"
        min="1"
        max="200"
        step="1"
        value="20"
        aria-label="Maximum API search results"
        title="API result limit"
        disabled
        class="w-14 shrink-0 rounded-lg border border-blue-800 bg-slate-950 px-2 py-2 text-base text-white focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      />
      <details id="search-source" class="relative z-20 shrink-0">
        <summary
          id="search-source-trigger"
          class="flex h-10 w-20 list-none cursor-pointer items-center justify-between rounded-lg border border-blue-800 bg-slate-950 px-2 text-sm text-cyan-100 hover:border-cyan-500 focus:outline-none [&::-webkit-details-marker]:hidden"
        >
          <span id="search-source-label">Local</span>
          <i data-lucide="chevron-down" aria-hidden="true" class="h-4 w-4"></i>
        </summary>
        <div
          role="menu"
          aria-label="Search source"
          class="absolute right-0 top-full z-50 mt-1 w-20 rounded-xl border border-blue-700 bg-slate-950 p-1 shadow-xl shadow-black/40"
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked="true"
            data-search-source="local"
            class="w-full rounded-lg px-3 py-2 text-left text-sm text-cyan-100 hover:bg-cyan-950/70"
          >Local</button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked="false"
            data-search-source="api"
            class="w-full rounded-lg px-3 py-2 text-left text-sm text-cyan-100 hover:bg-cyan-950/70"
          >API</button>
        </div>
      </details>
    </div>
    <p id="search-status" class="px-4 text-sm text-slate-400" aria-live="polite"></p>
  `;

  const searchInput = controls.querySelector("#song-search");
  const limitInput = controls.querySelector("#api-search-limit");
  const sourceMenu = controls.querySelector("#search-source");
  const sourceLabel = controls.querySelector("#search-source-label");
  const status = controls.querySelector("#search-status");
  let searchSource = "local";

  const runSearch = async () => {
    const searchId = ++latestSearch;
    const query = searchInput.value.trim();
    if (!controls.contains(searchInput)) return;

    if (!query) {
      status.textContent = "";
      renderSongs(Playlist.searchResults([]), player);
      return;
    }

    status.textContent = searchSource === "api" ? "Searching..." : "";

    try {
      const songs =
        searchSource === "api"
          ? createSongsFromApi(
              await searchSongs(query, getApiLimit(limitInput.value)),
            )
          : Lib.search(query);

      // Ignore stale responses and searches from a view that has been replaced.
      if (searchId !== latestSearch || !controls.contains(searchInput)) return;

      status.textContent = songs.length ? "" : "No songs found.";
      renderSongs(Playlist.searchResults(songs), player);
    } catch (error) {
      if (searchId !== latestSearch || !controls.contains(searchInput)) return;

      console.error("Song search failed", error);
      status.textContent = "Search failed. Please try again.";
      renderSongs(Playlist.searchResults([]), player);
    }
  };

  searchInput.addEventListener("keyup", () => {
    clearTimeout(searchTimeout);
    latestSearch++;
    searchTimeout = setTimeout(runSearch, 1000);
  });

  sourceMenu.querySelectorAll("[data-search-source]").forEach((option) => {
    option.addEventListener("click", () => {
      searchSource = option.dataset.searchSource;
      sourceLabel.textContent = option.textContent;
      limitInput.disabled = searchSource !== "api";

      sourceMenu
        .querySelectorAll('[role="menuitemradio"]')
        .forEach((menuOption) => {
          menuOption.setAttribute(
            "aria-checked",
            String(menuOption === option),
          );
        });

      sourceMenu.open = false;
      controls.querySelector("#search-source-trigger").focus();
      clearTimeout(searchTimeout);
      runSearch();
    });
  });

  limitInput.addEventListener("change", () => {
    if (searchSource === "api") runSearch();
  });

  renderPlayerIcons();
  renderSongs(Playlist.searchResults([]), player);
}

function getApiLimit(value) {
  const limit = Number(value);
  return Number.isInteger(limit) && limit > 0 ? Math.min(limit, 200) : 20;
}
