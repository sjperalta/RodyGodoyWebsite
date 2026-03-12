import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  };

  const language = i18n.language;

  const navLinks = [
    { name: t('nav.nav_home'), href: '#' },
    { name: t('nav.projects'), href: '#proyectos' },
    { name: t('nav.studio'), href: '#nosotros' },
    { name: t('nav.services'), href: '#servicios' },
    { name: t('nav.contact'), href: '#contacto' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Rody Godoy Logo" className="h-10 w-auto" />
          <h1 className="text-xl font-bold tracking-tight font-serif">{t('nav.studio_name')}</h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium tracking-widest uppercase hover:text-primary transition-colors duration-300"
            >
              {link.name}
            </a>
          ))}
            <button 
              onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
              className="px-3 py-1 text-xs font-bold tracking-widest border border-white/30 rounded-sm hover:bg-white hover:text-bg-dark transition-colors uppercase"
            >
              {i18n.language === 'es' ? 'EN' : 'ES'}
            </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-900" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white border-b border-accent-line md:hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium tracking-widest uppercase hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
                <button 
                  onClick={() => {
                    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
                    setIsOpen(false);
                  }}
                  className="px-6 py-2 border border-white/30 rounded-sm hover:bg-white hover:text-bg-dark transition-colors uppercase text-sm font-bold tracking-widest inline-block"
                >
                  {i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};


export default Navbar;
