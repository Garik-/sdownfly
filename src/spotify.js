'use strict'

import { save, load } from './data.js'

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env

if (!SPOTIFY_CLIENT_ID) {
  throw new Error('SPOTIFY_CLIENT_ID environment variable is not set.')
}

if (!SPOTIFY_CLIENT_SECRET) {
  throw new Error('SPOTIFY_CLIENT_SECRET environment variable is not set.')
}

const TOKEN_FILE = 'spotify_token.json'

async function fetchToken() {
  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append('client_id', SPOTIFY_CLIENT_ID)
  params.append('client_secret', SPOTIFY_CLIENT_SECRET)

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Spotify token request failed: ${errText}`)
  }

  const data = await res.json()
  // добавляем дату истечения токена
  data.expires_at = Date.now() + data.expires_in * 1000

  await save(TOKEN_FILE, data)
  return data
}

async function getToken() {
  try {
    const tokenData = await load(TOKEN_FILE)
    if (tokenData.expires_at && Date.now() < tokenData.expires_at - 5000) {
      return tokenData
    }
  } catch {
    // игнорируем ошибки чтения файла
  }

  return fetchToken()
}

function fetchAPI(baseURL, headers) {
  return async (path, options = {}) => {
    // формируем полный URL
    const url = new URL(path, baseURL)

    // добавляем query-параметры
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }

    const fetchOptions = {
      method: options.method || 'GET',
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    }

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body)
    }

    const res = await fetch(url.toString(), fetchOptions)
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Spotify API error: ${text}`)
    }

    return res.json()
  }
}

export async function init() {
  const token = await getToken()
  console.log('Spotify token:', token)

  const api = fetchAPI(new URL('https://api.spotify.com/v1/'), {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `${token.token_type} ${token.access_token}`,
  })

  return {
    /**
     * Get a playlist owned by a Spotify user.
     * @param {string} id - The Spotify ID of the playlist. Example: 3cEYpjA9oz9GiPac4AsH4n
     * @param {string} fields - Filters for the query: a comma-separated list of the fields to return. If omitted, all fields are returned.
     * @link https://developer.spotify.com/documentation/web-api/reference/get-playlist
     */
    playlists: (id, fields = '') => {
      return api(`playlists/${id}`, {
        params: fields ? { fields } : {},
      })
    },

    // TODO: add track  https://developer.spotify.com/documentation/web-api/reference/get-track
  }
}
