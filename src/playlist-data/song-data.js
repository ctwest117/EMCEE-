// Song node contains all song info, carrys across playlists
export class Song {
  static id = 0;
  constructor(
    title,
    artist = "John Doe",
    album = "Unkown",
    coverURL = "../assets/images/default-cover.png",
    albumIndex = 0, //For ordering within album
    genre = null,
    audioSrc = "../src/assets/audio/Faint Forte.mp3",
    duration = null,
  ) {
    this.id = Song.id++;
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.cover = coverURL;
    this.albumIndex = albumIndex;
    this.genre = genre;
    this.audioSrc = audioSrc;
    this.duration = duration;
    this.isFavorite = false;
  }
}
