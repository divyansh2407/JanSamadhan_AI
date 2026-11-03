/**
 * JanSamadhan – Civic Reporting Entry Gateway (/report)
 * Provides citizens with a clear, transparent choice between Authenticated Reporting
 * and Zero-PII Anonymous Reporting with privacy disclosures.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Shield,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Lock,
  Search,
  AlertCircle,
  FileText,
  EyeOff,
  BellRing,
  Award,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../hooks/useAuth';

export default function ReportEntryPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="section-container max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 mb-3">
              <Shield className="w-3.5 h-3.5 text-green-700" />
              Civic Issue Intake Gateway
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172B20] tracking-tight mb-3">
              Report a Civic Problem
            </h1>
            <p className="text-sm sm:text-base text-[#647067] leading-relaxed">
              Every complaint is routed to municipal authorities with geo-tagged verification.
              Choose how you want to submit your report below.
            </p>
          </div>

          {/* Dual Intake Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* OPTION 1: REPORT AS CITIZEN */}
            <div className="relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#172B20]">Report as a Citizen</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-[#647067] mt-1 leading-relaxed">
                    Submit under your verified citizen account to track progress directly on your personal dashboard.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-gray-100 text-xs text-[#172B20]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>View all submissions & updates in your Citizen Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Real-time resolution timeline notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Earn civic contribution karma & community impact score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Fast-tracked municipal ward officer assignment</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/report/submit?mode=registered')}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow-md transition-all"
                  >
                    <span>Continue as {user?.name || 'Citizen'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/login?redirect=/report/submit?mode=registered')}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow-md transition-all"
                    >
                      <span>Sign In & Report as Citizen</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[11px] text-center text-[#647067]">
                      New here?{' '}
                      <Link to="/register" className="text-green-700 font-semibold underline">
                        Register a Citizen Account
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* OPTION 2: REPORT ANONYMOUSLY */}
            <div className="relative bg-white rounded-3xl p-6 sm:p-8 border border-civic-border shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                  <EyeOff className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#172B20]">Report Anonymously</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Zero PII
                    </span>
                  </div>
                  <p className="text-xs text-[#647067] mt-1 leading-relaxed">
                    Zero login, zero name, email, or phone required. Protected by a cryptographic 256-bit secret token.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-gray-100 text-xs text-[#172B20]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>No registration, login, or personal profile stored</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>One-time 256-bit secret token for status tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Automatic EXIF & camera serial metadata purging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>IP addresses are never linked to problem records</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <button
                  onClick={() => navigate('/report/submit?mode=anonymous')}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-sm shadow-md transition-all"
                >
                  <span>Submit Anonymous Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-[#647067] mt-2">
                  No personal data recorded. Fully anonymous.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Feature Comparison Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-civic-border shadow-sm mb-10">
            <h3 className="text-base font-bold text-[#172B20] mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              Comparison: Citizen vs Anonymous Reporting
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-[#647067] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Feature / Metric</th>
                    <th className="py-3 px-4 text-green-700 bg-green-50/50 rounded-t-lg">Registered Citizen</th>
                    <th className="py-3 px-4 text-amber-800 bg-amber-50/50 rounded-t-lg">Anonymous Reporter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[#172B20]">
                  <tr>
                    <td className="py-3 px-4 font-semibold">Account Requirement</td>
                    <td className="py-3 px-4 text-green-700 font-medium bg-green-50/30">Verified Account (JWT)</td>
                    <td className="py-3 px-4 text-amber-700 font-medium bg-amber-50/30">None (Zero Login)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Personal Data Collected</td>
                    <td className="py-3 px-4 text-green-700 font-medium bg-green-50/30">Name & Email linked</td>
                    <td className="py-3 px-4 text-amber-700 font-medium bg-amber-50/30">Zero PII (Strictly Prohibited)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Status Tracking Mechanism</td>
                    <td className="py-3 px-4 text-green-700 font-medium bg-green-50/30">Citizen Dashboard</td>
                    <td className="py-3 px-4 text-amber-700 font-medium bg-amber-50/30">256-bit Secret Tracking Token</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Loss of Tracking Credential</td>
                    <td className="py-3 px-4 text-green-700 font-medium bg-green-50/30">Recoverable via Password Reset</td>
                    <td className="py-3 px-4 text-amber-700 font-medium bg-amber-50/30">Irrecoverable if lost (Salted SHA-256)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Civic Impact Score & Karma</td>
                    <td className="py-3 px-4 text-green-700 font-medium bg-green-50/30">Accrues on citizen profile</td>
                    <td className="py-3 px-4 text-amber-700 font-medium bg-amber-50/30">Unattributed</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Privacy Guarantee Disclosure */}
            <div className="mt-5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-bold">JanSamadhan Cryptographic Privacy Guarantee</strong>
                <p className="leading-relaxed text-[#172B20]">
                  For anonymous reports, the generated secret tracking key is shown <em>only once</em> and is never stored in plaintext on our servers.
                  Photographic evidence is automatically stripped of camera EXIF and GPS headers before persistence. While our application logs zero IP links to complaints, network intermediaries (e.g., your internet service provider) may log connection endpoints.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Track Banner */}
          <div className="text-center p-6 bg-white rounded-3xl border border-civic-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-sm font-bold text-[#172B20] flex items-center gap-2">
                <Search className="w-4 h-4 text-green-600" />
                Already have a submitted report?
              </h4>
              <p className="text-xs text-[#647067]">
                Track resolution progress using your Tracking ID and Secret Key.
              </p>
            </div>
            <Link
              to="/track"
              className="px-5 py-2.5 rounded-xl border border-green-600 text-green-700 font-semibold text-xs hover:bg-green-50 transition-colors shrink-0"
            >
              Track Report Status
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

