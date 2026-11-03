/**
 * JanSamadhan – Public Civic Report Tracking Interface (/track)
 * Tracks status of registered or anonymous complaints.
 * Requires secret token for anonymous reports to preserve security and verification.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Shield,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Loader2,
  Calendar,
  ArrowRight,
  KeyRound,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CategoryIcon from '../../components/common/CategoryIcon';
import reportService from '../../services/reportService';

const RESOLUTION_STEPS = [
  { key: 'SUBMITTED', label: 'Submitted', desc: 'Complaint received in municipal intake' },
  { key: 'ACKNOWLEDGED', label: 'Acknowledged', desc: 'Assigned to ward supervisor' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Field repair team dispatched' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Civic issue rectified and closed' },
];

export default function TrackReportPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const initialToken = searchParams.get('token') || '';

  const [trackingId, setTrackingId] = useState(initialId);
  const [secretToken, setSecretToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [requiresToken, setRequiresToken] = useState(false);

  // Auto-search if ID is present in URL
  useEffect(() => {
    if (initialId) {
      handleTrack(initialId, initialToken);
    }
  }, [initialId, initialToken]);

  const handleTrack = async (idToUse, tokenToUse) => {
    const id = (idToUse || trackingId).trim();
    const token = (tokenToUse !== undefined ? tokenToUse : secretToken).trim();

    if (!id) {
      setError('Please enter a valid Tracking ID (e.g., JS-2026-XXXXXX).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRequiresToken(false);

      const data = await reportService.trackReport(id, token);
      setReport(data);
    } catch (err) {
      console.error('Tracking query failed:', err);
      const statusCode = err.response?.status;
      const isAnon = err.response?.data?.isAnonymous;

      if (statusCode === 401 && (isAnon || !token)) {
        setRequiresToken(true);
        setError('Secret Tracking Key required. This report was submitted anonymously. Please provide your 256-bit secret key.');
      } else if (statusCode === 404) {
        setError('No civic report found matching this Tracking ID. Please double-check the ID.');
      } else {
        setError(err.response?.data?.message || 'Could not fetch report status. Please try again.');
      }
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 0;
      case 'ACKNOWLEDGED':
        return 1;
      case 'IN_PROGRESS':
        return 2;
      case 'RESOLVED':
        return 3;
      case 'REJECTED':
        return -1;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="section-container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 mb-3">
              <Search className="w-3.5 h-3.5 text-green-700" />
              Public Tracking Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172B20] tracking-tight mb-2">
              Track Civic Problem Status
            </h1>
            <p className="text-xs sm:text-sm text-[#647067]">
              Enter your public tracking identifier to view live resolution updates, ward officer notes, and photographic evidence.
            </p>
          </div>

          {/* Search Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-civic-border shadow-md mb-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrack();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tracking ID Input */}
                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Public Tracking ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="e.g. JS-2026-A8K7P2"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-civic-border text-xs font-mono uppercase tracking-wide focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-[#647067] block mt-1">
                    Format: JS-YYYY-XXXXXX
                  </span>
                </div>

                {/* Secret Token Input (Conditional or always available) */}
                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1 flex items-center justify-between">
                    <span>Secret Tracking Key</span>
                    <span className="text-[10px] font-normal text-[#647067]">
                      Required for anonymous reports
                    </span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={secretToken}
                      onChange={(e) => setSecretToken(e.target.value)}
                      placeholder="64-character hexadecimal key (if anonymous)"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-mono focus:ring-2 focus:ring-green-500 focus:outline-none ${
                        requiresToken ? 'border-amber-400 bg-amber-50/30' : 'border-civic-border'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-[#647067] block mt-1">
                    Issued upon anonymous submission
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking Records...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Track Progress</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results Display */}
          {report && (
            <div className="space-y-6 animate-fade-in">
              {/* Status Header Banner */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-civic-border shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider font-mono">
                        {report.trackingId}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          report.isAnonymous
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {report.isAnonymous ? 'Anonymous Submission' : 'Registered Citizen'}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          report.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : report.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : report.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#172B20]">
                      {report.title}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-[#647067] uppercase font-bold block">
                      Submitted Date
                    </span>
                    <span className="text-xs font-semibold text-[#172B20] flex items-center gap-1 sm:justify-end mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(report.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Multi-step Resolution Lifecycle Tracker */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#647067] mb-4">
                    Resolution Lifecycle Tracker
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {RESOLUTION_STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(report.status);
                      const isComplete = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <div
                          key={step.key}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isCurrent
                              ? 'border-green-600 bg-green-50/80 ring-2 ring-green-500/20'
                              : isComplete
                              ? 'border-green-200 bg-green-50/30'
                              : 'border-gray-200 bg-gray-50/50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isComplete
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            <span
                              className={`text-xs font-bold ${
                                isCurrent ? 'text-green-900' : 'text-[#172B20]'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#647067] leading-snug">
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Problem Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#F8FAF8] border border-civic-border text-xs">
                  <div>
                    <span className="text-[10px] text-[#647067] uppercase font-bold block">
                      Category
                    </span>
                    <span className="font-semibold text-[#172B20] flex items-center gap-1.5 mt-0.5">
                      <CategoryIcon
                        iconKey={report.categoryIcon}
                        categoryName={report.category}
                        className="w-4 h-4 text-green-600"
                      />
                      {report.category}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#647067] uppercase font-bold block">
                      Location
                    </span>
                    <span className="font-semibold text-[#172B20] mt-0.5 block truncate">
                      {report.address}
                      {report.landmark ? ` (${report.landmark})` : ''}, {report.city}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#647067] uppercase font-bold block">
                      Assigned Department
                    </span>
                    <span className="font-semibold text-[#172B20] flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      {report.assignedDepartment
                        ? report.assignedDepartment.name
                        : 'Pending Intake Routing'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#647067] mb-1">
                    Problem Description
                  </h4>
                  <p className="text-xs sm:text-sm text-[#172B20] leading-relaxed whitespace-pre-line bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    {report.description}
                  </p>
                </div>

                {/* Attached Photographs (Sanitized) */}
                {report.images && report.images.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#647067] mb-3">
                      Photographic Evidence ({report.images.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {report.images.map((img) => (
                        <a
                          key={img.id}
                          href={img.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="relative block rounded-2xl border border-civic-border overflow-hidden bg-gray-100 group shadow-2xs hover:shadow-md transition-all"
                        >
                          <img
                            src={img.imageUrl}
                            alt="Evidence submission"
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                            <span>View Full Image</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress History & Officer Remarks */}
                {report.progressUpdates && report.progressUpdates.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#647067] mb-3">
                      Official Remarks & Activity Log
                    </h4>
                    <div className="space-y-3">
                      {report.progressUpdates.map((update, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-white border border-civic-border flex items-start gap-3 text-xs"
                        >
                          <div className="w-8 h-8 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-[#172B20]">
                                Status changed to {update.status}
                              </span>
                              <span className="text-[10px] text-[#647067]">
                                {new Date(update.timestamp).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </span>
                            </div>
                            {update.remarks && (
                              <p className="text-[11px] text-[#647067] mt-1">
                                {update.remarks}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
