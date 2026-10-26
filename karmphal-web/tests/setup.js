import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup React DOM after each test
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Polyfill window.matchMedia for JSDOM
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Polyfill document.fonts.ready for JSDOM
if (typeof document !== 'undefined' && !document.fonts) {
  document.fonts = {
    ready: Promise.resolve(),
    add: vi.fn(),
    delete: vi.fn(),
    has: vi.fn().mockReturnValue(true),
  };
}

// Polyfill URL.createObjectURL and URL.revokeObjectURL
if (typeof URL !== 'undefined') {
  let urlCounter = 0;
  const createdUrls = new Set();
  if (!URL.createObjectURL) {
    URL.createObjectURL = vi.fn((_blob) => {
      urlCounter++;
      const url = `blob:http://localhost:5173/mock-blob-${urlCounter}`;
      createdUrls.add(url);
      return url;
    });
  }
  if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = vi.fn((url) => {
      createdUrls.delete(url);
    });
  }
}

// Polyfill HTMLCanvasElement.prototype.getContext
if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.getContext) {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: [] })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  }));
}
