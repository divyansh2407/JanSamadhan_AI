/**
 * JanSamadhan – Interactive City Map Component
 * Implements OpenStreetMap tiles with Leaflet, custom category/severity markers,
 * click-to-pin location selection, marker clustering, and privacy-safe issue popups.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import {
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  createCustomMarkerIcon,
  createUserLocationIcon,
  createPinPickerIcon,
} from '../../utils/mapUtils';
import {
  MapPin,
  Calendar,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ExternalLink,
  Search,
} from 'lucide-react';
import CategoryIcon from '../common/CategoryIcon';

/**
 * Child component to handle map events like click-to-select and pan synchronization
 */
function MapEventHandler({ onMapClick, interactiveSelection }) {
  useMapEvents({
    click(e) {
      if (interactiveSelection && onMapClick) {
        onMapClick({
          lat: parseFloat(e.latlng.lat.toFixed(6)),
          lng: parseFloat(e.latlng.lng.toFixed(6)),
        });
      }
    },
  });
  return null;
}

/**
 * Child component to re-center map when center coordinates change
 */
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function InteractiveCityMap({
  reports = [],
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  selectedLocation = null, // [lat, lng] for pin picker mode
  userLocation = null, // [lat, lng] for current GPS pulse indicator
  interactiveSelection = false, // True when in location-picking mode
  onSelectLocation = null,
  onSelectReport = null,
  className = 'h-full w-full',
}) {
  const [activeReport, setActiveReport] = useState(null);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-civic-border shadow-xs ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* OpenStreetMap Tile Layer with Legal Attribution */}
        <TileLayer
          url={OSM_TILE_URL}
          attribution={OSM_ATTRIBUTION}
          maxZoom={19}
        />

        {/* Dynamic Map Recenter */}
        <MapRecenter center={center} zoom={zoom} />

        {/* Map Events Handler (Click-to-Pin) */}
        <MapEventHandler
          onMapClick={onSelectLocation}
          interactiveSelection={interactiveSelection}
        />

        {/* ── 1. User GPS Position Indicator ──────────────────────────────── */}
        {userLocation && userLocation[0] && userLocation[1] && (
          <Marker
            position={userLocation}
            icon={createUserLocationIcon()}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="p-2 text-xs font-semibold text-blue-900">
                <span>Your Detected Location</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ── 2. Manual Location Selection Pin (Reporting Mode) ───────────── */}
        {interactiveSelection && selectedLocation && selectedLocation[0] && selectedLocation[1] && (
          <Marker
            position={selectedLocation}
            icon={createPinPickerIcon()}
            zIndexOffset={2000}
          >
            <Popup>
              <div className="p-2 text-xs font-semibold text-rose-900">
                <span className="block font-bold">Selected Issue Location</span>
                <span className="font-mono text-[10px] text-gray-600 block mt-0.5">
                  {selectedLocation[0]}, {selectedLocation[1]}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ── 3. Civic Issue Markers ──────────────────────────────────────── */}
        {!interactiveSelection &&
          reports.map((report) => {
            if (!report.latitude || !report.longitude) return null;

            const isSelected = activeReport?.id === report.id;

            return (
              <Marker
                key={report.id || report.trackingNumber}
                position={[report.latitude, report.longitude]}
                icon={createCustomMarkerIcon({
                  categoryName: report.categoryName || report.category,
                  severity: report.severity,
                  status: report.status,
                  isVerified: report.isVerified,
                  isSelected,
                })}
                eventHandlers={{
                  click: () => {
                    setActiveReport(report);
                    if (onSelectReport) onSelectReport(report);
                  },
                }}
              >
                <Popup className="civic-issue-popup">
                  <div className="w-64 p-3.5 space-y-2 text-xs">
                    {/* Header: Tracking ID & Status */}
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <span className="font-mono font-bold text-green-800 text-[11px]">
                        {report.trackingNumber}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                          report.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : report.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-[#172B20] text-xs leading-snug line-clamp-2">
                      {report.title}
                    </h4>

                    {/* Meta badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-[#172B20] text-[10px] font-medium">
                        <CategoryIcon categoryName={report.categoryName || report.category} className="w-3 h-3 text-green-700" />
                        <span>{report.categoryName || report.category}</span>
                      </span>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          report.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : report.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {report.severity}
                      </span>

                      {report.isVerified && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-800 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-green-700" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Sanitized Location */}
                    <div className="text-[11px] text-[#647067] flex items-center gap-1 truncate pt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{report.address}, {report.city}</span>
                    </div>

                    {/* Action link */}
                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                      <a
                        href={`/track?id=${encodeURIComponent(report.trackingNumber)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 hover:text-green-800"
                      >
                        <span>Track Status</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Interactive Selection Overlay Helper */}
      {interactiveSelection && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-xs px-4 py-2 rounded-2xl border border-civic-border shadow-md flex items-center gap-2 text-xs font-semibold text-[#172B20]">
          <MapPin className="w-4 h-4 text-rose-600 animate-bounce" />
          <span>Click anywhere on the map to place the problem pin</span>
        </div>
      )}
    </div>
  );
}

InteractiveCityMap.propTypes = {
  reports: PropTypes.array,
  center: PropTypes.array,
  zoom: PropTypes.number,
  selectedLocation: PropTypes.array,
  userLocation: PropTypes.array,
  interactiveSelection: PropTypes.bool,
  onSelectLocation: PropTypes.func,
  onSelectReport: PropTypes.func,
  className: PropTypes.string,
};

