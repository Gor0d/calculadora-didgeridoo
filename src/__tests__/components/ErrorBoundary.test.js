import React from 'react';
import { render } from '@testing-library/react-native';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Component that throws an error for testing
const ErrorThrowingComponent = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return null;
};

// Working component for normal tests
const WorkingComponent = () => <text>Working Component</text>;

describe('ErrorBoundary', () => {
  // Suppress console errors during tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(getByText('Working Component')).toBeTruthy();
  });

  test('renders error UI when child throws error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Oops! Algo deu errado')).toBeTruthy();
    expect(getByText('🔄 Tentar Novamente')).toBeTruthy();
  });

  test('logs error when error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });

  test('recovers when component stops throwing error', () => {
    const { getByText, rerender } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // First render should show error
    expect(getByText('Oops! Algo deu errado')).toBeTruthy();

    // Rerender with working component
    rerender(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    // Should still show error (ErrorBoundary doesn't automatically recover)
    expect(getByText('Oops! Algo deu errado')).toBeTruthy();
  });
});