/**
 * JanSamadhan – Citizen Profile View & Update Form
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Award,
} from 'lucide-react';
import citizenService from '../../services/citizenService';

export default function ProfileView({ profile, onProfileUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await citizenService.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });
      setSuccessMsg('Profile updated successfully.');
      setIsEditing(false);
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to update profile.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-civic-border shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-civic-border pb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-800 border border-green-200 flex items-center justify-center font-extrabold text-2xl shadow-sm">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-civic-text">{profile?.name}</h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 mt-1">
              <Shield className="w-3.5 h-3.5" />
              Verified Resident (CITIZEN)
            </span>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={handleEditToggle}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-green-100 text-civic-text hover:text-green-800 transition-colors self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={handleEditToggle}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-civic-secondary transition-colors self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs font-semibold text-green-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Profile Details or Edit Form */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-civic-border space-y-1">
            <span className="text-xs font-semibold text-civic-secondary flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-green-600" />
              Full Name
            </span>
            <p className="font-bold text-civic-text">{profile?.name || 'Not provided'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-civic-border space-y-1">
            <span className="text-xs font-semibold text-civic-secondary flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-green-600" />
              Email Address (Verified)
            </span>
            <p className="font-bold text-civic-text font-mono text-xs">{profile?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-civic-border space-y-1">
            <span className="text-xs font-semibold text-civic-secondary flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-green-600" />
              Phone Number
            </span>
            <p className="font-bold text-civic-text font-mono text-xs">{profile?.phone || 'Not provided'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-civic-border space-y-1">
            <span className="text-xs font-semibold text-civic-secondary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-green-600" />
              Citizen Member Since
            </span>
            <p className="font-bold text-civic-text">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Active Resident'}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-civic-text uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-civic-border bg-white text-sm text-civic-text focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-civic-text uppercase tracking-wider mb-1">
              Phone Number (10 Digits)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9876543210"
              pattern="[6-9][0-9]{9}"
              className="w-full px-3.5 py-2.5 rounded-xl border border-civic-border bg-white text-sm text-civic-text focus:outline-none focus:ring-2 focus:ring-green-600 font-mono"
            />
            <span className="text-[11px] text-civic-secondary block mt-1">
              Used strictly for municipal SMS resolution alerts. Never shared with third parties.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Changes…' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Civic Scorecard */}
      <div className="pt-4 border-t border-civic-border">
        <h4 className="text-xs font-bold uppercase tracking-wider text-civic-secondary mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          Civic Contribution Summary
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-gray-50 rounded-xl border border-civic-border">
            <span className="text-xl font-extrabold text-civic-text block">
              {profile?.totalReportsSubmitted ?? 0}
            </span>
            <span className="text-[11px] text-civic-secondary">Issues Reported</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-civic-border">
            <span className="text-xl font-extrabold text-green-700 block">
              {profile?.resolvedReportsCount ?? 0}
            </span>
            <span className="text-[11px] text-civic-secondary">Resolved</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-civic-border">
            <span className="text-xl font-extrabold text-blue-700 block">
              {profile?.resolutionRate ?? 0}%
            </span>
            <span className="text-[11px] text-civic-secondary">Resolution Rate</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-civic-border">
            <span className="text-xl font-extrabold text-purple-700 block">
              {profile?.profileCompletionPercentage ?? 80}%
            </span>
            <span className="text-[11px] text-civic-secondary">Profile Strength</span>
          </div>
        </div>
      </div>
    </div>
  );
}

ProfileView.propTypes = {
  profile: PropTypes.object,
  onProfileUpdated: PropTypes.func,
};

