import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { fadeInUp } from '../styles/animations';
import architectPhoto from '../assets/architect.jpg';

const About = () => {
  const { t } = useLanguage();

  return (
    <section id="nosotros" className="section-padding bg-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4 block">
            {t('about.subtitle')}
          </span>
          <h2 className="text-4xl md:text-6xl font-light leading-tight mb-8 font-serif">
            {t('about.title').split(' ')[0]} <br />
            <span className="italic">{t('about.title').split(' ').slice(1).join(' ')}</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6 font-light">
            {t('about.p1')}
          </p>
          <p className="text-slate-600 text-lg leading-relaxed font-light mb-8">
            {t('about.p2')}
          </p>
          <div className="pt-6 border-t border-accent-line/30 inline-block">
            <p className="font-serif italic text-2xl text-slate-900 mb-1">Arq. Rody Godoy</p>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">{t('about.signature_title')}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 30 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
          className="relative aspect-[4/5]"
        >
          <div className="relative w-full h-full overflow-hidden rounded-sm group">
            <motion.img
              initial={{ scale: 1.2 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src={architectPhoto}
              alt="Arquitecto Rody Godoy"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          </div>

          <div className="absolute -bottom-6 -right-6 w-1/2 h-1/2 bg-neutral-soft -z-10"></div>
          <div className="absolute -top-6 -left-6 w-1/3 h-1/3 border-t border-l border-primary/30 -z-10"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
