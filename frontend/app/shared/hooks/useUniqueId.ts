import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
/**
 * @description Generate a unique ID for a component key to tell react to re-render the component
 *
 * @returns A unique ID
 */
export function useUniqueId() {
  const [id, setId] = useState(uuidv4());

  const regenerate = useCallback(() => {
    setId(uuidv4());
  }, []);

  return [id, regenerate] as const;
}
