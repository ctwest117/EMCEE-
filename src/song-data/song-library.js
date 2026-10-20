import { Song } from "./song-data";
// local saved songs
class Library {
  songs = new Map();

  // add and remove songs
  add(song) {
    this.songs.set(song.id, song);
  }
  del(song) {
    this.songs.delete(song.id);
  }

  // save and restore Library to and from localstorage
  save() {
    localStorage.setItem(
      "LIBRARY_KEYS",
      JSON.stringify([...this.songs.values()]),
    );
  }

  restore() {
    const tracks = localStorage.getItem("LIBRARY_KEYS") ?? null;
    if (!tracks) return false;
    JSON.parse(tracks).forEach((song) => {
      const newSong = new Song(
        song.id,
        song.title,
        song.artist,
        song.album,
        song.cover,
        song.albumIndex,
        song.genre,
        song.audioSrc,
        song.duration,
        song.kind,
      );
      newSong.isFavorite = song.isFavorite;
    });
    return true;
  }

  clear() {
    this.songs.clear();
  }
}

export const Lib = new Library();
