/**
 * JanSamadhan – Citizen Dashboard Summary Stat Card
 */

import PropTypes from 'prop-types';

export default function StatsCard({
  title,
  count,
  icon: Icon,
  accentColor = 'text-green-700',
  bgColor = 'bg-green-50',
  borderColor = 'border-green-200',
  description,
  isLoading = false,
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-civic-border shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-civic-secondary uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl ${bgColor} ${accentColor} flex items-center justify-center shrink-0 border ${borderColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        ) : (
          <span className="text-3xl font-extrabold text-civic-text tracking-tight">
            {count ?? 0}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-civic-secondary flex items-center gap-1">
          {description}
        </p>
      )}
    </div>
  );
}

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  icon: PropTypes.elementType.isRequired,
  accentColor: PropTypes.string,
  bgColor: PropTypes.string,
  borderColor: PropTypes.string,
  description: PropTypes.string,
  isLoading: PropTypes.bool,
};

