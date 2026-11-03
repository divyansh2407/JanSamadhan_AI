/**
 * JanSamadhan – Login Page
 * Authentication page for all stakeholders.
 */

import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { Building2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-civic-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top back link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-civic-secondary hover:text-navy transition-colors"
        >
          <ArrowLeft size={16} /> Back to JanSamadhan Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
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
                Civic Platform
              </span>
            </div>
          </Link>

          <h1 className="text-2xl font-bold text-navy tracking-tight">
            Sign In to Your Account
          </h1>
          <p className="text-sm text-civic-secondary mt-1.5">
            Access your civic dashboard, tracked reports, and collaborative tools.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl border border-civic-border shadow-card">
          <LoginForm />
        </div>

        {/* Security badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-civic-secondary">
          <ShieldCheck className="w-4 h-4 text-green" />
          <span>256-Bit SSL Encrypted & Secured Session</span>
        </div>
      </div>
    </div>
  );
}
