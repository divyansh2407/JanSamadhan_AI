/**
 * JanSamadhan – AI Analysis Card Component
 * Renders structured recommendations from Grok API (xAI) with confidence scores,
 * severity assessment, department routing, preliminary solutions, and duplicate alerts.
 * Features strict human-in-the-loop labels and review triggers for authorized officers.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Sparkles,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Clock,
  Layers,
  Lightbulb,
  Cpu,
  RefreshCw,
  Check,
  X,
  Edit3,
  Copy,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CategoryIcon from '../common/CategoryIcon';

export default function AIAnalysisCard({
  analysis,
  onReview,
  onReanalyze,
  isOfficer = false,
  loading = false,
}) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(true);

  if (!analysis) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-civic-border text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 mx-auto flex items-center justify-center">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-sm font-bold text-[#172B20]">AI Analysis Pending</h3>
        <p className="text-xs text-[#647067] max-w-sm mx-auto">
          Grok AI is queued to analyze this complaint. Municipal officers can also trigger analysis manually.
        </p>
        {isOfficer && (
          <button
            type="button"
            onClick={onReanalyze}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Analyze with Grok AI</span>
          </button>
        )}
      </div>
    );
  }

  const {
    summary,
    suggestedCategory,
    categoryConfidence = 0.9,
    severity,
    severityConfidence = 0.85,
    severityReason,
    suggestedDepartment,
    departmentConfidence = 0.9,
    urgency = 'MEDIUM',
    solutionSuggestions = [],
    possibleDuplicates = [],
    confidence = 0.9,
    modelName = 'grok-2-latest',
    reviewStatus = 'PENDING',
    reviewNotes,
    reviewedAt,
    requiresHumanReview = true,
  } = analysis;

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const getConfidenceBadge = (score) => {
    const pct = Math.round((score || 0) * 100);
    let colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (pct < 75) colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
    if (pct < 50) colorClass = 'bg-rose-50 text-rose-800 border-rose-200';

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}>
        <span>{pct}% Confidence</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-civic-border shadow-sm overflow-hidden space-y-6 p-6 sm:p-8 animate-fade-in">
      {/* ── 1. Mandatory AI Disclaimer Header ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-900 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-300">
                AI-GENERATED RECOMMENDATION
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
                REQUIRES HUMAN VERIFICATION
              </span>
            </div>
            <p className="text-xs text-emerald-950 mt-1 font-medium">
              Analyzed by xAI Grok ({modelName}) to assist municipal decision-makers.
            </p>
          </div>
        </div>

        {isOfficer && (
          <button
            type="button"
            onClick={onReanalyze}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-semibold shadow-2xs transition-colors shrink-0"
            title="Re-run AI analysis with Grok"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Analyze</span>
          </button>
        )}
      </div>

      {/* ── 2. AI Executive Problem Summary ──────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#647067] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-green-700" />
            <span>AI Incident Synthesis</span>
          </h4>
          <button
            type="button"
            onClick={copySummary}
            className="text-[11px] text-green-700 hover:text-green-800 font-semibold flex items-center gap-1 transition-colors"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied' : 'Copy Summary'}</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-[#172B20] leading-relaxed bg-[#F8FAF8] p-4 rounded-2xl border border-civic-border">
          {summary}
        </p>
      </div>

      {/* ── 3. Tri-Core Analysis Metric Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card A: Category Recommendation */}
        <div className="p-4 rounded-2xl bg-white border border-civic-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#647067]">
              Suggested Category
            </span>
            {getConfidenceBadge(categoryConfidence)}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-800 flex items-center justify-center shrink-0">
              <CategoryIcon categoryName={suggestedCategory} className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#172B20] truncate">
              {suggestedCategory}
            </span>
          </div>
        </div>

        {/* Card B: Severity & Urgency Detection */}
        <div className="p-4 rounded-2xl bg-white border border-civic-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#647067]">
              Severity Assessment
            </span>
            {getConfidenceBadge(severityConfidence)}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span
              className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-md ${
                severity === 'CRITICAL'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : severity === 'HIGH'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}
            >
              {severity}
            </span>
            <span className="text-[11px] font-bold text-[#647067] uppercase">
              Urgency: {urgency}
            </span>
          </div>
          <p className="text-[11px] text-[#647067] line-clamp-2 leading-tight">
            {severityReason}
          </p>
        </div>

        {/* Card C: Department Routing Recommendation */}
        <div className="p-4 rounded-2xl bg-white border border-civic-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#647067]">
              Recommended Department
            </span>
            {getConfidenceBadge(departmentConfidence)}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#172B20] truncate">
              {suggestedDepartment}
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. Preliminary Solution Suggestions ─────────────────────────── */}
      {solutionSuggestions && solutionSuggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#647067] flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Solution Proposals (Advisory Only)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {solutionSuggestions.map((sol, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-[#F8FAF8] border border-civic-border space-y-2 text-xs flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-bold text-[#172B20] truncate">{sol.title}</h5>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        sol.complexity === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : sol.complexity === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {sol.complexity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#647067] leading-relaxed">
                    {sol.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-200/80 space-y-1 text-[10px]">
                  <div className="text-green-800">
                    <strong>Benefit:</strong> {sol.benefits}
                  </div>
                  <div className="text-amber-800">
                    <strong>Limitation:</strong> {sol.limitations}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. Duplicate Report Warnings ─────────────────────────────────── */}
      {possibleDuplicates && possibleDuplicates.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
          <button
            type="button"
            onClick={() => setShowDuplicates(!showDuplicates)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Potential Duplicate Reports Detected ({possibleDuplicates.length})</span>
            </div>
            {showDuplicates ? <ChevronUp className="w-4 h-4 text-amber-700" /> : <ChevronDown className="w-4 h-4 text-amber-700" />}
          </button>

          {showDuplicates && (
            <div className="space-y-2 pt-2 border-t border-amber-200/70 text-xs">
              {possibleDuplicates.map((dup, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-amber-950 font-mono text-[11px]">
                      {dup.trackingId || 'Historical Report'}
                    </span>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      {dup.similarityExplanation}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                    {Math.round((dup.confidence || 0.75) * 100)}% Similarity
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 6. Human Review Verification Status & Action Controls ────────── */}
      {isOfficer && (
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-[#647067] font-semibold">Review Status: </span>
            <span
              className={`font-bold uppercase px-2 py-0.5 rounded-full text-[10px] ${
                reviewStatus === 'ACCEPTED'
                  ? 'bg-green-100 text-green-800'
                  : reviewStatus === 'EDITED'
                  ? 'bg-blue-100 text-blue-800'
                  : reviewStatus === 'REJECTED'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {reviewStatus}
            </span>
            {reviewNotes && (
              <span className="text-[#647067] ml-2 text-[11px]">Note: {reviewNotes}</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onReview && onReview('ACCEPT')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Suggestions</span>
            </button>
            <button
              type="button"
              onClick={() => onReview && onReview('EDIT')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-civic-border bg-white text-[#172B20] hover:bg-gray-50 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modify</span>
            </button>
            <button
              type="button"
              onClick={() => onReview && onReview('REJECT')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

AIAnalysisCard.propTypes = {
  analysis: PropTypes.object,
  onReview: PropTypes.func,
  onReanalyze: PropTypes.func,
  isOfficer: PropTypes.bool,
  loading: PropTypes.bool,
};

