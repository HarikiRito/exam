import * as React from 'react';
import { ChevronsUpDown, Plus } from 'lucide-react';

import { AppDropdown } from 'app/shared/components/dropdown/AppDropdown';
import { AppSidebar } from 'app/shared/components/sidebar/AppSidebar';

export function TeamSwitcher({
  teams,
}: {
  readonly teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const { isMobile } = AppSidebar.useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(
    teams[0] ?? {
      name: '',
      logo: () => null,
      plan: '',
    },
  );

  return (
    <AppSidebar.Menu>
      <AppSidebar.MenuItem>
        <AppDropdown.Root>
          <AppDropdown.Trigger asChild>
            <AppSidebar.MenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <activeTeam.logo className='size-4' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{activeTeam.name}</span>
                <span className='truncate text-xs'>{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </AppSidebar.MenuButton>
          </AppDropdown.Trigger>
          <AppDropdown.Content
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}>
            <AppDropdown.Label className='text-muted-foreground text-xs'>Teams</AppDropdown.Label>
            {teams.map((team, index) => (
              <AppDropdown.Item key={team.name} onClick={() => setActiveTeam(team)} className='gap-2 p-2'>
                <div className='flex size-6 items-center justify-center rounded-xs border'>
                  <team.logo className='size-4 shrink-0' />
                </div>
                {team.name}
                <AppDropdown.Shortcut>⌘{index + 1}</AppDropdown.Shortcut>
              </AppDropdown.Item>
            ))}
            <AppDropdown.Separator />
            <AppDropdown.Item className='gap-2 p-2'>
              <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                <Plus className='size-4' />
              </div>
              <div className='text-muted-foreground font-medium'>Add team</div>
            </AppDropdown.Item>
          </AppDropdown.Content>
        </AppDropdown.Root>
      </AppSidebar.MenuItem>
    </AppSidebar.Menu>
  );
}
