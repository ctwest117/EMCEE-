import "./style.css";
import { searchSongs } from "./data/api-query";
import { Song } from "./data/song-data";
import { Lib } from "./data/song-library";
import { Playlist } from "./data/playlist-data";
import { MusicPlayer } from "./data/music-player-data";
import { renderMini } from "./page-rendering/mini-player-render";
import { setupEventListeners } from "./eventListeners";
import { renderHeader } from "./page-rendering/header-render";
import {
  miniPlayerListeners,
  syncMiniPlayer,
} from "./data/mini-player-data";
import {
  refreshRenderedSongs,
  renderSongs,
} from "./page-rendering/list-render";
import { createRouter } from "./router.js";
export const Player = new MusicPlayer();
const router = createRouter(Player);

renderHeader();
renderMini();
miniPlayerListeners(Player);
setupEventListeners(Player, router);
document.addEventListener("playlistchange", refreshRenderedSongs);

function saveAppState() {
  Playlist.save();
  Player.save();
}

// Save when the app is backgrounded or navigated away from, including on mobile.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveAppState();
});
window.addEventListener("pagehide", saveAppState);

Playlist.restore();
Player.restore();

syncMiniPlayer(Player);
// Persist the fully restored startup state once, after restore has finished.
Playlist.save();

router.start();

Player.save();

window.renderSongs = renderSongs;
window.searchSongs = searchSongs;
window.Lib = Lib;
window.Song = Song;
window.Playlist = Playlist;
window.Player = Player;
