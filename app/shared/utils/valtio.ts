import { useEffect } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { deepClone } from 'valtio/utils';

export function createProxyWithReset<T extends object>(initialState: T) {
  const proxyState = proxy(deepClone(initialState));

  function reset() {
    const resetState = deepClone(initialState);
    for (const key in resetState) {
      if (typeof resetState[key] !== 'function') {
        proxyState[key] = resetState[key];
      }
    }
  }

  function useResetHook() {
    useEffect(() => {
      return () => {
        reset();
      };
    }, []);
  }

  function useStateSnapshot() {
    /**
     * We acknowledge that this is a bit of a hack, but it works.
     * The type returned by useSnapshot is not the same as the type of the initial state.
     * This is a workaround to get the correct type without to deal with the readonly nature of the state.
     */
    return useSnapshot(proxyState) as T;
  }

  return { proxyState, reset, useResetHook, useStateSnapshot };
}
