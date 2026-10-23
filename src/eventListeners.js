import { Playlist } from "./playlist-data/playlist-data.js";
import { Lib } from "./song-data/song-library.js";
import { syncMiniPlayer } from "./mini-player/mini-player-data.js";
import {
  refreshRenderedSongs,
  renderSongs,
} from "./page-rendering/list-render.js";
import { renderHome } from "./page-rendering/home-controls.js";
import { renderPlaylist } from "./page-rendering/playlist-controls.js";
import { renderSearch } from "./page-rendering/search-controls.js";

function closeSongOptions() {
  const details = document.querySelector("#song-options-details");
  if (!details) return;

  details.open = false;
  document
    .querySelectorAll('[data-action="song-options"][aria-expanded="true"]')
    .forEach((button) => button.setAttribute("aria-expanded", "false"));
}

function closePlaylistOptions() {
  const details = document.querySelector("#playlist-options-details");
  if (!details) return;

  details.open = false;
  document
    .querySelectorAll('[data-action="playlist-options"][aria-expanded="true"]')
    .forEach((button) => button.setAttribute("aria-expanded", "false"));
}

function closeOptionsMenus() {
  closeSongOptions();
  closePlaylistOptions();
}

// Place a shared menu beside its trigger, keeping it within the viewport.
function openMenuAtTrigger(details, trigger) {
  const panel = details.querySelector("[data-options-panel]");
  if (!panel) return;

  details.open = true;
  panel.style.left = "0px";
  panel.style.top = "0px";

  const anchor = trigger.getBoundingClientRect();
  const { width, height } = panel.getBoundingClientRect();
  const edge = 8;
  const gap = 6;
  const maxLeft = Math.max(edge, window.innerWidth - width - edge);
  const left = Math.min(Math.max(edge, anchor.right - width), maxLeft);
  const fitsBelow = anchor.bottom + gap + height <= window.innerHeight - edge;
  const top = fitsBelow
    ? anchor.bottom + gap
    : Math.max(edge, anchor.top - height - gap);

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

// One delegated click handler serves buttons rendered now or added later.
export function setupEventListeners(player) {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (button) {
      const songDetails = document.querySelector("#song-options-details");
      const playlistDetails = document.querySelector(
        "#playlist-options-details",
      );
      const isMenuButton =
        songDetails?.contains(button) || playlistDetails?.contains(button);
      const isMenuTrigger = ["song-options", "playlist-options"].includes(
        button.dataset.action,
      );
      if (!isMenuTrigger && !isMenuButton) {
        closeOptionsMenus();
      }

      switch (button.dataset.action) {
        case "song-options": {
          if (!songDetails) break;

          const shouldOpen = !(
            songDetails.open &&
            songDetails.dataset.songId === (button.dataset.songId ?? "") &&
            songDetails.dataset.playId === (button.dataset.playId ?? "")
          );
          closeOptionsMenus();
          if (!shouldOpen) break;

          songDetails.dataset.songId = button.dataset.songId ?? "";
          songDetails.dataset.playId = button.dataset.playId ?? "";
          // Search results are not a playlist the user can remove a song from.
          const removeButton = songDetails.querySelector(
            '[data-action="remove"]',
          );
          if (removeButton) {
            const isSearchResults = button.dataset.searchResults === "true";
            removeButton.hidden = isSearchResults;
            removeButton.classList.toggle("hidden", isSearchResults);
          }
          button.setAttribute("aria-expanded", "true");
          openMenuAtTrigger(songDetails, button);
          break;
        }

        case "playlist-options": {
          if (!playlistDetails) break;

          const shouldOpen = !(
            playlistDetails.open &&
            playlistDetails.dataset.playId === (button.dataset.playId ?? "")
          );
          closeOptionsMenus();
          if (!shouldOpen) break;

          playlistDetails.dataset.playId = button.dataset.playId ?? "";
          playlistDetails
            .querySelectorAll("button[data-action]")
            .forEach((menuButton) => {
              menuButton.dataset.playId = playlistDetails.dataset.playId;
            });
          button.setAttribute("aria-expanded", "true");
          openMenuAtTrigger(playlistDetails, button);
          break;
        }

        case "delete-playlist": {
          const playlist = Playlist.myPlaylists.get(
            Number(button.dataset.playId),
          );
          closePlaylistOptions();

          if (playlist && Playlist.removePlaylist(playlist)) {
            syncMiniPlayer(player);
            renderHome(player);
          }
          break;
        }

        case "clear-playlist": {
          const playlist = Playlist.myPlaylists.get(
            Number(button.dataset.playId),
          );
          closePlaylistOptions();
          if (!playlist) break;

          if (playlist === Playlist.favorites) {
            playlist.iterate((node) => {
              node.song.isFavorite = false;
            });
          }
          playlist.removeAll();
          syncMiniPlayer(player);

          if (document.querySelector("#song-container ul")) {
            renderPlaylist(playlist, player);
          } else {
            renderHome(player);
          }
          break;
        }

        case "sort-playlist": {
          const playlist = Playlist.myPlaylists.get(
            Number(button.dataset.playId),
          );
          if (playlist && button.dataset.sortMethod) {
            playlist.sortBy(button.dataset.sortMethod);
          }
          button.closest("details")?.removeAttribute("open");
          break;
        }

        case "rename-playlist":
          // Rename is not wired up yet.
          closePlaylistOptions();
          break;

        case "play-pause":
          player.play();
          syncMiniPlayer(player);
          break;

        case "toggle-loop": {
          const loopOrder = ["off", "all", "one"];
          const currentIndex = loopOrder.indexOf(player.loop);
          const nextMode = loopOrder[(currentIndex + 1) % loopOrder.length];
          player.setLoopMode(nextMode);
          syncMiniPlayer(player);
          break;
        }

        case "toggle-shuffle":
          player.toggleShuffle();
          syncMiniPlayer(player);
          break;

        case "play-playlist": {
          const playlist = Playlist.myPlaylists.get(
            Number(button.dataset.playId),
          );
          if (!playlist || playlist.size === 0) break;

          if (player.currentPlaylist.id !== playlist.id)
            player.selectPlaylist(playlist);
          // play() is a toggle, so call it only when playback is stopped.
          else player.play();

          syncMiniPlayer(player);
          break;
        }

        case "previous-track":
          player.prev();
          syncMiniPlayer(player);
          break;

        case "next-track":
          player.skip();
          syncMiniPlayer(player);
          break;

        case "toggle-favorite": {
          const song = button.dataset.songId
            ? Lib.songs.get(Number(button.dataset.songId)) ??
              button.closest('li[data-action="select-song"]')?.songNode?.song
            : player.currentNode?.song;
          if (!song) break;

          if (song.isFavorite) {
            Playlist.removeFromFavorites(song);
          } else {
            Playlist.addToFavorites(song);
          }
          syncMiniPlayer(player);
          refreshRenderedSongs();
          break;
        }

        case "queue": {
          const songId = Number(songDetails?.dataset.songId);
          const song = Lib.songs.get(songId);
          if (song) player.addToQueue(song);
          closeSongOptions();
          break;
        }

        case "queueView":
        case "add-to-playlist":
        case "remove":
          // These menu actions don't have behavior wired up yet.
          closeSongOptions();
          break;

        case "home":
          renderHome(player);
          break;
        case "search":
          renderSearch(player);
          break;

        case "scroll-top":
          document
            .querySelector("#app")
            ?.scrollTo({ top: 0, behavior: "smooth" });
          break;

        default:
          break;
      }
    } else {
      closeOptionsMenus();
    }

    const songRow = event.target.closest('li[data-action="select-song"]');
    if (songRow && !button) {
      const songNode = songRow.songNode;

      if (songNode) {
        player.selectSong(songNode);
        if (!player.isPlaying) player.play();
        syncMiniPlayer(player);
      }
    }

    const playlistCard = event.target.closest("article[data-play-id]");
    if (playlistCard && !button) {
      const playlist = Playlist.myPlaylists.get(
        Number(playlistCard.dataset.playId),
      );
      if (playlist) renderPlaylist(playlist, player);
    }
  });
}
