import { SongNode, Playlist } from "../playlist-data/playlist-data";

// MusicPlayer manages playback and tracks current playlist + song
export class MusicPlayer {
  constructor() {
    this.currentPlaylist = null;
    this.currentNode = null;
    this.volume = 1.0;
    this.playBackPosition = 0;
    this.playbackOrder = null; //contains song order for shuffle
    this.isPlaying = false;
    this.isShuffled = false;
    this.loop = "off";
    this.isQueue = false;
    this.queue = [];
  }

  // playback controls ↓

  // play/pause, selectSong, nextSong, and prevSong methods
  play() {}

  selectSong(songNode, playlist = this.currentPlaylist) {}

  skip() {}

  prev() {}

  //   playlist select controls
  selectPlaylist(playlist) {}

  // Looping methods
  setLoopMode(mode) {}

  //   shuffle
  shufflePlaylist() {}

  //queue
  addToQueue(song) {}
  removeFromQueue(song) {}
  clearQueue() {}
  nextInQueue() {} //chatgpt, is this needed at all, or should i handle this inside of skip?

  //favorites
  addToFavorites(song = this.currentNode) {}
  removeFromFavorites(song = this.currentNode) {}

  //global songs
  findSongAPI(song) {} //chatgpt, where should i keep my songLibrary? should i keep it in another file?
}
