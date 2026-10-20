// Song node contains all song info, carrys across playlists
export class Song {
  constructor(
    id = 100,
    title = "Faint Forte",
    artist = "Slip Park",
    album = "We Are Not Your Meteora",
    coverURL = "../assets/images/default-cover.png",
    albumIndex = 0, //For ordering within album
    genre = "Nu Metal",
    audioSrc = "../src/assets/audio/Faint Forte.mp3",
    duration = 295000,
    kind = "song",
  ) {
    this.id = id;
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.cover = coverURL;
    this.albumIndex = albumIndex;
    this.genre = genre;
    this.audioSrc = audioSrc;
    this.duration = duration;
    this.kind = kind;
    this.isFavorite = false;
  }
}
