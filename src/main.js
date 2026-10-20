import { MusicPlayer } from "./music-player-data/music-player-data";
import { Song } from "./song-data/song-data";
import { Playlist } from "./playlist-data/playlist-data";
import { searchSongs } from "./api-data/api-query";
import "./style.css";
import { Lib } from "./song-data/song-library";
const Player = new MusicPlayer();
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

// import { createIcons, Trash2 } from "lucide";
// createIcons({ icons: { Trash2 } });

window.Lib = Lib;
window.searchSongs = searchSongs;
window.Playlist = Playlist;
window.Player = Player;
window.Song = Song;
console.log("hello");
