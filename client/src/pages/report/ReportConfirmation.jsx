/**
 * JanSamadhan – Report Submission Confirmation Gateway
 * Displays submission receipt. For anonymous submissions, renders the one-time
 * 256-bit Secret Tracking Token with one-click copy and .txt receipt download.
 */

import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Download,
  AlertTriangle,
  ArrowRight,
  Shield,
  LayoutDashboard,
  PlusCircle,
  FileText,
  Clock,
  MapPin,
  Check,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ReportConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const stateData = location.state || {};
  const { isAnonymous = false, result = {}, formData = {} } = stateData;

  // Extract keys and IDs from result
  const trackingId =
    result?.data?.trackingId ||
    result?.trackingId ||
    result?.trackingNumber ||
    result?.data?.trackingNumber ||
    'JS-2026-SUBMISSION';

  const secretTrackingToken =
    result?.data?.secretTrackingToken ||
    result?.secretTrackingToken ||
    null;

  const categoryName = formData?.categoryName || result?.data?.category || 'Civic Issue';
  const city = formData?.city || result?.data?.city || 'Pune';
  const submittedAt = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Copy Secret Token to clipboard
  const handleCopyKey = () => {
    if (secretTrackingToken) {
      navigator.clipboard.writeText(secretTrackingToken);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 3000);
    }
  };

  // Copy Tracking ID to clipboard
  const handleCopyId = () => {
    navigator.clipboard.writeText(trackingId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 3000);
  };

  // Download .txt receipt file
  const handleDownloadReceipt = () => {
    const textContent = `=====================================================
JANSAMADHAN - CIVIC ISSUE SUBMISSION RECEIPT
=====================================================

Tracking ID:        ${trackingId}
Submission Mode:    ${isAnonymous ? 'ANONYMOUS (ZERO PII)' : 'REGISTERED CITIZEN'}
Category:           ${categoryName}
Location:           ${city}, Maharashtra
Date & Time:        ${submittedAt}
Status:             SUBMITTED (Pending Municipal Verification)

${
  isAnonymous
    ? `-----------------------------------------------------
CRITICAL: YOUR SECRET TRACKING KEY (256-BIT)
-----------------------------------------------------
${secretTrackingToken}

IMPORTANT SECURITY NOTICE:
1. JanSamadhan CANNOT retrieve this key if lost.
2. The key is never stored in plaintext on our servers.
3. Keep this file safe. You need this key to track your report.
4. Anyone with this key can view status updates for this report.
-----------------------------------------------------`
    : `This report is linked to your verified citizen account.
You can track updates directly at: https://jansamadhan.gov.in/citizen/dashboard`
}

Track your report anytime at:
https://jansamadhan.gov.in/track?id=${encodeURIComponent(trackingId)}
=====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JanSamadhan-Receipt-${trackingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="section-container max-w-3xl mx-auto px-4">
          {/* Main Success Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-civic-border shadow-lg text-center space-y-6">
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-3xl bg-green-100 text-green-700 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200 mb-2">
                Report Successfully Dispatched
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B20]">
                Thank You for Empowering Your City!
              </h1>
              <p className="text-xs sm:text-sm text-[#647067] max-w-lg mx-auto mt-1 leading-relaxed">
                Your civic report has been queued for municipal verification and assigned a non-reversible tracking identifier.
              </p>
            </div>

            {/* Tracking ID Badge */}
            <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-civic-border inline-flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-md mx-auto">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#647067] block">
                  Public Tracking ID
                </span>
                <span className="text-lg font-mono font-extrabold text-[#172B20]">
                  {trackingId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-civic-border text-xs font-semibold text-civic-secondary hover:bg-gray-100 transition-colors"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* ANONYMOUS ONE-TIME SECRET KEY CALLOUT */}
            {isAnonymous && secretTrackingToken && (
              <div className="p-6 rounded-3xl bg-amber-50/90 border-2 border-amber-300 text-left space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950">
                      Save Your Secret Tracking Key Now (Shown Only Once)
                    </h3>
                    <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                      Because this was submitted anonymously with zero personal data, <strong>this 256-bit key is your only way to check updates</strong>. It is hashed with SHA-256 and salt on our servers and cannot be recovered if lost.
                    </p>
                  </div>
                </div>

                {/* Secret Key Display */}
                <div className="p-3.5 rounded-xl bg-white border border-amber-200">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs sm:text-sm font-mono text-amber-950 break-all select-all font-semibold">
                      {secretTrackingToken}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Download Receipt Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-amber-200/80">
                  <span className="text-[11px] text-amber-900">
                    Keep a local backup copy on your computer or phone.
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Receipt (.txt)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Registered Citizen Info Card */}
            {!isAnonymous && (
              <div className="p-5 rounded-2xl bg-green-50/70 border border-green-200 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-green-950">
                  <CheckCircle2 className="w-4 h-4 text-green-700" />
                  <span>Linked to Your Citizen Account</span>
                </div>
                <p className="text-green-900 leading-relaxed">
                  This report has been automatically attached to your citizen profile. You can monitor progress, field inspection reports, and resolution evidence directly inside your Citizen Dashboard.
                </p>
              </div>
            )}

            {/* Details Summary Pill */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left p-4 rounded-2xl bg-[#F8FAF8] border border-civic-border text-xs">
              <div>
                <span className="text-[10px] text-[#647067] uppercase font-bold block">Category</span>
                <span className="font-semibold text-[#172B20] truncate block">{categoryName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#647067] uppercase font-bold block">City</span>
                <span className="font-semibold text-[#172B20] truncate block">{city}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#647067] uppercase font-bold block">Status</span>
                <span className="font-semibold text-green-700 block">SUBMITTED</span>
              </div>
              <div>
                <span className="text-[10px] text-[#647067] uppercase font-bold block">Est. Response</span>
                <span className="font-semibold text-[#172B20] block">24–48 Hours</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              {!isAnonymous ? (
                <Link
                  to="/citizen/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Citizen Dashboard</span>
                </Link>
              ) : (
                <Link
                  to={`/track?id=${encodeURIComponent(trackingId)}${
                    secretTrackingToken ? `&token=${encodeURIComponent(secretTrackingToken)}` : ''
                  }`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <span>Track This Report Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                to="/report"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-civic-border text-xs font-semibold text-[#172B20] hover:bg-gray-50 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Another Issue</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

