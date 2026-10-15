import { Song } from "./song-data.js";

// holds song inside playlist
export class SongNode {
  constructor(song) {
    this.song = song;
    this.nextOrder = null; //update with playlist.size when added to a playlist.
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
      if (found.length <= 0) return -1;
      return found;
    }
  }

  static addPlaylist(playlist) {
    Playlist.myPlaylists.set(playlist.id, playlist);
  }

  static removePlaylist(playlist) {
    if (playlist === Playlist.favorites) return;
    Playlist.myPlaylists.delete(playlist.id);
  }

  static nextId = 100;

  constructor(name, cover) {
    this.id = "playlist" + Playlist.nextId++;
    this.name = name;
    this.cover = cover;
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.nextOrder = 0;
    this.duration = 0;
    this.sortMethod = "default";
    this.onSongRemoved = null;

    Playlist.addPlaylist(this);
  }

  //   add or remove songs & nodes
  append(song) {
    if (!(song instanceof Song)) {
      throw new TypeError("append() expects a Song instance");
    }
    const node = new SongNode(song);
    this.appendNode(node);
  }

  addNode(node) {}

  appendNode(node) {
    if (!(node instanceof SongNode)) {
      throw new TypeError("appendNode() expects a SongNode instance");
    }

    node.next = null;
    node.prev = null;

    if (!this.head) this.head = node;
    if (this.tail) {
      node.prev = this.tail;
      this.tail.next = node;
    }
    this.tail = node;

    node.playlist = this;
    node.orderAdded = this.nextOrder;
    this.nextOrder++;
    this.size++;
  }

  removeSong(node) {
    if (!node) return;

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

    this.onSongRemoved?.(node);

    node.song = null;
    node.next = null;
    node.prev = null;
    this.size--;
    this.getNewDuration();
  }

  removeAll(a = true) {
    this.head = null;
    this.tail = null;
    this.size = 0;
    if (a) this.nextOrder = 0;
    this.duration = 0;
  }

  //   iterate through playlist nodes
  iterate(callback) {
    let current = this.head;
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
  }

  //   get duration
  getNewDuration() {
    let newDuration = 0;
    this.iterate((node) => (newDuration += node.song.duration));
    this.duration = newDuration;
  }

  //  sorting, finding & moving songs
  sortBy(method = "default") {
    const sortMethods = [
      "none",
      "default",
      "reverse",
      "alpha",
      "album",
      "artist",
    ];
    if (!sortMethods.some((sort) => sort === method)) {
      throw new TypeError("Method not supported");
    }
    switch (method) {
      case "none":
        break;
      case "default":
        const sortedNodes = this.toArray().sort(
          (a, b) => a.orderAdded - b.orderAdded,
        );
        this.toPlaylist(sortedNodes);
        this.sortMethod = method;
        break;
      case "reverse":
        const reversedNodes = this.toArray().sort(
          (a, b) => b.orderAdded - a.orderAdded,
        );
        this.toPlaylist(reversedNodes);
        break;
      case "alpha":
        const alphaNodes = this.toArray().sort((a, b) => {
          if (a.song.title < b.song.title) return -1;
          else if (a.song.title === b.song.title) {
            return a.orderAdded - b.orderAdded;
          } else return 1;
        });
        this.toPlaylist(alphaNodes);
        this.sortMethod = method;
        break;
      case "album":
        const albumNodes = this.toArray().sort((a, b) => {
          if (a.song.album === b.song.album) {
            return a.song.albumIndex - b.song.albumIndex;
          }
          if (a.song.album < b.song.album) return -1;
          return 1;
        });
        this.toPlaylist(albumNodes);
        this.sortMethod = method;
        break;
      case "artist":
        const artistNodes = this.toArray().sort((a, b) => {
          if (a.song.artist === b.song.artist) {
            if (a.song.album < b.song.album) return -1;
            else if (a.song.album > b.song.album) return 1;
            else return a.song.albumIndex - b.song.albumIndex;
          } else {
            if (a.song.artist < b.song.artist) return -1;
            return 1;
          }
        });
        this.toPlaylist(artistNodes);
        this.sortMethod = method;
        break;
    }
  }

  compareNodes(node1, node2) {}

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
      if (!found.some(node)) {
        if (node.song.title.toLowerCase().includes(str)) found.push(node);
        if (node.song.album.toLowerCase().includes(str)) found.push(node);
        if (node.song.artist.toLowerCase().includes(str)) found.push(node);
      }
    });
    return found;
  }

  posOf(songNode) {
    let current = this.head;
    for (let i = 0; i < this.size; i++) {
      if (current === songNode) return i;
      current = current.next;
    }
    return -1;
  }

  atPos(pos) {
    if (!Number.isInteger(pos) || pos < 0 || pos >= this.size) return -1;
    let current = this.head;
    for (let i = 0; i <= pos; i++) {
      if (i == pos) return current;
      current = current.next;
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
    return node;
  }

  // favorites playlist
  static favorites = new Playlist("Favorites");
}
