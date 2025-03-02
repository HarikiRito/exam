import { proxy } from 'valtio';

export const themeStore = proxy({
  sideBarWidth: 0,
  headerHeight: 0,
});
