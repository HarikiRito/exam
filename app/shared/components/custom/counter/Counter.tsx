import { useState } from 'react';

interface CounterProps {
  readonly initialValue?: number;
}

export function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue);

  function handleIncrement() {
    setCount((prev) => prev + 1);
  }

  function handleDecrement() {
    setCount((prev) => prev - 1);
  }

  function handleReset() {
    setCount(initialValue);
  }

  return (
    <div className='flex flex-col items-center space-y-4 p-4'>
      <div className='text-2xl font-bold' data-testid='count-display'>
        {count}
      </div>
      <div className='flex space-x-2'>
        <button
          onClick={handleDecrement}
          className='rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600'
          data-testid='decrement-button'>
          -
        </button>
        <button
          onClick={handleReset}
          className='rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
          data-testid='reset-button'>
          Reset
        </button>
        <button
          onClick={handleIncrement}
          className='rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600'
          data-testid='increment-button'>
          +
        </button>
      </div>
    </div>
  );
}
