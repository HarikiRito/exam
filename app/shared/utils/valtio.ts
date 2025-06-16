import { useEffect } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { deepClone } from 'valtio/utils';

export function createProxyWithReset<T extends object>(initialState: T) {
  const proxyState = proxy(initialState);

  function reset() {
    const resetState = initialState;
    for (const key in resetState) {
      if (typeof resetState[key] !== 'function') {
        proxyState[key] = deepClone(resetState[key]);
      }
    }
  }

  function useResetHook() {
    // Since the proxy are external state, we need to reset them when the component unmounts to make sure the state is not persisted
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

/**
 * Unwraps a proxy to a deep clone of the original object.
 * @param proxy - The proxy to unwrap.
 * @returns A deep clone of the original object.
 */
export function unwrapProxy<T extends object>(proxy: T) {
  return deepClone(proxy);
}
