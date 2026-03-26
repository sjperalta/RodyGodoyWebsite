import '@testing-library/jest-dom/vitest';

// `framer-motion` uses `IntersectionObserver` for viewport/animation features.
// JSDOM doesn't provide it by default, so we stub it for stable tests.
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Make it available in both `window` and `global` scopes.
  window.IntersectionObserver = IntersectionObserver;
  globalThis.IntersectionObserver = IntersectionObserver;
}

