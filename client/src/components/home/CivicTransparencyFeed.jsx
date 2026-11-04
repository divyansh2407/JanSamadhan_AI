/**
 * JanSamadhan – Public Civic Problem Transparency Feed
 * Real-time public disclosure of civic issues, municipal accountability,
 * verified ground progress, and official resolution updates.
 */

import React, { useState, useEffect } from 'react';
import publicFeedService from '../../services/publicFeedService';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  MapPin,
  Calendar,
  Eye,
  X,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
} from 'lucide-react';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Pending Triage', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  ACKNOWLEDGED: { label: 'Acknowledged', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  VERIFIED: { label: 'Ground Verified', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  ASSIGNED: { label: 'Dept Assigned', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  IN_PROGRESS: { label: 'Under Investigation / Work In Progress', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
  RESOLVED: { label: 'Resolved & Closed', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
  REJECTED: { label: 'Closed / Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function CivicTransparencyFeed() {
  const [data, setData] = useState({
    statistics: { total: 0, verified: 0, resolved: 0, inProgress: 0, pending: 0 },
    categoryStats: [],
    recentUpdates: [],
    problems: [],
    pagination: { total: 0, page: 1, limit: 12, totalPages: 1 },
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('');

  // Problem detail modal
  const [activeProblem, setActiveProblem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await publicFeedService.getFeed({
        search,
        category: selectedCategory,
        status: selectedStatus,
        city: selectedCity,
        page: 1,
        limit: 12,
      });
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to fetch public civic feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeed();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedStatus, selectedCity]);

  const openDetails = async (id) => {
    setDetailLoading(true);
    try {
      const res = await publicFeedService.getProblemDetails(id);
      if (res && res.success) {
        setActiveProblem(res.problem);
      }
    } catch (err) {
      console.error('Failed to load problem details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const { statistics, categoryStats, recentUpdates, problems } = data;

  return (
    <section id="civic-feed" className="py-20 bg-gray-50 border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>Civic Problem Transparency & Public Accountability</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Live Public Complaints & Resolution Ledger
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
            Every civic grievance registered by residents is publicly cataloged to ensure municipal responsiveness,
            track investigation milestones, and verify real-world resolution evidence.
          </p>
        </div>

        {/* 1. Live Public KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Reports</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900">{statistics?.total || 0}</span>
              <span className="text-xs font-semibold text-gray-500">Public Issues</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-200 shadow-xs bg-indigo-50/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Verified Issues</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-indigo-800">{statistics?.verified || 0}</span>
              <span className="text-xs font-semibold text-indigo-600">Inspected</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Under Investigation</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-blue-800">{statistics?.inProgress || 0}</span>
              <span className="text-xs font-semibold text-blue-600">Work in Progress</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/30 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Resolved Problems</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-800">{statistics?.resolved || 0}</span>
              <span className="text-xs font-semibold text-emerald-600">Action Complete</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20 flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Triage</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-800">{statistics?.pending || 0}</span>
              <span className="text-xs font-semibold text-amber-600">Awaiting Action</span>
            </div>
          </div>
        </div>

        {/* 2. Latest Government Action & Resolution Updates Feed Ticker */}
        {recentUpdates && recentUpdates.length > 0 && (
          <div className="mb-10 bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-800 uppercase tracking-wider">
              <Activity size={15} className="text-emerald-600 animate-pulse" />
              <span>Latest Municipal Government Actions & Resolution Updates</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentUpdates.slice(0, 3).map((upd) => (
                <div key={upd.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{upd.problemTitle}</p>
                    <p className="text-[11px] text-emerald-700 font-medium">{upd.remarks}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                      <span>{upd.city}</span>
                      <span>•</span>
                      <span>{new Date(upd.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Search & Multi-Faceted Filters */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search civic issues by title, description, tracking ID, or area..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">All Categories ({categoryStats?.length || 0})</option>
                {categoryStats?.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name} {c.count ? `(${c.count})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* City / Location Input */}
            <div>
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder="Filter by city (e.g. Pune)..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">Status:</span>
            {[
              { id: 'ALL', label: 'All Statuses' },
              { id: 'SUBMITTED', label: 'Pending Triage' },
              { id: 'VERIFIED', label: 'Verified' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'RESOLVED', label: 'Resolved' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  selectedStatus === st.id
                    ? 'bg-[#172B20] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Problem Cards Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-gray-500">Loading civic complaints ledger...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <Layers size={26} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No Matching Civic Reports Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No reported civic issues match the selected filters. Try broadening your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((prob) => {
              const statusCfg = STATUS_CONFIG[prob.status] || STATUS_CONFIG.SUBMITTED;

              return (
                <div
                  key={prob.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Tracking number & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {prob.trackingNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Problem Title */}
                    <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
                      {prob.title}
                    </h3>

                    {/* Category & Location Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                        <AlertCircle size={12} className="text-gray-500" />
                        <span>{prob.category?.name || 'Civic'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        <MapPin size={12} className="text-emerald-600" />
                        <span>{prob.location?.city || prob.city}</span>
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {prob.description}
                    </p>

                    {/* Evidence Photo Preview */}
                    {prob.images && prob.images.length > 0 && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 h-36 bg-gray-100 relative group">
                        <img
                          src={prob.images[0].imageUrl}
                          alt={prob.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {prob.images.length > 1 && (
                          <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                            +{prob.images.length - 1} more photos
                          </span>
                        )}
                      </div>
                    )}

                    {/* Concerned Municipal Department */}
                    {prob.assignedDepartment && (
                      <div className="mb-4 p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        <Building2 size={14} className="text-gray-500 shrink-0" />
                        <span className="text-[11px] text-gray-700 truncate font-medium">
                          {prob.assignedDepartment.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      <span>{new Date(prob.createdAt).toLocaleDateString()}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openDetails(prob.id)}
                      className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                    >
                      <span>View Public Details</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Citizen Privacy Notice */}
        <div className="mt-12 p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Guaranteed Resident Privacy Protection</h4>
              <p className="text-[11px] text-gray-500">
                To safeguard citizens against retaliation or harassment, personal phone numbers, email addresses, and exact resident identities are never exposed on this public ledger.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full whitespace-nowrap">
            Civic Transparency Act Compliant
          </span>
        </div>

      </div>

      {/* ── Public Details Transparency Modal ──────────────────────────────── */}
      {activeProblem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-800">
                    {activeProblem.trackingNumber}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      (STATUS_CONFIG[activeProblem.status] || STATUS_CONFIG.SUBMITTED).bg
                    } ${(STATUS_CONFIG[activeProblem.status] || STATUS_CONFIG.SUBMITTED).text}`}
                  >
                    {(STATUS_CONFIG[activeProblem.status] || STATUS_CONFIG.SUBMITTED).label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">{activeProblem.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Reported on {new Date(activeProblem.createdAt).toLocaleString()} in {activeProblem.location?.city}
                </p>
              </div>
              <button
                onClick={() => setActiveProblem(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {/* Civic Details */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Problem Description</h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {activeProblem.description}
                </p>
              </div>

              {/* Photo Evidence */}
              {activeProblem.images && activeProblem.images.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ground Photo Evidence</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {activeProblem.images.map((img) => (
                      <div key={img.id} className="rounded-xl overflow-hidden border border-gray-200 h-44 bg-gray-100">
                        <img src={img.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Notes if Resolved */}
              {activeProblem.status === 'RESOLVED' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                    <CheckCircle2 size={16} />
                    <span>Official Resolution Summary</span>
                  </div>
                  <p className="text-xs text-emerald-900">
                    {activeProblem.resolutionNotes || 'Work verified and completed by municipal engineering squad.'}
                  </p>
                </div>
              )}

              {/* Status Timeline History */}
              {activeProblem.statusHistory && activeProblem.statusHistory.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Official Investigation & Action Timeline
                  </h4>
                  <div className="space-y-3 pl-2 border-l-2 border-emerald-500">
                    {activeProblem.statusHistory.map((h, i) => (
                      <div key={h.id || i} className="relative pl-4">
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold text-gray-900">{h.toStatus}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(h.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{h.remarks}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Municipal Jurisdiction: {activeProblem.assignedDepartment?.name || 'General Municipal Works'}
              </span>
              <button
                type="button"
                onClick={() => setActiveProblem(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

