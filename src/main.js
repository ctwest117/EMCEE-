import "./style.css";
import { searchSongs } from "./api-data/api-query";
import { Song } from "./song-data/song-data";
import { Lib } from "./song-data/song-library";
import { Playlist } from "./playlist-data/playlist-data";
import { MusicPlayer } from "./music-player-data/music-player-data";
import { renderMini } from "./mini-player/mini-player-render";
import {
  miniPlayerListeners,
  syncMiniPlayer,
} from "./mini-player/mini-player-data";

export const Player = new MusicPlayer();

renderMini();
miniPlayerListeners(Player);

window.addEventListener("beforeunload", () => {
  Playlist.save();
  Player.save();
});

// const bbArr = await searchSongs("Breaking Benjamin", 50);
// bbArr.forEach((a) => {
//   if (a.at(-1) === "song") Playlist.favorites.addSong(new Song(...a));
// });

Playlist.restore();
Player.restore();
syncMiniPlayer(Player);

window.searchSongs = searchSongs;
window.Lib = Lib;
window.Song = Song;
window.Playlist = Playlist;
window.Player = Player;
