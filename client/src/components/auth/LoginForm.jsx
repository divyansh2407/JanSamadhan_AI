/**
 * JanSamadhan – Multi-Stakeholder LoginForm Component
 * Authenticates Citizen, Government, University, and Industry accounts.
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Building2,
  GraduationCap,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

const ACCOUNT_TYPES = [
  { id: 'CITIZEN', label: 'Citizen', icon: User, defaultEmail: 'citizen@jansamadhan.dev' },
  { id: 'GOVERNMENT', label: 'Government', icon: Building2, defaultEmail: 'government@jansamadhan.dev' },
  { id: 'UNIVERSITY', label: 'University', icon: GraduationCap, defaultEmail: 'university@jansamadhan.dev' },
  { id: 'INDUSTRY', label: 'Industry', icon: Briefcase, defaultEmail: 'industry@jansamadhan.dev' },
];

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState('CITIZEN');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    const result = await login({
      email: formData.email.trim(),
      password: formData.password,
      accountType: selectedRole,
    });
    setLoading(false);

    if (result.success) {
      const destination = location.state?.from?.pathname || result.redirectTo || (
        result.user?.role === 'GOVERNMENT' ? '/government/dashboard' :
        result.user?.role === 'UNIVERSITY' ? '/university/dashboard' :
        result.user?.role === 'INDUSTRY' ? '/industry/dashboard' :
        '/citizen/dashboard'
      );

      setSuccessMessage(`Login verified! Entering your ${result.user?.role || selectedRole} workspace…`);
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 600);
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const fillTestAccount = (email, pwd = 'Password@123', role = 'CITIZEN') => {
    setSelectedRole(role);
    setFormData({ email, password: pwd, rememberMe: true });
    setErrorMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* ── 1. Account Type Selector Tabs ──────────────────────────────────── */}
      <div>
        <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
          Select Portal Role
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ACCOUNT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedRole === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleRoleSelect(type.id)}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'border-green bg-green-light text-navy font-bold shadow-xs'
                    : 'border-civic-border bg-gray-50 text-civic-secondary hover:bg-gray-100 hover:text-navy'
                }`}
              >
                <Icon size={16} className={isSelected ? 'text-green' : 'text-gray-400'} />
                <span className="text-xs">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success alert */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-green-light border border-green-200 text-green-700 text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-green" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Email input */}
      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
          {selectedRole === 'CITIZEN' ? 'Email Address' : `Official ${selectedRole} Email`}{' '}
          <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder={
              selectedRole === 'GOVERNMENT'
                ? 'officer@punecorporation.org'
                : selectedRole === 'UNIVERSITY'
                ? 'researcher@university.edu'
                : selectedRole === 'INDUSTRY'
                ? 'csr@company.com'
                : 'citizen@jansamadhan.dev'
            }
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-civic-border bg-white text-civic-text placeholder:text-civic-secondary/50 focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
          />
        </div>
      </div>

      {/* Password input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-xs font-semibold text-navy uppercase tracking-wider">
            Password <span className="text-rose-500">*</span>
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-civic-border bg-white text-civic-text placeholder:text-civic-secondary/50 focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-civic-secondary hover:text-navy transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center text-xs text-civic-secondary cursor-pointer">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 text-green border-civic-border rounded focus:ring-green cursor-pointer"
          />
          <span className="ml-2">Remember credentials</span>
        </label>
        <span className="text-xs text-green font-medium hover:underline cursor-pointer">
          Forgot Password?
        </span>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-3 text-sm font-semibold shadow-md mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4.5 h-4.5 animate-spin" size={18} />
            <span>Authenticating {selectedRole}…</span>
          </>
        ) : (
          <span>Log In as {selectedRole}</span>
        )}
      </button>

      {/* Quick Test Demo Accounts */}
      <div className="pt-3 border-t border-civic-border">
        <p className="text-[11px] font-semibold text-civic-secondary uppercase tracking-wider mb-2">
          Demo Testing Accounts (Password: Password@123):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {[
            { label: 'Citizen', email: 'citizen@jansamadhan.dev', role: 'CITIZEN' },
            { label: 'Gov Official', email: 'government@jansamadhan.dev', role: 'GOVERNMENT' },
            { label: 'University', email: 'university@jansamadhan.dev', role: 'UNIVERSITY' },
            { label: 'Industry', email: 'industry@jansamadhan.dev', role: 'INDUSTRY' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => fillTestAccount(item.email, 'Password@123', item.role)}
              className="text-[10px] px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-green-light hover:text-green text-civic-secondary border border-civic-border transition-colors font-medium truncate"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Switch to registration */}
      <p className="text-center text-xs text-civic-secondary pt-2">
        Don&apos;t have an account yet?{' '}
        <Link to="/register" className="font-semibold text-green hover:underline">
          Create Account ({selectedRole})
        </Link>
      </p>
    </form>
  );
}
