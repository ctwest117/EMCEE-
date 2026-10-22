import "./style.css";
import { searchSongs } from "./api-data/api-query";
import { Song } from "./song-data/song-data";
import { Lib } from "./song-data/song-library";
import { Playlist } from "./playlist-data/playlist-data";
import { MusicPlayer } from "./music-player-data/music-player-data";
import { renderMini } from "./mini-player/mini-player-render";
import { setupEventListeners } from "./eventListeners";
import {
  miniPlayerListeners,
  syncMiniPlayer,
} from "./mini-player/mini-player-data";
export const Player = new MusicPlayer();

renderMini();
miniPlayerListeners(Player);
setupEventListeners(Player);

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

window.searchSongs = searchSongs;
window.Lib = Lib;
window.Song = Song;
window.Playlist = Playlist;
window.Player = Player;
