import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../styles/animations';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you'd send this to Formspree or a backend
    const alertMsg = t('lang') === 'es' 
      ? `Mensaje enviado por ${formData.name}. (Demo)`
      : `Message sent by ${formData.name}. (Demo)`;
    alert(alertMsg);
    setFormData({ name: '', email: '', message: '' });
  };

  const contactInfo = [
    {
      icon: <Phone size={24} className="text-primary" />,
      label: t('contact.form_phone'),
      value: '+504 9558-3920',
      href: 'tel:+50495583920',
    },
    {
      icon: <Mail size={24} className="text-primary" />,
      label: t('contact.form_email'),
      value: 'arqrrgodoy@gmail.com',
      href: 'mailto:arqrrgodoy@gmail.com',
    },
    {
      icon: <MapPin size={24} className="text-primary" />,
      label: t('projects.location'),
      value: 'Puerto Cortés, Honduras',
      href: '#',
    },
  ];

  return (
    <section id="contacto" className="section-padding bg-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
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
            {t('contact.subtitle')}
          </motion.span>
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-light font-serif leading-tight mb-8"
          >
            {t('contact.title').split(' ').slice(0, 3).join(' ')} <br /> <span className="italic font-bold">{t('contact.title').split(' ').slice(3).join(' ')}</span>
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-slate-600 text-lg font-light leading-relaxed mb-12"
          >
            {t('contact.description')}
          </motion.p>

          <div className="space-y-8">
            {contactInfo.map((info, idx) => (
              <motion.a 
                key={info.label} 
                href={info.href}
                className="flex items-center gap-6 group"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
              >
                <div className="w-12 h-12 bg-bg-light flex items-center justify-center rounded-full group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                   {info.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                    {info.label}
                  </p>
                  <p className="text-lg font-medium group-hover:text-primary transition-colors">
                    {info.value}
                  </p>
                </div>
              </motion.a>
            ))}
            
            <motion.div 
              variants={fadeInUp}
              className="pt-8 border-t border-accent-line/30"
            >
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-6">{t('contact.social_title')}</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { name: 'Instagram', url: 'https://www.instagram.com/arq.godoy.hn/', label: 'IG' },
                  { name: 'TikTok', url: 'https://www.tiktok.com/@arq.godoy.hn?_t=8gvz5zQxRNW&_r=1', label: 'TK' },
                  { name: 'Facebook', url: 'https://www.facebook.com/arq.rody/', label: 'FB' },
                  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/rodygodoy/', label: 'LI' },
                  { name: 'Behance', url: 'https://www.behance.net/arqrodygodoy', label: 'BE' }
                ].map((social, idx) => (
                  <motion.a 
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -5, backgroundColor: '#c5a059', color: '#fff' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="w-12 h-12 bg-bg-light flex items-center justify-center rounded-full transition-all duration-300 text-xs font-bold uppercase tracking-tighter"
                    title={social.name}
                  >
                    {social.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
          className="bg-bg-light p-8 md:p-12 relative overflow-hidden group shadow-2xl rounded-sm"
        >
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <motion.div variants={fadeInUp}>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2 text-slate-500">{t('contact.form_name')}</label>
              <input
                type="text"
                required
                className="w-full bg-white border border-accent-line/30 p-4 focus:border-primary outline-none transition-colors rounded-none placeholder-slate-300"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2 text-slate-500">{t('contact.form_email')}</label>
              <input
                type="email"
                required
                className="w-full bg-white border border-accent-line/30 p-4 focus:border-primary outline-none transition-colors rounded-none placeholder-slate-300"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2 text-slate-500">{t('contact.form_message')}</label>
              <textarea
                required
                rows="5"
                className="w-full bg-white border border-accent-line/30 p-4 focus:border-primary outline-none transition-colors resize-none rounded-none placeholder-slate-300"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </motion.div>
            <motion.button
              variants={fadeInUp}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-primary text-white py-4 font-bold tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-bg-dark transition-all duration-500 relative overflow-hidden group/btn"
            >
              <span className="relative z-10 flex items-center gap-3">
                {t('contact.form_submit')}
                <Send size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-bg-dark transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
            </motion.button>
          </form>
          {/* Decorative element */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary rounded-full pointer-events-none -z-0"
          ></motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
