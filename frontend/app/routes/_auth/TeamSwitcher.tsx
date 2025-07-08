import { BookKey, ChevronsUpDown } from 'lucide-react';

import { AppSidebar } from 'app/shared/components/ui/sidebar/AppSidebar';

export function TeamSwitcher() {
  return (
    <AppSidebar.Menu>
      <AppSidebar.MenuItem>
        <AppSidebar.MenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
            <BookKey className='size-4' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-medium'>Learning Hub</span>
          </div>
          <ChevronsUpDown className='ml-auto' />
        </AppSidebar.MenuButton>
      </AppSidebar.MenuItem>
    </AppSidebar.Menu>
  );
}
