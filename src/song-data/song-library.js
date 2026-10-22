import { Song } from "./song-data.js";
// local saved songs
class Library {
  songs = new Map();

  // keeps track of all the playlists a song is a member of
  trackedSongs = new Map();

  // add and remove songs
  add(song) {
    if (this.songs.has(song.id)) return false;
    this.songs.set(song.id, song);
    return true;
  }
  del(song) {
    if (!this.songs.has(song.id)) return false;
    this.songs.delete(song.id);
    return true;
  }

  //   search and track songs locally
  search(query) {
    return [...this.songs.values()].filter((song) =>
      [song.title, song.artist, song.album].some((value) =>
        value?.toLowerCase().includes(query.toLowerCase()),
      ),
    );
  }

  trackSongsAdd(song, playlist) {
    const ids = this.trackedSongs.get(song.id);

    if (!ids) {
      this.trackedSongs.set(song.id, [playlist.id]);
    } else if (!ids.includes(playlist.id)) {
      ids.push(playlist.id);
    }
  }

  trackSongsDel(song, playlist) {
    const ids = this.trackedSongs.get(song.id);
    if (!ids) return;

    const remainIds = ids.filter((id) => id !== playlist.id);

    if (remainIds.length === 0) this.trackedSongs.delete(song.id);
    else this.trackedSongs.set(song.id, remainIds);
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
    if (!tracks) {
      console.log("restore failed");
      return false;
    }
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
      this.add(newSong);
    });
    console.log("restore succeded");
    return true;
  }

  clear() {
    this.songs.clear();
    this.trackedSongs.clear();
  }
}

export const Lib = new Library();
