/**
 * JanSamadhan – Collaboration Detail Workspace (Stage 11)
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import collaborationService from '../../services/collaborationService';
import {
  Users2,
  Building,
  ArrowLeft,
  CheckCircle,
  Clock,
  Shield,
  UserPlus,
} from 'lucide-react';

export default function CollaborationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [collab, setCollab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinRole, setJoinRole] = useState('RESEARCHER');
  const [joinMsg, setJoinMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await collaborationService.getCollaboration(id);
      setCollab(data);
    } catch (err) {
      console.error('Failed to load collaboration detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleJoin = async () => {
    setJoinMsg('');
    try {
      await collaborationService.joinCollaboration(id, joinRole);
      setJoinMsg('Successfully joined the collaboration workspace!');
      loadData();
    } catch (err) {
      setJoinMsg(err.response?.data?.message || 'Failed to join collaboration.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <span className="text-xs text-gray-500">Loading collaboration workspace...</span>
      </div>
    );
  }

  if (!collab) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Collaboration Not Found</h2>
        <Link to="/collaborations" className="text-xs text-green-700 font-bold">
          ← Return to Collaborations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link
          to="/collaborations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={14} />
          <span>Back to Collaborations</span>
        </Link>

        {/* Workspace Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {collab.collaborationType}
              </span>
              <h1 className="text-2xl font-black text-gray-900 mt-2">{collab.organization}</h1>
              <p className="text-xs text-gray-500 mt-1">
                Workspace ID: <span className="font-mono">{collab.id}</span>
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
                collab.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Status: {collab.status}
            </span>
          </div>

          <div className="py-6 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Scope of Work & Joint Mandate
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
              {collab.description}
            </p>
          </div>

          {/* Linked Problem */}
          {collab.problem && (
            <div className="py-6 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Connected Civic Challenge
              </h3>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="font-bold text-gray-900 text-sm block">
                  {collab.problem.title}
                </span>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {collab.problem.description}
                </p>
                <div className="mt-3 flex gap-2 text-[11px] font-semibold text-gray-500">
                  <span>Location: {collab.problem.city}</span>
                  <span>•</span>
                  <span>Status: {collab.problem.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="pt-6">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
              Registered Stakeholder Members ({collab.members?.length || 0})
            </h3>
            <div className="space-y-3 mb-6">
              {collab.members && collab.members.length > 0 ? (
                collab.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-900 block">
                        {m.user?.name || 'Registered Partner'}
                      </span>
                      <span className="text-[11px] text-gray-500">{m.user?.role}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-semibold text-[10px]">
                      {m.role}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No members registered yet.</p>
              )}
            </div>

            {/* Join Form */}
            {user && (
              <div className="bg-green-50/50 p-5 rounded-2xl border border-green-200">
                <h4 className="text-xs font-bold text-green-900 uppercase tracking-wider mb-2">
                  Join This Collaboration Initiative
                </h4>
                {joinMsg && (
                  <div className="p-2 mb-3 bg-white rounded-lg border border-green-300 text-green-800 text-xs font-semibold">
                    {joinMsg}
                  </div>
                )}
                <div className="flex gap-3">
                  <select
                    value={joinRole}
                    onChange={(e) => setJoinRole(e.target.value)}
                    className="text-xs px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="RESEARCHER">Role: Research Lead / Scientist</option>
                    <option value="CONTRACTOR">Role: Implementation Contractor</option>
                    <option value="OBSERVER">Role: Community Observer / Auditor</option>
                  </select>
                  <button
                    onClick={handleJoin}
                    className="px-5 py-2 rounded-xl bg-[#172B20] text-white text-xs font-bold hover:bg-green-950 flex items-center gap-1.5"
                  >
                    <UserPlus size={14} />
                    <span>Join Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

