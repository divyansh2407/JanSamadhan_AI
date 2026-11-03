import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Building2 } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'About Us',     href: '#about' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Our Impact',   href: '#impact' },
  { label: 'Stakeholders', href: '#stakeholders' },
];

export default function Navbar() {
  const [isOpen,      setIsOpen]      = useState(false);
  const [scrolled,   setScrolled]    = useState(false);
  const [activeLink, setActiveLink]  = useState('');

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

          {/* ── Desktop CTA buttons ───────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-navy rounded-lg hover:bg-civic-bg transition-colors duration-150"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-green hover:bg-green-600 rounded-lg transition-colors duration-150 shadow-sm"
            >
              Get Started
            </Link>
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
          <div className="flex gap-3 pt-3 border-t border-civic-border mt-2">
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
        </nav>
      </div>
    </header>
  );
}

