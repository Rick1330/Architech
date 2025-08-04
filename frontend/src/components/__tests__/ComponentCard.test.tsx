import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentCard } from '../ComponentCard';

describe('ComponentCard', () => {
  const mockComponent = {
    id: 'api-gateway',
    name: 'API Gateway',
    description: 'Routes and manages API requests',
    category: 'infrastructure',
    icon: 'gateway',
    color: '#3b82f6',
  };

  const mockOnDragStart = vi.fn();
  const mockOnToggleFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders component information correctly', () => {
    render(
      <ComponentCard 
        component={mockComponent} 
        onDragStart={mockOnDragStart}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    expect(screen.getByText('API Gateway')).toBeInTheDocument();
    expect(screen.getByText('Routes and manages API requests')).toBeInTheDocument();
    expect(screen.getByText('infrastructure')).toBeInTheDocument();
  });

  it('toggles favorite status', async () => {
    const user = userEvent.setup();
    render(
      <ComponentCard 
        component={mockComponent} 
        onDragStart={mockOnDragStart}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    const favoriteButton = screen.getByRole('button');
    await user.click(favoriteButton);

    expect(mockOnToggleFavorite).toHaveBeenCalledWith(mockComponent.id);
  });
});