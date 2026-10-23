// One shared menu is positioned beside whichever song-options button opens it.
export function createSongOptionsMenu() {
  const details = document.createElement("details");
  details.id = "song-options-details";
  details.className = "song-options-details";
  details.dataset.songId = "";
  details.dataset.playId = "";
  details.innerHTML = /* html */ `
    <summary class="sr-only">Song options</summary>
    <div
      role="menu"
      data-options-panel
      class="fixed left-0 top-0 z-[60] max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] min-w-48 overflow-y-auto rounded-xl border border-blue-700 bg-slate-950 p-2 shadow-xl"
    >
      <button
        type="button"
        role="menuitem"
        data-action="queue"
        class="flex w-full items-center gap-2 rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
      >
        <i data-lucide="FunnelPlus" aria-hidden="true" class="h-4 w-4 shrink-0"></i>
        <span>Add to queue</span>
      </button>
      <button
        type="button"
        role="menuitem"
        data-action="queueView"
        class="flex w-full items-center gap-2 rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
      >
        <i data-lucide="Funnel" aria-hidden="true" class="h-4 w-4 shrink-0"></i>
        <span>View Queue</span>
      </button>
      <button
        type="button"
        role="menuitem"
        data-action="add-to-playlist"
          class="flex w-full items-center gap-2 rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
      >
          <i data-lucide="ListPlus" aria-hidden="true" class="h-4 w-4 shrink-0"></i>
          <span>Add to playlist</span>
      </button>
      <button
        type="button"
        role="menuitem"
        data-action="remove"
        class="flex w-full items-center gap-2 rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
      >
        <i data-lucide="ListX" aria-hidden="true" class="h-4 w-4 shrink-0"></i>
        <span>Remove from playlist</span>
      </button>
    </div>
  `;
  return details;
}
