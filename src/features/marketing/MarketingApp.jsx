import { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Navbar from '@/features/marketing/Navbar';
import Hero from '@/features/marketing/Hero';
import About from '@/features/marketing/About';
import Projects from '@/features/projects/Projects';
import Philosophy from '@/features/marketing/Philosophy';
import Services from '@/features/marketing/Services';
import Process from '@/features/marketing/Process';
import Contact from '@/features/marketing/Contact';
import Footer from '@/features/marketing/Footer';

const CustomCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target;
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

export default function MarketingApp() {
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

