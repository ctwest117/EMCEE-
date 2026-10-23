export function createPlaylistOptionsMenu() {
  const details = document.createElement("details");
  details.id = "playlist-options-details";
  details.className = "song-options-details";
  details.dataset.playId = "";
  details.innerHTML = /* html */ `
    <summary class="sr-only">Playlist options</summary>
    <div
      role="menu"
      data-options-panel
      class="fixed left-0 top-0 z-60 max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] min-w-48 overflow-y-auto rounded-xl border border-blue-700 bg-slate-950 p-2 text-white shadow-xl"
    >
      <button
        type="button"
        role="menuitem"
        data-action="delete-playlist"
        data-play-id=""
        class="flex w-full items-center gap-2 rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm hover:bg-white/10"
      >
        <i data-lucide="trash" aria-hidden="true" class="h-4 w-4 shrink-0"></i>
        <span>Delete Playlist</span>
      </button>
      <button
        type="button"
        role="menuitem"
        data-action="clear-playlist"
        data-play-id=""
        class="flex w-full items-center gap-2 rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm hover:bg-white/10"
      >
        <i data-lucide="list-x" aria-hidden="true" class="h-4 w-4 shrink-0"></i>
        <span>Clear Playlist</span>
      </button>
      <button
        type="button"
        role="menuitem"
        data-action="rename-playlist"
        data-play-id=""
        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
      >
        <i data-lucide="pencil" aria-hidden="true" class="h-4 w-4 shrink-0"></i>
        <span>Rename Playlist</span>
      </button>
    </div>
  `;
  return details;
}
