import '@testing-library/jest-dom';
import './mocks/server';
import { vi } from 'vitest';


// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage with realistic behavior
const createStorageMock = () => {
  const store: Record<string, string> = {};
  
  const mockStorage = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
    // Add a method to get all keys for testing
    getAllKeys: () => Object.keys(store),
  };

  // Add store keys as enumerable properties to make Object.keys work
  const updateEnumerableKeys = () => {
    // Remove old enumerable keys
    Object.keys(mockStorage).forEach(key => {
      if (key in store) {
        delete (mockStorage as any)[key];
      }
    });
    
    // Add current store keys as enumerable properties
    Object.keys(store).forEach(key => {
      Object.defineProperty(mockStorage, key, {
        value: store[key],
        enumerable: true,
        configurable: true,
      });
    });
  };

  // Override setItem and removeItem to update enumerable keys
  const originalSetItem = mockStorage.setItem;
  const originalRemoveItem = mockStorage.removeItem;
  const originalClear = mockStorage.clear;

  mockStorage.setItem = vi.fn((key: string, value: string) => {
    originalSetItem(key, value);
    updateEnumerableKeys();
  });

  mockStorage.removeItem = vi.fn((key: string) => {
    originalRemoveItem(key);
    updateEnumerableKeys();
  });

  mockStorage.clear = vi.fn(() => {
    originalClear();
    updateEnumerableKeys();
  });

  return mockStorage;
};

global.localStorage = createStorageMock() as any;
global.sessionStorage = createStorageMock() as any;
