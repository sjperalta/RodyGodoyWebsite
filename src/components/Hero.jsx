import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp, staggerContainer, imageZoom } from '../styles/animations';

const Hero = () => {
  const { t } = useTranslation();

  const titleText = "Rody Godoy";
  const studioText = t('nav.studio').split(' ')[0];

  return (
    <section className="relative h-screen min-h-[700px] w-full flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <motion.div 
        variants={imageZoom}
        initial="initial"
        animate="animate"
        className="absolute inset-0 z-0"
      >
        <video
          src={`${import.meta.env.BASE_URL}projects_assets/Airbnb refugio perfecto.mp4`}
          className="w-full h-full object-cover grayscale opacity-50"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/60 to-transparent"></div>
      </motion.div>

      <div className="relative z-10 section-padding w-full">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl"
        >
          <motion.span 
            variants={fadeInUp}
            className="text-primary text-xs md:text-sm font-bold tracking-[0.4em] uppercase mb-6 block"
          >
            {t('hero.subtitle')}
          </motion.span>
          
          <h1 className="text-5xl md:text-8xl font-light text-white leading-[1.1] mb-8 font-serif">
            <motion.span 
              variants={fadeInUp}
              className="block opacity-70 text-2xl md:text-3xl mb-2 tracking-widest uppercase font-sans font-bold"
            >
              {studioText}
            </motion.span>
            <div className="block font-bold overflow-hidden pb-4">
              {titleText.split('').map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.5 + index * 0.05,
                    ease: [0.33, 1, 0.68, 1] 
                  }}
                  className="inline-block"
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>
          </h1>

          <motion.p 
            variants={fadeInUp}
            className="text-neutral-soft text-lg md:text-2xl font-light leading-relaxed max-w-2xl mb-12"
          >
            {t('hero.tagline')} <br />
            {t('hero.description')}
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap gap-6"
          >
            <a
              href="#proyectos"
              className="px-8 py-4 bg-primary text-white text-sm font-bold tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 relative group overflow-hidden"
            >
              <span className="relative z-10">{t('hero.cta_primary')}</span>
              <motion.div 
                className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
              />
            </a>
            <a
              href="#contacto"
              className="px-8 py-4 border border-white text-white text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-bg-dark transition-all duration-300"
            >
              {t('hero.cta_secondary')}
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white"
      >
        <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">{t('hero.scroll')}</span>
        <div className="w-[1px] h-12 bg-white/30 relative overflow-hidden">
          <motion.div
            animate={{ y: [0, 48, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-1/3 bg-primary"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
