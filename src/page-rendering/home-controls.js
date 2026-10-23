import { renderPlaylists } from "./my-playlists-render";
import { renderPlayerIcons } from "../assets/icons.js";

let searchTimeout;

export function renderHome(player) {
  const controls = document.getElementById("view-controls");
  if (!controls) return;
  clearTimeout(searchTimeout);

  controls.innerHTML = /* html */ `
    <div class="flex items-center gap-3 px-4 py-3">
      <input
        id="playlist-search"
        type="search"
        placeholder="Search playlists"
        aria-label="Search playlists"
        class="min-w-0 flex-1 rounded-lg border border-blue-800 bg-slate-950 px-4 py-2 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
      />
      <button
        type="button"
        data-action="new-playlist"
        class="flex shrink-0 items-center gap-2 rounded-lg border border-cyan-500/60 bg-slate-950 px-4 py-2 font-semibold text-cyan-300 transition duration-200 hover:border-cyan-300 hover:bg-cyan-950/50 hover:text-cyan-100 hover:shadow-[0_0_14px_rgba(34,211,238,0.25)] active:scale-95"
      >
        <i data-lucide="plus" aria-hidden="true" class="h-4 w-4"></i>
        New playlist
      </button>
    </div>
  `;
  renderPlayerIcons();

  const searchInput = controls.querySelector("#playlist-search");
  searchInput.addEventListener("keyup", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderPlaylists(player, searchInput.value);
    }, 1000);
  });

  renderPlaylists(player, searchInput.value);
}
