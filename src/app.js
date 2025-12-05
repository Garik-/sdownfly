"use strict";
import { init } from './spotify.js';

async function main() {
  try {
    const spotify = await init();
    console.log('Spotify initialized successfully:', spotify);

    const p = await spotify.playlists('1Ae90mOdJjXwupOpEkdMma', 'tracks.items(track(name,disc_number,track_number,artists(name),album(name,release_date)))')
    console.log('Playlist data:', JSON.stringify(p, null, 2));

  } catch (err) {
    console.error('Error during initialization:', err);
    process.exit(1);
  }
}

main();
