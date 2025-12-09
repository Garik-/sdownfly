'use strict'
// import { init } from './spotify.js'

import { music } from './jackett.js'
import { save } from './data.js'

/*
async function getCapabilities() {
  const caps = await config('rutracker')

  const regex = /lossless|hi\-res|audio/i
  const keys = []
  for (const key in caps) {
    if (regex.test(caps[key])) {
      keys.push(key)
    }
  }
  return keys.join(',')
}
  */

async function main() {
  try {
    // const spotify = await init()
    // console.log('Spotify initialized successfully:', spotify)
    // const p = await spotify.playlists(
    //   '1Ae90mOdJjXwupOpEkdMma',
    //   'tracks.items(track(name,disc_number,track_number,artists(name),album(name,release_date)))',
    // )
    // console.log('Playlist data:', JSON.stringify(p, null, 2))

    // const cat = await getCapabilities()
    const results = await music({ artist: 'Trivium', album: '', year: '', q: 'Trivium' })
    await save('jackett_results.json', results)
    console.log('Jackett search completed. Results saved to jackett_results.json')
  } catch (err) {
    console.error('Error during initialization:', err)
    process.exit(1)
  }
}

main()
