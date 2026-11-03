import { motion } from 'framer-motion';
import { User, Building, GraduationCap, FlaskConical, Factory } from 'lucide-react';

const STAKEHOLDERS = [
  {
    icon:    User,
    title:   'Citizens',
    role:    'Problem Reporters & Verifiers',
    desc:    'Residents identify, report, photograph, and track civic issues in their neighbourhoods. They also verify resolutions and provide feedback.',
    tags:    ['Report Issues', 'Track Progress', 'Verify Solutions'],
    color:   'text-blue-600',
    bg:      'bg-blue-50',
    accent:  'bg-blue-600',
    border:  'border-blue-100',
  },
  {
    icon:    Building,
    title:   'Government Authorities',
    role:    'Solution Implementers',
    desc:    'Municipal corporations, local bodies, and government departments receive AI-routed complaints, assign tasks, and implement ground-level solutions.',
    tags:    ['Receive Reports', 'Assign Departments', 'Monitor Resolution'],
    color:   'text-purple-600',
    bg:      'bg-purple-50',
    accent:  'bg-purple-600',
    border:  'border-purple-100',
  },
  {
    icon:    GraduationCap,
    title:   'Universities',
    role:    'Research & Innovation Partners',
    desc:    'Academic institutions study complex civic challenges, propose evidence-based solutions, and train the next generation of civic technologists.',
    tags:    ['Research Studies', 'Propose Solutions', 'Student Engagement'],
    color:   'text-amber-600',
    bg:      'bg-amber-50',
    accent:  'bg-amber-600',
    border:  'border-amber-100',
  },
  {
    icon:    FlaskConical,
    title:   'Researchers & Experts',
    role:    'Technical Consultants',
    desc:    'Domain experts in urban planning, engineering, environment, and public health contribute technical analysis and strategic guidance.',
    tags:    ['Technical Review', 'Policy Advice', 'Impact Assessment'],
    color:   'text-green-600',
    bg:      'bg-green-50',
    accent:  'bg-green-600',
    border:  'border-green-100',
  },
  {
    icon:    Factory,
    title:   'Industries',
    role:    'Implementation Partners',
    desc:    'Private sector companies contribute technology, resources, CSR funding, and implementation expertise to accelerate civic improvements.',
    tags:    ['CSR Funding', 'Technology', 'Infrastructure Support'],
    color:   'text-rose-600',
    bg:      'bg-rose-50',
    accent:  'bg-rose-600',
    border:  'border-rose-100',
  },
];

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y:  0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export default function StakeholderSection() {
  return (
    <section id="stakeholders" className="py-20 lg:py-28 bg-white">
      <div className="section-container">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label mx-auto"
          >
            Stakeholder Ecosystem
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-heading text-center"
          >
            A Collaborative Network for Change
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="section-subheading mx-auto text-center"
          >
            JanSamadhan unites five key stakeholder groups, each playing a vital role in
            identifying problems and delivering lasting solutions.
          </motion.p>
        </div>

        {/* ── Cards ──────────────────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {STAKEHOLDERS.map(({ icon: Icon, title, role, desc, tags, color, bg, accent, border }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="card p-6 flex flex-col group"
            >
              {/* Icon + accent bar */}
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div className={`w-1 h-10 rounded-full ${accent} opacity-20 group-hover:opacity-60 transition-opacity`} />
              </div>

              <h3 className="text-base font-bold text-navy-DEFAULT mb-0.5">{title}</h3>
              <p className={`text-xs font-semibold ${color} mb-3`}>{role}</p>
              <p className="text-sm text-civic-secondary leading-relaxed flex-1 mb-5">{desc}</p>

              {/* Tag pills */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[11px] font-semibold ${color} ${bg} border ${border} px-2.5 py-1 rounded-full`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}

          {/* ── "Join Us" filler card on large screens ─────────────── */}
          <motion.div
            variants={cardVariants}
            className="hidden lg:flex card p-6 items-center justify-center bg-navy-DEFAULT text-white text-center"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🤝</span>
              </div>
              <h3 className="text-base font-bold mb-2">Join the Ecosystem</h3>
              <p className="text-sm text-white/70 mb-5">
                Is your organisation ready to make a civic impact? Register as a stakeholder.
              </p>
              <button className="btn-outline-white text-sm px-5 py-2.5">
                Register as Partner
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

