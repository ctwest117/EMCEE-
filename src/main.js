import { MusicPlayer } from "./music-player-data/music-player-data";
import { Song } from "./playlist-data/song-data";
import { Playlist } from "./playlist-data/playlist-data";
import "./style.css";
const player = new MusicPlayer();
window.Playlist = Playlist;
window.player = player;
window.Song = Song;
console.log(Playlist.myPlaylists);
