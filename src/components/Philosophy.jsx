// Removed React import
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp, staggerContainer } from '../styles/animations';

const Philosophy = () => {
  const { t } = useTranslation();

  const principles = [
    {
      id: '01',
      title: t('philosophy.p1_title'),
      description: t('philosophy.p1_desc'),
    },
    {
      id: '02',
      title: t('philosophy.p2_title'),
      description: t('philosophy.p2_desc'),
    },
    {
      id: '03',
      title: t('philosophy.p3_title'),
      description: t('philosophy.p3_desc'),
    },
    {
      id: '04',
      title: t('philosophy.p4_title'),
      description: t('philosophy.p4_desc'),
    },
  ];

  return (
    <section className="section-padding bg-bg-light border-y border-accent-line/20 overflow-hidden">
      <motion.div 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="text-center max-w-3xl mx-auto mb-20"
      >
        <motion.span 
          variants={fadeInUp}
          className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4 block"
        >
          {t('philosophy.subtitle')}
        </motion.span>
        <motion.h2 
          variants={fadeInUp}
          className="text-4xl md:text-5xl font-light font-serif italic mb-6"
        >
          {t('philosophy.title')}
        </motion.h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {principles.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="group p-8 bg-white border border-accent-line/30 hover:border-primary/40 transition-all duration-500 hover:shadow-xl"
          >
            <span className="text-4xl font-serif text-primary/20 group-hover:text-primary/100 transition-colors duration-500 block mb-6 transform group-hover:-translate-y-2">
              {p.id}
            </span>
            <h3 className="text-xl font-bold tracking-widest uppercase mb-4 group-hover:text-primary transition-colors duration-500">
              {p.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-light">
              {p.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Philosophy;
