/**
 * JanSamadhan – LoginForm Component
 * Handles user login with validation, password visibility toggle, and error messaging.
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

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
      email: formData.email,
      password: formData.password,
    });
    setLoading(false);

    if (result.success) {
      setSuccessMessage('Login verified! Redirecting to your dashboard…');
      // If user came from a protected route attempt, honor it, otherwise redirect to role dashboard
      const destination = location.state?.from?.pathname || result.redirectTo;
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 600);
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  // Helper function to fill test credentials for quick testing
  const fillTestAccount = (email, pwd = 'Password@123') => {
    setFormData({ email, password: pwd, rememberMe: true });
    setErrorMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
        <label htmlFor="email" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
          Email Address <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
            <Mail className="w-4.5 h-4.5" size={18} />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="citizen@jansamadhan.dev"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-civic-border bg-white text-civic-text placeholder:text-civic-secondary/50 focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
          />
        </div>
      </div>

      {/* Password input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="block text-xs font-semibold text-navy uppercase tracking-wider">
            Password <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs text-green font-medium hover:underline cursor-pointer">
            Forgot Password?
          </span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
            <Lock className="w-4.5 h-4.5" size={18} />
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
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Remember Me checkbox */}
      <div className="flex items-center">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={handleChange}
          className="w-4 h-4 text-green border-civic-border rounded focus:ring-green focus:ring-offset-0 cursor-pointer"
        />
        <label htmlFor="rememberMe" className="ml-2.5 block text-xs font-medium text-civic-secondary cursor-pointer">
          Remember this device for 30 days
        </label>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-3 text-sm font-semibold shadow-md"
      >
        {loading ? (
          <>
            <Loader2 className="w-4.5 h-4.5 animate-spin" size={18} />
            <span>Authenticating…</span>
          </>
        ) : (
          <span>Log In to JanSamadhan</span>
        )}
      </button>

      {/* Quick Test Accounts Drawer (For development & demo) */}
      <div className="pt-2 border-t border-civic-border">
        <p className="text-[11px] font-semibold text-civic-secondary uppercase tracking-wider mb-2">
          Quick Demo Accounts (Password: Password@123):
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Citizen', email: 'citizen@jansamadhan.dev' },
            { label: 'Gov Official', email: 'government@jansamadhan.dev' },
            { label: 'Super Admin', email: 'admin@jansamadhan.dev' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => fillTestAccount(item.email)}
              className="text-[10px] px-2 py-1 rounded bg-civic-bg hover:bg-green-light hover:text-green text-civic-secondary border border-civic-border transition-colors font-medium"
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
          Register as Citizen
        </Link>
      </p>
    </form>
  );
}
