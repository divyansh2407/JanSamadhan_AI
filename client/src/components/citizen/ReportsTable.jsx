/**
 * JanSamadhan – Citizen Reports Table & Card List
 * Displays paginated, searchable, and filterable complaints submitted by the citizen.
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Calendar,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ReportsTable({
  reports = [],
  pagination = {},
  categories = [],
  onPageChange,
  onFilterChange,
  onViewDetails,
  isLoading = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({
      search: searchTerm,
      status: selectedStatus,
      categoryId: selectedCategory,
    });
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    onFilterChange({
      search: searchTerm,
      status,
      categoryId: selectedCategory,
    });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    onFilterChange({
      search: searchTerm,
      status: selectedStatus,
      categoryId,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedCategory('');
    onFilterChange({ search: '', status: '', categoryId: '' });
  };

  return (
    <div className="bg-white rounded-3xl border border-civic-border shadow-sm overflow-hidden">
      {/* ── Table Controls Header ── */}
      <div className="p-5 border-b border-civic-border bg-[#F8FAF8] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-civic-text flex items-center gap-2">
              My Civic Reports
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                {pagination.total || reports.length} Total
              </span>
            </h3>
            <p className="text-xs text-civic-secondary mt-0.5">
              Track the live progress of all issues you have submitted to municipal authorities.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs font-semibold py-2 pl-3 pr-8 rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Reported</option>
                <option value="ACKNOWLEDGED">Under Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-civic-secondary absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Category Dropdown */}
            {categories.length > 0 && (
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="text-xs font-semibold py-2 pl-3 pr-8 rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none cursor-pointer max-w-[150px] truncate"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 text-civic-secondary absolute right-2.5 top-3 pointer-events-none" />
              </div>
            )}

            {(searchTerm || selectedStatus || selectedCategory) && (
              <button
                onClick={handleReset}
                className="text-xs text-civic-secondary hover:text-civic-text p-2 rounded-xl hover:bg-gray-100 flex items-center gap-1 transition-colors"
                title="Reset filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your reports by title, tracking ID, or street address..."
            className="w-full pl-10 pr-24 py-2.5 text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all placeholder:text-gray-400"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* ── Table Content ── */}
      {isLoading ? (
        <div className="p-8 space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 px-4 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-green-50 text-green-700 border border-green-200 flex items-center justify-center">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-civic-text">No Civic Reports Found</h4>
          <p className="text-xs text-civic-secondary max-w-sm mx-auto mt-1">
            {searchTerm || selectedStatus || selectedCategory
              ? 'No complaints matched your search filter criteria. Try resetting your filters.'
              : 'You have not submitted any complaints yet. Use the "Report a Civic Issue" button to submit your first report.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-civic-border bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-civic-secondary">
                  <th className="py-3 px-5">Tracking ID</th>
                  <th className="py-3 px-5">Problem Title</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Location</th>
                  <th className="py-3 px-5">Submitted</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-civic-border text-sm">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-green-50/40 transition-colors group"
                  >
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-green-800">
                      {report.trackingNumber || `PRB-${report.id.slice(0, 8).toUpperCase()}`}
                    </td>
                    <td className="py-3.5 px-5 max-w-xs">
                      <span className="font-semibold text-civic-text block truncate group-hover:text-green-700 transition-colors">
                        {report.title}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-civic-secondary">
                      {report.category?.name || 'General'}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-civic-secondary max-w-[180px] truncate">
                      {report.address ? `${report.address}, ${report.city}` : report.city}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-civic-secondary font-mono">
                      {new Date(report.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onViewDetails(report)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-green-100 text-civic-text hover:text-green-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="md:hidden divide-y divide-civic-border">
            {reports.map((report) => (
              <div key={report.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-green-800 block">
                      {report.trackingNumber || `PRB-${report.id.slice(0, 8).toUpperCase()}`}
                    </span>
                    <h4 className="font-bold text-sm text-civic-text mt-0.5 line-clamp-2">
                      {report.title}
                    </h4>
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                <div className="flex items-center justify-between text-xs text-civic-secondary pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-green-600" />
                    {report.city}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                <button
                  onClick={() => onViewDetails(report)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-green-100 text-civic-text hover:text-green-800 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Status Timeline
                </button>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-civic-border bg-[#F8FAF8] flex items-center justify-between text-xs text-civic-secondary">
              <span>
                Page <strong className="text-civic-text">{pagination.page}</strong> of{' '}
                <strong className="text-civic-text">{pagination.totalPages}</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-xl border border-civic-border bg-white text-civic-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-xl border border-civic-border bg-white text-civic-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

ReportsTable.propTypes = {
  reports: PropTypes.array,
  pagination: PropTypes.object,
  categories: PropTypes.array,
  onPageChange: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

