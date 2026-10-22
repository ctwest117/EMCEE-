import { Playlist } from "./playlist-data/playlist-data.js";
import { Lib } from "./song-data/song-library.js";
import { syncMiniPlayer } from "./mini-player/mini-player-data.js";

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
            .querySelectorAll('[data-action="song-options"][aria-expanded="true"]')
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
          const node = player.currentNode;
          if (!node) break;

          if (node.song.isFavorite) {
            Playlist.removeFromFavorites(node.song);
          } else {
            Playlist.addToFavorites(node.song);
          }
          syncMiniPlayer(player);
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

        default:
          break;
      }
    } else {
      closeSongOptions();
    }
  });
}
