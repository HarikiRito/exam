import { atom, createStore } from 'jotai';

export const themeStore = createStore();

export class ThemeStoreAtom {
  static readonly sideBarSize = atom(0);
  static readonly headerHeight = atom(0);
}
