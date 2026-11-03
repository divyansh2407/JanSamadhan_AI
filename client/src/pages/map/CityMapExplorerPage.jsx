/**
 * JanSamadhan – City-Wide Civic Map Explorer (/map)
 * Visualizes city-wide civic issues on an interactive OpenStreetMap canvas
 * with multi-dimensional filtering, nearby problem radar, and hotspot analytics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Filter,
  Layers,
  Sparkles,
  Compass,
  Crosshair,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  RotateCcw,
  Eye,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import InteractiveCityMap from '../../components/map/InteractiveCityMap';
import MapFilterPanel from '../../components/map/MapFilterPanel';
import CategoryIcon from '../../components/common/CategoryIcon';
import mapService from '../../services/mapService';
import reportService from '../../services/reportService';
import { CITY_CENTERS, DEFAULT_CENTER } from '../../utils/mapUtils';

import { DEFAULT_CATEGORIES } from '../report/ReportProblemForm';

export default function CityMapExplorerPage() {
  const [city, setCity] = useState('Pune');
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    categoryId: 'ALL',
    status: 'ALL',
    severity: 'ALL',
    verifiedOnly: false,
  });

  // Nearby discovery state
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyList, setNearbyList] = useState([]);
  const [isNearbyOpen, setIsNearbyOpen] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(5);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  // Load categories and summary on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [cats, sum] = await Promise.all([
          reportService.getCategories(),
          mapService.getMapSummary(city),
        ]);
        if (Array.isArray(cats) && cats.length > 0) setCategories(cats);
        setSummary(sum);
      } catch (err) {
        console.error('Failed to load map metadata:', err);
      }
    };
    fetchMeta();
  }, [city]);

  // Fetch reports when filters or city change
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mapService.getMapReports({
        city,
        categoryId: filters.categoryId !== 'ALL' ? filters.categoryId : undefined,
        status: filters.status !== 'ALL' ? filters.status : undefined,
        severity: filters.severity !== 'ALL' ? filters.severity : undefined,
        verifiedOnly: filters.verifiedOnly ? true : undefined,
      });
      setReports(data);
    } catch (err) {
      console.error('Failed to load map reports:', err);
    } finally {
      setLoading(false);
    }
  }, [city, filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handle Nearby Discovery Trigger
  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setUserLocation([lat, lng]);

        try {
          const res = await mapService.getNearbyReports(lat, lng, nearbyRadius);
          setNearbyList(res.data || []);
          setIsNearbyOpen(true);
        } catch (e) {
          alert('Could not discover nearby reports.');
        } finally {
          setNearbyLoading(false);
        }
      },
      (err) => {
        setNearbyLoading(false);
        alert(err.code === 1 ? 'Location permission was denied.' : 'Unable to determine GPS location.');
      },
      { timeout: 10000 }
    );
  };

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => {
    setFilters({
      categoryId: 'ALL',
      status: 'ALL',
      severity: 'ALL',
      verifiedOnly: false,
    });
  };

  const mapCenter = CITY_CENTERS[city] || DEFAULT_CENTER;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
      <Navbar />

      <main className="flex-1 pt-20 flex flex-col">
        {/* Top Metric Bar */}
        <div className="bg-white border-b border-civic-border px-4 py-3 shrink-0">
          <div className="section-container flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-extrabold text-sm text-[#172B20]">
                <MapPin className="w-4 h-4 text-green-700" />
                <span>{city} Civic Map Intelligence</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] text-[#647067]">
                OpenStreetMap Geocoded Visualization
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-xl bg-gray-100 text-[#172B20] font-semibold text-[11px]">
                <span>Total: </span>
                <strong className="text-green-800">{reports.length}</strong>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 font-semibold text-[11px] hidden sm:block">
                <span>In Progress: </span>
                <strong>{reports.filter((r) => r.status === 'IN_PROGRESS').length}</strong>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-green-50 text-green-800 font-semibold text-[11px] hidden sm:block">
                <span>Resolved: </span>
                <strong>{reports.filter((r) => r.status === 'RESOLVED').length}</strong>
              </div>

              <button
                type="button"
                onClick={handleFindNearby}
                disabled={nearbyLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-[11px] shadow-2xs transition-colors shrink-0"
              >
                {nearbyLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Crosshair className="w-3.5 h-3.5" />
                )}
                <span>Near Me</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map & Sidebar Layout */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          {/* Left Filter Sidebar */}
          <div className="w-full lg:w-80 p-4 border-r border-civic-border bg-white overflow-y-auto shrink-0 space-y-4">
            <MapFilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              categories={categories}
              totalReports={reports.length}
              city={city}
              onCityChange={(c) => {
                setCity(c);
                setUserLocation(null);
              }}
            />

            {/* Privacy Shield Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Geospatial Privacy Shield</span>
              </div>
              <p className="leading-snug text-[#172B20]">
                All markers display street-level public descriptions with zero citizen identity or private tokens.
              </p>
            </div>
          </div>

          {/* Map Canvas */}
          <div className="flex-1 relative min-h-[450px] lg:min-h-0">
            {loading && (
              <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-civic-border shadow-md flex items-center gap-2 text-xs font-semibold text-[#172B20]">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span>Loading mapped reports...</span>
              </div>
            )}

            <InteractiveCityMap
              reports={reports}
              center={mapCenter}
              zoom={13}
              userLocation={userLocation}
              onSelectReport={(rep) => setSelectedReport(rep)}
              className="h-full w-full"
            />

            {/* Selected Report Floating Preview Drawer */}
            {selectedReport && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-[1000] bg-white rounded-3xl p-5 border border-civic-border shadow-xl animate-fade-in-up space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-green-800 text-xs">
                      {selectedReport.trackingNumber}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        selectedReport.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedReport.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedReport.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#172B20] line-clamp-1">
                    {selectedReport.title}
                  </h3>
                  <p className="text-[11px] text-[#647067] line-clamp-2 mt-1">
                    {selectedReport.summary || selectedReport.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#647067] pt-1">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{selectedReport.address}, {selectedReport.city}</span>
                  </div>
                  <span className="font-bold uppercase text-[10px] text-green-800">
                    {selectedReport.categoryName}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    Reported {new Date(selectedReport.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  <a
                    href={`/track?id=${encodeURIComponent(selectedReport.trackingNumber)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-800"
                  >
                    <span>Full Progress</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Nearby Issues Slide-out Panel */}
            {isNearbyOpen && (
              <div className="absolute top-4 bottom-4 right-4 w-full sm:w-80 z-[1000] bg-white rounded-3xl border border-civic-border shadow-2xl flex flex-col overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-civic-border bg-[#F8FAF8] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-green-700" />
                    <h3 className="text-xs font-bold text-[#172B20]">
                      Nearby Issues ({nearbyList.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsNearbyOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 border-b border-gray-100 flex items-center justify-between text-xs shrink-0">
                  <span className="text-[11px] text-[#647067]">Search Radius:</span>
                  <div className="flex gap-1">
                    {[2, 5, 10].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setNearbyRadius(r);
                          if (userLocation) {
                            mapService.getNearbyReports(userLocation[0], userLocation[1], r).then((res) => {
                              setNearbyList(res.data || []);
                            });
                          }
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          nearbyRadius === r
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {r} km
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
                  {nearbyList.length === 0 ? (
                    <div className="p-8 text-center text-[#647067] space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                      <p className="font-bold text-xs text-[#172B20]">No Nearby Issues Found</p>
                      <p className="text-[11px]">
                        No complaints reported within {nearbyRadius} km of your GPS coordinates.
                      </p>
                    </div>
                  ) : (
                    nearbyList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedReport(item)}
                        className="p-3 rounded-2xl border border-civic-border bg-[#F8FAF8] hover:bg-green-50/50 hover:border-green-300 transition-all cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-green-800 text-[10px]">
                            {item.trackingNumber}
                          </span>
                          <span className="font-bold text-blue-700 text-[10px]">
                            {item.distanceText}
                          </span>
                        </div>
                        <h4 className="font-bold text-[#172B20] text-xs line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-[#647067] pt-1">
                          <span>{item.category}</span>
                          <span className="uppercase font-bold">{item.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

