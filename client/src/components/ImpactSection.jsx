import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FileText, CheckCircle2, Users2, Building2 } from 'lucide-react';

/* ── Animated counter ────────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref               = useRef(null);
  const inView            = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    let start     = 0;
    const end     = parseInt(target.toString().replace(/[^0-9]/g, ''));
    const duration = 1800;
    const step     = Math.ceil(end / (duration / 16));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) { start = end; clearInterval(timer); }
      setCount(start);
    }, 16);

    return () => clearInterval(timer);
  }, [inView, target]);

  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();

  return <span ref={ref}>{formatted}{suffix}</span>;
}

const METRICS = [
  {
    icon:  FileText,
    value: 50000,
    suffix: '+',
    label: 'Problems Reported',
    desc:  'Total civic issues submitted by citizens across all cities',
    color: 'text-blue-600',
    bg:    'bg-blue-50',
  },
  {
    icon:  CheckCircle2,
    value: 38000,
    suffix: '+',
    label: 'Problems Resolved',
    desc:  'Issues successfully resolved and verified by citizens',
    color: 'text-green-600',
    bg:    'bg-green-50',
  },
  {
    icon:  Users2,
    value: 120000,
    suffix: '+',
    label: 'Active Collaborators',
    desc:  'Citizens, experts, and officials active on the platform',
    color: 'text-purple-600',
    bg:    'bg-purple-50',
  },
  {
    icon:  Building2,
    value: 340,
    suffix: '+',
    label: 'Participating Departments',
    desc:  'Government departments and agencies partnered with JanSamadhan',
    color: 'text-amber-600',
    bg:    'bg-amber-50',
  },
];

export default function ImpactSection() {
  return (
    <section id="impact" className="py-20 lg:py-28 bg-navy relative overflow-hidden">

      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
          backgroundSize:  '32px 32px',
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-green/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-green/5 blur-2xl pointer-events-none" />

      <div className="section-container relative z-10">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-green-400 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
          >
            Our Impact
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4"
          >
            Numbers That Tell the Story
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-white/60 text-lg max-w-xl mx-auto"
          >
            Illustrative metrics demonstrating the potential of civic collaboration at scale.
          </motion.p>

          {/* Disclaimer banner */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="inline-block mt-4 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-medium px-4 py-2 rounded-lg"
          >
            ⚠ These are illustrative / demo statistics. Not actual platform data.
          </motion.div>
        </div>

        {/* ── Metric cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map(({ icon: Icon, value, suffix, label, desc, color, bg }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: idx * 0.1 }}
              className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/12 transition-colors duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className="text-3xl font-black text-white mb-1">
                <AnimatedCounter target={value} suffix={suffix} />
              </div>
              <div className="text-sm font-semibold text-white/90 mb-2">{label}</div>
              <div className="text-xs text-white/50 leading-relaxed">{desc}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Resolution rate progress ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 bg-white/8 border border-white/10 rounded-2xl p-6 lg:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Overall Resolution Rate</h3>
              <p className="text-white/50 text-sm">Across all reported civic categories (illustrative)</p>
            </div>
            <span className="text-3xl font-black text-green-400">76%</span>
          </div>

          {/* Category bars */}
          <div className="space-y-4">
            {[
              { label: 'Road & Infrastructure',    pct: 82, color: 'bg-amber-400' },
              { label: 'Water & Sanitation',        pct: 71, color: 'bg-blue-400'  },
              { label: 'Waste Management',          pct: 68, color: 'bg-rose-400'  },
              { label: 'Electricity & Streetlights',pct: 88, color: 'bg-yellow-400'},
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/70 font-medium">{label}</span>
                  <span className="text-white/50">{pct}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className={`h-full rounded-full ${color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

