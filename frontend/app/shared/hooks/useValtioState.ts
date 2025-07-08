import { useConstant } from 'app/shared/hooks/useConstant';
import { useSnapshot } from 'valtio/react';

export function useValtioState<T extends object>(fn: () => T) {
  const mutation = useConstant(() => fn());
  const snapshot = useSnapshot(mutation);
  return [snapshot, mutation] as const;
}
