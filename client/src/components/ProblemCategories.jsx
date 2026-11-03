import { motion } from 'framer-motion';
import {
  Construction, Trash2, Droplets, Zap, Car, Leaf,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  {
    icon:        Construction,
    title:       'Road & Infrastructure',
    description: 'Potholes, broken footpaths, damaged bridges, and road cave-ins affecting daily commutes.',
    color:       'bg-amber-50 text-amber-700 border-amber-100',
    iconBg:      'bg-amber-100',
  },
  {
    icon:        Trash2,
    title:       'Waste Management',
    description: 'Overflowing bins, illegal dumping, and irregular garbage collection in residential areas.',
    color:       'bg-rose-50 text-rose-700 border-rose-100',
    iconBg:      'bg-rose-100',
  },
  {
    icon:        Droplets,
    title:       'Water & Sanitation',
    description: 'Pipeline leaks, contaminated supply, broken sewage lines, and open drain issues.',
    color:       'bg-blue-50 text-blue-700 border-blue-100',
    iconBg:      'bg-blue-100',
  },
  {
    icon:        Zap,
    title:       'Electricity & Streetlights',
    description: 'Faulty wiring, power outages, non-functional streetlights, and unsafe electrical poles.',
    color:       'bg-yellow-50 text-yellow-700 border-yellow-100',
    iconBg:      'bg-yellow-100',
  },
  {
    icon:        Car,
    title:       'Traffic & Transportation',
    description: 'Signal failures, missing road signs, unsafe intersections, and poor public transit.',
    color:       'bg-purple-50 text-purple-700 border-purple-100',
    iconBg:      'bg-purple-100',
  },
  {
    icon:        Leaf,
    title:       'Environment & Pollution',
    description: 'Air quality issues, noise pollution, encroached green spaces, and industrial dumping.',
    color:       'bg-green-50 text-green-700 border-green-100',
    iconBg:      'bg-green-light',
  },
];

/* ── Animation variants ──────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y:  0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export default function ProblemCategories() {
  return (
    <section id="categories" className="py-20 lg:py-28 bg-white">
      <div className="section-container">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label mx-auto"
          >
            Civic Issues We Address
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-heading text-center"
          >
            Every Problem Deserves a Solution
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="section-subheading mx-auto text-center"
          >
            Report issues across six major civic categories. Our AI system ensures your
            complaint reaches the right authority instantly.
          </motion.p>
        </div>

        {/* ── Category grid ──────────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {CATEGORIES.map(({ icon: Icon, title, description, color, iconBg }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="card p-6 group cursor-pointer"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-6 h-6 ${color.split(' ')[1]}`} />
              </div>

              {/* Content */}
              <h3 className="text-base font-bold text-navy-DEFAULT mb-2 group-hover:text-green-DEFAULT transition-colors">
                {title}
              </h3>
              <p className="text-sm text-civic-secondary leading-relaxed mb-4">
                {description}
              </p>

              {/* Report CTA */}
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-DEFAULT opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Report Issue <ArrowRight size={12} />
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Bottom note ────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-civic-secondary mt-10"
        >
          Don't see your category?{' '}
          <button className="text-green-DEFAULT font-semibold hover:underline focus:outline-none">
            Report as Other Issue
          </button>
        </motion.p>
      </div>
    </section>
  );
}

