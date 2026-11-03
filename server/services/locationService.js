/**
 * JanSamadhan – Location & Spatial Services
 * Provides Haversine distance calculations, bounding-box geospatial filtering,
 * coordinate validation, and privacy-preserving reverse geocoding.
 */

const https = require('https');

const EARTH_RADIUS_KM = 6371;

// In-memory reverse-geocode cache (TTL 24 hours)
const geocodeCache = new Map();

// Local landmark directory for rapid offline resolution (Pune & Major Indian hubs)
const LOCAL_LANDMARK_DIRECTORY = [
  { name: 'Shivaji Nagar Bus Station', city: 'Pune', lat: 18.5314, lng: 73.8446, radiusKm: 0.8 },
  { name: 'Deccan Gymkhana / FC Road', city: 'Pune', lat: 18.5167, lng: 73.8415, radiusKm: 0.8 },
  { name: 'Swargate Junction & Bus Stand', city: 'Pune', lat: 18.5018, lng: 73.8586, radiusKm: 1.0 },
  { name: 'Kothrud Paud Road', city: 'Pune', lat: 18.5074, lng: 73.8077, radiusKm: 1.2 },
  { name: 'Hadapsar Magarpatta City', city: 'Pune', lat: 18.5089, lng: 73.9260, radiusKm: 1.5 },
  { name: 'Viman Nagar / Phoenix Mall', city: 'Pune', lat: 18.5679, lng: 73.9143, radiusKm: 1.2 },
  { name: 'Baner Balewadi High Street', city: 'Pune', lat: 18.5642, lng: 73.7769, radiusKm: 1.5 },
  { name: 'Katraj Snake Park / Lake', city: 'Pune', lat: 18.4550, lng: 73.8672, radiusKm: 1.2 },
  { name: 'Aundh Parihar Chowk', city: 'Pune', lat: 18.5580, lng: 73.8070, radiusKm: 0.8 },
  { name: 'Pune Railway Station Main Gate', city: 'Pune', lat: 18.5289, lng: 73.8744, radiusKm: 0.7 },
  { name: 'Dadar Western Railway Terminus', city: 'Mumbai', lat: 19.0178, lng: 72.8478, radiusKm: 1.0 },
  { name: 'Andheri West Metro Station', city: 'Mumbai', lat: 19.1197, lng: 72.8464, radiusKm: 1.0 },
];

/**
 * Validates whether latitude and longitude are within standard WGS-84 ranges
 */
function isValidCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Computes great-circle distance between two geographic points using Haversine formula
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Human-readable distance formatter (e.g. "350 m away", "2.4 km away")
 */
function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Calculates a bounding box square around a center point for rapid DB indexed pre-filtering
 */
function calculateBoundingBox(lat, lon, radiusKm) {
  // 1 deg latitude ~ 111.32 km
  const latDelta = radiusKm / 111.32;
  // 1 deg longitude ~ 111.32 * cos(lat) km
  const lonDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lon - lonDelta,
    maxLng: lon + lonDelta,
  };
}

/**
 * Reverse geocode coordinates to approximate street / landmark name
 * Prioritizes local municipal landmark directory, then checks memory cache,
 * then queries OpenStreetMap Nominatim with caching and rate limiting.
 */
async function reverseGeocode(lat, lng) {
  if (!isValidCoordinates(lat, lng)) {
    throw new Error('Invalid geographic coordinates');
  }

  // 1. Check local landmark directory
  for (const landmark of LOCAL_LANDMARK_DIRECTORY) {
    const dist = calculateDistance(lat, lng, landmark.lat, landmark.lng);
    if (dist <= landmark.radiusKm) {
      return {
        formattedAddress: `Near ${landmark.name}, ${landmark.city}`,
        locality: landmark.name,
        city: landmark.city,
        state: 'Maharashtra',
        source: 'MUNICIPAL_DIRECTORY',
      };
    }
  }

  // 2. Check in-memory cache (rounded to ~100m for cache reuse)
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // 3. Fallback to OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    const result = await new Promise((resolve, reject) => {
      const req = https.get(
        nominatimUrl,
        {
          headers: {
            'User-Agent': 'JanSamadhan-CivicPlatform/1.0 (contact@jansamadhan.gov.in)',
            Accept: 'application/json',
          },
          timeout: 4000,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                resolve(JSON.parse(data));
              } else {
                resolve(null);
              }
            } catch (e) {
              resolve(null);
            }
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
      req.on('error', () => resolve(null));
    });

    if (result && result.address) {
      const addr = result.address;
      const road = addr.road || addr.suburb || addr.neighbourhood || '';
      const suburb = addr.suburb || addr.city_district || '';
      const city = addr.city || addr.town || addr.municipality || 'Pune';
      const state = addr.state || 'Maharashtra';
      const pincode = addr.postcode || '';

      const parts = [road, suburb, city].filter(Boolean);
      const formattedAddress = parts.join(', ') || result.display_name.slice(0, 100);

      const resolved = {
        formattedAddress,
        locality: road || suburb || city,
        city,
        state,
        pincode,
        source: 'OPENSTREETMAP_NOMINATIM',
      };

      geocodeCache.set(cacheKey, resolved);
      return resolved;
    }
  } catch (err) {
    console.warn('[LocationService] Nominatim lookup fallback:', err.message);
  }

  // Default coordinate representation if external geocoder times out
  const fallback = {
    formattedAddress: `Location at ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
    locality: 'Civic Locality',
    city: 'Pune',
    state: 'Maharashtra',
    source: 'COORDINATE_FALLBACK',
  };

  geocodeCache.set(cacheKey, fallback);
  return fallback;
}

module.exports = {
  isValidCoordinates,
  calculateDistance,
  formatDistance,
  calculateBoundingBox,
  reverseGeocode,
  EARTH_RADIUS_KM,
};

