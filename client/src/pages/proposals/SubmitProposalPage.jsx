/**
 * JanSamadhan – Submit Solution Proposal (Stage 12)
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import proposalService from '../../services/proposalService';
import { Lightbulb, ArrowLeft, Send } from 'lucide-react';

export default function SubmitProposalPage() {
  const navigate = useNavigate();

  const [problemId, setProblemId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposedApproach, setProposedApproach] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('3 months');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await proposalService.createProposal({
        problemId,
        title,
        description,
        proposedApproach,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        estimatedDuration,
      });

      navigate('/proposals');
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to submit solution proposal. Please check fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link
          to="/proposals"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={14} />
          <span>Back to Proposals</span>
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Lightbulb size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Submit Civic Solution Proposal
              </h1>
              <p className="text-xs text-gray-500">
                Formulate an engineering or policy intervention for review by municipal authorities.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Target Civic Issue UUID / ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 11111111-2222-3333-4444-555555555555"
                value={problemId}
                onChange={(e) => setProblemId(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Proposal Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Permeable Geopolymer Concrete Resurfacing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Executive Problem Understanding & Overview *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Provide engineering context and analysis of the underlying root cause..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Proposed Technical Approach & Methodology *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Step-by-step technological implementation, materials used, monitoring sensors, and quality benchmarks..."
                value={proposedApproach}
                onChange={(e) => setProposedApproach(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Estimated Budget (₹ INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Estimated Implementation Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 45 days / 3 months"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#172B20] text-white text-xs font-bold hover:bg-green-950 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send size={15} />
              <span>{loading ? 'Submitting Proposal...' : 'Submit Proposal for Municipal Review'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

