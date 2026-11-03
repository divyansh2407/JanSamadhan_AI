import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Users, Zap, Shield, ChevronDown } from 'lucide-react';

/* ── Floating stat badge ─────────────────────────────────────────────────── */
function StatBadge({ value, label, icon: Icon, delay, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`absolute bg-white rounded-2xl shadow-card border border-civic-border px-4 py-3 flex items-center gap-3 ${className}`}
    >
      <div className="w-9 h-9 rounded-xl bg-green-light flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-green-DEFAULT" size={18} />
      </div>
      <div>
        <p className="text-sm font-bold text-navy-DEFAULT leading-none">{value}</p>
        <p className="text-[11px] text-civic-secondary mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

/* ── City illustration (pure CSS/SVG) ───────────────────────────────────── */
function CityIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">

      {/* Central hub circle */}
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-36 h-36 rounded-full bg-navy-DEFAULT flex flex-col items-center justify-center shadow-2xl border-4 border-white"
      >
        <div className="text-white text-center">
          <div className="text-2xl font-bold">JS</div>
          <div className="text-[10px] font-medium tracking-widest opacity-80 uppercase">Platform</div>
        </div>
      </motion.div>

      {/* Orbit rings */}
      <div className="absolute w-64 h-64 rounded-full border-2 border-dashed border-green-DEFAULT/20 animate-spin" style={{ animationDuration: '30s' }} />
      <div className="absolute w-96 h-96 rounded-full border border-dashed border-navy-DEFAULT/10 animate-spin" style={{ animationDuration: '50s', animationDirection: 'reverse' }} />

      {/* Stakeholder nodes on the orbit */}
      {[
        { label: 'Citizens',      icon: '👤', angle: 0,   color: 'bg-blue-50   border-blue-200'  },
        { label: 'Government',    icon: '🏛️', angle: 72,  color: 'bg-purple-50 border-purple-200' },
        { label: 'Universities',  icon: '🎓', angle: 144, color: 'bg-amber-50  border-amber-200'  },
        { label: 'Experts',       icon: '🔬', angle: 216, color: 'bg-green-50  border-green-200'  },
        { label: 'Industries',    icon: '🏭', angle: 288, color: 'bg-rose-50   border-rose-200'   },
      ].map(({ label, icon, angle, color }) => {
        const rad   = (angle - 90) * (Math.PI / 180);
        const orbitR = 128; // px – matches w-64/2
        const x      = Math.cos(rad) * orbitR;
        const y      = Math.sin(rad) * orbitR;
        return (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + angle / 360, duration: 0.5 }}
            style={{ transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))` }}
            className={`absolute z-20 w-14 h-14 rounded-xl border-2 ${color} flex flex-col items-center justify-center shadow-sm cursor-default`}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[8px] font-semibold text-civic-secondary mt-0.5 text-center leading-tight">{label}</span>
          </motion.div>
        );
      })}

      {/* Connector lines (SVG overlay) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
        {[0, 72, 144, 216, 288].map((angle) => {
          const rad  = (angle - 90) * (Math.PI / 180);
          const cx   = '50%';
          const cy   = '50%';
          const r    = 128;
          const x2   = `calc(50% + ${Math.cos(rad) * r}px)`;
          const y2   = `calc(50% + ${Math.sin(rad) * r}px)`;
          return (
            <line
              key={angle}
              x1={cx} y1={cy}
              x2={x2} y2={y2}
              stroke="#16834A" strokeWidth="1" strokeDasharray="4 4" opacity="0.35"
            />
          );
        })}
      </svg>

      {/* Floating stat badges */}
      <StatBadge value="50K+" label="Problems Solved" icon={Shield} delay={0.8}
        className="top-2 -right-4 sm:right-0" />
      <StatBadge value="120+" label="Cities Active"   icon={MapPin} delay={1.0}
        className="bottom-8 -left-4 sm:left-0" />
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */
export default function Hero() {
  const scrollToHow = () => {
    const el = document.querySelector('#how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F7F9F7 0%, #EEF4EE 50%, #E8F5EC 100%)' }}
    >
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#172B20 1px, transparent 1px), linear-gradient(90deg, #172B20 1px, transparent 1px)`,
          backgroundSize:  '48px 48px',
        }}
      />

      <div className="section-container w-full py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left column ───────────────────────────────────────────── */}
          <div>
            {/* Pill label */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y:   0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-green-light border border-green-DEFAULT/20 text-green-DEFAULT text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-DEFAULT animate-pulse-soft" />
              AI-Powered Civic Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y:  0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="text-4xl sm:text-5xl xl:text-6xl font-bold text-navy-DEFAULT leading-[1.1] tracking-tight mb-6"
            >
              Building Smarter Cities Through{' '}
              <span className="text-green-DEFAULT">Collective Action.</span>
            </motion.h1>

            {/* Supporting text */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y:  0 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="text-lg text-civic-secondary leading-relaxed mb-10 max-w-xl"
            >
              JanSamadhan connects citizens, government authorities, universities, experts, and
              industries to identify civic challenges, develop innovative solutions, and create
              measurable impact.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y:  0 }}
              transition={{ duration: 0.65, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <a href="#categories" onClick={(e) => { e.preventDefault(); document.querySelector('#categories')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="btn-primary text-base px-7 py-3.5"
              >
                Report a Problem
                <ArrowRight className="w-4.5 h-4.5" size={18} />
              </a>
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToHow(); }}
                className="btn-secondary text-base px-7 py-3.5"
              >
                Explore Platform
              </a>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-6 text-sm text-civic-secondary"
            >
              {[
                { icon: Shield, text: 'Government Verified' },
                { icon: Users,  text: '1L+ Citizens Active' },
                { icon: Zap,    text: 'AI-Powered Analysis' },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-green-DEFAULT" size={16} />
                  {text}
                </span>
              ))}
            </motion.div>
          </div>

          {/* ── Right column – illustration ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-96 lg:h-[500px] flex items-center justify-center"
          >
            <CityIllustration />
          </motion.div>
        </div>

        {/* ── Scroll cue ──────────────────────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={scrollToHow}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-civic-secondary hover:text-navy-DEFAULT transition-colors"
          aria-label="Scroll to How It Works"
        >
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </motion.button>
      </div>
    </section>
  );
}

