import { useCallback, useState } from 'react';

/**
 * @description Generate a unique ID for a component key to tell react to re-render the component
 *
 * @returns A unique ID
 */
export function useUniqueId() {
  const [id, setId] = useState(generateId());

  function generateId() {
    return crypto.randomUUID() as string;
  }

  const regenerate = useCallback(() => {
    setId(generateId());
  }, []);

  return [id, regenerate] as const;
}
