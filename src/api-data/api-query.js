function translateData(data) {
  switch (data.kind) {
    case "song":
      return [
        data.trackId,
        data.trackName,
        data.artistName,
        data.collectionName,
        data.artworkUrl100,
        data.trackNumber,
        data.primaryGenreName,
        data.previewUrl,
        data.trackTimeMillis,
        data.kind,
      ];

    case "collection":
      return [
        data.collectionId,
        data.collectionName,
        data.artistName,
        data.artworkUrl100,
        data.trackNumber,
        data.primaryGenreName,
        data.releaseDate,
        data.kind,
      ];

    case "artist":
    case "musicArtist":
      return [
        data.artistId,
        data.artistName,
        data.primaryGenreName,
        data.artistLinkUrl,
        data.kind,
      ];

    default:
      return null;
  }
}

export async function searchSongs(query, limit = 20, entity = "song") {
  const url = new URL("https://itunes.apple.com/search");

  url.searchParams.set("term", query);
  url.searchParams.set("entity", entity);
  url.searchParams.set("limit", limit);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();

  return data.results.map((a) => translateData(a));
}

/* 
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.cover = coverURL;
    this.albumIndex = albumIndex;
    this.genre = genre;
    this.audioSrc = audioSrc;
    this.duration = duration; */
