import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

describe('Counter Component', () => {
  it('should render with default initial value of 0', () => {
    render(<Counter />);

    const countDisplay = screen.getByTestId('count-display');
    expect(countDisplay).toHaveTextContent('0');
  });

  it('should render with custom initial value', () => {
    render(<Counter initialValue={5} />);

    const countDisplay = screen.getByTestId('count-display');
    expect(countDisplay).toHaveTextContent('5');
  });

  it('should increment count when increment button is clicked', () => {
    render(<Counter />);

    const countDisplay = screen.getByTestId('count-display');
    const incrementButton = screen.getByTestId('increment-button');

    fireEvent.click(incrementButton);
    expect(countDisplay).toHaveTextContent('1');

    fireEvent.click(incrementButton);
    expect(countDisplay).toHaveTextContent('2');
  });

  it('should decrement count when decrement button is clicked', () => {
    render(<Counter initialValue={5} />);

    const countDisplay = screen.getByTestId('count-display');
    const decrementButton = screen.getByTestId('decrement-button');

    fireEvent.click(decrementButton);
    expect(countDisplay).toHaveTextContent('4');

    fireEvent.click(decrementButton);
    expect(countDisplay).toHaveTextContent('3');
  });

  it('should reset count to initial value when reset button is clicked', () => {
    render(<Counter initialValue={10} />);

    const countDisplay = screen.getByTestId('count-display');
    const incrementButton = screen.getByTestId('increment-button');
    const resetButton = screen.getByTestId('reset-button');

    // Increment a few times
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    expect(countDisplay).toHaveTextContent('12');

    // Reset should go back to initial value
    fireEvent.click(resetButton);
    expect(countDisplay).toHaveTextContent('10');
  });

  it('should handle negative values', () => {
    render(<Counter initialValue={0} />);

    const countDisplay = screen.getByTestId('count-display');
    const decrementButton = screen.getByTestId('decrement-button');

    fireEvent.click(decrementButton);
    expect(countDisplay).toHaveTextContent('-1');

    fireEvent.click(decrementButton);
    expect(countDisplay).toHaveTextContent('-2');
  });

  it('should render all buttons with correct labels', () => {
    render(<Counter />);

    expect(screen.getByTestId('increment-button')).toHaveTextContent('+');
    expect(screen.getByTestId('decrement-button')).toHaveTextContent('-');
    expect(screen.getByTestId('reset-button')).toHaveTextContent('Reset');
  });
});
