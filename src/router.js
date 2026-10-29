import { Playlist } from "./data/playlist-data.js";
import { renderHome } from "./page-rendering/home-controls.js";
import { renderPlaylist } from "./page-rendering/playlist-controls.js";
import { renderSearch } from "./page-rendering/search-controls.js";

// The hash is the source of truth for which view is displayed.
export function createRouter(
  player,
  {
    browser = window,
    playlists = Playlist.myPlaylists,
    views = { home: renderHome, search: renderSearch, playlist: renderPlaylist },
  } = {},
) {
  const homeHash = "#/home";

  function renderCurrent() {
    const hash = browser.location.hash;
    if (hash === "#/search") {
      views.search(player);
      return;
    }
    if (hash === homeHash) {
      views.home(player);
      return;
    }

    const match = /^#\/playlist\/(\d+)$/.exec(hash);
    const id = match ? Number(match[1]) : null;
    const playlist = Number.isSafeInteger(id) ? playlists.get(id) : null;
    if (playlist) {
      views.playlist(playlist, player);
      return;
    }

    // Replace an empty, invalid, or unavailable route without adding history.
    browser.history.replaceState(browser.history.state, "", homeHash);
    views.home(player);
  }

  function navigate(view, playlistId) {
    const hash =
      view === "playlist" ? `#/playlist/${playlistId}` : `#/${view}`;
    if (browser.location.hash === hash) {
      renderCurrent();
    } else {
      browser.location.hash = hash;
    }
  }

  function start() {
    browser.addEventListener("hashchange", renderCurrent);
    renderCurrent();
  }

  return { start, navigate, refresh: renderCurrent };
}
