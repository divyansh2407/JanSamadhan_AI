/**
 * JanSamadhan – Report Status Timeline Modal
 * Displays detailed civic problem progress across the 7-step lifecycle
 * using real chronological status history from the backend.
 */

import PropTypes from 'prop-types';
import {
  X,
  MapPin,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ImageIcon,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const LIFECYCLE_STEPS = [
  { key: 'SUBMITTED', label: 'Report Submitted', desc: 'Civic complaint logged by citizen' },
  { key: 'ACKNOWLEDGED', label: 'Under Review', desc: 'Received by municipal triage cell' },
  { key: 'VERIFIED', label: 'Field Verified', desc: 'Inspected by Ward Junior Engineer' },
  { key: 'ASSIGNED', label: 'Department Assigned', desc: 'Dispatched to responsible division' },
  { key: 'IN_PROGRESS', label: 'Work in Progress', desc: 'Ground repairs and execution underway' },
  { key: 'RESOLVED', label: 'Work Resolved', desc: 'Department marked completion proof' },
  { key: 'VERIFIED_COMPLETE', label: 'Resolution Verified', desc: 'Citizen / community audit confirmed' },
];

export default function StatusTimelineModal({ report, isOpen, onClose }) {
  if (!isOpen || !report) return null;

  const currentStatus = (report.status || 'SUBMITTED').toUpperCase();
  const isRejected = currentStatus === 'REJECTED';

  // Map chronological status history items by toStatus
  const historyMap = {};
  if (Array.isArray(report.statusHistory)) {
    report.statusHistory.forEach((h) => {
      historyMap[h.toStatus] = h;
    });
  }

  // Find active step index in lifecycle
  const currentStepIndex = isRejected
    ? -1
    : LIFECYCLE_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-civic-border overflow-hidden animate-fade-in-up">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-civic-border bg-[#F8FAF8]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-md border border-green-200">
                {report.trackingNumber || `PRB-${report.id.slice(0, 8).toUpperCase()}`}
              </span>
              <StatusBadge status={report.status} />
            </div>
            <h3 className="text-xl font-bold text-civic-text">{report.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-civic-secondary hover:text-civic-text rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50/70 p-4 rounded-2xl border border-civic-border text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600 shrink-0" />
              <div>
                <span className="text-civic-secondary block">Location</span>
                <span className="font-semibold text-civic-text line-clamp-1">
                  {report.address ? `${report.address}, ${report.city}` : report.city}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-green-600 shrink-0" />
              <div>
                <span className="text-civic-secondary block">Assigned Dept</span>
                <span className="font-semibold text-civic-text">
                  {report.assignedDepartment?.name || 'Awaiting Triage'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600 shrink-0" />
              <div>
                <span className="text-civic-secondary block">Reported On</span>
                <span className="font-semibold text-civic-text">
                  {new Date(report.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Rejection Notice if applicable */}
          {isRejected && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Complaint Not Actionable (Rejected)</h4>
                <p className="text-xs mt-1 text-rose-800">
                  {report.rejectionReason ||
                    historyMap.REJECTED?.remarks ||
                    'The municipal authority verified that this issue is either private property, out of municipal jurisdiction, or duplicate.'}
                </p>
              </div>
            </div>
          )}

          {/* Problem Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-civic-secondary mb-1">
              Description
            </h4>
            <p className="text-sm text-civic-text leading-relaxed bg-white border border-civic-border p-3.5 rounded-xl">
              {report.description}
            </p>
          </div>

          {/* Photographs Gallery */}
          {Array.isArray(report.images) && report.images.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-civic-secondary mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-green-600" />
                Submitted Evidence Photographs ({report.images.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative rounded-xl overflow-hidden border border-civic-border bg-gray-100 aspect-video"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.caption || 'Evidence'}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">
                      {img.stage || 'Evidence'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifecycle Status Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-civic-secondary mb-3">
              Resolution Progress Timeline
            </h4>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-civic-border">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const historyEntry = historyMap[step.key];
                const isPassed = !isRejected && currentStepIndex >= idx;
                const isCurrent = !isRejected && currentStepIndex === idx;

                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    {/* Step Dot */}
                    <div
                      className={`absolute -left-6 mt-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                        isPassed
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-2.5 h-2.5" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${
                            isCurrent
                              ? 'text-green-700'
                              : isPassed
                              ? 'text-civic-text'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {historyEntry && (
                          <span className="text-[11px] text-civic-secondary font-mono">
                            {new Date(historyEntry.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-civic-secondary mt-0.5">{step.desc}</p>
                      {historyEntry?.remarks && (
                        <div className="mt-1.5 p-2 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs text-emerald-900 font-medium">
                          💬 {historyEntry.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-civic-border bg-[#F8FAF8] flex items-center justify-between">
          <span className="text-xs text-civic-secondary flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Official municipal tracking record. All updates verified by authorities.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-gray-200 hover:bg-gray-300 text-civic-text transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

StatusTimelineModal.propTypes = {
  report: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
