// Song node contains all song info, carrys across playlists
export class Song {
  static id = 0;
  constructor(
    title,
    artist,
    album,
    coverURL,
    albumIndex, //For ordering within album
    genre,
    audioSrc,
    duration,
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
