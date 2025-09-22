import '@testing-library/jest-dom';

global.fetch = jest.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    clip: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    arc: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
  })),
});

const mockEnv = {
  VITE_LTA_API_KEY: 'test_api_key',
  VITE_LTA_BASE_URL: 'https://api.test.sg',
  VITE_DEFAULT_MAP_CENTER_LAT: '1.3521',
  VITE_DEFAULT_MAP_CENTER_LNG: '103.8198',
  VITE_DEFAULT_ZOOM_LEVEL: '12',
  VITE_API_POLLING_INTERVAL: '30000',
  VITE_DEBUG_MODE: 'true',
};

Object.defineProperty(import.meta, 'env', {
  value: mockEnv,
});