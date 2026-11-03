/**
 * JanSamadhan – Help & Civic Support Modal
 */

import PropTypes from 'prop-types';
import { HelpCircle, X, PhoneCall, Shield, FileText, CheckCircle2 } from 'lucide-react';

const HELPLINES = [
  { service: 'National Emergency Helpline', number: '112', desc: 'Police, Fire & Medical Emergencies' },
  { service: 'Swachh Bharat Urban Helpline', number: '1969', desc: 'Waste dumping & sanitation reporting' },
  { service: 'Central Water Board Grievances', number: '1916', desc: 'Drinking water pipeline bursts & quality issues' },
  { service: 'Electricity Outage & Safety Desk', number: '1912', desc: 'Fallen electric lines & streetlight blackouts' },
];

const FAQS = [
  {
    q: 'How long does a municipal authority take to verify my report?',
    a: 'Under the Citizen Service Charter, standard civic grievances are reviewed by Ward Junior Engineers within 24 to 72 hours of submission.',
  },
  {
    q: 'Can I report sensitive civic issues anonymously?',
    a: 'Yes! JanSamadhan provides a dedicated Anonymous Reporting portal where zero personal data is collected, EXIF metadata is stripped from photos, and you receive a secret tracking token.',
  },
  {
    q: 'Why was my complaint marked as REJECTED?',
    a: 'Complaints can only be rejected with a recorded statutory reason (e.g. private residential property, duplicate ticket, or out of municipal jurisdiction). Open the complaint details to read the official remark.',
  },
];

export default function HelpSupportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-civic-border overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-civic-border bg-[#F8FAF8]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 border border-green-200 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-civic-text">Help & Municipal Support</h3>
              <p className="text-xs text-civic-secondary">
                Citizen charter guidelines, emergency helplines & frequently asked questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-civic-secondary hover:text-civic-text rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Helplines Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-civic-secondary mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-green-600" />
              Direct Emergency & Civic Helplines
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HELPLINES.map((h) => (
                <div
                  key={h.service}
                  className="p-3.5 rounded-2xl border border-civic-border bg-[#F8FAF8] flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-civic-text">{h.service}</h5>
                    <p className="text-[11px] text-civic-secondary mt-0.5">{h.desc}</p>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-green-700 bg-green-50 px-2.5 py-1 rounded-xl border border-green-200">
                    {h.number}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-civic-secondary mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-green-600" />
              Frequently Asked Questions
            </h4>
            <div className="space-y-3">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="p-3.5 rounded-2xl border border-civic-border bg-white space-y-1"
                >
                  <h5 className="text-xs font-bold text-civic-text flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    {faq.q}
                  </h5>
                  <p className="text-xs text-civic-secondary pl-5 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Escrow Note */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">DPDP Act 2023 Statutory Privacy Compliance</span>
              Your contact details are encrypted and utilized strictly for civic grievance tracking. JanSamadhan never shares citizen data with commercial entities.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-civic-border bg-[#F8FAF8] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-gray-200 hover:bg-gray-300 text-civic-text transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

HelpSupportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

