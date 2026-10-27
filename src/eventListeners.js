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
import { createPlaylistForm } from "./page-rendering/playlist-creation-form.js";

// These menus are shared elements, so closing them also resets their triggers.
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

// Rebuild the queue view from the player's upcoming queue entries.
function renderQueue(details, player) {
  const list = details.querySelector("[data-queue-list]");
  const emptyMessage = details.querySelector("[data-queue-empty]");
  if (!list || !emptyMessage) return;

  list.replaceChildren();
  emptyMessage.classList.toggle("hidden", player.queue.length > 0);

  player.queue.forEach((queueNode, index) => {
    const item = document.createElement("li");
    item.className =
      "flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-white/5";

    const title = document.createElement("span");
    title.className = "min-w-0 flex-1 truncate";
    title.textContent = queueNode.song.title;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.dataset.action = "queue-remove";
    deleteButton.dataset.queueIndex = String(index);
    deleteButton.className =
      "shrink-0 rounded-md px-2 py-1 text-xs text-rose-300 hover:bg-rose-950/60 hover:text-rose-200";
    deleteButton.setAttribute(
      "aria-label",
      `Remove ${queueNode.song.title} from queue`,
    );
    deleteButton.textContent = "Delete";

    item.append(title, deleteButton);
    list.append(item);
  });
}

// Show every playlist, disabling the ones that already contain this song.
function renderPlaylistPicker(details, song) {
  const list = details.querySelector("[data-playlist-picker-list]");
  const formContainer = details.querySelector("[data-playlist-create-form]");
  if (!list || !formContainer) return;

  list.replaceChildren();
  for (const playlist of Playlist.myPlaylists.values()) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const alreadyContainsSong = playlist.findById(song.id) !== -1;

    button.type = "button";
    button.dataset.action = "add-song-to-playlist";
    button.dataset.playId = String(playlist.id);
    button.disabled = alreadyContainsSong;
    button.className = alreadyContainsSong
      ? "w-full cursor-not-allowed rounded-lg px-3 py-2 text-left text-sm text-slate-600"
      : "w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10";
    button.textContent = playlist.name;
    item.append(button);
    list.append(item);
  }

  formContainer.replaceChildren();
  const createForm = createPlaylistForm(
    (newPlaylist) => {
      newPlaylist.addSong(song);
      closeSongOptions();
    },
    { inline: true },
  );
  formContainer.append(createForm);
}

function keepMenuInViewport(details) {
  const panel = details.querySelector("[data-options-panel]");
  if (!panel) return;

  const edge = 8;
  const bounds = panel.getBoundingClientRect();
  const maxLeft = Math.max(edge, window.innerWidth - bounds.width - edge);
  const maxTop = Math.max(edge, window.innerHeight - bounds.height - edge);
  panel.style.left = `${Math.min(Math.max(edge, bounds.left), maxLeft)}px`;
  panel.style.top = `${Math.min(Math.max(edge, bounds.top), maxTop)}px`;
}

// Use one delegated click listener so actions also work on newly rendered buttons.
export function setupEventListeners(player) {
  // Close floating menus when the page or a content container scrolls.
  window.addEventListener(
    "scroll",
    (event) => {
      // Safari may scroll the page to reveal a focused field above its keyboard.
      const activeField = document.activeElement;
      if (
        activeField instanceof Element &&
        activeField.matches("input, textarea, select") &&
        activeField.closest("#song-options-details, #playlist-options-details")
      ) {
        return;
      }

      if (
        event.target instanceof Element &&
        event.target.closest("#song-options-details, #playlist-options-details")
      ) {
        return;
      }
      closeOptionsMenus();
    },
    true,
  );

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

      // Each action is named in the button's data-action attribute.
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
          const menuPanel = songDetails.querySelector("[data-options-panel]");
          menuPanel.querySelectorAll(":scope > button").forEach((item) => {
            item.hidden = false;
          });
          const queueView = menuPanel.querySelector("[data-queue-view]");
          if (queueView) queueView.hidden = true;
          const playlistPicker = menuPanel.querySelector(
            "[data-playlist-picker]",
          );
          if (playlistPicker) playlistPicker.hidden = true;

          // Keep the Song object itself: temporary search results may not be in Lib.
          const selectedRow = button.closest('li[data-action="select-song"]');
          const selectedSongId = Number(button.dataset.songId);
          songDetails.selectedSong =
            selectedRow?.songNode?.song ??
            Lib.songs.get(selectedSongId) ??
            (player.currentNode?.song?.id === selectedSongId
              ? player.currentNode.song
              : null);
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
          const renameForm = playlistDetails.querySelector(
            "[data-playlist-rename-form]",
          );
          if (renameForm) {
            renameForm.dataset.playId = playlistDetails.dataset.playId;
            renameForm.classList.add("hidden");
            renameForm.querySelector("[data-rename-error]").textContent = "";
            renameForm.querySelector("input").removeAttribute("aria-invalid");
          }
          const coverForm = playlistDetails.querySelector(
            "[data-playlist-cover-form]",
          );
          if (coverForm) {
            coverForm.dataset.playId = playlistDetails.dataset.playId;
            coverForm.classList.add("hidden");
            coverForm.querySelector("[data-cover-error]").textContent = "";
            coverForm.querySelector("input").removeAttribute("aria-invalid");
          }
          playlistDetails
            .querySelectorAll("[data-playlist-option]")
            .forEach((option) => option.classList.remove("hidden"));
          const renameButton = playlistDetails.querySelector(
            '[data-action="rename-playlist"]',
          );
          if (renameButton) {
            const isFavorites =
              Number(playlistDetails.dataset.playId) === Playlist.favorites.id;
            renameButton.hidden = isFavorites;
            renameButton.classList.toggle("hidden", isFavorites);
          }
          button.setAttribute("aria-expanded", "true");
          openMenuAtTrigger(playlistDetails, button);
          break;
        }

        // Playlist menu actions use the playlist ID stored on their menu buttons.
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

        case "rename-playlist": {
          const playlist = Playlist.myPlaylists.get(
            Number(button.dataset.playId),
          );
          if (!playlist || playlist === Playlist.favorites) break;

          const panel = playlistDetails?.querySelector("[data-options-panel]");
          const renameForm = playlistDetails?.querySelector(
            "[data-playlist-rename-form]",
          );
          if (!panel || !renameForm) break;

          panel.querySelectorAll("[data-playlist-option]").forEach((option) => {
            option.classList.add("hidden");
          });
          renameForm.classList.remove("hidden");
          const input = renameForm.querySelector("input");
          input.value = playlist.name;
          renameForm.querySelector("[data-rename-error]").textContent = "";
          input.focus();
          input.select();
          break;
        }

        case "change-playlist-cover": {
          const playlist = Playlist.myPlaylists.get(
            Number(button.dataset.playId),
          );
          const panel = playlistDetails?.querySelector("[data-options-panel]");
          const coverForm = playlistDetails?.querySelector(
            "[data-playlist-cover-form]",
          );
          if (!playlist || !panel || !coverForm) break;

          panel.querySelectorAll("[data-playlist-option]").forEach((option) => {
            option.classList.add("hidden");
          });
          coverForm.classList.remove("hidden");
          const input = coverForm.querySelector("input");
          input.value = playlist.cover === "none" ? "" : playlist.cover;
          coverForm.querySelector("[data-cover-error]").textContent = "";
          input.focus();
          input.select();
          break;
        }

        case "cancel-playlist-cover": {
          const panel = playlistDetails?.querySelector("[data-options-panel]");
          const coverForm = playlistDetails?.querySelector(
            "[data-playlist-cover-form]",
          );
          coverForm?.classList.add("hidden");
          panel
            ?.querySelectorAll("[data-playlist-option]")
            .forEach((option) => {
              option.classList.remove("hidden");
            });
          closePlaylistOptions();
          break;
        }

        case "cancel-playlist-rename": {
          const panel = playlistDetails?.querySelector("[data-options-panel]");
          const renameForm = playlistDetails?.querySelector(
            "[data-playlist-rename-form]",
          );
          renameForm?.classList.add("hidden");
          panel
            ?.querySelectorAll("[data-playlist-option]")
            .forEach((option) => {
              option.classList.remove("hidden");
            });
          closePlaylistOptions();
          break;
        }

        case "play-pause":
          // Keep the player controls and mini-player display in sync.
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

          try {
            if (player.currentPlaylist !== playlist) {
              player.selectPlaylist(playlist);
            }

            // Recover a stopped player at the end of a playlist.
            if (!player.currentNode) {
              player.isPlaying = false;
              player.currentNode = player.playbackOrder?.[0] ?? playlist.head;
              player.queuePrev = player.currentNode;
              player.updateSrc();
            }

            // This button means Play, so don't toggle a playing playlist to pause.
            if (!player.isPlaying) player.play();
          } catch (error) {
            console.error("Could not start playlist playback", error);
          }

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
            ? (Lib.songs.get(Number(button.dataset.songId)) ??
              button.closest('li[data-action="select-song"]')?.songNode?.song)
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
          const song = songDetails?.selectedSong ?? Lib.songs.get(songId);
          if (song) player.addToQueue(song);
          closeSongOptions();
          break;
        }

        case "queueView": {
          const menuPanel = songDetails?.querySelector("[data-options-panel]");
          const queueView = menuPanel?.querySelector("[data-queue-view]");
          if (!menuPanel || !queueView) break;

          menuPanel.querySelectorAll(":scope > button").forEach((item) => {
            item.hidden = true;
          });
          queueView.hidden = false;
          renderQueue(songDetails, player);
          keepMenuInViewport(songDetails);
          break;
        }

        case "add-to-playlist": {
          const menuPanel = songDetails?.querySelector("[data-options-panel]");
          const picker = menuPanel?.querySelector("[data-playlist-picker]");
          const song = songDetails?.selectedSong;
          if (!menuPanel || !picker || !song) break;

          menuPanel.querySelectorAll(":scope > button").forEach((item) => {
            item.hidden = true;
          });
          const queueView = menuPanel.querySelector("[data-queue-view]");
          if (queueView) queueView.hidden = true;
          picker.hidden = false;
          renderPlaylistPicker(songDetails, song);
          keepMenuInViewport(songDetails);
          break;
        }

        case "playlist-picker-back": {
          const menuPanel = songDetails?.querySelector("[data-options-panel]");
          const picker = menuPanel?.querySelector("[data-playlist-picker]");
          if (!menuPanel || !picker) break;

          picker.hidden = true;
          menuPanel.querySelectorAll(":scope > button").forEach((item) => {
            item.hidden = false;
          });
          const removeButton = menuPanel.querySelector(
            '[data-action="remove"]',
          );
          if (removeButton?.classList.contains("hidden")) {
            removeButton.hidden = true;
          }
          break;
        }

        case "playlist-picker-new": {
          const createForm = songDetails?.querySelector(
            "[data-playlist-create-form] form",
          );
          if (!createForm) break;

          createForm.hidden = !createForm.hidden;
          if (!createForm.hidden) {
            createForm.querySelector("input").focus();
            keepMenuInViewport(songDetails);
          }
          break;
        }

        case "add-song-to-playlist": {
          const playlist = Playlist.myPlaylists.get(
            Number(button.dataset.playId),
          );
          const song = songDetails?.selectedSong;
          if (playlist && song && playlist.findById(song.id) === -1) {
            if (playlist === Playlist.favorites) {
              Playlist.addToFavorites(song);
            } else {
              playlist.addSong(song);
            }
            syncMiniPlayer(player);
            refreshRenderedSongs();
            closeSongOptions();
          }
          break;
        }

        case "queue-view-back": {
          const menuPanel = songDetails?.querySelector("[data-options-panel]");
          const queueView = menuPanel?.querySelector("[data-queue-view]");
          if (!menuPanel || !queueView) break;

          queueView.hidden = true;
          menuPanel.querySelectorAll(":scope > button").forEach((item) => {
            item.hidden = false;
          });
          break;
        }

        case "queue-remove": {
          const queueNode = player.queue[Number(button.dataset.queueIndex)];
          if (queueNode) player.removeFromQueue(queueNode);
          renderQueue(songDetails, player);
          break;
        }

        case "remove": {
          const playlist = Playlist.myPlaylists.get(
            Number(songDetails?.dataset.playId),
          );
          const song = songDetails?.selectedSong;
          if (!playlist || !song || playlist.isSearchResults) {
            closeSongOptions();
            break;
          }

          let removedSong;
          if (playlist === Playlist.favorites) {
            removedSong = Playlist.removeFromFavorites(song);
          } else {
            const node = playlist.findById(song.id);
            if (node !== -1) removedSong = playlist.removeSong(node);
          }

          if (removedSong) {
            syncMiniPlayer(player);
            refreshRenderedSongs();
          }
          closeSongOptions();
          break;
        }

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
    } else if (
      !document
        .querySelector("#song-options-details")
        ?.contains(event.target) &&
      !document
        .querySelector("#playlist-options-details")
        ?.contains(event.target)
    ) {
      closeOptionsMenus();
    }

    const songRow = event.target.closest('li[data-action="select-song"]');
    if (songRow && !button) {
      // Song rows carry their SongNode reference, so playback uses the rendered item.
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

  // Handle rename and cover forms separately from clicks so Enter submits too.
  document.addEventListener("submit", (event) => {
    const form = event.target.closest(
      "[data-playlist-rename-form], [data-playlist-cover-form]",
    );
    if (!form) return;
    event.preventDefault();

    const playlist = Playlist.myPlaylists.get(Number(form.dataset.playId));
    if (!playlist) return;

    if (form.matches("[data-playlist-cover-form]")) {
      const input = form.querySelector("input");
      const error = form.querySelector("[data-cover-error]");
      const coverUrl = input.value.trim();
      if (!coverUrl) {
        closePlaylistOptions();
        return;
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(coverUrl);
      } catch {
        error.textContent = "Enter a valid image URL.";
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        error.textContent = "Use an HTTP or HTTPS image URL.";
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }

      playlist.cover = parsedUrl.href;
      Playlist.save();
      closePlaylistOptions();
      if (document.querySelector("#song-search")) {
        renderPlaylist(playlist, player);
      } else {
        renderHome(player);
      }
      return;
    }

    // A blank name cancels the rename; duplicate names are rejected case-insensitively.
    if (playlist === Playlist.favorites) return;

    const input = form.querySelector("input");
    const error = form.querySelector("[data-rename-error]");
    const newName = input.value.trim();
    if (!newName) {
      closePlaylistOptions();
      return;
    }

    const duplicate = [...Playlist.myPlaylists.values()].some(
      (candidate) =>
        candidate !== playlist &&
        candidate.name.trim().toLowerCase() === newName.toLowerCase(),
    );
    if (duplicate) {
      error.textContent = "A playlist with that name already exists.";
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }

    playlist.name = newName;
    Playlist.save();
    closePlaylistOptions();
    if (document.querySelector("#song-search")) {
      renderPlaylist(playlist, player);
    } else {
      renderHome(player);
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-playlist-rename-form] input")) {
      event.target.removeAttribute("aria-invalid");
      event.target
        .closest("[data-playlist-rename-form]")
        .querySelector("[data-rename-error]").textContent = "";
    }
    if (event.target.matches("[data-playlist-cover-form] input")) {
      event.target.removeAttribute("aria-invalid");
      event.target
        .closest("[data-playlist-cover-form]")
        .querySelector("[data-cover-error]").textContent = "";
    }
  });
}
