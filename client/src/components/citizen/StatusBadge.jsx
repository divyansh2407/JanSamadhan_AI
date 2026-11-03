/**
 * JanSamadhan – Status Badge Component
 * Renders standardized civic problem status badges with semantic colors and icons.
 */

import PropTypes from 'prop-types';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  UserCheck,
  CheckCheck,
  XCircle,
  FileQuestion,
} from 'lucide-react';

const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'REPORTED',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: Clock,
  },
  ACKNOWLEDGED: {
    label: 'UNDER REVIEW',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: FileQuestion,
  },
  VERIFIED: {
    label: 'VERIFIED',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    icon: UserCheck,
  },
  ASSIGNED: {
    label: 'ASSIGNED',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: Wrench,
  },
  RESOLVED: {
    label: 'RESOLVED',
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: CheckCircle2,
  },
  VERIFIED_COMPLETE: {
    label: 'VERIFIED COMPLETE',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    icon: CheckCheck,
  },
  REJECTED: {
    label: 'REJECTED',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: XCircle,
  },
};

export default function StatusBadge({ status, className = '' }) {
  const normalizedStatus = (status || 'SUBMITTED').toUpperCase();
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.SUBMITTED;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {config.label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
  className: PropTypes.string,
};

