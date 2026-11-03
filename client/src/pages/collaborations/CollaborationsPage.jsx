/**
 * JanSamadhan – Collaboration Platform (Stage 11)
 * Multi-stakeholder ecosystem connecting citizens, municipal bodies,
 * universities, researchers, domain experts, NGOs, and CSR industries.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import collaborationService from '../../services/collaborationService';
import {
  Users2,
  Building,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function CollaborationsPage() {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Create Collaboration modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [problemId, setProblemId] = useState('');
  const [organization, setOrganization] = useState('');
  const [collaborationType, setCollaborationType] = useState('ACADEMIC_PILOT');
  const [description, setDescription] = useState('');
  const [createMsg, setCreateMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await collaborationService.listCollaborations({ status: statusFilter });
      setCollaborations(data.collaborations || []);
    } catch (err) {
      console.error('Failed to load collaborations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateMsg('');
    try {
      await collaborationService.createCollaboration({
        problemId,
        organization,
        collaborationType,
        description,
      });
      setCreateMsg('Collaboration initiative successfully launched!');
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      setCreateMsg('Failed to create collaboration initiative.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Hero Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-xs font-bold uppercase tracking-wider mb-3">
                <Users2 size={14} />
                <span>Multi-Stakeholder Civic Ecosystem</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Civic Collaboration Workspaces
              </h1>
              <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
                JanSamadhan bridges municipal administration with academic institutions,
                independent engineering experts, NGOs, and corporate CSR partners to co-create
                high-impact urban solutions.
              </p>
            </div>

            {(user?.role === 'GOVERNMENT' || user?.role === 'SUPER_ADMIN') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#172B20] text-white text-xs font-bold shadow-sm hover:bg-green-950 transition-all self-start md:self-auto"
              >
                <Plus size={16} />
                <span>Initiate Collaboration</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-700">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-xl bg-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="INITIATED">INITIATED</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          <span className="text-xs text-gray-500 font-medium">
            {collaborations.length} Active Initiatives
          </span>
        </div>

        {/* Collaboration Cards */}
        {loading ? (
          <div className="text-center py-16 text-xs text-gray-500">
            Loading collaboration workspaces...
          </div>
        ) : collaborations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
              <Users2 size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              No Collaborations Found
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              There are currently no active multi-stakeholder partnerships matching your filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborations.map((collab) => (
              <div
                key={collab.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {collab.collaborationType}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        collab.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : collab.status === 'COMPLETED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {collab.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug">
                    {collab.organization}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                    {collab.description}
                  </p>

                  {collab.problem && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Linked Civic Problem
                      </span>
                      <span className="text-xs font-semibold text-gray-800 block truncate">
                        {collab.problem.title}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {collab.problem.city}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users2 size={13} />
                    <span>{collab.members?.length || 0} Members</span>
                  </span>

                  <Link
                    to={`/collaborations/${collab.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-green-800 hover:text-green-950"
                  >
                    <span>View Workspace</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Initiate Multi-Stakeholder Collaboration
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Target Problem UUID / ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Problem UUID"
                  value={problemId}
                  onChange={(e) => setProblemId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Partner Organization / Consortium
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COEP Technological University"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Collaboration Type
                </label>
                <select
                  value={collaborationType}
                  onChange={(e) => setCollaborationType(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="ACADEMIC_PILOT">Academic Research Pilot</option>
                  <option value="INDUSTRY_CSR">Industry CSR Partnership</option>
                  <option value="EXPERT_TASKFORCE">Expert Engineering Taskforce</option>
                  <option value="NGO_COMMUNITY">NGO Community Program</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Scope & Objectives
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe joint objectives, resource allocation, and timeline..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#172B20] text-white text-xs font-bold hover:bg-green-950"
                >
                  Launch Collaboration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
