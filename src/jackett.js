'use strict'
import xml2js from 'xml2js'

const { JACKETT_API_KEY, JACKETT_URL } = process.env

if (!JACKETT_API_KEY) {
  throw new Error('JACKETT_API_KEY environment variable is not set.')
}

if (!JACKETT_URL) {
  throw new Error('JACKETT_URL environment variable is not set.')
}

export async function config(indexers = '!status:failing,test:passed') {
  const url = new URL(`/api/v2.0/indexers/${indexers}/results/torznab/api`, JACKETT_URL)
  url.searchParams.append('apikey', JACKETT_API_KEY)
  url.searchParams.append('t', 'caps')

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

    const map = {}
    for (const item of data.caps.categories.category) {
      const { id, name } = item['$']
      map[id] = name

      if (item.subcat) {
        if (Array.isArray(item.subcat)) {
          for (const sub of item.subcat) {
            const { id: subId, name: subName } = sub['$']
            map[subId] = subName
          }
        } else {
          const { id: subId, name: subName } = item.subcat['$']
          map[subId] = subName
        }
      }
    }
    return map
  } catch (err) {
    console.error('Jackett music search error:', err.message)
    return null
  }
}

export async function music({ album, artist, label, track, year, genre, q, cat } = {}) {
  const url = new URL(
    '/api/v2.0/indexers/!status:failing,test:passed/results/torznab/api',
    JACKETT_URL,
  )
  url.searchParams.append('apikey', JACKETT_API_KEY)
  url.searchParams.append('t', 'music')

  const params = { album, artist, label, track, year, genre, q, cat }

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value)
    }
  }

  console.log(cat)

  // console.log(url.toString())

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
