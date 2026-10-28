import { Song } from "../song-data/song-data.js";
import { Lib } from "../song-data/song-library.js";

function notifyPlaylistChange(playlist, removed = false) {
  document.dispatchEvent(
    new CustomEvent("playlistchange", { detail: { playlist, removed } }),
  );
}

const defaultCover =
  "https://static.vecteezy.com/system/resources/previews/052/887/161/non_2x/neon-icon-of-a-shiny-vinyl-record-shining-on-black-background-vector.jpg";

const favoriteCover =
  "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTExL3Jhd3BpeGVsb2ZmaWNlMl9zaW1wbGVfbGluZV9uZW9uX29mX2hlYXJ0X2ljb25faW5fdGhlX3N0eWxlX29mX18yNWYzMThhYy1mMmI2LTRhOWYtYjgyYy1iYzNiOGZlYjQzYmNfMS5qcGc.jpg";

// holds song inside playlist
export class SongNode {
  constructor(song, { addToLibrary = true } = {}) {
    if (!(song instanceof Song)) {
      throw new TypeError("SongNode expects a Song instance");
    }

    this.song = song;
    this.orderAdded = 0;
    this.playlist = null; //for when a song is selected in different playlist. will update when added to playlist
    this.next = null;
    this.prev = null;

    // shuffle connections
    this.nextShuffled = null;
    this.prevShuffled = null;

    if (addToLibrary) Lib.add(song);
  }
}

//  playlist class builds and handles playlists
export class Playlist {
  //   adding and removing playlists to the manager array
  static myPlaylists = new Map();
  static isRestoring = false;
  static sortMethods = [
    "none",
    "default",
    "reverse",
    "alpha",
    "album",
    "artist",
  ];

  static findPlaylist(nameOrId) {
    if (Playlist.myPlaylists.get(nameOrId)) {
      return [Playlist.myPlaylists.get(nameOrId)];
    } else {
      const found = [...Playlist.myPlaylists.values()].filter((playlist) =>
        playlist.name.toLowerCase().includes(nameOrId.toLowerCase()),
      );
      return found;
    }
  }

  static addPlaylist(playlist) {
    if (!(playlist instanceof Playlist)) {
      throw new TypeError("addPlaylist() expects a Playlist instance");
    }
    Playlist.myPlaylists.set(playlist.id, playlist);
    if (Playlist.keys && !Playlist.isRestoring) Playlist.save();
  }

  static createPlaylist(name) {
    const cleanName = String(name ?? "").trim();
    if (!cleanName) {
      return { playlist: null, error: "Enter a playlist name." };
    }

    const duplicate = [...Playlist.myPlaylists.values()].some(
      (playlist) =>
        playlist.name.trim().toLowerCase() === cleanName.toLowerCase(),
    );
    if (duplicate) {
      return {
        playlist: null,
        error: "A playlist with that name already exists.",
      };
    }

    return { playlist: new Playlist(cleanName), error: "" };
  }

  static removePlaylist(playlist) {
    if (!(playlist instanceof Playlist)) {
      throw new TypeError("removePlaylist() expects a Playlist instance");
    }
    if (!playlist || playlist === Playlist.favorites) return false;

    playlist.onPlaylistRemoved?.(playlist);

    const removed = Playlist.myPlaylists.delete(playlist.id);
    if (!removed) return false;

    if (!Playlist.isRestoring) Playlist.save();
    playlist.iterate((node) => Lib.trackSongsDel(node.song, playlist));
    notifyPlaylistChange(playlist, true);
    return true;
  }

  // constructor
  static nextId = 100;

  constructor(
    name,
    cover = defaultCover,
    id = Playlist.nextId++,
    addToPlaylists = true,
  ) {
    this.id = id;
    this.name = name;
    this.cover = cover;
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.nextOrder = 0;
    this.duration = 0;
    this.sortMethod = "default";
    this.isSearchResults = false;
    this.onSongRemoved = null;

    if (addToPlaylists) Playlist.addPlaylist(this);
  }
  //  Search results playlist
  static searchResults(songs, playId = 0) {
    const results = new Playlist("search-results", "none", playId, false);
    results.isSearchResults = true;
    songs.forEach((song) => {
      results.addSong(song);
      Lib.trackSongsDel(song, results);
    });
    Lib.save();
    return results;
  }

  // favorites playlist
  static favorites = new Playlist("Favorites", favoriteCover);

  static addToFavorites(song) {
    if (!(song instanceof Song)) {
      throw new TypeError("addToFavorites() expects a Song");
    }
    const librarySong = Lib.songs.get(song.id) ?? song;
    librarySong.isFavorite = true;
    const node = Playlist.favorites.addSong(librarySong);
    // A duplicate favorite does not add a node, but its flag may still need saving.
    if (!node && !Playlist.isRestoring) Playlist.save();
    return node;
  }

  static removeFromFavorites(song) {
    if (!(song instanceof Song)) {
      throw new TypeError("removeFromFavorite() expects a Song");
    }
    const librarySong = Lib.songs.get(song.id) ?? song;
    librarySong.isFavorite = false;
    const node = Playlist.favorites.findById(librarySong.id);
    if (node !== -1) node.song.isFavorite = false;
    const removedSong = Playlist.favorites.removeSong(node);
    // removeSong saves when it removes a node; save here if there was no node.
    if (!removedSong && !Playlist.isRestoring) Playlist.save();
    return removedSong;
  }

  //  saving and restoring playlists
  static keys = "PLAYLIST_KEYS";

  static save() {
    Lib.save();
    const result = [];
    for (const playlist of Playlist.myPlaylists.values()) {
      result.push({
        id: playlist.id,
        name: playlist.name,
        cover: playlist.cover,
        songs: playlist.toArray().map((node) => ({
          id: node.song.id,
          orderAdded: node.orderAdded,
        })),
        sortMethod: playlist.sortMethod,
      });
    }
    localStorage.setItem(Playlist.keys, JSON.stringify(result));
    // console.log(result);
  }

  static restore() {
    Playlist.isRestoring = true;
    try {
      Lib.restore();
      const saved = localStorage.getItem(Playlist.keys);
      if (!saved) return false;
      const res = JSON.parse(saved);
      res.forEach((playlist) => {
        if (playlist.id >= Playlist.nextId) Playlist.nextId = playlist.id + 1;

        const isFavorites = playlist.id === Playlist.favorites.id;
        const restoredPlaylist = isFavorites
          ? Playlist.favorites
          : new Playlist(playlist.name, playlist.cover, playlist.id);

        // Append in saved display order; sorting can be applied later.
        restoredPlaylist.sortMethod = "none";
        playlist.songs.forEach((savedSong) => {
          // Older saves contain song IDs instead of objects.
          const songId =
            savedSong !== null && typeof savedSong === "object"
              ? savedSong.id
              : savedSong;
          const song = Lib.songs.get(songId) ?? null;
          if (!song || (isFavorites && !song.isFavorite)) return;

          const node = restoredPlaylist.addSong(song);
          if (node.playlist !== restoredPlaylist) return;

          const orderAdded = savedSong?.orderAdded;
          if (Number.isSafeInteger(orderAdded) && orderAdded >= 0) {
            node.orderAdded = orderAdded;
            restoredPlaylist.nextOrder = Math.max(
              restoredPlaylist.nextOrder,
              orderAdded + 1,
            );
          }
        });

        restoredPlaylist.sortMethod = Playlist.sortMethods.includes(
          playlist.sortMethod,
        )
          ? playlist.sortMethod
          : "default";
      });
      return true;
    } finally {
      Playlist.isRestoring = false;
    }
  }

  //   add or remove songs & nodes
  addSong(song) {
    if (!(song instanceof Song)) {
      throw new TypeError("addSong() expects a Song instance");
    }
    const node = new SongNode(song);
    this.addNode(node);
    return node;
  }

  addNode(node) {
    if (!(node instanceof SongNode)) {
      throw new TypeError("addNode() expects a SongNode");
    }
    if (node.playlist) {
      throw new TypeError("songNode belongs to another Playlist");
    }
    if (this.toArray().some((a) => a.song.id === node.song.id)) return;

    node.orderAdded = this.nextOrder++;
    node.playlist = this;
    node.prev = null;
    node.next = null;

    if (this.sortMethod === "none") {
      this.appendNode(node);
      this.size++;
      this.getNewDuration();
      Lib.trackSongsAdd(node.song, this);
      notifyPlaylistChange(this);
      if (!Playlist.isRestoring) Playlist.save();
      return node;
    }

    let current = this.head;
    while (current && this.compareNodes(node, current) >= 0) {
      current = current.next;
    }

    if (!current) {
      this.appendNode(node);
    } else {
      const prev = current.prev;
      if (prev) prev.next = node;
      else this.head = node;
      node.prev = prev;
      node.next = current;
      current.prev = node;
    }

    this.size++;
    this.getNewDuration();
    Lib.trackSongsAdd(node.song, this);
    notifyPlaylistChange(this);
    if (!Playlist.isRestoring) Playlist.save();
    return node;
  }
  //↓ low level helper, does not modify anything but the nxt and prev
  appendNode(node) {
    if (!(node instanceof SongNode)) {
      throw new TypeError("appendNode() expects a SongNode instance");
    }

    if (node.next || node.prev) return -1;

    if (!this.head) this.head = node;
    if (this.tail) {
      node.prev = this.tail;
      this.tail.next = node;
    }
    this.tail = node;
  }

  removeSong(node) {
    if (!node || node.playlist !== this) return;

    this.onSongRemoved?.(node);

    const prev = node.prev;
    const next = node.next;

    if (!prev) {
      this.head = next;
    } else {
      prev.next = next;
    }
    if (!next) {
      this.tail = prev;
    } else {
      next.prev = prev;
    }

    const song = node.song;
    Lib.trackSongsDel(node.song, this);
    node.song = null;
    node.playlist = null;
    node.next = null;
    node.prev = null;
    this.size--;
    this.getNewDuration();
    notifyPlaylistChange(this);
    if (!Playlist.isRestoring) Playlist.save();
    return song;
  }

  removeAll(fullReset = true) {
    if (fullReset) {
      this.iterate((node) => {
        this.onSongRemoved?.(node);
        Lib.trackSongsDel(node.song, this);
      });
    }
    this.head = null;
    this.tail = null;
    this.size = 0;
    if (fullReset) {
      this.nextOrder = 0;
    }
    this.duration = 0;
    if (fullReset) notifyPlaylistChange(this);
    if (fullReset && !Playlist.isRestoring) Playlist.save();
  }

  //   iterate through playlist nodes
  iterate(callback) {
    let current = this.head;
    if (!current) return;
    for (let i = 0; i < this.size; i++) {
      callback(current, i, this);
      current = current.next;
    }
  }

  //  convert playlist to an array and back for sorting
  toArray() {
    const arr = [];
    this.iterate((node) => arr.push(node));
    return arr;
  }

  toSongArray() {
    const arr = [];
    this.iterate((node) => arr.push(node.song));
    return arr;
  }

  toPlaylist(arr) {
    this.removeAll(false);
    arr.forEach((node) => {
      node.prev = null;
      node.next = null;
      if (!this.head) {
        this.head = node;
      } else {
        node.prev = this.tail;
        this.tail.next = node;
      }
      this.tail = node;
      node.playlist = this;
      this.size++;
    });
    this.getNewDuration();
    notifyPlaylistChange(this);
  }

  //   get duration
  getNewDuration() {
    let newDuration = 0;
    this.iterate((node) => (newDuration += node.song.duration));
    this.duration = newDuration;
  }

  //  sorting, finding & moving songs
  sortBy(method = "default") {
    if (!Playlist.sortMethods.includes(method)) {
      throw new TypeError("Method not supported");
    }
    this.sortMethod = method;
    if (method === "none") {
      if (!Playlist.isRestoring) Playlist.save();
      return method;
    }

    const sortedNodes = this.toArray().sort((a, b) => this.compareNodes(a, b));
    this.toPlaylist(sortedNodes);
    if (this.head) this.head.prev = null;
    if (!Playlist.isRestoring) Playlist.save();
    return method;
  }

  compareNodes(newNode, node) {
    switch (this.sortMethod) {
      case "none":
        return 1;
      case "default":
        return newNode.orderAdded - node.orderAdded;
      case "reverse":
        return node.orderAdded - newNode.orderAdded;
      case "alpha":
        const alpha = newNode.song.title.localeCompare(node.song.title);
        if (alpha === 0) return newNode.orderAdded - node.orderAdded;
        else return alpha;
      case "album":
        const album = newNode.song.album.localeCompare(node.song.album);
        if (album === 0) return newNode.song.albumIndex - node.song.albumIndex;
        else return album;
      case "artist":
        const art = newNode.song.artist.localeCompare(node.song.artist);
        if (art === 0) {
          const alb = newNode.song.album.localeCompare(node.song.album);
          if (alb === 0) return newNode.song.albumIndex - node.song.albumIndex;
          else return alb;
        } else return art;
    }
  }

  findById(id) {
    if (typeof id === "number") {
      let current = this.head;
      for (let i = 0; i < this.size; i++) {
        if (current.song.id === id) return current;
        current = current.next;
      }
    }
    return -1;
  }

  findByStr(str) {
    if (typeof str !== "string") return -1;
    str = str.toLowerCase();
    const found = [];
    this.iterate((node) => {
      if (
        node.song.title.toLowerCase().includes(str) ||
        node.song.album.toLowerCase().includes(str) ||
        node.song.artist.toLowerCase().includes(str)
      ) {
        found.push(node);
      }
    });
    return found;
  }

  posOf(node) {
    let current = this.head;
    for (let i = 0; i < this.size; i++) {
      if (current === node) return i;
      current = current.next;
    }
    return -1;
  }

  atPos(pos) {
    if (!Number.isInteger(pos) || pos < 0 || pos >= this.size) return -1;
    let current = this.head;
    let i = 0;
    while (current) {
      if (i === pos) return current;
      current = current.next;
      i++;
    }
    return -1;
  }

  moveSong(node, pos) {
    if (!(node instanceof SongNode)) {
      throw new TypeError("moveSong() expects a songNode");
    }
    if (node.playlist !== this) {
      throw new TypeError("songNode not in this playlist");
    }
    if (!Number.isInteger(pos) || pos < 0 || pos >= this.size) return -1;
    if (node === this.atPos(pos)) return node;

    // disconnect node from prev position
    const prev = node.prev;
    const next = node.next;

    if (!prev && !next) return node;
    if (!prev) {
      this.head = next;
      next.prev = prev;
    } else {
      prev.next = next;
    }
    if (!next) {
      this.tail = prev;
      prev.next = next;
    } else {
      next.prev = prev;
    }

    //if added to the end
    if (pos === this.size - 1) {
      this.tail.next = node;
      node.prev = this.tail;
      node.next = null;
      this.tail = node;
      this.sortMethod = "none";
      notifyPlaylistChange(this);
      if (!Playlist.isRestoring) Playlist.save();
      return node;
    }

    const target = this.atPos(pos);
    const tarPrev = target.prev;
    if (!tarPrev) {
      this.head = node;
      node.prev = null;
    } else {
      tarPrev.next = node;
      node.prev = tarPrev;
    }
    node.next = target;
    target.prev = node;

    this.sortMethod = "none";
    this.head.prev = null;
    notifyPlaylistChange(this);
    if (!Playlist.isRestoring) Playlist.save();
    return node;
  }
}
