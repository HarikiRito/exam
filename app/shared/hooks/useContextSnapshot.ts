import { Context, useContext } from 'react';
import { useSnapshot } from 'valtio';

export function useContextSnapshot<T>(context: Context<T>) {
  const state = useContext(context);
  if (!state) {
    throw new Error('Context must be provided');
  }
  const snap = useSnapshot(state);

  return { snap, state };
}
