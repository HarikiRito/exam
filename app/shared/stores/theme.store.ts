import { proxy } from 'valtio';

class ThemeStore {
  sideBarWidth = 0;
  headerHeight = 0;
}

export const themeStore = proxy(new ThemeStore());
