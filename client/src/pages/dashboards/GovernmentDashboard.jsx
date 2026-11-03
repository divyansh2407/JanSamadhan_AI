/**
 * JanSamadhan – Government Administration & Verification Dashboard (Stages 9 & 10)
 * Professional civic administration portal for municipal authorities, triage,
 * verification, department routing, and progress tracking.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import governmentService from '../../services/governmentService';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  FileText,
  UserCheck,
  Send,
  Filter,
  RefreshCw,
  Eye,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function GovernmentDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected problem for verification & assignment modal
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [assignDeptId, setAssignDeptId] = useState('');
  const [assignPriority, setAssignPriority] = useState('NORMAL');
  const [assignOfficerId, setAssignOfficerId] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, queueData, deptsData, officersData] = await Promise.all([
        governmentService.getDashboardStats(),
        governmentService.getVerificationQueue({
          status: statusFilter,
          severity: severityFilter,
        }),
        governmentService.getDepartments(),
        governmentService.getOfficers(),
      ]);

      setStats(statsData);
      setQueue(queueData.problems || []);
      setDepartments(deptsData);
      setOfficers(officersData);
    } catch (err) {
      console.error('Failed to load government dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter]);

  const openProblemDetail = async (id) => {
    setDetailLoading(true);
    setFeedbackMsg('');
    try {
      const problem = await governmentService.getProblemDetail(id);
      setSelectedProblem(problem);
      setAssignDeptId(problem?.assignedDepartmentId || '');
    } catch (err) {
      console.error('Failed to load problem detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleVerify = async (action) => {
    if (!selectedProblem) return;
    try {
      await governmentService.verifyProblem(selectedProblem.id, {
        action,
        notes: actionNotes,
        rejectionReason: action === 'REJECT' ? rejectionReason : undefined,
      });
      setFeedbackMsg(`Problem successfully marked as ${action}!`);
      await openProblemDetail(selectedProblem.id);
      loadData();
    } catch (err) {
      setFeedbackMsg('Error updating verification status.');
    }
  };

  const handleAssignDepartment = async () => {
    if (!selectedProblem || !assignDeptId) return;
    try {
      await governmentService.assignDepartment(selectedProblem.id, {
        departmentId: assignDeptId,
        priority: assignPriority,
        assignmentNotes: actionNotes,
      });
      setFeedbackMsg('Department assigned successfully!');
      await openProblemDetail(selectedProblem.id);
      loadData();
    } catch (err) {
      setFeedbackMsg('Error assigning department.');
    }
  };

  const handleAssignOfficer = async () => {
    if (!selectedProblem || !assignOfficerId) return;
    try {
      await governmentService.assignOfficer(selectedProblem.id, {
        officerUserId: assignOfficerId,
        assignmentNotes: actionNotes,
      });
      setFeedbackMsg('Officer assigned successfully!');
      await openProblemDetail(selectedProblem.id);
      loadData();
    } catch (err) {
      setFeedbackMsg('Error assigning officer.');
    }
  };

  const handleAddNote = async () => {
    if (!selectedProblem || !internalNoteText.trim()) return;
    try {
      await governmentService.addInternalNote(selectedProblem.id, {
        noteText: internalNoteText,
        isPublic: false,
      });
      setInternalNoteText('');
      await openProblemDetail(selectedProblem.id);
    } catch (err) {
      setFeedbackMsg('Error adding internal note.');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedProblem) return;
    try {
      await governmentService.updateProblemStatus(selectedProblem.id, {
        status: newStatus,
        notes: newStatus === 'RESOLVED' ? resolutionNotes : actionNotes,
      });
      setFeedbackMsg(`Status updated to ${newStatus}!`);
      await openProblemDetail(selectedProblem.id);
      loadData();
    } catch (err) {
      setFeedbackMsg('Error updating status.');
    }
  };

  const filteredQueue = queue.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#172B20] flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Jan<span className="text-green-700">Samadhan</span> Municipal Administration
              </h1>
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                Official Verification & Department Routing Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-800 hover:bg-green-100 border border-green-200"
            >
              <TrendingUp size={14} />
              <span>City Analytics</span>
            </Link>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-gray-900 block">{user?.name}</span>
              <span className="text-[11px] text-green-700 font-medium">{user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Total Reports
            </span>
            <span className="text-2xl font-black text-gray-900">{stats.total}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/30">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
              Pending Triage
            </span>
            <span className="text-2xl font-black text-amber-800">{stats.pending}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm bg-blue-50/30">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
              Verified Issues
            </span>
            <span className="text-2xl font-black text-blue-800">{stats.verified}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm bg-purple-50/30">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">
              In Progress
            </span>
            <span className="text-2xl font-black text-purple-800">{stats.inProgress}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-green-200 shadow-sm bg-green-50/30">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider block mb-1">
              Resolved
            </span>
            <span className="text-2xl font-black text-green-800">{stats.resolved}</span>
          </div>
        </div>

        {/* Queue and Filter Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Civic Complaints Triage & Verification Queue
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Review complaints, analyze AI recommendations, verify authenticity, and assign departments.
              </p>
            </div>

            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors self-start md:self-auto"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Queue</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by Title, Tracking # or City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>

            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 bg-white"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-y border-gray-200">
                <tr>
                  <th className="py-3 px-4">Tracking #</th>
                  <th className="py-3 px-4">Problem Title & Location</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">AI Triage Rec.</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                      No complaints found in verification queue.
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map((prob) => (
                    <tr key={prob.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {prob.trackingNumber || 'JS-PENDING'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-900 block">{prob.title}</span>
                        <span className="text-[11px] text-gray-500">
                          {prob.city || 'Pune'}, {prob.address || 'Reported Location'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 font-medium text-gray-700">
                          {prob.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                            prob.severity === 'CRITICAL' || prob.severity === 'HIGH'
                              ? 'bg-rose-100 text-rose-800'
                              : prob.severity === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {prob.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prob.status === 'VERIFIED'
                              ? 'bg-blue-100 text-blue-800'
                              : prob.status === 'RESOLVED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {prob.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {prob.aiAnalyses && prob.aiAnalyses[0] ? (
                          <span className="text-[11px] text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Rec: {prob.aiAnalyses[0].recommendedDepartment || 'Auto Triage'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Analysis Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openProblemDetail(prob.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#172B20] text-white hover:bg-green-950 font-medium text-xs shadow-sm transition-all"
                        >
                          <Eye size={13} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Verification & Action Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 md:p-8">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {selectedProblem.trackingNumber || 'UNASSIGNED'}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedProblem.title}</h3>
                <p className="text-xs text-gray-500">
                  {selectedProblem.address}, {selectedProblem.city}
                </p>
              </div>

              <button
                onClick={() => setSelectedProblem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            {feedbackMsg && (
              <div className="my-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl">
                {feedbackMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Left Column: Complaint Details & AI Recommendations */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Citizen Description
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedProblem.description}
                  </p>
                </div>

                {/* Grok AI Analysis Box */}
                {selectedProblem.aiAnalyses && selectedProblem.aiAnalyses.length > 0 && (
                  <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2 text-purple-900">
                      <Shield size={16} />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Grok AI Recommendation Summary
                      </h4>
                    </div>
                    <p className="text-xs text-purple-950 mb-2 leading-relaxed">
                      {selectedProblem.aiAnalyses[0].summary}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-purple-800">
                      <span className="px-2 py-0.5 bg-purple-100 rounded">
                        Dept: {selectedProblem.aiAnalyses[0].recommendedDepartment}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-100 rounded">
                        Urgency: {selectedProblem.aiAnalyses[0].urgency}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-100 rounded">
                        Category: {selectedProblem.aiAnalyses[0].detectedCategory}
                      </span>
                    </div>
                  </div>
                )}

                {/* Internal Notes Thread */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Internal Government Notes
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                    {selectedProblem.internalNotes && selectedProblem.internalNotes.length > 0 ? (
                      selectedProblem.internalNotes.map((note) => (
                        <div key={note.id} className="text-xs bg-white p-2.5 rounded-xl border border-gray-100">
                          <span className="font-bold text-gray-900 block">{note.author?.name}</span>
                          <p className="text-gray-700 mt-0.5">{note.noteText}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-gray-400">No internal notes yet.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add an internal note..."
                      value={internalNoteText}
                      onChange={(e) => setInternalNoteText(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none"
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-3 py-1.5 rounded-xl bg-gray-800 text-white text-xs font-semibold hover:bg-black"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Verification & Assignment Controls */}
              <div className="space-y-5">
                {/* 1. Official Verification Action */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Step 1: Verification Decision
                  </h4>
                  <textarea
                    rows={2}
                    placeholder="Officer verification observations / remarks..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl mb-3 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify('VERIFY')}
                      className="flex-1 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs shadow-xs"
                    >
                      Verify Complaint
                    </button>
                    <button
                      onClick={() => handleVerify('REJECT')}
                      className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                    >
                      Reject Complaint
                    </button>
                  </div>
                </div>

                {/* 2. Department Assignment */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Step 2: Department Assignment
                  </h4>
                  <div className="space-y-2">
                    <select
                      value={assignDeptId}
                      onChange={(e) => setAssignDeptId(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="">Select Department...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.city})
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <select
                        value={assignPriority}
                        onChange={(e) => setAssignPriority(e.target.value)}
                        className="flex-1 text-xs p-2 border border-gray-200 rounded-xl bg-white focus:outline-none"
                      >
                        <option value="LOW">Priority: LOW</option>
                        <option value="NORMAL">Priority: NORMAL</option>
                        <option value="HIGH">Priority: HIGH</option>
                        <option value="URGENT">Priority: URGENT</option>
                      </select>

                      <button
                        onClick={handleAssignDepartment}
                        className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
                      >
                        Assign Dept
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Status Progression (Stage 10) */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Step 3: Implementation & Resolution
                  </h4>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Resolution completion notes / evidence..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="text-xs p-2 border border-gray-200 rounded-xl focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus('IN_PROGRESS')}
                        className="flex-1 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs"
                      >
                        Mark In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('RESOLVED')}
                        className="flex-1 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs"
                      >
                        Confirm Resolved
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

