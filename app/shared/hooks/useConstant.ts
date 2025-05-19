import { useRef } from 'react';

export function useConstant<T>(value: T) {
  const ref = useRef<T>(value);
  return ref.current;
}
