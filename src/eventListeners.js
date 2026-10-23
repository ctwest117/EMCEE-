import { Playlist } from "./playlist-data/playlist-data.js";
import { Lib } from "./song-data/song-library.js";
import { syncMiniPlayer } from "./mini-player/mini-player-data.js";
import { refreshRenderedSongs } from "./page-rendering/list-render.js";

function closeSongOptions() {
  const details = document.querySelector("#song-options-details");
  if (!details) return;

  details.open = false;
  document
    .querySelectorAll('[data-action="song-options"][aria-expanded="true"]')
    .forEach((button) => button.setAttribute("aria-expanded", "false"));
}

// One delegated click handler serves buttons rendered now or added later.
export function setupEventListeners(player) {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (button) {
      const details = document.querySelector("#song-options-details");
      const isMenuButton = details?.contains(button);
      if (button.dataset.action !== "song-options" && !isMenuButton) {
        closeSongOptions();
      }

      switch (button.dataset.action) {
        case "song-options": {
          if (!details) break;

          details.dataset.songId = button.dataset.songId ?? "";
          details.dataset.playId = button.dataset.playId ?? "";
          details.open = !details.open;
          document
            .querySelectorAll(
              '[data-action="song-options"][aria-expanded="true"]',
            )
            .forEach((openButton) =>
              openButton.setAttribute("aria-expanded", "false"),
            );
          button.setAttribute("aria-expanded", String(details.open));
          break;
        }

        case "play-pause":
          player.play();
          syncMiniPlayer(player);
          break;

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
            ? Lib.songs.get(Number(button.dataset.songId))
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
          const songId = Number(details?.dataset.songId);
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
        case "search":
          // Header navigation controls are placeholders for now.
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
      closeSongOptions();
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
  });
}
