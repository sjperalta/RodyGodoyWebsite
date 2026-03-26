import '@testing-library/jest-dom/vitest';

// `framer-motion` uses `IntersectionObserver` for viewport/animation features.
// JSDOM doesn't provide it by default, so we stub it for stable tests.
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  class IntersectionObserver {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    observe(target: Element) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unobserve(target: Element) {}
    disconnect() {}
  }

  // Make it available in both `window` and `globalThis` scopes.
  window.IntersectionObserver = IntersectionObserver;
  globalThis.IntersectionObserver = IntersectionObserver;
}
