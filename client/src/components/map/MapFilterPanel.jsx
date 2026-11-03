/**
 * JanSamadhan – Map Filter Panel Component
 * Provides comprehensive multi-dimensional filtering for civic map visualization
 * including category, severity, resolution status, verified reports, and city focus.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Building2,
  Layers,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { CITY_CENTERS } from '../../utils/mapUtils';

const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['ALL', 'SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'];

export default function MapFilterPanel({
  filters,
  onChange,
  onReset,
  categories = [],
  totalReports = 0,
  city = 'Pune',
  onCityChange,
}) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-civic-border shadow-sm space-y-5 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2 font-bold text-sm text-[#172B20]">
          <Filter className="w-4 h-4 text-green-700" />
          <span>Map Intelligence Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-[#647067] hover:text-green-800 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* City Selector */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647067] mb-1.5">
          Municipal Corporation Focus:
        </label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-civic-border bg-[#F8FAF8] text-xs font-semibold text-[#172B20] focus:ring-2 focus:ring-green-500 focus:outline-none"
        >
          {Object.keys(CITY_CENTERS).map((cityName) => (
            <option key={cityName} value={cityName}>
              {cityName} Municipal Corporation
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647067] mb-1.5">
          Problem Category:
        </label>
        <select
          value={filters.categoryId || 'ALL'}
          onChange={(e) => onChange('categoryId', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-civic-border bg-[#F8FAF8] text-xs text-[#172B20] focus:ring-2 focus:ring-green-500 focus:outline-none"
        >
          <option value="ALL">All Civic Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Severity Filter */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647067] mb-1.5">
          Severity Level:
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {SEVERITIES.slice(0, 3).map((sev) => {
            const isSelected = (filters.severity || 'ALL') === sev;
            return (
              <button
                key={sev}
                type="button"
                onClick={() => onChange('severity', sev)}
                className={`py-1.5 px-2 rounded-lg font-bold text-[10px] uppercase transition-all ${
                  isSelected
                    ? 'bg-green-600 text-white shadow-2xs'
                    : 'bg-gray-100 text-civic-secondary hover:bg-gray-200'
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
          {SEVERITIES.slice(3).map((sev) => {
            const isSelected = (filters.severity || 'ALL') === sev;
            return (
              <button
                key={sev}
                type="button"
                onClick={() => onChange('severity', sev)}
                className={`py-1.5 px-2 rounded-lg font-bold text-[10px] uppercase transition-all ${
                  isSelected
                    ? 'bg-green-600 text-white shadow-2xs'
                    : 'bg-gray-100 text-civic-secondary hover:bg-gray-200'
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647067] mb-1.5">
          Resolution Status:
        </label>
        <select
          value={filters.status || 'ALL'}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-civic-border bg-[#F8FAF8] text-xs text-[#172B20] focus:ring-2 focus:ring-green-500 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Reported (Intake)</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved Complete</option>
        </select>
      </div>

      {/* Verified Only Checkbox */}
      <div className="pt-2 border-t border-gray-100">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(filters.verifiedOnly)}
            onChange={(e) => onChange('verifiedOnly', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-xs font-semibold text-[#172B20] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
            <span>Verified Reports Only</span>
          </span>
        </label>
      </div>

      {/* Active Results Summary */}
      <div className="p-3 bg-[#F8FAF8] rounded-xl border border-civic-border text-center text-xs">
        <span className="text-[#647067]">Displaying </span>
        <strong className="text-green-800 font-extrabold">{totalReports}</strong>
        <span className="text-[#647067]"> civic issues on map</span>
      </div>
    </div>
  );
}

MapFilterPanel.propTypes = {
  filters: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  categories: PropTypes.array,
  totalReports: PropTypes.number,
  city: PropTypes.string,
  onCityChange: PropTypes.func.isRequired,
};
