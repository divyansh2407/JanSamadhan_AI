/**
 * JanSamadhan – Citizen Registration Page
 * Public account creation page for citizens.
 */

import { Link } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import { Building2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Register() {
  return (
    <div className="min-h-screen bg-civic-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top back link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-civic-secondary hover:text-navy transition-colors"
        >
          <ArrowLeft size={16} /> Back to JanSamadhan Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4">
        {/* Branding header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="w-11 h-11 rounded-2xl bg-navy flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight text-left">
              <span className="block text-xl font-bold text-navy tracking-tight">
                Jan<span className="text-green">Samadhan</span>
              </span>
              <span className="block text-[10px] font-medium text-civic-secondary tracking-widest uppercase">
                Citizen Portal
              </span>
            </div>
          </Link>

          <h1 className="text-2xl font-bold text-navy tracking-tight">
            Create Your Citizen Account
          </h1>
          <p className="text-sm text-civic-secondary mt-1.5">
            Join your fellow citizens in reporting, discussing, and solving urban civic issues.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl border border-civic-border shadow-card">
          <RegisterForm />
        </div>

        {/* Security badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-civic-secondary">
          <ShieldCheck className="w-4 h-4 text-green" />
          <span>Verified Citizen Identity Platform</span>
        </div>
      </div>
    </div>
  );
}

