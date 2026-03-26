import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fadeInUp, staggerContainer } from '@/app/styles/animations';
import { 
  PencilRuler, 
  Home, 
  Building2, 
  RefreshCcw, 
  HardHat, 
  Search 
} from 'lucide-react';
import type { ReactNode } from 'react';

interface ServiceCategory {
  title: string;
  icon: ReactNode;
  items: string[];
}

const Services = () => {
  const { t } = useTranslation();

  const serviceCategories: ServiceCategory[] = [
    {
      title: t('services.s1_title'),
      icon: <PencilRuler className="text-primary" size={32} />,
      items: t<string[]>('services.s1_items', { returnObjects: true }),
    },
    {
      title: t('services.s2_title'),
      icon: <Home className="text-primary" size={32} />,
      items: t<string[]>('services.s2_items', { returnObjects: true }),
    },
    {
      title: t('services.s3_title'),
      icon: <Building2 className="text-primary" size={32} />,
      items: t<string[]>('services.s3_items', { returnObjects: true }),
    },
    {
      title: t('services.s4_title'),
      icon: <RefreshCcw className="text-primary" size={32} />,
      items: t<string[]>('services.s4_items', { returnObjects: true }),
    },
    {
      title: t('services.s5_title'),
      icon: <HardHat className="text-primary" size={32} />,
      items: t<string[]>('services.s5_items', { returnObjects: true }),
    },
    {
      title: t('services.s6_title'),
      icon: <Search className="text-primary" size={32} />,
      items: t<string[]>('services.s6_items', { returnObjects: true }),
    },
  ];

  return (
    <section id="servicios" className="section-padding bg-white overflow-hidden">
      <motion.div 
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="mb-20"
      >
        <motion.span 
          variants={fadeInUp}
          className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4 block"
        >
          {t('services.subtitle')}
        </motion.span>
        <motion.h2 
          variants={fadeInUp}
          className="text-4xl md:text-6xl font-light font-serif leading-tight"
        >
          {t('services.title')}
        </motion.h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {serviceCategories.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="group p-8 border border-accent-line/20 hover:bg-bg-light transition-all duration-500 hover:shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">{service.icon}</div>
            <h3 className="text-2xl font-serif font-medium mb-6 group-hover:text-primary transition-colors duration-300">
              {service.title}
            </h3>
            <ul className="space-y-3">
              {service.items.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-500 font-light">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Services;
