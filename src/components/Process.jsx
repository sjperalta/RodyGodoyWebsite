// Removed React import
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp, staggerContainer } from '../styles/animations';

const Process = () => {
  const { t } = useTranslation();

  const steps = [
    {
      id: '01',
      title: t('process.st1_title'),
      description: t('process.st1_desc'),
    },
    {
      id: '02',
      title: t('process.st2_title'),
      description: t('process.st2_desc'),
    },
    {
      id: '03',
      title: t('process.st3_title'),
      description: t('process.st3_desc'),
    },
    {
      id: '04',
      title: t('process.st4_title'),
      description: t('process.st4_desc'),
    },
    {
      id: '05',
      title: t('process.st5_title'),
      description: t('process.st5_desc'),
    },
  ];

  return (
    <section className="section-padding bg-bg-dark text-white overflow-hidden">
      <div className="max-w-4xl">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.span 
            variants={fadeInUp}
            className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4 block"
          >
            {t('process.subtitle')}
          </motion.span>
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-light font-serif leading-tight mb-20"
          >
            {t('process.title')}
          </motion.h2>
        </motion.div>

        <div className="space-y-12 relative">
          {/* Vertical line for desktop */}
          <motion.div 
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute left-[24px] top-4 bottom-4 w-[1px] bg-white/10 hidden md:block origin-top"
          ></motion.div>

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className="group flex flex-col md:flex-row gap-6 md:gap-12 relative"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-primary flex items-center justify-center rounded-full z-10 font-bold font-serif text-lg group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700">
                {step.id}
              </div>
              <div className="pt-2">
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-3 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-neutral-soft/70 leading-relaxed max-w-2xl font-light">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
