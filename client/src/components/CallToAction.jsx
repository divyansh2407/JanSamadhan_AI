import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';

export default function CallToAction() {
  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="cta" className="py-20 lg:py-28 bg-civic-bg">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #12304A 0%, #0B1F33 60%, #0d3d20 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-green/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-green/10 blur-2xl pointer-events-none" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)`,
              backgroundSize:  '40px 40px',
            }}
          />

          <div className="relative z-10 px-8 py-16 lg:px-16 lg:py-20 text-center">

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-green-400 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Join the Movement
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-5 max-w-3xl mx-auto"
            >
              Together, We Can Build <span className="text-green-400">Better Cities.</span>
            </motion.h2>

            {/* Supporting text */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18 }}
              className="text-white/65 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            >
              Every problem deserves attention. Every solution starts with collaboration.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.26 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() => scrollTo('#categories')}
                className="inline-flex items-center justify-center gap-2 bg-green hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-base"
              >
                Join JanSamadhan
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollTo('#categories')}
                className="inline-flex items-center justify-center gap-2 border-2 border-white/25 hover:border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-base"
              >
                <FileText className="w-5 h-5" />
                Report a Civic Issue
              </button>
            </motion.div>

            {/* Trust footnote */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-white/35 text-sm mt-8"
            >
              Free to join · No subscription required · Open to all Indian residents
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

