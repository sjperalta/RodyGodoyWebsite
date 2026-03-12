export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] }
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const revealText = {
  initial: { y: "100%" },
  animate: { 
    y: 0,
    transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] }
  }
};

export const imageZoom = {
  initial: { scale: 1.1, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 1.5, ease: "easeOut" }
  }
};

export const fadeScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
  }
};
