/**
 * JanSamadhan – Report a Civic Issue Modal
 * Transparently indicates Stage 6 upcoming full reporting pipeline (interactive map, photo upload),
 * while providing immediate reporting requirements.
 */

import PropTypes from 'prop-types';
import { PlusCircle, X, MapPin, Camera, Sparkles, ArrowRight, Shield } from 'lucide-react';

export default function PreReportNoticeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-civic-border overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-civic-border bg-[#F8FAF8]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 border border-green-200 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-civic-text">Report a Civic Issue</h3>
              <p className="text-xs text-civic-secondary">
                Stage 6 Intake Pipeline Specification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-civic-secondary hover:text-civic-text rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              Stage 6 Geo-Tagged Ingestion Engine
            </div>
            <p className="leading-relaxed">
              The full-featured reporting interface with interactive OpenStreetMap pin placement, EXIF-sanitized multi-photo upload, and real-time Grok AI auto-categorization is scheduled for <strong>Stage 6</strong> per the Master Development Roadmap.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-civic-text uppercase tracking-wider text-[11px]">
              What You Will Be Able to Report in Stage 6:
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAF8] border border-civic-border">
                <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-civic-text block">Interactive Ward & Street Pin</strong>
                  Pinpoint exact pothole, water leakage, or streetlight location on high-resolution OpenStreetMap tiles.
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAF8] border border-civic-border">
                <Camera className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-civic-text block">Before / In-Progress / After Photographic Proof</strong>
                  Upload high-resolution camera photos with automatic client-side EXIF stripping for privacy protection.
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAF8] border border-civic-border">
                <Shield className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-civic-text block">Dual Registered or Anonymous Pipeline</strong>
                  Option to submit linked to your citizen profile or anonymously with a 256-bit secret tracking token.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-civic-border bg-[#F8FAF8] flex items-center justify-between">
          <span className="text-[11px] text-civic-secondary font-mono">
            Roadmap: Stage 5 Dashboard Active
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

PreReportNoticeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

