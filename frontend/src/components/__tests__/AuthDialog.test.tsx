import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthDialog } from '../auth/AuthDialog';

// Mock dependencies
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    isLoading: false,
  }),
}));

describe('AuthDialog', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in form by default', () => {
    render(<AuthDialog open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText('Welcome to Architech')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to sign up form when tab is clicked', async () => {
    const user = userEvent.setup();
    render(<AuthDialog open={true} onOpenChange={mockOnOpenChange} />);

    const signUpTab = screen.getByRole('tab', { name: /sign up/i });
    await user.click(signUpTab);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });
});