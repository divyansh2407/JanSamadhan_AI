/**
 * JanSamadhan – Civic Problem Collaboration Platform
 * Allows universities, industries, and research experts to discover real-world
 * verified civic challenges, express interest, and formulate solution proposals.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import collaborationService from '../../services/collaborationService';
import publicFeedService from '../../services/publicFeedService';
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
  Search,
  AlertCircle,
  MapPin,
  Lightbulb,
  Handshake,
  Send,
  Eye,
  X,
  ShieldCheck,
} from 'lucide-react';

export default function CollaborationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'initiatives'
  const [loading, setLoading] = useState(true);

  // Discover Problems state
  const [problems, setProblems] = useState([]);
  const [problemSearch, setProblemSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProblemForExplore, setSelectedProblemForExplore] = useState(null);

  // Collaborations state
  const [collaborations, setCollaborations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  // Express Interest / Create Collaboration Modal
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [targetProblem, setTargetProblem] = useState(null);
  const [organization, setOrganization] = useState(user?.organizationName || user?.departmentName || '');
  const [collaborationType, setCollaborationType] = useState(
    user?.role === 'UNIVERSITY' ? 'ACADEMIC_PILOT' : user?.role === 'INDUSTRY' ? 'CSR_PARTNERSHIP' : 'TECHNICAL_CONSORTIUM'
  );
  const [description, setDescription] = useState('');
  const [modalFeedback, setModalFeedback] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [feedData, collabData] = await Promise.all([
        publicFeedService.getFeed({
          search: problemSearch,
          category: selectedCategory,
          limit: 20,
        }),
        collaborationService.listCollaborations({ status: statusFilter }),
      ]);

      setProblems(feedData.problems || []);
      setCollaborations(collabData.collaborations || []);
    } catch (err) {
      console.error('Failed to load collaboration data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [problemSearch, selectedCategory, statusFilter]);

  const handleExpressInterest = (prob) => {
    setTargetProblem(prob);
    setOrganization(user?.organizationName || user?.name || '');
    setDescription('');
    setModalFeedback('');
    setShowInterestModal(true);
  };

  const submitInterest = async (e) => {
    e.preventDefault();
    setModalFeedback('');
    try {
      await collaborationService.createCollaboration({
        problemId: targetProblem.id,
        organization: organization.trim(),
        collaborationType,
        description: description.trim(),
      });
      setModalFeedback('Collaboration request submitted successfully! Municipal authorities will review your proposal.');
      setTimeout(() => {
        setShowInterestModal(false);
        setActiveTab('initiatives');
        loadData();
      }, 1200);
    } catch (err) {
      setModalFeedback('Failed to submit collaboration request. Please try again.');
    }
  };

  const handleUpdateCollabStatus = async (collabId, newStatus) => {
    try {
      await collaborationService.updateStatus(collabId, newStatus);
      loadData();
    } catch (err) {
      console.error('Failed to update collaboration status:', err);
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
                <span>Multi-Stakeholder Innovation Hub</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Civic Problem Discovery & Collaboration Platform
              </h1>
              <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
                Connect academic research labs, corporate CSR initiatives, and engineering experts with ground-level
                civic challenges reported by citizens. Formulate actionable solutions and pilot technological interventions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/proposals/submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#172B20] text-white text-xs font-bold shadow-sm hover:bg-green-950 transition-all"
              >
                <Lightbulb size={16} />
                <span>Submit Solution Proposal</span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mt-8 gap-6">
            <button
              onClick={() => setActiveTab('discover')}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'discover'
                  ? 'border-green-800 text-green-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Search size={16} />
              <span>Discover Verified Problems ({problems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('initiatives')}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'initiatives'
                  ? 'border-green-800 text-green-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Handshake size={16} />
              <span>Active Multi-Stakeholder Partnerships ({collaborations.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* ── TAB 1: Discover Civic Problems for Solutions ─────────────────── */}
        {activeTab === 'discover' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search challenges by keyword, category, or city..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="">All Problem Categories</option>
                  <option value="Roads and Potholes">Roads & Potholes</option>
                  <option value="Garbage and Waste Management">Waste & Sanitation</option>
                  <option value="Water Supply and Leakage">Water & Drainage</option>
                  <option value="Electricity and Streetlights">Electricity & Streetlights</option>
                  <option value="Traffic and Transportation">Traffic & Mobility</option>
                </select>
              </div>
            </div>

            {/* Problem Cards Grid */}
            {loading ? (
              <div className="text-center py-16 text-xs text-gray-500">
                Loading public civic challenges...
              </div>
            ) : problems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
                <AlertCircle size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-600">No civic problems match your filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {problems.map((prob) => (
                  <div
                    key={prob.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {prob.trackingNumber}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {prob.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
                        {prob.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-3 text-[11px] text-gray-600">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">
                          {prob.category?.name || 'Civic'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-800 font-medium">
                          <MapPin size={12} />
                          <span>{prob.city || 'Pune'}</span>
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                        {prob.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedProblemForExplore(prob)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>Explore</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleExpressInterest(prob)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          title="Register multi-stakeholder partnership"
                        >
                          Express Interest
                        </button>

                        <button
                          onClick={() => navigate(`/proposals/submit?problemId=${prob.id}`)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-green-800 hover:bg-green-900 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Lightbulb size={12} />
                          <span>Propose</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Active Multi-Stakeholder Partnerships ─────────────────── */}
        {activeTab === 'initiatives' && (
          <div>
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

            {loading ? (
              <div className="text-center py-16 text-xs text-gray-500">
                Loading collaboration workspaces...
              </div>
            ) : collaborations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
                  <Users2 size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No Active Initiatives Yet</h3>
                <p className="text-xs text-gray-500 mb-6">
                  Select a reported civic challenge from the Discover tab to submit the first solution collaboration proposal.
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="px-4 py-2 bg-green-800 text-white rounded-xl text-xs font-bold"
                >
                  Discover Challenges
                </button>
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
                        <span>{collab.members?.length || 1} Members</span>
                      </span>

                      {(user?.role === 'GOVERNMENT' || user?.role === 'SUPER_ADMIN') && collab.status === 'INITIATED' ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleUpdateCollabStatus(collab.id, 'ACTIVE')}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateCollabStatus(collab.id, 'CANCELLED')}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <Link
                          to={`/collaborations/${collab.id}`}
                          className="text-xs font-semibold text-green-700 hover:text-green-900 flex items-center gap-1"
                        >
                          <span>Open Workspace</span>
                          <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Express Interest / Propose Collaboration Modal ─────────────────── */}
      {showInterestModal && targetProblem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Express Collaboration Interest</h3>
                <p className="text-xs text-gray-500 truncate max-w-sm mt-0.5">{targetProblem.title}</p>
              </div>
              <button
                onClick={() => setShowInterestModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {modalFeedback && (
              <div className="my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                {modalFeedback}
              </div>
            )}

            <form onSubmit={submitInterest} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Organization / University / Corporate Name *
                </label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. COEP Technological University Urban Lab"
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Collaboration Track *
                </label>
                <select
                  value={collaborationType}
                  onChange={(e) => setCollaborationType(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="ACADEMIC_PILOT">Academic Research & Pilot Deployment</option>
                  <option value="CSR_PARTNERSHIP">Corporate CSR Funding & Infrastructure</option>
                  <option value="TECHNICAL_CONSORTIUM">Domain Expert & Engineering Consultancy</option>
                  <option value="COMMUNITY_ACTION">Community NGO Action</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Proposed Contribution / Approach Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the technological capability, lab equipment, or CSR resource your organization intends to deploy..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInterestModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-green-800 hover:bg-green-900 text-white font-bold shadow-xs"
                >
                  Submit Official Interest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Explore Problem Modal ─────────────────────────────────────────── */}
      {selectedProblemForExplore && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {selectedProblemForExplore.trackingNumber}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{selectedProblemForExplore.title}</h3>
              </div>
              <button
                onClick={() => setSelectedProblemForExplore(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">Description</span>
                <p className="text-gray-800 leading-relaxed">{selectedProblemForExplore.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 block">Category</span>
                  <span className="font-bold text-gray-900">{selectedProblemForExplore.category?.name || 'Civic'}</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 block">Location</span>
                  <span className="font-bold text-gray-900">{selectedProblemForExplore.city}</span>
                </div>
              </div>

              {selectedProblemForExplore.images && selectedProblemForExplore.images.length > 0 && (
                <div>
                  <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Ground Photo Evidence</span>
                  <div className="h-44 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={selectedProblemForExplore.images[0].imageUrl}
                      alt="Ground Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const prob = selectedProblemForExplore;
                  setSelectedProblemForExplore(null);
                  handleExpressInterest(prob);
                }}
                className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200"
              >
                Express Interest
              </button>
              <button
                onClick={() => {
                  const id = selectedProblemForExplore.id;
                  setSelectedProblemForExplore(null);
                  navigate(`/proposals/submit?problemId=${id}`);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-green-800 hover:bg-green-900 rounded-xl shadow-xs"
              >
                Propose Technical Solution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
