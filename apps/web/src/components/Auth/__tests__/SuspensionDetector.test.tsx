import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SuspensionDetector, SuspensionDebugInfo } from '../SuspensionDetector';

// Mock the hook
const mockUseSuspensionDetector = vi.fn();
let mockHookReturnValue = {
  isActive: true,
  lastActiveTime: Date.now(),
  getInactiveTimeMinutes: () => 0,
};

vi.mock('@/hooks/useSuspensionDetector', () => ({
  useSuspensionDetector: (options: any) => {
    mockUseSuspensionDetector(options);
    return mockHookReturnValue;
  },
}));

describe('SuspensionDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock return value
    mockHookReturnValue = {
      isActive: true,
      lastActiveTime: Date.now(),
      getInactiveTimeMinutes: () => 0,
    };
  });

  describe('SuspensionDetector component', () => {
    it('should render children without any additional UI', () => {
      render(
        <SuspensionDetector>
          <div data-testid='test-child'>Test Content</div>
        </SuspensionDetector>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should call useSuspensionDetector with default options', () => {
      render(
        <SuspensionDetector>
          <div>Test</div>
        </SuspensionDetector>
      );

      expect(mockUseSuspensionDetector).toHaveBeenCalledWith({
        inactivityCheckThresholdMinutes: 30,
        checkIntervalMinutes: 1,
      });
    });

    it('should call useSuspensionDetector with custom options', () => {
      render(
        <SuspensionDetector
          inactivityCheckThresholdMinutes={15}
          checkIntervalMinutes={2}
        >
          <div>Test</div>
        </SuspensionDetector>
      );

      expect(mockUseSuspensionDetector).toHaveBeenCalledWith({
        inactivityCheckThresholdMinutes: 15,
        checkIntervalMinutes: 2,
      });
    });

    it('should render multiple children correctly', () => {
      render(
        <SuspensionDetector>
          <div data-testid='child-1'>Child 1</div>
          <div data-testid='child-2'>Child 2</div>
          <span data-testid='child-3'>Child 3</span>
        </SuspensionDetector>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('SuspensionDebugInfo component', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should render debug info in development environment', () => {
      process.env.NODE_ENV = 'development';

      render(<SuspensionDebugInfo />);

      expect(screen.getByText('Page: Active')).toBeInTheDocument();
      expect(screen.getByText(/Last Active:/)).toBeInTheDocument();
      expect(screen.getByText('Inactive: 0.0m')).toBeInTheDocument();
    });

    it('should show hidden state when page is not active', () => {
      process.env.NODE_ENV = 'development';

      // Update mock return value
      mockHookReturnValue = {
        isActive: false,
        lastActiveTime: new Date('2024-01-01T10:00:00Z').getTime(),
        getInactiveTimeMinutes: () => 30.0,
      };

      render(<SuspensionDebugInfo />);

      expect(screen.getByText('Page: Hidden')).toBeInTheDocument();
      expect(screen.getByText('Inactive: 30.0m')).toBeInTheDocument();
    });

    it('should not render in production environment', () => {
      process.env.NODE_ENV = 'production';

      render(<SuspensionDebugInfo />);

      expect(screen.queryByText(/Page:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Last Active:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Inactive:/)).not.toBeInTheDocument();
    });

    it('should not render in test environment', () => {
      process.env.NODE_ENV = 'test';

      render(<SuspensionDebugInfo />);

      expect(screen.queryByText(/Page:/)).not.toBeInTheDocument();
    });

    it('should have correct styling classes', () => {
      process.env.NODE_ENV = 'development';

      const { container } = render(<SuspensionDebugInfo />);
      const debugElement = container.firstChild as HTMLElement;

      expect(debugElement).toHaveClass(
        'fixed',
        'bottom-4',
        'right-4',
        'bg-black',
        'bg-opacity-75',
        'text-white',
        'p-2',
        'rounded',
        'text-xs',
        'font-mono',
        'z-50'
      );
    });
  });

  describe('integration', () => {
    it('should work with nested components', () => {
      const NestedComponent = () => (
        <div data-testid='nested'>
          <h1>Dashboard</h1>
          <p>Welcome to your dashboard</p>
        </div>
      );

      render(
        <SuspensionDetector enableLogging={true}>
          <NestedComponent />
        </SuspensionDetector>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome to your dashboard')).toBeInTheDocument();

      expect(mockUseSuspensionDetector).toHaveBeenCalledWith({
        inactivityCheckThresholdMinutes: 30,
        checkIntervalMinutes: 1,
      });
    });

    it('should handle component updates correctly', () => {
      const { rerender } = render(
        <SuspensionDetector inactivityCheckThresholdMinutes={15}>
          <div>Initial Content</div>
        </SuspensionDetector>
      );

      expect(mockUseSuspensionDetector).toHaveBeenCalledWith({
        inactivityCheckThresholdMinutes: 15,
        checkIntervalMinutes: 1,
      });

      rerender(
        <SuspensionDetector inactivityCheckThresholdMinutes={45}>
          <div>Updated Content</div>
        </SuspensionDetector>
      );

      expect(mockUseSuspensionDetector).toHaveBeenCalledWith({
        inactivityCheckThresholdMinutes: 45,
        checkIntervalMinutes: 1,
      });

      expect(screen.getByText('Updated Content')).toBeInTheDocument();
    });
  });
});
