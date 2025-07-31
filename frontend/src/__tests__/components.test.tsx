import '@testing-library/jest-dom';
import { cn, getComponentColor } from '../lib/utils';
import { PALETTE_COMPONENTS } from '../lib/data';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe('Utility Functions', () => {
  test('cn function combines classes correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  test('getComponentColor returns correct colors', () => {
    expect(getComponentColor('Service')).toBe('bg-blue-500');
    expect(getComponentColor('Data')).toBe('bg-green-500');
    expect(getComponentColor('Messaging')).toBe('bg-purple-500');
    expect(getComponentColor('Networking')).toBe('bg-orange-500');
    expect(getComponentColor('Unknown')).toBe('bg-gray-500');
  });
});

describe('Data Constants', () => {
  test('PALETTE_COMPONENTS contains expected components', () => {
    expect(PALETTE_COMPONENTS).toHaveLength(6);
    
    const componentTypes = PALETTE_COMPONENTS.map(c => c.type);
    expect(componentTypes).toContain('service');
    expect(componentTypes).toContain('database');
    expect(componentTypes).toContain('cache');
    expect(componentTypes).toContain('queue');
    expect(componentTypes).toContain('balancer');
    expect(componentTypes).toContain('gateway');
  });

  test('Each component has required properties', () => {
    PALETTE_COMPONENTS.forEach(component => {
      expect(component).toHaveProperty('id');
      expect(component).toHaveProperty('type');
      expect(component).toHaveProperty('name');
      expect(component).toHaveProperty('icon');
      expect(component).toHaveProperty('category');
    });
  });
});

