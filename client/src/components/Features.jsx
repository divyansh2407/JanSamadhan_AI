import { motion } from 'framer-motion';
import { Brain, MapPin, Eye, Users2, Activity, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    icon:  Brain,
    title: 'AI-Powered Problem Analysis',
    desc:  'Advanced AI automatically classifies, prioritises, and routes complaints to the right department — eliminating manual sorting.',
    color: 'text-purple-600',
    bg:    'bg-purple-50',
  },
  {
    icon:  MapPin,
    title: 'Smart Location Mapping',
    desc:  'Geo-tagged reports appear on interactive city maps, giving authorities a real-time view of problem clusters across neighbourhoods.',
    color: 'text-blue-600',
    bg:    'bg-blue-50',
  },
  {
    icon:  Eye,
    title: 'Transparent Complaint Tracking',
    desc:  'Citizens can track every stage of their complaint in real time — from submission to resolution — with full audit trails.',
    color: 'text-green-600',
    bg:    'bg-green-50',
  },
  {
    icon:  Users2,
    title: 'Collaborative Solution Development',
    desc:  'Experts, universities, and industry partners co-develop innovative and cost-effective solutions using a shared workspace.',
    color: 'text-amber-600',
    bg:    'bg-amber-50',
  },
  {
    icon:  Activity,
    title: 'Implementation Monitoring',
    desc:  'Track solution progress on the ground with milestone updates, photo verification, and completion sign-offs.',
    color: 'text-rose-600',
    bg:    'bg-rose-50',
  },
  {
    icon:  BarChart3,
    title: 'Impact Analytics',
    desc:  'Governance dashboards show resolution rates, department performance, and city-wide civic health metrics in one view.',
    color: 'text-navy-DEFAULT',
    bg:    'bg-navy-DEFAULT/5',
  },
];

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x:  0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Features() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-civic-bg">
      <div className="section-container">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label mx-auto"
          >
            Platform Features
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-heading text-center"
          >
            Technology Built for Governance
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="section-subheading mx-auto text-center"
          >
            Six purpose-built features to transform how cities manage civic challenges.
          </motion.p>
        </div>

        {/* ── Feature grid ───────────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="card p-6 group"
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="text-sm font-bold text-navy-DEFAULT mb-2 group-hover:text-green-DEFAULT transition-colors">
                {title}
              </h3>
              <p className="text-sm text-civic-secondary leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

