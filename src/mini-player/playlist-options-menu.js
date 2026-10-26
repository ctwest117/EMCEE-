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
        data-playlist-option
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
        data-playlist-option
        class="flex w-full items-center gap-2 rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm hover:bg-white/10"
      >
        <i data-lucide="list-x" aria-hidden="true" class="h-4 w-4 shrink-0"></i>
        <span>Clear Playlist</span>
      </button>
      <button
        type="button"
        role="menuitem"
        data-action="change-playlist-cover"
        data-play-id=""
        data-playlist-option
        class="flex w-full items-center gap-2 rounded-lg border-b border-blue-700 px-3 py-2 text-left text-sm hover:bg-white/10"
      >
        <i data-lucide="disc-3" aria-hidden="true" class="h-4 w-4 shrink-0"></i>
        <span>Change Cover</span>
      </button>
      <button
        type="button"
        role="menuitem"
        data-action="rename-playlist"
        data-play-id=""
        data-playlist-option
        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
      >
        <i data-lucide="pencil" aria-hidden="true" class="h-4 w-4 shrink-0"></i>
        <span>Rename Playlist</span>
      </button>
      <form data-playlist-rename-form data-play-id="" class="hidden border-t border-blue-700 p-2">
        <label class="sr-only" for="playlist-rename-input">New playlist name</label>
        <input
          id="playlist-rename-input"
          name="playlistName"
          type="text"
          autocomplete="off"
          placeholder="Playlist name"
          class="w-full rounded-lg border border-blue-800 bg-slate-900 px-3 py-2 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
        <p data-rename-error class="mt-2 min-h-4 text-xs text-rose-300" aria-live="polite"></p>
        <div class="mt-2 flex justify-end gap-2">
          <button type="button" data-action="cancel-playlist-rename" class="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10">Cancel</button>
          <button type="submit" class="rounded-lg bg-cyan-900/60 px-3 py-1.5 text-sm font-semibold text-cyan-200 hover:bg-cyan-800/70">Save</button>
        </div>
      </form>
      <form data-playlist-cover-form data-play-id="" class="hidden border-t border-blue-700 p-2">
        <label class="sr-only" for="playlist-cover-url">Cover image URL</label>
        <input
          id="playlist-cover-url"
          name="coverUrl"
          type="url"
          autocomplete="url"
          placeholder="https://example.com/cover.jpg"
          class="w-full rounded-lg border border-blue-800 bg-slate-900 px-3 py-2 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
        <p data-cover-error class="mt-2 min-h-4 text-xs text-rose-300" aria-live="polite"></p>
        <div class="mt-2 flex justify-end gap-2">
          <button type="button" data-action="cancel-playlist-cover" class="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10">Cancel</button>
          <button type="submit" class="rounded-lg bg-cyan-900/60 px-3 py-1.5 text-sm font-semibold text-cyan-200 hover:bg-cyan-800/70">Save</button>
        </div>
      </form>
    </div>
  `;
  return details;
}
