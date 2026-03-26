import { useTranslation } from 'react-i18next';
import logo from '@/app/assets/logo.png';
import type { FC } from 'react';

interface SocialLink {
  name: string;
  url: string;
  label: string;
}

const Footer: FC = () => {
  const { t } = useTranslation();

  const socialLinks: SocialLink[] = [
    { name: 'Instagram', url: 'https://www.instagram.com/arq.godoy.hn/', label: 'I' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@arq.godoy.hn?_t=8gvz5zQxRNW&_r=1', label: 'T' },
    { name: 'Facebook', url: 'https://www.facebook.com/arq.rody/', label: 'F' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/rodygodoy/', label: 'L' },
    { name: 'Behance', url: 'https://www.behance.net/arqrodygodoy', label: 'B' }
  ];

  return (
    <footer className="bg-bg-dark text-white pt-20 pb-10 px-6 md:px-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="Rody Godoy Logo" className="h-10 w-auto brightness-0 invert" />
            <h2 className="text-2xl font-serif font-bold tracking-tight">{t('nav.studio_name')}</h2>
          </div>
          <p className="text-neutral-soft/60 max-w-sm mb-10 font-light leading-relaxed">
            {t('hero.description')}
          </p>
          <div className="flex gap-4">
            {socialLinks.map(social => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 text-[10px] font-bold uppercase tracking-tighter"
                title={social.name}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase mb-8 text-primary">{t('nav.studio')}</h4>
          <ul className="space-y-4 text-neutral-soft/60 font-light text-sm">
            <li><a href="#" className="hover:text-white transition-colors">{t('nav.nav_home')}</a></li>
            <li><a href="#proyectos" className="hover:text-white transition-colors">{t('nav.projects')}</a></li>
            <li><a href="#nosotros" className="hover:text-white transition-colors">{t('nav.studio')}</a></li>
            <li><a href="#servicios" className="hover:text-white transition-colors">{t('nav.services')}</a></li>
            <li><a href="#contacto" className="hover:text-white transition-colors">{t('nav.contact')}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase mb-8 text-primary">{t('nav.studio')}</h4>
          <p className="text-neutral-soft/60 font-light text-sm leading-relaxed mb-6">
            Puerto Cortés,<br />
            Honduras, CA.
          </p>
          <p className="text-neutral-soft/60 font-light text-sm">
            {t('footer.schedule_label')} <br />
            {t('footer.schedule')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-soft/30 flex flex-wrap items-center gap-x-2">
          <span>© {new Date().getFullYear()} {t('nav.studio_name')}. {t('footer.rights')}</span>
          <span className="opacity-20 hidden md:block">|</span>
          <a 
            href="https://omegatech.dev" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-primary transition-colors"
          >
            {t('footer.created_by')} omegatech.dev
          </a>
        </p>
        <div className="flex gap-8">
          <a href="#" className="text-[10px] font-bold tracking-widest uppercase text-neutral-soft/30 hover:text-primary transition-colors">
            {t('footer.privacy')}
          </a>
          <a href="#" className="text-[10px] font-bold tracking-widest uppercase text-neutral-soft/30 hover:text-primary transition-colors">
            {t('footer.cookies')}
          </a>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
