/**
 * JanSamadhan – Location Selector & Map Pin Placement Component
 * Integrates browser GPS Geolocation API with interactive OpenStreetMap pin placement
 * and reverse-geocoding for the Stage 6 reporting wizard.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  MapPin,
  Crosshair,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Compass,
  X,
  Check,
  Search,
} from 'lucide-react';
import InteractiveCityMap from './InteractiveCityMap';
import { CITY_CENTERS } from '../../utils/mapUtils';
import mapService from '../../services/mapService';

export default function LocationSelector({
  value = {},
  onChange,
  city = 'Pune',
}) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  const currentCenter =
    value.latitude && value.longitude
      ? [value.latitude, value.longitude]
      : CITY_CENTERS[city] || CITY_CENTERS.Pune;

  // 1. Browser Geolocation API Handler (Explicit User Action)
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const lat = parseFloat(latitude.toFixed(6));
        const lng = parseFloat(longitude.toFixed(6));

        onChange({
          ...value,
          latitude: lat,
          longitude: lng,
          accuracy: Math.round(accuracy),
          locationMode: 'gps',
        });

        // Trigger reverse geocode lookup
        try {
          setGeocoding(true);
          const geoData = await mapService.reverseGeocode(lat, lng);
          if (geoData && geoData.formattedAddress) {
            onChange({
              ...value,
              latitude: lat,
              longitude: lng,
              accuracy: Math.round(accuracy),
              locationMode: 'gps',
              address: value.address || geoData.formattedAddress,
              city: geoData.city || value.city || city,
            });
          }
        } catch (e) {
          console.warn('Reverse geocode failed:', e);
        } finally {
          setGeocoding(false);
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsError('Location permission denied. Please allow location access or select on map.');
        } else if (err.code === 2) {
          setGpsError('Position unavailable. Please pick location on the map.');
        } else {
          setGpsError('GPS request timed out. Please select location manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // 2. Interactive Map Pin Selection Handler
  const handleMapPinSelected = async (coords) => {
    const lat = coords.lat;
    const lng = coords.lng;

    onChange({
      ...value,
      latitude: lat,
      longitude: lng,
      locationMode: 'map',
    });

    try {
      setGeocoding(true);
      const geoData = await mapService.reverseGeocode(lat, lng);
      if (geoData && geoData.formattedAddress) {
        onChange({
          ...value,
          latitude: lat,
          longitude: lng,
          locationMode: 'map',
          address: value.address || geoData.formattedAddress,
          city: geoData.city || value.city || city,
        });
      }
    } catch (e) {
      console.warn('Reverse geocode failed:', e);
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Action Banner: GPS Detection & Map Picker */}
      <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-civic-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#172B20]">Location Intelligence Options</h4>
            <p className="text-[11px] text-[#647067] mt-0.5">
              Pinpoint the issue with GPS or place a pin on the OpenStreetMap interactive city grid.
            </p>
            {value.latitude && value.longitude && (
              <div className="mt-1 flex items-center gap-2 text-green-800 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>
                  Tagged: {value.latitude}, {value.longitude}
                  {value.accuracy ? ` (±${value.accuracy}m)` : ''}
                </span>
                {geocoding && <Loader2 className="w-3 h-3 animate-spin text-green-600" />}
              </div>
            )}
            {gpsError && (
              <p className="mt-1 text-[11px] text-rose-600 font-medium">{gpsError}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={gpsLoading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-green-600 bg-white text-green-700 hover:bg-green-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            {gpsLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Crosshair className="w-3.5 h-3.5" />
                <span>Use Current GPS</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMapModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Pick on Map</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="relative bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl border border-civic-border overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-civic-border bg-[#F8FAF8] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-green-100 text-green-800 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172B20]">
                    Select Problem Location on Map
                  </h3>
                  <p className="text-[11px] text-[#647067]">
                    Click anywhere on the map to place the problem marker pin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="p-2 text-civic-secondary hover:text-civic-text rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative min-h-0">
              <InteractiveCityMap
                center={currentCenter}
                zoom={14}
                interactiveSelection={true}
                selectedLocation={
                  value.latitude && value.longitude
                    ? [value.latitude, value.longitude]
                    : null
                }
                userLocation={
                  value.locationMode === 'gps' && value.latitude
                    ? [value.latitude, value.longitude]
                    : null
                }
                onSelectLocation={handleMapPinSelected}
                className="h-full w-full"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-civic-border bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div className="text-xs">
                {value.latitude && value.longitude ? (
                  <div className="flex items-center gap-2 text-green-800 font-mono font-bold">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>
                      Selected Pin: {value.latitude}, {value.longitude}
                    </span>
                    {geocoding && (
                      <span className="text-[10px] text-gray-500 font-normal">
                        (Resolving address...)
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[#647067] text-[11px]">
                    No pin placed yet. Click anywhere on the map above to select.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="px-3.5 py-2 rounded-xl border border-civic-border text-xs font-semibold text-[#172B20] hover:bg-gray-50 transition-colors"
                >
                  Detect GPS
                </button>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-2xs transition-colors"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

LocationSelector.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  city: PropTypes.string,
};
