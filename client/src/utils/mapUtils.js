/**
 * JanSamadhan – Map Utilities & OpenStreetMap Configuration
 * Manages tile URLs, legal attributions, city coordinates, and custom SVG DivIcons.
 */

import L from 'leaflet';

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

export const CITY_CENTERS = {
  Pune: [18.5204, 73.8567],
  Mumbai: [19.076, 72.8777],
  Nagpur: [21.1458, 79.0882],
  Nashik: [19.9975, 73.7898],
  Thane: [19.2183, 72.9781],
  Bengaluru: [12.9716, 77.5946],
  Delhi: [28.6139, 77.209],
  Hyderabad: [17.385, 78.4867],
};

export const DEFAULT_CENTER = CITY_CENTERS.Pune;
export const DEFAULT_ZOOM = 13;

const CATEGORY_COLORS = {
  'roads-potholes': '#EA580C', // Amber-Orange
  'garbage-waste': '#65A30D', // Lime-Green
  'water-supply': '#0284C7', // Sky Blue
  'drainage-sewage': '#0D9488', // Teal
  'street-lighting': '#EAB308', // Gold/Yellow
  'public-health': '#E11D48', // Rose
  'air-pollution': '#64748B', // Slate
  'noise-pollution': '#8B5CF6', // Purple
  'illegal-construction': '#B91C1C', // Dark Red
  'tree-greenery': '#16A34A', // Forest Green
  'stray-animals': '#D97706', // Amber
  'traffic-signage': '#2563EB', // Royal Blue
};

const SEVERITY_RINGS = {
  CRITICAL: 'ring-3 ring-rose-500 animate-pulse',
  HIGH: 'ring-2 ring-amber-500',
  MEDIUM: 'ring-1 ring-gray-300',
  LOW: 'ring-0',
};

/**
 * Creates custom styled HTML DivIcon for Leaflet markers
 */
export function createCustomMarkerIcon({
  categoryName = '',
  severity = 'MEDIUM',
  status = 'SUBMITTED',
  isVerified = false,
  isSelected = false,
}) {
  let bgColor = '#166534';
  const nameLower = categoryName.toLowerCase();

  if (nameLower.includes('road') || nameLower.includes('pothole')) bgColor = '#EA580C';
  else if (nameLower.includes('garbage') || nameLower.includes('waste')) bgColor = '#65A30D';
  else if (nameLower.includes('water') || nameLower.includes('leak')) bgColor = '#0284C7';
  else if (nameLower.includes('light') || nameLower.includes('lamp')) bgColor = '#EAB308';
  else if (nameLower.includes('drain') || nameLower.includes('sewage')) bgColor = '#0D9488';
  else if (nameLower.includes('health') || nameLower.includes('sanitation')) bgColor = '#E11D48';
  else if (nameLower.includes('air')) bgColor = '#64748B';
  else if (nameLower.includes('noise')) bgColor = '#8B5CF6';
  else if (nameLower.includes('construction')) bgColor = '#B91C1C';
  else if (nameLower.includes('tree') || nameLower.includes('greenery')) bgColor = '#16A34A';
  else if (nameLower.includes('animal') || nameLower.includes('stray')) bgColor = '#D97706';
  else if (nameLower.includes('traffic') || nameLower.includes('signage')) bgColor = '#2563EB';

  const size = isSelected ? 38 : 30;
  const isResolved = status === 'RESOLVED';

  const html = `
    <div style="
      background-color: ${isResolved ? '#059669' : bgColor};
      width: ${size}px;
      height: ${size}px;
      border-radius: 9999px;
      border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'};
      box-shadow: ${
        severity === 'CRITICAL'
          ? '0 0 0 4px rgba(225, 29, 72, 0.4), 0 4px 10px rgba(0,0,0,0.3)'
          : '0 3px 8px rgba(0,0,0,0.25)'
      };
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      position: relative;
    ">
      ${
        isVerified
          ? `<span style="
              position: absolute;
              top: -2px;
              right: -2px;
              width: 10px;
              height: 10px;
              background-color: #22c55e;
              border: 1.5px solid #ffffff;
              border-radius: 9999px;
            "></span>`
          : ''
      }
      <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-civic-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/**
 * Creates custom pin indicator for current user location
 */
export function createUserLocationIcon() {
  const html = `
    <div style="
      position: relative;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 24px;
        height: 24px;
        background-color: rgba(59, 130, 246, 0.3);
        border-radius: 9999px;
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        width: 14px;
        height: 14px;
        background-color: #2563eb;
        border: 2.5px solid #ffffff;
        border-radius: 9999px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'user-pulse-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

/**
 * Creates pin indicator for manual placement
 */
export function createPinPickerIcon() {
  const html = `
    <div style="
      width: 34px;
      height: 34px;
      background-color: #dc2626;
      border: 3px solid #ffffff;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.45);
      color: #ffffff;
      animation: bounce 1s infinite;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'pin-picker-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });
}
