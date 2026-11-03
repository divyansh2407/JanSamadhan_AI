/**
 * JanSamadhan – Officer AI Review Action Modal
 * Enables municipal officers to accept, edit, or reject AI recommendations
 * with audit remarks, without bypassing human verification workflows.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  X,
  Check,
  Edit3,
  AlertTriangle,
  Building2,
  Shield,
  Loader2,
} from 'lucide-react';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const URGENCIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function AIReviewModal({
  isOpen,
  onClose,
  action, // 'ACCEPT' | 'EDIT' | 'REJECT'
  analysis,
  onSubmit,
  loading = false,
}) {
  const [notes, setNotes] = useState('');
  const [editedFields, setEditedFields] = useState({
    suggestedCategory: analysis?.suggestedCategory || '',
    severity: analysis?.severity || 'MEDIUM',
    suggestedDepartment: analysis?.suggestedDepartment || '',
    urgency: analysis?.urgency || 'MEDIUM',
  });

  if (!isOpen || !analysis) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      action,
      notes: notes.trim(),
      editedFields: action === 'EDIT' ? editedFields : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-civic-border overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-civic-border bg-[#F8FAF8]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                action === 'ACCEPT'
                  ? 'bg-green-100 text-green-800'
                  : action === 'EDIT'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {action === 'ACCEPT' ? <Check className="w-5 h-5" /> : action === 'EDIT' ? <Edit3 className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172B20]">
                {action === 'ACCEPT'
                  ? 'Accept AI Recommendation'
                  : action === 'EDIT'
                  ? 'Modify AI Recommendation'
                  : 'Reject AI Recommendation'}
              </h3>
              <p className="text-xs text-[#647067]">
                Human officer audit & verification step
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {action === 'EDIT' && (
            <div className="space-y-3 p-4 rounded-2xl bg-[#F8FAF8] border border-civic-border">
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Adjust Category:
                </label>
                <input
                  type="text"
                  value={editedFields.suggestedCategory}
                  onChange={(e) =>
                    setEditedFields((prev) => ({ ...prev, suggestedCategory: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-civic-border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Adjust Severity:
                  </label>
                  <select
                    value={editedFields.severity}
                    onChange={(e) =>
                      setEditedFields((prev) => ({ ...prev, severity: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-civic-border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Adjust Urgency:
                  </label>
                  <select
                    value={editedFields.urgency}
                    onChange={(e) =>
                      setEditedFields((prev) => ({ ...prev, urgency: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-civic-border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                  >
                    {URGENCIES.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Adjust Department:
                </label>
                <input
                  type="text"
                  value={editedFields.suggestedDepartment}
                  onChange={(e) =>
                    setEditedFields((prev) => ({ ...prev, suggestedDepartment: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-civic-border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1">
              Officer Audit Remarks (Required for records):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                action === 'ACCEPT'
                  ? 'e.g. Ground inspection confirms water main break. Routing to Water Works.'
                  : action === 'EDIT'
                  ? 'e.g. Severity upgraded to CRITICAL due to heavy school commute traffic.'
                  : 'e.g. Insufficient details provided in citizen text to warrant full department dispatch.'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-civic-border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Your review is logged in the permanent municipal audit ledger. AI recommendations never override official authority.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-civic-border text-xs font-semibold text-civic-secondary hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !notes.trim()}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-xs transition-colors ${
                action === 'REJECT'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Review Decision</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AIReviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  action: PropTypes.string,
  analysis: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

