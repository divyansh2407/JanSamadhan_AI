/**
 * JanSamadhan – RegisterForm Component
 * Citizen registration with comprehensive client validation, strength indicator, and terms agreement.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Client validation helper
  const validateForm = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      return 'Please enter your full name (minimum 2 characters).';
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }

    const phoneRegex = /^[0-9+() -]{7,20}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
      return 'Please enter a valid phone number (e.g. +91 98765 43210).';
    }

    if (!formData.password || formData.password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }

    if (!formData.agreeTerms) {
      return 'You must accept the Terms and Conditions to create an account.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    });
    setLoading(false);

    if (result.success) {
      setSuccessMessage('Account created! Redirecting to your Citizen Dashboard…');
      setTimeout(() => {
        navigate(result.redirectTo || '/citizen/dashboard', { replace: true });
      }, 700);
    } else {
      setErrorMessage(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Role notice banner */}
      <div className="p-3 rounded-xl bg-green-light/70 border border-green-200 flex items-start gap-2.5 text-xs text-green-700">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-green" />
        <span>
          <strong>Citizen Registration:</strong> Public sign-up creates standard Citizen accounts. Government, University, and Expert credentials are authorized separately by administration.
        </span>
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

      {/* Full Name */}
      <div>
        <label htmlFor="name" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
            <User className="w-4.5 h-4.5" size={18} />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Aarav Sharma"
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-civic-border bg-white text-civic-text placeholder:text-civic-secondary/50 focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
          />
        </div>
      </div>

      {/* Email Address */}
      <div>
        <label htmlFor="reg-email" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
          Email Address <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
            <Mail className="w-4.5 h-4.5" size={18} />
          </div>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-civic-border bg-white text-civic-text placeholder:text-civic-secondary/50 focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
          Phone Number <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
            <Phone className="w-4.5 h-4.5" size={18} />
          </div>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-civic-border bg-white text-civic-text placeholder:text-civic-secondary/50 focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="reg-password" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
          Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
            <Lock className="w-4.5 h-4.5" size={18} />
          </div>
          <input
            id="reg-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            className="w-full pl-10 pr-11 py-2 text-sm rounded-xl border border-civic-border bg-white text-civic-text placeholder:text-civic-secondary/50 focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-civic-secondary hover:text-navy transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
          Confirm Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
            <Lock className="w-4.5 h-4.5" size={18} />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            className="w-full pl-10 pr-11 py-2 text-sm rounded-xl border border-civic-border bg-white text-civic-text placeholder:text-civic-secondary/50 focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-civic-secondary hover:text-navy transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Terms and Conditions Checkbox */}
      <div className="flex items-start pt-1">
        <input
          id="agreeTerms"
          name="agreeTerms"
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className="w-4 h-4 mt-0.5 text-green border-civic-border rounded focus:ring-green focus:ring-offset-0 cursor-pointer"
        />
        <label htmlFor="agreeTerms" className="ml-2.5 block text-xs text-civic-secondary leading-relaxed cursor-pointer">
          I agree to the{' '}
          <span className="text-navy font-semibold hover:underline cursor-pointer">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="text-navy font-semibold hover:underline cursor-pointer">
            Privacy Policy
          </span>{' '}
          of the JanSamadhan Platform.
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-3 text-sm font-semibold shadow-md mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4.5 h-4.5 animate-spin" size={18} />
            <span>Creating Citizen Account…</span>
          </>
        ) : (
          <span>Create Citizen Account</span>
        )}
      </button>

      {/* Switch to login */}
      <p className="text-center text-xs text-civic-secondary pt-2">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-green hover:underline">
          Log in here
        </Link>
      </p>
    </form>
  );
}

