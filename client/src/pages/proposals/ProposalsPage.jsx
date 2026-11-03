/**
 * JanSamadhan – Solution Proposals Showcase (Stage 12)
 * High-impact technical proposals submitted by universities, researchers,
 * civil engineering experts, and smart-city solution providers.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import proposalService from '../../services/proposalService';
import {
  Lightbulb,
  Plus,
  ArrowRight,
  Clock,
  IndianRupee,
  CheckCircle,
  XCircle,
  Building,
} from 'lucide-react';

export default function ProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await proposalService.listProposals({ status: statusFilter });
      setProposals(data.proposals || []);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleApprove = async (id, status) => {
    try {
      await proposalService.updateStatus(id, status);
      loadData();
    } catch (err) {
      console.error('Failed to update proposal status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
                <Lightbulb size={14} />
                <span>Engineering & Civic Innovation</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Solution Proposals & Implementation
              </h1>
              <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
                Peer-reviewed civic interventions, research pilots, and infrastructure solutions
                submitted by universities, technical experts, and industry partners.
              </p>
            </div>

            <Link
              to="/proposals/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#172B20] text-white text-xs font-bold shadow-sm hover:bg-green-950 transition-all self-start md:self-auto"
            >
              <Plus size={16} />
              <span>Submit Solution Proposal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-700">Evaluation Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-xl bg-white focus:outline-none"
            >
              <option value="">All Proposals</option>
              <option value="PROPOSED">PROPOSED</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <span className="text-xs text-gray-500 font-medium">
            {proposals.length} Submitted Proposals
          </span>
        </div>

        {/* Proposals Grid */}
        {loading ? (
          <div className="text-center py-16 text-xs text-gray-500">
            Loading solution proposals...
          </div>
        ) : proposals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
              <Lightbulb size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              No Solution Proposals Found
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Be the first university or domain expert to submit an innovative engineering proposal.
            </p>
            <Link
              to="/proposals/submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#172B20] text-white text-xs font-bold"
            >
              <Plus size={14} />
              <span>Submit Proposal</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {prop.submitter?.role || 'EXPERT'}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        prop.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-800'
                          : prop.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                    {prop.description}
                  </p>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Proposed By:</span>
                      <span className="font-semibold text-gray-800">
                        {prop.submitter?.name || 'Researcher'}
                      </span>
                    </div>
                    {prop.estimatedCost && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Est. Budget:</span>
                        <span className="font-bold text-green-800">
                          ₹ {prop.estimatedCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    {prop.estimatedDuration && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Est. Duration:</span>
                        <span className="font-medium text-gray-700">{prop.estimatedDuration}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Government Evaluation Actions */}
                {(user?.role === 'GOVERNMENT' || user?.role === 'SUPER_ADMIN') &&
                  prop.status === 'PROPOSED' && (
                    <div className="pt-4 border-t border-gray-100 flex gap-2">
                      <button
                        onClick={() => handleApprove(prop.id, 'ACCEPTED')}
                        className="flex-1 py-1.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-bold text-xs"
                      >
                        Accept Proposal
                      </button>
                      <button
                        onClick={() => handleApprove(prop.id, 'REJECTED')}
                        className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
