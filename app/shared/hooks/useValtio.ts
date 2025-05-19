import { useConstant } from 'app/shared/hooks/useConstant';
import { proxy, useSnapshot } from 'valtio';

export function useValtioState<T extends object>(store: T) {
  const ref = useConstant(proxy(store));
  const snapshot = useSnapshot(ref);
  return [snapshot, ref] as const;
}
