import { Playlist } from "../playlist-data/playlist-data.js";

let nextInputId = 0;

// Build the same validated playlist form for Home and future song actions.
export function createPlaylistForm(onCreated, { inline = false } = {}) {
  const inputId = `playlist-name-${nextInputId++}`;
  const form = document.createElement("form");
  form.hidden = true;
  form.className = inline
    ? "mt-2 w-full rounded-xl border border-blue-700 bg-slate-950 p-3"
    : "absolute right-4 top-full z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-blue-700 bg-slate-950 p-3 shadow-xl shadow-black/40";
  form.innerHTML = /* html */ `
    <div class="flex items-center gap-2">
      <label for="${inputId}" class="sr-only">Playlist name</label>
      <input
        id="${inputId}"
        name="playlistName"
        type="text"
        autocomplete="off"
        placeholder="Playlist name"
        class="min-w-0 flex-1 rounded-lg border border-blue-800 bg-slate-900 px-3 py-2 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
      />
      <button
        type="submit"
        class="shrink-0 rounded-lg border border-cyan-500/60 bg-slate-950 px-3 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-300 hover:bg-cyan-950/50 hover:text-cyan-100"
      >Create</button>
    </div>
    <p class="playlist-create-error mt-2 min-h-4 text-xs text-rose-300" aria-live="polite"></p>
  `;

  const nameInput = form.querySelector("input");
  const errorMessage = form.querySelector(".playlist-create-error");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const result = Playlist.createPlaylist(nameInput.value);
    if (!result.playlist) {
      errorMessage.textContent = result.error;
      nameInput.setAttribute("aria-invalid", "true");
      nameInput.focus();
      return;
    }

    nameInput.value = "";
    nameInput.removeAttribute("aria-invalid");
    errorMessage.textContent = "";
    form.hidden = true;
    onCreated?.(result.playlist);
  });

  nameInput.addEventListener("input", () => {
    errorMessage.textContent = "";
    nameInput.removeAttribute("aria-invalid");
  });

  return form;
}
