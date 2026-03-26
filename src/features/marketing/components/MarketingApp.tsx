import { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import Philosophy from './Philosophy';
import Services from './Services';
import Process from './Process';
import Contact from './Contact';
import Footer from './Footer';
import { Projects } from '@/features/projects';

const CustomCursor = () => {
  const mouseX = useMotionValue<number>(0);
  const mouseY = useMotionValue<number>(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const [isPointer, setIsPointer] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' || target.tagName === 'A' || target.tagName === 'BUTTON'
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-primary pointer-events-none z-[9999] hidden md:block mix-blend-difference"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        scale: isPointer ? 1.5 : 1,
        backgroundColor: isPointer ? 'rgba(197, 160, 89, 0.2)' : 'rgba(197, 160, 89, 0)',
      }}
    />
  );
};

export function MarketingApp() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-bg-light transition-colors duration-300">
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Philosophy />
        <Services />
        <Process />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
