import { useRef } from 'react';

/**
 * Returns a constant value that is only created once.
 * @param value - The value to create.
 * @returns The constant value.
 */
export function useConstant<T>(value: () => T) {
  const ref = useRef(value());
  return ref.current;
}
