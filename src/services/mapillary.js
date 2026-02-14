/**
 * Mapillary Service
 * Handles all interactions with the Mapillary Graph API.
 */

const RAW_TOKEN = import.meta.env.VITE_mapillary_Access_Token || '';
const ACCESS_TOKEN = RAW_TOKEN; // Use the full raw token string (MLY|...)

/**
 * Fetches nearby images within a bounding box.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in degrees (approx)
 * @param {number} limit - Max number of images to return
 * @returns {Promise<Array>} List of image features
 */
export async function fetchNearbyImages(lat, lng, radius = 0.005, limit = 100) {
  const west = lng - radius;
  const south = lat - radius;
  const east = lng + radius;
  const north = lat + radius;

  const url = `https://graph.mapillary.com/images?fields=id,geometry,sequence,captured_at,creator_id&bbox=${west},${south},${east},${north}&limit=${limit}&access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mapillary API Error: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error('Error fetching Mapillary images:', err);
    throw err;
  }
}

/**
 * Gets the raw access token for components that need direct integration (e.g. Viewer).
 * @returns {string} The full raw token
 */
export function getMapillaryToken() {
  return RAW_TOKEN;
}
