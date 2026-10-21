export function createSongOptionsMenu({
  getSong,
  onToggleFavorite,
  onAddToQueue,
  opensUp = false,
}) {
  const root = document.createElement("div");
  root.className = "relative";

  const menuPosition = opensUp
    ? "bottom-full right-0 mb-2"
    : "right-0 top-full mt-2";

  root.innerHTML = `
    <button
      type="button"
      class="player-icon-button text-cyan-400"
      aria-label="Song options"
      aria-haspopup="menu"
      aria-expanded="false"
    >
      <i data-lucide="ellipsis-vertical" aria-hidden="true"></i>
    </button>

    <div
      role="menu"
      class="absolute ${menuPosition} z-50 hidden min-w-48 rounded-xl border border-blue-700 bg-slate-950 p-2 shadow-xl"
    >
      <button type="button" role="menuitem" data-action="favorite"
        class="block w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10">
      </button>
      <button type="button" role="menuitem" data-action="queue"
        class="block w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10">
        Add to queue
      </button>
    </div>
  `;

  const trigger = root.querySelector("button[aria-haspopup]");
  const menu = root.querySelector('[role="menu"]');
  const favoriteAction = root.querySelector('[data-action="favorite"]');
  const queueAction = root.querySelector('[data-action="queue"]');

  trigger.addEventListener("click", () => {
    const song = getSong();
    if (!song) return;

    favoriteAction.textContent = song.isFavorite
      ? "Remove from favorites"
      : "Add to favorites";

    menu.classList.toggle("hidden");
    trigger.setAttribute(
      "aria-expanded",
      String(!menu.classList.contains("hidden")),
    );
  });

  favoriteAction.addEventListener("click", () => {
    const song = getSong();
    if (song) onToggleFavorite(song);
    menu.classList.add("hidden");
    trigger.setAttribute("aria-expanded", "false");
  });

  queueAction.addEventListener("click", () => {
    const song = getSong();
    if (song) onAddToQueue(song);
    menu.classList.add("hidden");
    trigger.setAttribute("aria-expanded", "false");
  });

  return root;
}
