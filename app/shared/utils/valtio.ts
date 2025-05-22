import { useEffect } from 'react';
import { proxy } from 'valtio';
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

  return { proxyState, reset, useResetHook };
}
