import { renderPlayerIcons } from "../assets/icons.js";

export function renderHeader() {
  const header = document.querySelector("#app-header");
  if (!header) return;

  header.className =
    "relative flex h-14 w-full items-center justify-center border-b border-blue-800 bg-slate-950/80 text-white";
  header.innerHTML = /* html */ `
    <div class="logo fixed left-4 top-3 z-60 inline-flex h-9 w-10 items-center justify-center text-lg">
      <i
        data-lucide="disc-3"
        aria-hidden="true"
        class="pointer-events-none absolute h-9 w-9 text-cyan-400/20"
      ></i>
      <span class="relative z-10">MC²</span>
    </div>

    <nav aria-label="Main navigation" class="flex items-center justify-around w-[50%] gap-3">
      <button
        type="button"
        data-action="home"
        aria-label="Home"
        title="Home"
        class="player-icon-button header-icon-button text-cyan-400 hover:text-cyan-200"
      ><i data-lucide="house" aria-hidden="true"></i></button>
      <button
        type="button"
        data-action="search"
        aria-label="Search"
        title="Search"
        class="player-icon-button header-icon-button text-cyan-400 hover:text-cyan-200"
      ><i data-lucide="search" aria-hidden="true"></i></button>
    </nav>

    <button
      type="button"
      data-action="scroll-top"
      aria-label="Back to top"
      title="To Top"
      class="player-icon-button header-icon-button fixed right-4 top-3 z-60 text-cyan-400 hover:text-cyan-200"
    ><i data-lucide="chevron-up" aria-hidden="true"></i></button>
  `;

  renderPlayerIcons();
}
