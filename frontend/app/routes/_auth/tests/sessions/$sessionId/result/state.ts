import { createProxyWithReset } from 'app/shared/utils/valtio';

export type FilterTab = 'all' | 'correct' | 'incorrect';

export const resultStore = createProxyWithReset(
  new (class ResultState {
    filterTab: FilterTab = 'all';

    setFilterTab(tab: FilterTab) {
      this.filterTab = tab;
    }
  })(),
);
