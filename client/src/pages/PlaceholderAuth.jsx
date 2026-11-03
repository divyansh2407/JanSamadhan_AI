import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

export default function PlaceholderAuth({ mode = 'Login' }) {
  return (
    <div className="min-h-screen bg-civic-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-civic-border p-8 shadow-card text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-light border border-green-100 flex items-center justify-center mx-auto mb-6 text-green">
          <Lock className="w-7 h-7" />
        </div>
        
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-navy/5 text-navy mb-3">
          Stage 2 Preview Placeholder
        </span>

        <h1 className="text-2xl font-bold text-navy mb-2">
          {mode === 'Login' ? 'Citizen & Official Login' : 'Create an Account'}
        </h1>
        
        <p className="text-sm text-civic-secondary mb-6 leading-relaxed">
          Authentication and user roles (Citizen, Authority, Expert, University, Industry) will be 
          connected to MongoDB and JWT security in the upcoming backend authentication stage.
        </p>

        <div className="p-4 rounded-xl bg-civic-bg border border-civic-border text-left mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy mb-1">
            <ShieldCheck className="w-4 h-4 text-green" />
            <span>Planned Security Features</span>
          </div>
          <ul className="text-xs text-civic-secondary space-y-1 ml-6 list-disc">
            <li>JWT token-based sessions with HTTP-only cookies</li>
            <li>Role-Based Access Control (RBAC)</li>
            <li>Aadhaar/Mobile OTP verification (roadmap)</li>
          </ul>
        </div>

        <Link
          to="/"
          className="btn-primary w-full justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
