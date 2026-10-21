import { renderPlayerIcons } from "../assets/icons.js";

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
function updateProgress(player) {
  const progress = document.querySelector("#progress");
  const currentTime = document.querySelector("#current-time");
  const duration = document.querySelector("#duration");
  if (!progress || !currentTime || !duration) return;

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
  currentTime.textContent = formatTime(player.audio.currentTime);
  duration.textContent = formatTime(total);
}

// Copy the current player state into the visible labels and controls.
export function syncMiniPlayer(player) {
  const title = document.querySelector("#mini-song-title");
  const artist = document.querySelector("#mini-song-artist");
  const playPause = document.querySelector("#play-pause");
  if (!title || !artist || !playPause) return;

  const song = player.currentNode?.song;
  title.textContent = song?.title ?? "Nothing playing";
  artist.textContent = song?.artist ?? "Choose a song to start listening";

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
  const playPause = document.querySelector("#play-pause");
  const previous = document.querySelector("#previous-track");
  const next = document.querySelector("#next-track");
  if (!progress || !playPause || !previous || !next) return;

  playPause.addEventListener("click", () => player.play());
  previous.addEventListener("click", () => {
    player.prev();
    syncMiniPlayer(player);
  });
  next.addEventListener("click", () => {
    player.skip();
    syncMiniPlayer(player);
  });

  // The range value is a fraction of the song duration, so convert it back
  // into seconds before assigning audio.currentTime.
  progress.addEventListener("input", () => {
    const duration = player.audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    player.audio.currentTime = (Number(progress.value) / 1000) * duration;
    updateProgress(player);
  });

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
