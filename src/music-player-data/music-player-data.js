import { SongNode, Playlist } from "../playlist-data/playlist-data.js";
import { Song } from "../song-data/song-data.js";
import { Lib } from "../song-data/song-library.js";

// MusicPlayer manages playback and tracks current playlist + song
export class MusicPlayer {
  constructor() {
    this.currentPlaylist = null;
    this.currentNode = null;
    this.audio = new Audio();
    this.audio.preload = "metadata";
    this.keys = "PLAYBACK_KEYS";
    this.playbackOrder = null;
    this.shuffleHead = null;
    this.shuffleTail = null;
    this.isPlaying = false;
    this.isShuffled = false;
    this.loop = "off";
    this.isQueue = false;
    this.isRestoringPlayback = false;
    this.queue = []; //queue carries between playlists
    this.queuePrev = null; //the last normal song played beforre queue, it changes everytime a song that isnt a queue song is selected or played
  }

  // save and restore playback
  save() {
    const save = {
      listId: this.currentPlaylist ? this.currentPlaylist.id : 100,
      songPos: this.currentPlaylist
        ? this.currentPlaylist.posOf(this.currentNode)
        : -1,
      time: this.audio.currentTime,
      loop: this.loop,
      isShuffled: this.isShuffled,
    };
    localStorage.setItem(this.keys, JSON.stringify(save));
  }

  restore() {
    const save = localStorage.getItem(this.keys);
    if (!save) return -1;
    const res = JSON.parse(save);
    const playlist =
      Playlist.myPlaylists.get(res.listId ?? 100) ?? Playlist.favorites;

    const loopModes = ["off", "all", "one"];
    this.setLoopMode(loopModes.includes(res.loop) ? res.loop : "off");
    // Restore the saved position in normal playlist order before rebuilding shuffle.
    this.isShuffled = false;
    this.isRestoringPlayback = true;
    try {
      this.selectPlaylist(playlist);
      if (playlist.size > 0) {
        const index = res.songPos;
        const node =
          Number.isInteger(index) && index >= 0
            ? this.playbackOrder[index]
            : null;

        if (node) this.selectSong(node);
      }

      this.isShuffled = res.isShuffled === true;
      if (this.isShuffled) this.shufflePlaylist();

      this.audio.currentTime = Number.isFinite(res.time) ? res.time : 0;
    } finally {
      this.isRestoringPlayback = false;
    }
  }

  // playback controls ↓

  // take a callback when playlist removes a song or playlist
  //   helper
  connectPlaylist(playlist) {
    playlist.onPlaylistRemoved = (removedPlaylist) =>
      this.onPlaylistRemoved(removedPlaylist);

    playlist.onSongRemoved = (removedNode) => this.onSongRemoved(removedNode);
  }

  onPlaylistRemoved(playlist) {
    if (this.currentPlaylist !== playlist) return;
    this.currentPlaylist = null;
    this.isPlaying = false;
    this.currentNode = null;
    this.queuePrev = null;
    this.playbackOrder = [];
    this.shuffleHead = null;
    this.shuffleTail = null;
    this.updateSrc();
    this.audio.pause();
  }

  onSongRemoved(node) {
    //  repairs shuffle connections
    if (this.isShuffled) {
      const prev = node.prevShuffled;
      const next = node.nextShuffled;

      if (this.shuffleHead === node) this.shuffleHead = next;
      if (this.shuffleTail === node) this.shuffleTail = prev;

      if (prev) prev.nextShuffled = next;
      if (next) next.prevShuffled = prev;
    }

    // if the node was queuePrev
    if (this.queuePrev === node) {
      if (this.isShuffled) {
        this.queuePrev =
          this.queuePrev.prevShuffled ?? this.queuePrev.nextShuffled;
      } else {
        this.queuePrev = this.queuePrev.prev ?? this.queuePrev.next;
      }
    }

    // if the node was the currentNode
    if (this.currentNode === node) {
      if (this.isShuffled) {
        this.currentNode =
          this.currentNode.nextShuffled ?? this.currentNode.prevShuffled;
      } else {
        this.currentNode = this.currentNode.next ?? this.currentNode.prev;
      }
      this.updateSrc();
      this.isPlaying = false;
      this.audio.pause();
    }

    // fix playlist playback order
    if (node.playlist === this.currentPlaylist) {
      this.playbackOrder = this.playbackOrder.filter((a) => a !== node);
    }
  }

  // helper
  updateSrc() {
    if (this.currentNode) {
      this.audio.src = this.currentNode.song.audioSrc;
    } else {
      this.audio.src = "";
    }
    if (this.isPlaying && !!this.currentNode) {
      this.audio.play().catch((err) => {
        if (err.code === 20) {
          console.warn("Aborted previous play");
        } else {
          console.error("Could not play", err);
        }
      });
    }
    if (!this.isRestoringPlayback) this.save();
  }

  // play/pause, selectSong, nextSong, and prevSong methods
  play() {
    if (!this.currentNode) {
      const firstNode = this.playbackOrder?.[0];
      if (!firstNode) return;

      this.currentNode = firstNode;
      this.queuePrev = firstNode;
      this.updateSrc();
    }
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      this.audio
        .play()
        .then(() => (this.isPlaying = true))
        .catch((err) => console.error("Could not play", err));
    }
  }

  skip() {
    if (!this.currentPlaylist || !this.currentNode) return;

    if (this.isQueue) {
      this.currentNode = this.nextInQueue();
      if (!this.currentNode) {
        this.isQueue = false;
        this.currentNode = this.queuePrev;
        if (this.isShuffled) this.currentNode = this.currentNode.nextShuffled;
        else this.currentNode = this.currentNode.next;
      }
    } else if (this.isShuffled) {
      this.currentNode = this.currentNode.nextShuffled;
      this.queuePrev = this.currentNode;
    } else {
      this.currentNode = this.currentNode.next;
      this.queuePrev = this.currentNode;
    }

    if (this.loop === "one") this.setLoopMode("all");
    if (!this.currentNode) {
      if (this.loop === "all") {
        if (!this.isShuffled) this.currentNode = this.currentPlaylist.head;
        else this.currentNode = this.shuffleHead;
      }
    }
    if (!this.currentNode) this.isPlaying = false;
    this.updateSrc();
    if (!this.isPlaying && this.currentNode) this.play();
  }

  prev() {
    if (!this.currentPlaylist || !this.currentNode) return;

    if (this.audio.currentTime > 2) {
      this.audio.currentTime = 0;
      return;
    }

    if (!this.currentNode.playlist) {
      this.currentNode = this.queuePrev;
    } else if (this.isShuffled) {
      this.currentNode = this.currentNode.prevShuffled;
    } else {
      this.currentNode = this.currentNode.prev;
    }

    if (this.loop === "one") this.setLoopMode("all");
    if (!this.currentNode) {
      if (this.loop === "all") {
        this.currentNode = !this.isShuffled
          ? this.currentPlaylist.tail
          : this.shuffleTail;
      }
    }
    this.queuePrev = this.currentNode;

    if (!this.currentNode) this.isPlaying = false;
    this.updateSrc();
    if (!this.isPlaying && this.currentNode) this.play();
  }
  //   playlist select controls
  selectPlaylist(playlist) {
    if (!(playlist instanceof Playlist)) {
      throw new TypeError("selectPlaylist expects a Playlist instance");
    }
    if (this.currentPlaylist) {
      this.currentPlaylist.iterate((node) => {
        node.prevShuffled = null;
        node.nextShuffled = null;
      });
    }
    this.currentPlaylist = playlist;
    this.currentNode = playlist.head;

    if (!this.isShuffled) {
      this.playbackOrder = this.currentPlaylist.toArray();
    } else {
      this.shufflePlaylist();
    }
    this.queuePrev = this.currentNode;
    this.connectPlaylist(playlist);
    this.updateSrc();
  }

  selectSong(node) {
    if (!(node instanceof SongNode)) {
      throw new TypeError("selectSong() expects a SongNode");
    }

    if (this.currentPlaylist && this.currentPlaylist !== node.playlist) {
      this.currentPlaylist.iterate((node) => {
        node.prevShuffled = null;
        node.nextShuffled = null;
      });
    }

    this.currentNode = node;
    this.currentPlaylist = node.playlist;
    if (this.isShuffled) this.shufflePlaylist();
    else this.playbackOrder = this.currentPlaylist.toArray();

    this.queuePrev = this.currentNode;
    this.connectPlaylist(node.playlist);
    this.updateSrc();
  }

  // Looping methods
  setLoopMode(mode) {
    const modes = ["off", "one", "all"];
    if (!modes.includes(mode)) {
      throw new TypeError("Mode not supported");
    }
    if (mode === "off") {
      this.audio.loop = false;
      this.loop = "off";
    } else if (mode === "one") {
      this.audio.loop = true;
      this.loop = "one";
    } else if (mode === "all") {
      this.audio.loop = false;
      this.loop = "all";
    }
  }

  //   shuffle
  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    this.shufflePlaylist();
  }

  shufflePlaylist() {
    if (!this.currentPlaylist) return;

    this.currentPlaylist.iterate((node) => {
      node.nextShuffled = null;
      node.prevShuffled = null;
    });
    this.shuffleHead = null;
    this.shuffleTail = null;

    if (this.currentPlaylist.size === 0) return [];

    if (!this.isShuffled) {
      this.playbackOrder = this.currentPlaylist.toArray();
      return this.currentPlaylist.toArray();
    }

    // Keep the current song playing; shuffle the rest.
    const nodes = this.currentPlaylist.toArray();
    for (let i = nodes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
    }
    if (this.currentNode) {
      const pos = nodes.indexOf(this.currentNode);
      nodes.splice(pos, 1);
      nodes.unshift(this.currentNode);
    }

    this.shuffleHead = nodes.at(0);
    this.shuffleTail = nodes.at(-1);

    //reconnect shuffled playlist
    nodes.forEach((node, i, arr) => {
      node.prevShuffled = arr[i - 1] ?? null;
      node.nextShuffled = arr[i + 1] ?? null;
    });

    this.playbackOrder = nodes;
  }

  //queue
  addToQueue(song) {
    if (!(song instanceof Song)) {
      throw new TypeError("addToQueue() expects a Song instance");
    }
    // Queue nodes hold their own song reference; they aren't Library entries.
    const node = new SongNode(song, { addToLibrary: false });
    this.queue.push(node);
    this.isQueue = true;
    return node;
  }

  removeFromQueue(node) {
    if (!this.queue.includes(node)) return -1;
    this.queue = this.queue.filter((song) => song !== node);
    this.releaseQueueSong(node);
    return node;
  }

  clearQueue() {
    this.queue.forEach((node) => this.releaseQueueSong(node));
    this.queue = [];
    if (!this.currentNode || this.currentNode.playlist) this.isQueue = false;
  }

  nextInQueue() {
    const result = this.queue.shift();
    this.releaseQueueSong(result);
    return result ?? null;
  }

  // Queue-only search results shouldn't become permanent Library entries.
  releaseQueueSong(node) {
    const song = node?.song;
    if (!song || Lib.trackedSongs.has(song.id)) return;
    if (Lib.del(song)) Lib.save();
  }
}
