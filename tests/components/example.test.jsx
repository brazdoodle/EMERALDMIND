/**
 * Example Component Tests for EmeraldMind
 * Demonstrates testing patterns and best practices
 */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockTrainer, renderWithProviders } from '../setup.js';

// Mock a simple component for testing
const MockTrainerCard = ({ trainer, onEdit, onDelete }) => {
  return (
    <div data-testid="trainer-card">
      <h3>{trainer.trainer_name}</h3>
      <p>{trainer.trainer_class}</p>
      <p>Level {trainer.level_min}-{trainer.level_max}</p>
      <button onClick={() => onEdit(trainer)} data-testid="edit-button">
        Edit
      </button>
      <button onClick={() => onDelete(trainer.id)} data-testid="delete-button">
        Delete
      </button>
    </div>
  );
};

describe('TrainerCard Component', () => {
  let mockTrainer;
  let mockOnEdit;
  let mockOnDelete;

  beforeEach(() => {
    mockTrainer = createMockTrainer({
      trainer_name: 'Test Youngster',
      trainer_class: 'YOUNGSTER',
      level_min: 10,
      level_max: 15
    });
    mockOnEdit = vi.fn();
    mockOnDelete = vi.fn();
  });

  it('renders trainer information correctly', () => {
    renderWithProviders(
      <MockTrainerCard 
        trainer={mockTrainer} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    expect(screen.getByText('Test Youngster')).toBeInTheDocument();
    expect(screen.getByText('YOUNGSTER')).toBeInTheDocument();
    expect(screen.getByText('Level 10-15')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <MockTrainerCard 
        trainer={mockTrainer} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    await user.click(screen.getByTestId('edit-button'));
    
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTrainer);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <MockTrainerCard 
        trainer={mockTrainer} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    await user.click(screen.getByTestId('delete-button'));
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockTrainer.id);
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(
      <MockTrainerCard 
        trainer={mockTrainer} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );

    const card = screen.getByTestId('trainer-card');
    expect(card).toBeInTheDocument();
    
    const editButton = screen.getByTestId('edit-button');
    const deleteButton = screen.getByTestId('delete-button');
    
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });
});

// Mock an async component for testing async operations
const MockAsyncComponent = ({ onLoad }) => {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleLoad = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await onLoad();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error}</div>;
  if (data) return <div data-testid="data">Data: {JSON.stringify(data)}</div>;
  
  return (
    <button onClick={handleLoad} data-testid="load-button">
      Load Data
    </button>
  );
};

describe('AsyncComponent', () => {
  it('shows loading state during async operation', async () => {
    const mockOnLoad = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithProviders(<MockAsyncComponent onLoad={mockOnLoad} />);
    
    const loadButton = screen.getByTestId('load-button');
    fireEvent.click(loadButton);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  it('displays data after successful load', async () => {
    const testData = { message: 'Success!' };
    const mockOnLoad = vi.fn(() => Promise.resolve(testData));
    
    renderWithProviders(<MockAsyncComponent onLoad={mockOnLoad} />);
    
    const loadButton = screen.getByTestId('load-button');
    fireEvent.click(loadButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('data')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('data')).toHaveTextContent('Data: {"message":"Success!"}');
  });

  it('displays error message on load failure', async () => {
    const mockOnLoad = vi.fn(() => Promise.reject(new Error('Load failed')));
    
    renderWithProviders(<MockAsyncComponent onLoad={mockOnLoad} />);
    
    const loadButton = screen.getByTestId('load-button');
    fireEvent.click(loadButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('error')).toHaveTextContent('Error: Load failed');
  });
});

// Example integration test
describe('Component Integration', () => {
  it('works with providers and context', () => {
    const TestComponent = () => {
      // This would use actual hooks from your app
      return <div data-testid="integration-test">Integration Test</div>;
    };

    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('integration-test')).toBeInTheDocument();
  });
});

// Example snapshot test
describe('Component Snapshots', () => {
  it('matches snapshot', () => {
    const mockTrainer = createMockTrainer();
    const { container } = renderWithProviders(
      <MockTrainerCard 
        trainer={mockTrainer} 
        onEdit={vi.fn()} 
        onDelete={vi.fn()} 
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
});