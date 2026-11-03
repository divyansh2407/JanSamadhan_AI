/**
 * JanSamadhan – Citizen Notifications Modal & Dropdown
 */

import PropTypes from 'prop-types';
import { Bell, X, Check, Clock, CheckCheck, Inbox } from 'lucide-react';

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onViewReport,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-civic-border overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-civic-border bg-[#F8FAF8]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 border border-green-200 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-civic-text">Civic Notifications</h3>
              <p className="text-xs text-civic-secondary">
                {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All updates read'}
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

        {/* List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto divide-y divide-civic-border">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-civic-secondary">
              <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              No notifications yet. You will be alerted when authorities update your complaints.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`py-3.5 px-3 rounded-2xl flex items-start justify-between gap-3 transition-colors ${
                  n.isRead ? 'bg-transparent' : 'bg-green-50/50'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-green-600 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-civic-text">{n.title}</h4>
                  </div>
                  <p className="text-xs text-civic-secondary leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-civic-secondary">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {n.relatedProblemId && onViewReport && (
                      <button
                        onClick={() => {
                          onViewReport(n.relatedProblemId);
                          onClose();
                        }}
                        className="text-green-700 hover:underline font-semibold"
                      >
                        View Issue
                      </button>
                    )}
                  </div>
                </div>

                {!n.isRead && onMarkRead && (
                  <button
                    onClick={() => onMarkRead(n.id)}
                    className="p-1.5 text-xs text-civic-secondary hover:text-green-700 rounded-lg hover:bg-white transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-civic-border bg-[#F8FAF8] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-gray-200 hover:bg-gray-300 text-civic-text transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

NotificationsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  notifications: PropTypes.array,
  unreadCount: PropTypes.number,
  onMarkRead: PropTypes.func,
  onViewReport: PropTypes.func,
};

