import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Building2, User, LogOut, LayoutDashboard, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'About Us',     href: '#about' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Our Impact',   href: '#impact' },
  { label: 'Stakeholders', href: '#stakeholders' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const { user, isAuthenticated, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  // Track scroll for shadow + background effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setIsOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Smooth scroll helper
  const handleNavClick = useCallback((e, href) => {
    e.preventDefault();
    setIsOpen(false);
    setActiveLink(href);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-nav border-b border-civic-border'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-bold text-navy tracking-tight">
                Jan<span className="text-green">Samadhan</span>
              </span>
              <span className="block text-[10px] font-medium text-civic-secondary tracking-widest uppercase">
                Civic Platform
              </span>
            </div>
          </a>

          {/* ── Desktop nav links ─────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  activeLink === link.href
                    ? 'text-green bg-green-light'
                    : 'text-civic-secondary hover:text-navy hover:bg-civic-bg'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ── Desktop CTA / User Profile ────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/map"
              className="px-2.5 py-1.5 text-xs font-semibold text-civic-secondary hover:text-navy hover:bg-civic-bg rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <MapPin size={13} className="text-green-600" />
              <span>Map</span>
            </Link>
            <Link
              to="/collaborations"
              className="px-2.5 py-1.5 text-xs font-semibold text-civic-secondary hover:text-navy hover:bg-civic-bg rounded-lg transition-colors"
            >
              Collaborations
            </Link>
            <Link
              to="/proposals"
              className="px-2.5 py-1.5 text-xs font-semibold text-civic-secondary hover:text-navy hover:bg-civic-bg rounded-lg transition-colors"
            >
              Proposals
            </Link>
            <Link
              to="/analytics"
              className="px-2.5 py-1.5 text-xs font-semibold text-civic-secondary hover:text-navy hover:bg-civic-bg rounded-lg transition-colors"
            >
              Analytics
            </Link>
            <Link
              to="/track"
              className="px-3 py-1.5 text-xs font-semibold text-civic-secondary hover:text-navy hover:bg-civic-bg rounded-lg transition-colors"
            >
              Track Report
            </Link>
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-green hover:bg-green-600 rounded-xl transition-colors shadow-sm"
            >
              <span>Report Issue</span>
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-civic-border">
                <Link
                  to={getDashboardPath(user.role)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-navy bg-civic-bg hover:bg-green-light hover:text-green border border-civic-border rounded-xl transition-all"
                >
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-navy/10 text-navy uppercase">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-civic-secondary hover:text-rose-600 rounded-lg transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-civic-border">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-navy rounded-lg hover:bg-civic-bg transition-colors duration-150"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-navy bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ─────────────────────────────────────── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-civic-secondary hover:text-navy hover:bg-civic-bg transition-colors duration-150"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 border-t border-civic-border' : 'max-h-0'
        }`}
      >
        <nav className="bg-white px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-civic-secondary hover:text-navy hover:bg-civic-bg transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-civic-border">
            <Link
              to="/map"
              onClick={() => setIsOpen(false)}
              className="text-center px-2 py-2 text-xs font-semibold text-navy bg-civic-bg hover:bg-green-light rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <MapPin size={12} className="text-green-600" />
              <span>Map</span>
            </Link>
            <Link
              to="/report"
              onClick={() => setIsOpen(false)}
              className="text-center px-2 py-2 text-xs font-semibold text-white bg-green hover:bg-green-600 rounded-lg transition-colors"
            >
              Report
            </Link>
            <Link
              to="/track"
              onClick={() => setIsOpen(false)}
              className="text-center px-2 py-2 text-xs font-semibold text-navy bg-civic-bg hover:bg-green-light rounded-lg transition-colors"
            >
              Track
            </Link>
          </div>

          <div className="pt-3 border-t border-civic-border mt-2">
            {isAuthenticated && user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-civic-secondary">
                  <User size={14} className="text-green" />
                  <span className="font-semibold text-navy">{user.name}</span>
                  <span className="text-[10px] uppercase font-bold text-green bg-green-light px-2 py-0.5 rounded">
                    {user.role}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={getDashboardPath(user.role)}
                    className="flex-1 text-center px-4 py-2 text-xs font-semibold text-white bg-green hover:bg-green-600 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Open Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-navy border border-civic-border rounded-lg hover:bg-civic-bg transition-colors duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-green hover:bg-green-600 rounded-lg transition-colors duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
