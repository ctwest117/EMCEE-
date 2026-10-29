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
      <section data-queue-view hidden class="min-w-56 text-white">
        <div class="mb-2 flex items-center justify-between border-b border-blue-700 pb-2">
          <h2 class="px-2 text-sm font-semibold">Queue</h2>
          <div class="flex items-center gap-1">
            <button
              type="button"
              data-action="queue-clear"
              aria-label="Clear upcoming songs from queue"
              class="rounded-lg px-2 py-1 text-xs text-rose-300 hover:bg-rose-950/60 disabled:cursor-not-allowed disabled:opacity-40"
              disabled
            >Clear queue</button>
            <button
              type="button"
              data-action="queue-view-back"
              class="rounded-lg px-2 py-1 text-xs text-cyan-300 hover:bg-white/10"
            >Back</button>
          </div>
        </div>
        <p data-queue-empty class="hidden px-2 py-3 text-sm text-slate-400">Queue is empty.</p>
        <ul data-queue-list class="space-y-1"></ul>
      </section>
      <section data-playlist-picker hidden class="min-w-56 text-white">
        <div class="mb-2 flex items-center justify-between border-b border-blue-700 pb-2">
          <h2 class="px-2 text-sm font-semibold">Add to playlist</h2>
          <button
            type="button"
            data-action="playlist-picker-back"
            class="rounded-lg px-2 py-1 text-xs text-cyan-300 hover:bg-white/10"
          >Back</button>
        </div>
        <ul data-playlist-picker-list class="space-y-1"></ul>
        <button
          type="button"
          data-action="playlist-picker-new"
          class="mt-2 w-full rounded-lg border-t border-blue-700 px-3 py-2 text-left text-sm font-semibold text-cyan-300 hover:bg-white/10"
        >+ New playlist</button>
        <div data-playlist-create-form></div>
      </section>
    </div>
  `;
  return details;
}
