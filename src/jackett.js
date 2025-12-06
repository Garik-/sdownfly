'use strict'
import xml2js from 'xml2js'

const { JACKETT_API_KEY, JACKETT_URL } = process.env

if (!JACKETT_API_KEY) {
  throw new Error('JACKETT_API_KEY environment variable is not set.')
}

if (!JACKETT_URL) {
  throw new Error('JACKETT_URL environment variable is not set.')
}

export async function music({ album, artist, label, track, year, genre, q } = {}) {
  const url = new URL('/api/v2.0/indexers/all/results/torznab/api', JACKETT_URL)
  url.searchParams.append('apikey', JACKETT_API_KEY)
  url.searchParams.append('t', 'music')

  const params = { album, artist, label, track, year, genre, q }

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value)
    }
  }

  try {
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`Jackett returned HTTP ${res.status}: ${res.statusText}`)
    }

    const xml = await res.text()

    let data
    try {
      data = await xml2js.parseStringPromise(xml, {
        explicitArray: false,
      })
    } catch (e) {
      throw new Error('Failed to parse XML from Jackett: ' + e.message)
    }

    if (!data?.rss?.channel) {
      throw new Error('Invalid Torznab response structure')
    }

    return data.rss.channel.item ?? []
  } catch (err) {
    console.error('Jackett music search error:', err.message)
    return null
  }
}
