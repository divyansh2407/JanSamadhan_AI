/**
 * JanSamadhan – Government AI Analysis Review Page (/government/ai-review/:problemId)
 * Provides authorized municipal officers with a comprehensive view of
 * Grok AI recommendations, confidence breakdown, historical audits, and human verification controls.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Clock,
  Shield,
  Loader2,
  AlertTriangle,
  History,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AIAnalysisCard from '../../components/ai/AIAnalysisCard';
import AIReviewModal from '../../components/ai/AIReviewModal';
import aiService from '../../services/aiService';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function AIAnalysisPreviewPage() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [problem, setProblem] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [reviewModalAction, setReviewModalAction] = useState(null); // 'ACCEPT' | 'EDIT' | 'REJECT' | null

  const isOfficer = user?.role === 'GOVERNMENT' || user?.role === 'SUPER_ADMIN';

  // Load problem details & AI analysis
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch problem report
      const probRes = await api.get(`/problems/${problemId}`);
      setProblem(probRes.data?.problem || null);

      // Fetch latest AI analysis
      const aiData = await aiService.getAnalysis(problemId);
      setAnalysis(aiData);

      // Fetch history if officer
      if (isOfficer) {
        const histData = await aiService.getAnalysisHistory(problemId);
        setHistoryList(histData?.history || []);
      }
    } catch (err) {
      console.error('Failed to load problem or AI analysis:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load report analysis');
    } finally {
      setLoading(false);
    }
  }, [problemId, isOfficer]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle re-analyze trigger
  const handleReanalyze = async () => {
    try {
      setActionLoading(true);
      const updated = await aiService.triggerAnalysis(problemId, true);
      setAnalysis(updated);
      await loadData();
    } catch (err) {
      alert(`Re-analysis failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle officer review decision submission
  const handleReviewSubmit = async (reviewData) => {
    try {
      setActionLoading(true);
      await aiService.reviewAnalysis(analysis.id, reviewData);
      setReviewModalAction(null);
      await loadData();
    } catch (err) {
      alert(`Review action failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="section-container max-w-5xl mx-auto px-4 space-y-6">
          {/* Breadcrumb / Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Link
              to="/government/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647067] hover:text-[#172B20] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Government Portal</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-green-700 font-mono bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                {problem?.trackingNumber || 'JS-RECORD'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white uppercase text-[10px]">
                {problem?.status || 'SUBMITTED'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-civic-secondary text-xs">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span>Loading civic report and Grok AI intelligence...</span>
            </div>
          ) : error ? (
            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Error Loading AI Intelligence</span>
              </div>
              <p>{error}</p>
              <button
                onClick={loadData}
                className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl font-semibold text-xs hover:bg-rose-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Problem Overview Card */}
              {problem && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-civic-border shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#647067]">
                        Reported Civic Complaint
                      </span>
                      <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B20]">
                        {problem.title}
                      </h1>
                    </div>
                    <div className="text-xs text-[#647067] flex items-center gap-1.5 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(problem.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#172B20] leading-relaxed whitespace-pre-line bg-[#F8FAF8] p-4 rounded-2xl border border-civic-border">
                    {problem.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#647067] uppercase font-bold block">Category</span>
                      <span className="font-semibold text-[#172B20] block">{problem.category?.name || 'Unspecified'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#647067] uppercase font-bold block">Location</span>
                      <span className="font-semibold text-[#172B20] block truncate">
                        {problem.address}, {problem.city}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#647067] uppercase font-bold block">User Severity</span>
                      <span className="font-semibold text-[#172B20] block">{problem.severity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#647067] uppercase font-bold block">Type</span>
                      <span className="font-semibold text-[#172B20] block">
                        {problem.isAnonymous ? 'Anonymous' : 'Registered Citizen'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Analysis Component */}
              <AIAnalysisCard
                analysis={analysis}
                onReview={(act) => setReviewModalAction(act)}
                onReanalyze={handleReanalyze}
                isOfficer={isOfficer}
                loading={actionLoading}
              />

              {/* Historical Audit Trail */}
              {isOfficer && historyList.length > 1 && (
                <div className="bg-white rounded-3xl p-6 border border-civic-border shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-green-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B20]">
                      Historical AI Run Audit Log ({historyList.length})
                    </h3>
                  </div>

                  <div className="divide-y divide-gray-100 text-xs">
                    {historyList.map((hist, idx) => (
                      <div key={hist.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#172B20]">Run #{historyList.length - idx}</span>
                            <span className="text-[10px] font-mono text-[#647067]">{hist.modelName}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                hist.processingStatus === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {hist.processingStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#647067] mt-0.5 truncate max-w-md">
                            {hist.summary}
                          </p>
                        </div>
                        <span className="text-[10px] text-[#647067] shrink-0 font-mono">
                          {new Date(hist.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      <AIReviewModal
        isOpen={Boolean(reviewModalAction)}
        onClose={() => setReviewModalAction(null)}
        action={reviewModalAction}
        analysis={analysis}
        onSubmit={handleReviewSubmit}
        loading={actionLoading}
      />

      <Footer />
    </div>
  );
}
