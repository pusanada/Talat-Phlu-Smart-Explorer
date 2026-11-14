/**
 * Service to fetch shop cover photos & thumbnails from Google Maps
 * Supports:
 * 1. Google Places API (New & Legacy) via Google Cloud API Key
 * 2. SerpApi (Google Maps Engine)
 * 3. Direct Google User Content CDN links (lh3.googleusercontent.com)
 */

const rawGoogleKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim()
const rawSerpApiKey = (import.meta.env.VITE_SERPAPI_KEY || '').trim()

// Check if user accidentally pasted URL instead of key
const isRealGoogleKey = rawGoogleKey && !rawGoogleKey.startsWith('http') && !rawGoogleKey.includes('placeholder')
const isRealSerpKey = (rawSerpApiKey && !rawSerpApiKey.startsWith('http')) || (rawGoogleKey && !rawGoogleKey.startsWith('http') && rawGoogleKey.length > 30)

/**
 * Extract Place ID from a Google Maps URL
 */
export function extractPlaceId(mapLink) {
  if (!mapLink) return null
  const placeIdMatch = mapLink.match(/query_place_id=([a-zA-Z0-9_\-]+)/)
  if (placeIdMatch) return placeIdMatch[1]

  const dataMatch = mapLink.match(/!1s(0x[a-f0-9]+:0x[a-f0-9]+)/)
  if (dataMatch) return dataMatch[1]

  return null
}

/**
 * Fetch thumbnail/cover photo for a Google Maps place
 * @param {string} placeId - Google Place ID (e.g. ChIJzyBzYZWZ4jAR1u9WohoSibw)
 * @param {string} [query] - Shop name fallback query (e.g. "MATCHAMA มัทฉะมะ ตลาดพลู")
 * @returns {Promise<string|null>} - Image URL or null
 */
export async function fetchGooglePlacePhoto(placeId, query = '') {
  if (!placeId && !query) return null

  // 1. Try SerpApi if SerpApi key is provided
  const serpKey = isRealSerpKey ? (rawSerpApiKey || rawGoogleKey) : null
  if (serpKey) {
    try {
      const endpoint = `https://serpapi.com/search.json?engine=google_maps&${placeId ? `place_id=${placeId}` : `q=${encodeURIComponent(query)}`}&api_key=${serpKey}`
      const res = await fetch(endpoint)
      if (res.ok) {
        const data = await res.json()
        const photo =
          data?.place_results?.thumbnail ||
          data?.place_results?.photos?.[0]?.thumbnail ||
          data?.place_results?.photos?.[0]?.image
        if (photo) return photo
      }
    } catch (err) {
      console.warn('SerpApi fetch error:', err)
    }
  }

  // 2. Try Google Cloud Places API (New) if Google Cloud Key is provided
  if (isRealGoogleKey && placeId) {
    try {
      const url = `https://places.googleapis.com/v1/places/${placeId}?fields=photos&key=${rawGoogleKey}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        const photoName = data?.photos?.[0]?.name
        if (photoName) {
          return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=600&maxWidthPx=800&key=${rawGoogleKey}`
        }
      }
    } catch (err) {
      console.warn('Google Places API fetch error:', err)
    }
  }

  return null
}
