/**
 * JanSamadhan – Citizen Recent Activity Feed
 * Chronological stream of actual updates on citizen's reported issues.
 */

import PropTypes from 'prop-types';
import { Activity, ArrowUpRight, CheckCircle2, Clock, Wrench } from 'lucide-react';

export default function ActivityStream({ activities = [], onViewProblem, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-civic-border p-5 shadow-sm space-y-3">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-14 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-14 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-civic-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-civic-text flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-600" />
          Recent Activity
        </h3>
        <span className="text-xs text-civic-secondary font-mono">Live Timeline</span>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-civic-secondary">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          No recent activity on your complaints yet.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((act) => {
            const isResolved = act.toStatus === 'RESOLVED';
            const isInProgress = act.toStatus === 'IN_PROGRESS';

            return (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-2xl border border-civic-border hover:bg-green-50/30 transition-colors group"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isResolved
                      ? 'bg-green-100 text-green-800'
                      : isInProgress
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isResolved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isInProgress ? (
                    <Wrench className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-civic-text truncate">
                      {act.problemTitle}
                    </span>
                    <span className="text-[10px] text-civic-secondary shrink-0 font-mono">
                      {new Date(act.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-civic-secondary mt-0.5 line-clamp-1">
                    {act.remarks || `Status transitioned to ${act.toStatus}`}
                  </p>

                  {onViewProblem && act.problemId && (
                    <button
                      onClick={() => onViewProblem(act.problemId)}
                      className="mt-1 text-[11px] font-semibold text-green-700 hover:text-green-800 inline-flex items-center gap-0.5"
                    >
                      View Report
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

ActivityStream.propTypes = {
  activities: PropTypes.array,
  onViewProblem: PropTypes.func,
  isLoading: PropTypes.bool,
};
