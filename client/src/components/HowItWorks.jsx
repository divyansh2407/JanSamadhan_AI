import { motion } from 'framer-motion';
import { FileText, Cpu, CheckCircle, Users, CheckCheck } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon:   FileText,
    title:  'Report a Problem',
    desc:   'Citizens submit civic issues with photos, location tags, and a description through the web or mobile interface.',
    color:  'text-blue-600',
    bg:     'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    number: '02',
    icon:   Cpu,
    title:  'AI-Powered Analysis',
    desc:   'Our AI engine categorises, prioritises, and routes the report to the relevant government department automatically.',
    color:  'text-purple-600',
    bg:     'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    number: '03',
    icon:   CheckCircle,
    title:  'Authority Verification',
    desc:   'Designated officials acknowledge the complaint, verify its validity, and assign a resolution timeline.',
    color:  'text-amber-600',
    bg:     'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    number: '04',
    icon:   Users,
    title:  'Collaborative Solutions',
    desc:   'Experts, universities, and industries collaborate to propose the most effective and sustainable solution.',
    color:  'text-green-600',
    bg:     'bg-green-50',
    border: 'border-green-200',
  },
  {
    number: '05',
    icon:   CheckCheck,
    title:  'Implementation & Resolution',
    desc:   'Solutions are implemented on the ground. Citizens receive updates and confirm resolution through the platform.',
    color:  'text-navy',
    bg:     'bg-navy/5',
    border: 'border-navy/20',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-civic-bg">
      <div className="section-container">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label mx-auto"
          >
            Our Process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-heading text-center"
          >
            How JanSamadhan Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="section-subheading mx-auto text-center"
          >
            A transparent, five-step process from problem submission to verified resolution.
          </motion.p>
        </div>

        {/* ── Timeline ─────────────────────────────────────────────────── */}
        <div className="relative">

          {/* Vertical connector line (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-civic-border -translate-x-1/2" />

          <div className="flex flex-col gap-10 lg:gap-0">
            {STEPS.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: idx * 0.08, ease: 'easeOut' }}
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-12 items-center ${
                    isEven ? '' : 'lg:direction-rtl'
                  }`}
                >
                  {/* Step card */}
                  <div className={`${isEven ? 'lg:col-start-1 lg:text-right' : 'lg:col-start-2 lg:row-start-1'}`}>
                    <div className={`card p-6 inline-block w-full max-w-sm ${isEven ? 'lg:ml-auto' : ''}`}>
                      {/* Step number badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl font-black text-civic-border">{step.number}</span>
                        <div className={`w-10 h-10 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center`}>
                          <step.icon className={`w-5 h-5 ${step.color}`} />
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-navy mb-2">{step.title}</h3>
                      <p className="text-sm text-civic-secondary leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Center dot on the timeline line */}
                  <div
                    className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-green border-4 border-white shadow-sm z-10`}
                    style={{ top: '50%', transform: 'translate(-50%, -50%)' }}
                  />

                  {/* Empty column for alternating layout */}
                  <div className={isEven ? 'lg:col-start-2' : 'lg:col-start-1 lg:row-start-1'} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

