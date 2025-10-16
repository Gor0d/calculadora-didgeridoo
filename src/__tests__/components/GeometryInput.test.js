import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GeometryInput } from '../../components/GeometryInput';

describe('GeometryInput', () => {
  const mockOnGeometryChange = jest.fn();
  const mockOnValidation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    geometry: '',
    onGeometryChange: mockOnGeometryChange,
    onValidation: mockOnValidation,
    currentUnit: 'metric'
  };

  test('renders correctly', () => {
    const { getByPlaceholderText } = render(<GeometryInput {...defaultProps} />);
    expect(getByPlaceholderText(/geometry/i)).toBeTruthy();
  });

  test('calls onGeometryChange when text changes', () => {
    const { getByPlaceholderText } = render(<GeometryInput {...defaultProps} />);
    const input = getByPlaceholderText(/geometry/i);

    fireEvent.changeText(input, '0,30;50,28');

    expect(mockOnGeometryChange).toHaveBeenCalledWith('0,30;50,28');
  });

  test('validates geometry on input', async () => {
    const { getByPlaceholderText } = render(<GeometryInput {...defaultProps} />);
    const input = getByPlaceholderText(/geometry/i);

    fireEvent.changeText(input, '0,30;50,28;100,25');

    await waitFor(() => {
      expect(mockOnValidation).toHaveBeenCalledWith(
        expect.objectContaining({ isValid: true })
      );
    });
  });

  test('shows error for invalid geometry', async () => {
    const { getByPlaceholderText, getByText } = render(<GeometryInput {...defaultProps} />);
    const input = getByPlaceholderText(/geometry/i);

    fireEvent.changeText(input, 'invalid');

    await waitFor(() => {
      expect(mockOnValidation).toHaveBeenCalledWith(
        expect.objectContaining({ isValid: false })
      );
    });
  });

  test('displays current geometry value', () => {
    const geometry = '0,30;50,28;100,25';
    const { getByDisplayValue } = render(
      <GeometryInput {...defaultProps} geometry={geometry} />
    );

    expect(getByDisplayValue(geometry)).toBeTruthy();
  });

  test('handles unit change correctly', () => {
    const { rerender } = render(<GeometryInput {...defaultProps} currentUnit="metric" />);

    rerender(<GeometryInput {...defaultProps} currentUnit="imperial" />);

    // Component should update its display
    expect(mockOnGeometryChange).not.toHaveBeenCalled();
  });
});
