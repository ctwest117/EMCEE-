import { Song } from "./song-data";

// holds song inside playlist
export class SongNode {
  constructor(song) {
    this.song = song;
    this.addedOrder = 0; //update with playlist.size when added to a playlist.
    this.playlist = null; //for when a song is selected in different playlist. will update when added to playlist
    this.next = null;
    this.prev = null;
  }
}

// playlist class builds and tracks playlists
export class Playlist {
  static myPlaylists = new Map();

  //   adding and removing playlists to the manager array
  static findPlaylist(nameOrId) {
    if (Playlist.myPlaylists.get(nameOrId)) {
      return Playlist.myPlaylists.get(nameOrId);
    } else {
      const found = [...Playlist.myPlaylists.values()].filter(
        (playlist) => playlist.name === nameOrId,
      );
      if (found.length <= 0) return null;
      return found;
    }
  }

  static addPlaylist(playlist) {
    Playlist.myPlaylists.set(playlist.id, playlist);
  }

  static removePlaylist(playlist) {
    if (playlist === Playlist.favorites) return;
    Playlist.myPlaylists.delete(playlistId);
  }

  static nextId = 100;

  constructor(name, cover) {
    this.id = "playlist" + Playlist.nextId++;
    this.name = name;
    this.cover = cover;
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.addedOrder = 0;
    this.duration = 0;
    this.sortMethod = "default";

    Playlist.addPlaylist(this);
  }

  //   add or remove songs
  append(song) {}

  prepend(song) {}

  removeSong(songNode) {}

  removeAll() {}

  //   convert playlist to an array for sorting
  toArray() {}

  //   get duration
  getNewDuration() {}

  //  sorting, finding & moving songs
  sortBy(method) {
    /* methods to include: default(order added), reverse(reverse added),
    alphabetically, by album,and by artist. 
    sort actually changes the order they appear and play*/
  }

  findSongNode(id) {}

  moveSong(songNode, pos) {}

  // favorites playlist
  static favorites = new Playlist("Favorites");
}
