# Emcee²

Emcee is a responsive, browser-based music player for searching music, building playlists, and managing playback from a compact player interface.

Try it live: [emcee-squared.netlify.app](https://emcee-squared.netlify.app/)

## Purpose

This project explores how a client-side music player can organize songs and playlists, provide a queue and playback controls, and keep a listener's library available between visits. It is also a learning project built around JavaScript classes, browser audio, DOM rendering, and local persistence.

## Who it's for

Emcee is for listeners who want a lightweight way to organize and play music previews in a browser, and for developers interested in a small JavaScript application with playlist, queue, and player state management.

## Features

- Create, search, rename, clear, and delete playlists.
- Set a playlist cover using an image URL.
- Search the local library or search the iTunes Search API.
- Add songs to playlists and Favorites, or add them to the playback queue.
- Reorder songs in a playlist by dragging its grip handle; filtered results are not reordered.
- View the queue and remove upcoming songs.
- Play, pause, skip, go back, and seek through the current audio.
- Shuffle playlists and choose a repeat mode: none, all, or one.
- Expand the mini-player by clicking or dragging it upward. The expanded player shows larger album artwork, track details, progress, and playback controls over the current view.
- Show a spinning Disc3 icon while an API search is in progress.
- Navigate between Home, Search, and playlists using browser Back and Forward.
- Save playlists, library data, and playback settings in browser `localStorage`.
- Use responsive controls and contextual song and playlist menus.

## Technologies

- JavaScript (ES modules)
- HTML and CSS
- Vite for local development and production builds
- Tailwind CSS for styling
- Lucide icons
- SortableJS for playlist song reordering
- iTunes Search API for online song search and preview audio
- Node.js built-in test runner for automated tests

## Run locally

Install [Node.js](https://nodejs.org/) and npm, then run these commands from the project directory:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Online search requires an internet connection. Emcee stores its data in the current browser's `localStorage`; data is not synced across browsers or devices.

## Tests and production build

Run the automated test suite:

```sh
npm test
```

Create and preview a production build:

```sh
npm run build
npm run preview
```

## Deploy to Netlify

To deploy manually, build the project and upload the generated `dist/` folder using Netlify's manual deploy or drag-and-drop publisher:

```sh
npm run build
```

For automatic deployments, connect the repository to Netlify and configure `npm run build` as the build command and `dist` as the publish directory. Netlify can then rebuild the site when changes are pushed to the connected production branch.

The tests cover player behavior, playlist and library operations, API result handling, event actions, and playlist creation form validation.

## Project structure

- `src/data/`: Songs, the local library, playlists, playback state, mini-player synchronization, and iTunes API requests.
- `src/page-rendering/`: Header, home, playlist, search, song-list and mini-player views, plus their option menus.
- `src/router.js`: Hash routes and browser history navigation.
- `src/eventListeners.js`: Delegated UI actions and menu interactions.
- `src/assets/`: Icons, images, and fonts.
- `tests/`: Automated tests run by `node --test`.

## Known limitations

- iTunes search supplies preview audio rather than full-length tracks. The preview is typically 30 seconds, and the API does not provide a way for Emcee to request an arbitrary starting offset within the full track. Preview availability can vary by result and storefront. See Apple's [Search API result fields](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/UnderstandingSearchResults.html).
- Saved data is local to one browser and can be lost if its site data is cleared. There is no account, cloud sync, or server-side storage.
- Playlist URLs use IDs from the current browser's library; they do not share playlist contents with another browser.
- Returning to Search through browser history opens a fresh search rather than restoring the previous query or results.
- Automated tests cover the data and interaction logic; the visual renderers do not yet have browser-based integration tests.
- Playlist covers are entered as image URLs; the app does not upload or host images.
- The expanded player requests a 400×400 artwork URL by replacing `100x100` in the song artwork URL. Higher-resolution artwork depends on the image host having that size available.

## Future improvements

- Add browser-based tests for rendered views and responsive behavior.
- Improve accessibility, including keyboard navigation and screen-reader labels for controls.
- Add import/export or account-based backup for playlists and settings.
- Explore additional audio sources that can provide full tracks where licensing permits.

## Authors and contributions

Emcee was created by the project owner, who designed the application and built its core data model, playback behavior, playlist system, API search, and visual direction. The project owner's name is not listed in this repository yet.

ChatGPT contributed implementation and review work during development, including reusable playlist creation and editing forms, queue and playlist option menus, test coverage, and this README. The README was written by ChatGPT at the project owner's request. The project remains the project owner's work.
