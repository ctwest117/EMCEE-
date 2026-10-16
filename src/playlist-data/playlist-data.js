import { Song } from "./song-data.js";

// holds song inside playlist
export class SongNode {
  constructor(song) {
    this.song = song;
    this.orderAdded = 0;
    this.playlist = null; //for when a song is selected in different playlist. will update when added to playlist
    this.next = null;
    this.prev = null;
  }
}

//  playlist class builds and handles playlists
export class Playlist {
  static myPlaylists = new Map();

  //   adding and removing playlists to the manager array
  static findPlaylist(nameOrId) {
    if (Playlist.myPlaylists.get(nameOrId)) {
      return [Playlist.myPlaylists.get(nameOrId)];
    } else {
      const found = [...Playlist.myPlaylists.values()].filter(
        (playlist) => playlist.name === nameOrId,
      );
      return found;
    }
  }

  static addPlaylist(playlist) {
    Playlist.myPlaylists.set(playlist.id, playlist);
  }

  static removePlaylist(playlist) {
    if (!playlist || playlist === Playlist.favorites) return false;

    const removed = Playlist.myPlaylists.delete(playlist.id);
    if (!removed) return false;

    playlist.onPlaylistRemoved?.(playlist);
    return true;
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

    node.orderAdded = this.nextOrder++;
    node.playlist = this;
    node.prev = null;
    node.next = null;

    if (this.sortMethod === "none") {
      this.appendNode(node);
      this.size++;
      this.getNewDuration();
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

    const song = node.song;
    node.song = null;
    node.playlist = null;
    node.next = null;
    node.prev = null;
    this.size--;
    this.getNewDuration();
    return song;
  }

  removeAll(fullReset = true) {
    if (fullReset) {
      this.iterate((node) => {
        this.onSongRemoved?.(node);
      });
    }
    this.head = null;
    this.tail = null;
    this.size = 0;
    if (fullReset) {
      this.nextOrder = 0;
    }
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
    if (!sortMethods.includes(method)) {
      throw new TypeError("Method not supported");
    }
    this.sortMethod = method;
    if (method === "none") return;

    const sortedNodes = this.toArray().sort((a, b) => this.compareNodes(a, b));
    this.toPlaylist(sortedNodes);
    this.head.prev = null;
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
    return node;
  }

  // favorites playlist
  static favorites = new Playlist("Favorites");
}
