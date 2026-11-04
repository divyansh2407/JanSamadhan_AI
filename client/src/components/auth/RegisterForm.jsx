/**
 * JanSamadhan – Multi-Stakeholder RegisterForm Component
 * Supports 4 verified account types: Citizen, Government, University, and Industry.
 * Implements strict input validation, password strength requirements, and role workflows.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Award,
} from 'lucide-react';

const ACCOUNT_TYPES = [
  { id: 'CITIZEN', label: 'Citizen', icon: User, desc: 'Civic Reporting & Neighborhood Tracking' },
  { id: 'GOVERNMENT', label: 'Government', icon: Building2, desc: 'Municipal Verification & Task Force' },
  { id: 'UNIVERSITY', label: 'University', icon: GraduationCap, desc: 'Academic Research & Solution Pilots' },
  { id: 'INDUSTRY', label: 'Industry', icon: Briefcase, desc: 'CSR Partnerships & Technical Implementation' },
];

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [accountType, setAccountType] = useState('CITIZEN');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: 'Pune',
    // Government specific
    departmentName: '',
    organizationName: '',
    designation: '',
    // University specific
    universityName: '',
    areaOfExpertise: '',
    // Industry specific
    companyName: '',
    industryType: '',
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

  const validateForm = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      return 'Please enter full name / authorized representative name (minimum 2 characters).';
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      return 'Please enter a valid official/personal email address.';
    }

    const phoneRegex = /^[0-9+() -]{7,20}$/;
    if (formData.phone.trim() && !phoneRegex.test(formData.phone.trim())) {
      return 'Please enter a valid mobile number (e.g. +91 98765 43210).';
    }

    if (!formData.password || formData.password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    if (!/[A-Z]/.test(formData.password)) {
      return 'Password must contain at least one uppercase letter (e.g. A-Z).';
    }

    if (!/[a-z]/.test(formData.password)) {
      return 'Password must contain at least one lowercase letter (e.g. a-z).';
    }

    if (!/\d/.test(formData.password)) {
      return 'Password must contain at least one number (0-9).';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }

    // Role-specific validations
    if (accountType === 'GOVERNMENT') {
      if (!formData.departmentName.trim()) return 'Please provide your government department.';
      if (!formData.organizationName.trim()) return 'Please provide your municipal corporation or authority name.';
      if (!formData.designation.trim()) return 'Please enter your official designation.';
    } else if (accountType === 'UNIVERSITY') {
      if (!formData.universityName.trim()) return 'Please enter your university / research institution name.';
      if (!formData.departmentName.trim()) return 'Please enter your academic department.';
      if (!formData.areaOfExpertise.trim()) return 'Please specify your research or technical domain.';
    } else if (accountType === 'INDUSTRY') {
      if (!formData.companyName.trim()) return 'Please enter your company or corporate entity name.';
      if (!formData.industryType.trim()) return 'Please specify your industry sector.';
      if (!formData.areaOfExpertise.trim()) return 'Please specify your technology/CSR focus area.';
    }

    if (!formData.agreeTerms) {
      return 'You must accept the Civic Platform Terms and Conditions to proceed.';
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
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: accountType,
      accountType,
      city: formData.city.trim(),
      departmentName: formData.departmentName.trim() || undefined,
      organizationName: (formData.organizationName || formData.universityName || formData.companyName || '').trim() || undefined,
      designation: formData.designation.trim() || undefined,
      areaOfExpertise: formData.areaOfExpertise.trim() || undefined,
      industryType: formData.industryType.trim() || undefined,
      termsAccepted: formData.agreeTerms,
    };

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      setSuccessMessage(`Account created successfully! Launching your ${accountType} workspace…`);
      setTimeout(() => {
        navigate(result.redirectTo || (
          accountType === 'GOVERNMENT' ? '/government/dashboard' :
          accountType === 'UNIVERSITY' ? '/university/dashboard' :
          accountType === 'INDUSTRY' ? '/industry/dashboard' :
          '/citizen/dashboard'
        ), { replace: true });
      }, 700);
    } else {
      setErrorMessage(result.error || 'Registration failed. Please check your details and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* ── 1. Account Type Selector Tabs ──────────────────────────────────── */}
      <div>
        <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
          Select Account Type <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ACCOUNT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = accountType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setAccountType(type.id);
                  setErrorMessage('');
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'border-green bg-green-light/60 text-navy font-bold shadow-xs'
                    : 'border-civic-border bg-gray-50 text-civic-secondary hover:bg-gray-100 hover:text-navy'
                }`}
              >
                <Icon size={18} className={isSelected ? 'text-green' : 'text-gray-400'} />
                <span className="text-xs">{type.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-civic-secondary mt-1.5 text-center">
          {ACCOUNT_TYPES.find((t) => t.id === accountType)?.desc}
        </p>
      </div>

      {/* Security Workflow Notice for Institutional Accounts */}
      {accountType !== 'CITIZEN' && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
          <span>
            <strong>Official {accountType} Workflow:</strong> Privileged institutional credentials are logged with audit trails. Official actions, department routing, and solution proposals require verified domain identity.
          </span>
        </div>
      )}

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

      {/* ── 2. Common Fields ────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="name" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
          {accountType === 'GOVERNMENT'
            ? 'Officer Full Name'
            : accountType === 'CITIZEN'
            ? 'Citizen Full Name'
            : 'Authorized Representative Name'}{' '}
          <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
            <User className="w-4 h-4" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder={
              accountType === 'GOVERNMENT'
                ? 'e.g. Dr. Rajesh Sharma'
                : accountType === 'UNIVERSITY'
                ? 'e.g. Prof. Priya Narayanan'
                : 'e.g. Ananya Deshmukh'
            }
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
          {accountType !== 'CITIZEN' ? 'Official / Institutional Email' : 'Email Address'}{' '}
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
            required
            value={formData.email}
            onChange={handleChange}
            placeholder={
              accountType === 'GOVERNMENT'
                ? 'officer@punecorporation.org'
                : accountType === 'UNIVERSITY'
                ? 'dean.research@iitb.ac.in'
                : accountType === 'INDUSTRY'
                ? 'csr.director@tata.com'
                : 'citizen@example.com'
            }
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
          />
        </div>
      </div>

      {/* ── 3. Role-Specific Dynamic Fields ─────────────────────────────────── */}

      {/* Citizen: Phone and City */}
      {accountType === 'CITIZEN' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
              />
            </div>
          </div>
          <div>
            <label htmlFor="city" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
              City / Ward <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="city"
                name="city"
                type="text"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Pune"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green focus:border-green transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Government: Department, Organization, Designation */}
      {accountType === 'GOVERNMENT' && (
        <div className="space-y-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="organizationName" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
                Government Organization <span className="text-rose-500">*</span>
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="e.g. Pune Municipal Corporation (PMC)"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
            <div>
              <label htmlFor="departmentName" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
                Municipal Department <span className="text-rose-500">*</span>
              </label>
              <input
                id="departmentName"
                name="departmentName"
                type="text"
                required
                value={formData.departmentName}
                onChange={handleChange}
                placeholder="e.g. Public Works Department (Roads)"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
          </div>
          <div>
            <label htmlFor="designation" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
              Official Designation <span className="text-rose-500">*</span>
            </label>
            <input
              id="designation"
              name="designation"
              type="text"
              required
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Executive Engineer / Ward Officer"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green"
            />
          </div>
        </div>
      )}

      {/* University: University Name, Department, Area of Expertise */}
      {accountType === 'UNIVERSITY' && (
        <div className="space-y-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="universityName" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
                University / Institution Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="universityName"
                name="universityName"
                type="text"
                required
                value={formData.universityName}
                onChange={handleChange}
                placeholder="e.g. IIT Bombay / COEP Tech"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
            <div>
              <label htmlFor="departmentName" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
                Academic Department <span className="text-rose-500">*</span>
              </label>
              <input
                id="departmentName"
                name="departmentName"
                type="text"
                required
                value={formData.departmentName}
                onChange={handleChange}
                placeholder="e.g. Civil & Environmental Eng."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
          </div>
          <div>
            <label htmlFor="areaOfExpertise" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
              Area of Research & Expertise <span className="text-rose-500">*</span>
            </label>
            <input
              id="areaOfExpertise"
              name="areaOfExpertise"
              type="text"
              required
              value={formData.areaOfExpertise}
              onChange={handleChange}
              placeholder="e.g. Urban Hydrology, Smart Waste Recycling, Air Quality Sensors"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green"
            />
          </div>
        </div>
      )}

      {/* Industry: Company Name, Industry Type, Area of Expertise */}
      {accountType === 'INDUSTRY' && (
        <div className="space-y-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="companyName" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
                Company / Organization Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Tata Motors CSR / L&T Infra"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
            <div>
              <label htmlFor="industryType" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
                Industry Sector <span className="text-rose-500">*</span>
              </label>
              <input
                id="industryType"
                name="industryType"
                type="text"
                required
                value={formData.industryType}
                onChange={handleChange}
                placeholder="e.g. Clean Energy, Construction Tech"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
          </div>
          <div>
            <label htmlFor="areaOfExpertise" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
              Technical Expertise / CSR Focus <span className="text-rose-500">*</span>
            </label>
            <input
              id="areaOfExpertise"
              name="areaOfExpertise"
              type="text"
              required
              value={formData.areaOfExpertise}
              onChange={handleChange}
              placeholder="e.g. Solar Microgrids, Rapid Pothole Patching Technology"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green"
            />
          </div>
        </div>
      )}

      {/* ── 4. Passwords ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
            Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-civic-secondary hover:text-navy"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-secondary">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-civic-border bg-white text-civic-text focus:outline-none focus:ring-2 focus:ring-green"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-civic-secondary hover:text-navy"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Terms checkbox */}
      <div className="flex items-start pt-1">
        <input
          id="agreeTerms"
          name="agreeTerms"
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className="w-4 h-4 mt-0.5 text-green border-civic-border rounded focus:ring-green cursor-pointer"
        />
        <label htmlFor="agreeTerms" className="ml-2.5 text-xs text-civic-secondary cursor-pointer leading-relaxed">
          I confirm that the information provided is accurate and agree to the{' '}
          <span className="font-semibold text-navy hover:underline">Civic Participation Terms</span> and{' '}
          <span className="font-semibold text-navy hover:underline">Privacy Charter</span>.
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
            <span>Creating {accountType} Account…</span>
          </>
        ) : (
          <span>Complete {accountType} Registration</span>
        )}
      </button>

      {/* Switch to login */}
      <p className="text-center text-xs text-civic-secondary pt-2">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-green hover:underline">
          Sign In Here
        </Link>
      </p>
    </form>
  );
}
