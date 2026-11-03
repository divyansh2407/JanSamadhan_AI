import { Building2, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-navy-deep text-white border-t border-navy-700">
      <div className="section-container pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="leading-tight">
                <span className="block text-xl font-bold tracking-tight text-white">
                  Jan<span className="text-green">Samadhan</span>
                </span>
                <span className="block text-[10px] font-medium text-white/50 tracking-widest uppercase">
                  Civic Collaboration Platform
                </span>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-sm mb-6">
              JanSamadhan connects citizens, city administration, academic researchers, and industry experts 
              to identify, verify, and resolve civic challenges with transparency and AI-assisted efficiency.
            </p>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <Globe className="w-3.5 h-3.5 text-green-400" /> Made for Indian Cities
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                Stage 2 Preview
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Home', href: '#home' },
                { label: 'Problem Categories', href: '#categories' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Stakeholders', href: '#stakeholders' },
                { label: 'Platform Features', href: '#features' },
                { label: 'Our Impact', href: '#impact' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-white/70 hover:text-green-400 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Features */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Key Capabilities
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>AI-Powered Triage</li>
              <li>Geo-Tagged Reporting</li>
              <li>Live Resolution Tracker</li>
              <li>Multi-Stakeholder Hub</li>
              <li>Civic Analytics Dashboard</li>
              <li>Public Audit Trails</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Connect With Us
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span>Civic Innovation Center, New Delhi, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-green-400 shrink-0" />
                <a href="mailto:support@jansamadhan.gov.in" className="hover:text-green-400 transition-colors">
                  contact@jansamadhan.org
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-green-400 shrink-0" />
                <span>1800-XXX-CIVIC (Toll-Free Placeholder)</span>
              </li>
            </ul>

            <div className="mt-6">
              <span className="block text-xs text-white/40 mb-2">Portal Access</span>
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  Citizen Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs px-3 py-1.5 rounded-lg bg-green hover:bg-green-600 text-white font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {currentYear} JanSamadhan. All rights reserved. Open Civic Initiative.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white/80 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white/80 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white/80 transition-colors cursor-pointer">Accessibility Statement</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
