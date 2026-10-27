import { renderPlayerIcons } from "../assets/icons.js";
import {
  refreshRenderedSongs,
  syncRenderedSongState,
} from "../page-rendering/list-render.js";
import { syncRenderedPlaylists } from "../page-rendering/my-playlists-render.js";

let lastSyncedSongId = null;
let progressFrame = null;

// Convert audio time in seconds to the familiar minutes:seconds display.
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainder}`;
}

// Keep the slider, elapsed time, and total time in sync with the audio.
function updateProgress(player, updateTimeLabels = true) {
  const progress = document.querySelector("#progress");
  const currentTime = document.querySelector("#current-time");
  const duration = document.querySelector("#duration");
  if (!progress) return;

  const total = player.audio.duration;
  const canSeek = Number.isFinite(total) && total > 0;
  // A 0–1000 slider range gives smooth seeking without changing its max for
  // each song. CSS uses --progress to draw the colored part of the track.
  progress.disabled = !canSeek;
  progress.value = canSeek
    ? String(Math.round((player.audio.currentTime / total) * 1000))
    : "0";
  progress.style.setProperty(
    "--progress",
    `${canSeek ? (player.audio.currentTime / total) * 100 : 0}%`,
  );
  if (updateTimeLabels && currentTime && duration) {
    currentTime.textContent = formatTime(player.audio.currentTime);
    duration.textContent = formatTime(total);
  }
}

function animateProgress(player) {
  progressFrame = null;
  if (player.audio.paused || player.audio.ended) return;

  updateProgress(player, false);
  progressFrame = requestAnimationFrame(() => animateProgress(player));
}

function startProgressAnimation(player) {
  if (progressFrame === null) {
    progressFrame = requestAnimationFrame(() => animateProgress(player));
  }
}

function stopProgressAnimation() {
  if (progressFrame === null) return;

  cancelAnimationFrame(progressFrame);
  progressFrame = null;
}

// Copy the current player state into the visible labels and controls.
export function syncMiniPlayer(player) {
  const title = document.querySelector("#mini-song-title");
  const artist = document.querySelector("#mini-song-artist");
  const cover = document.querySelector("#mini-song-cover");
  const playPause = document.querySelector("#play-pause");
  const favBtn = document.querySelector("#toggle-favorite");
  const loopButton = document.querySelector("#toggle-loop");
  const shuffleButton = document.querySelector("#toggle-shuffle");
  const songOptionsButton = document.querySelector("#player-more");
  if (!title || !artist || !playPause) return;

  const song = player.currentNode?.song;
  title.textContent = song?.title ?? "Nothing playing";
  artist.textContent = song?.artist ?? "Choose a song to start listening";
  syncRenderedSongState(player);
  syncRenderedPlaylists(player);

  const songId = song?.id ?? null;
  if (songId !== lastSyncedSongId) {
    lastSyncedSongId = songId;
    refreshRenderedSongs();
  }

  if (cover) {
    if (song?.cover) cover.src = song.cover;
    else cover.removeAttribute("src");
    cover.alt = song ? `Album cover for ${song.album}` : "";
    cover.classList.toggle("md:block", Boolean(song?.cover));
  }

  if (songOptionsButton) {
    songOptionsButton.dataset.songId = song ? String(song.id) : "";
    songOptionsButton.dataset.playId = player.currentPlaylist
      ? String(player.currentPlaylist.id)
      : "";
    songOptionsButton.dataset.searchResults = String(
      Boolean(player.currentPlaylist?.isSearchResults),
    );
  }

  if (favBtn) {
    const isFavorite = Boolean(song?.isFavorite);

    favBtn.setAttribute("aria-pressed", String(isFavorite));
    favBtn.setAttribute(
      "aria-label",
      isFavorite ? "Remove from favorites" : "Add to favorites",
    );
    favBtn.title = isFavorite ? "Remove from favorites" : "Add to favorites";

    favBtn.classList.toggle("text-fuchsia-400", isFavorite);
    favBtn.classList.toggle("text-slate-400", !isFavorite);
    favBtn.querySelector("svg")?.classList.toggle("fill-current", isFavorite);
  }

  if (loopButton) {
    const loopModes = {
      off: { icon: "repeat-off", label: "Loop off" },
      all: { icon: "repeat", label: "Loop all" },
      one: { icon: "repeat-1", label: "Loop one" },
    };
    const mode = loopModes[player.loop] ?? loopModes.off;

    loopButton.setAttribute("aria-label", mode.label);
    loopButton.title = mode.label;
    loopButton.setAttribute("aria-pressed", String(player.loop !== "off"));
    loopButton.classList.toggle("text-cyan-300", player.loop !== "off");
    loopButton.classList.toggle("text-slate-400", player.loop === "off");

    if (loopButton.dataset.icon !== mode.icon) {
      loopButton.dataset.icon = mode.icon;
      loopButton.innerHTML = `<i data-lucide="${mode.icon}" aria-hidden="true"></i>`;
      renderPlayerIcons();
    }
  }

  if (shuffleButton) {
    const isShuffled = Boolean(player.isShuffled);
    shuffleButton.setAttribute("aria-pressed", String(isShuffled));
    shuffleButton.setAttribute(
      "aria-label",
      isShuffled ? "Turn shuffle off" : "Turn shuffle on",
    );
    shuffleButton.title = isShuffled ? "Turn shuffle off" : "Turn shuffle on";
    shuffleButton.classList.toggle("text-cyan-300", isShuffled);
    shuffleButton.classList.toggle("text-slate-400", !isShuffled);
  }

  const isPlaying = !player.audio.paused;
  const icon = isPlaying ? "pause" : "play";
  const label = isPlaying ? "Pause" : "Play";
  // Rebuild the play/pause icon only when its state changes, not on every
  // timeupdate event while the song is playing.
  if (playPause.dataset.icon !== icon) {
    playPause.dataset.icon = icon;
    playPause.setAttribute("aria-label", label);
    playPause.title = label;
    playPause.innerHTML = `<i data-lucide="${icon}" aria-hidden="true"></i>`;
    renderPlayerIcons();
  }

  updateProgress(player);
}

// Connect the rendered controls and audio events to this MusicPlayer instance.
export function miniPlayerListeners(player) {
  const progress = document.querySelector("#progress");
  if (!progress) return;

  // Persist playback progress every few seconds, and exactly when it pauses
  // or the user finishes seeking. Avoid writing to storage on every timeupdate.
  let lastSavedTime = player.audio.currentTime;
  player.audio.addEventListener("timeupdate", () => {
    const currentTime = player.audio.currentTime;
    if (
      !player.isRestoringPlayback &&
      Math.abs(currentTime - lastSavedTime) >= 5
    ) {
      player.save();
      lastSavedTime = currentTime;
    }
  });
  player.audio.addEventListener("pause", () => {
    if (!player.isRestoringPlayback) player.save();
  });
  progress.addEventListener("change", () => {
    if (!player.isRestoringPlayback) player.save();
  });

  // The range value is a fraction of the song duration, so convert it back
  // into seconds before assigning audio.currentTime.
  progress.addEventListener("input", () => {
    const duration = player.audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    player.audio.currentTime = (Number(progress.value) / 1000) * duration;
    updateProgress(player);
  });

  // Keep the slider moving smoothly while audio plays; stop drawing when paused.
  player.audio.addEventListener("play", () => startProgressAnimation(player));
  player.audio.addEventListener("pause", stopProgressAnimation);
  player.audio.addEventListener("ended", stopProgressAnimation);

  // When a track ends, advance unless repeat-one is active.
  player.audio.addEventListener("ended", () => {
    if (player.loop !== "one") player.skip();
    syncMiniPlayer(player);
  });

  // Audio events are the source of truth for time, duration, and play state.
  for (const eventName of [
    "durationchange",
    "loadedmetadata",
    "timeupdate",
    "play",
    "pause",
    "loadstart",
    "emptied",
  ]) {
    player.audio.addEventListener(eventName, () => syncMiniPlayer(player));
  }

  syncMiniPlayer(player);
}
