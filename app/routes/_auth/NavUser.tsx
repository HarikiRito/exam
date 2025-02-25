'use client';

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-react';

import { AppAvatar } from 'app/shared/components/avatar/AppAvatar';
import { AppDropdown } from 'app/shared/components/dropdown/AppDropdown';
import { AppSidebar } from 'app/shared/components/sidebar/AppSidebar';

export function NavUser({
  user,
}: {
  readonly user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = AppSidebar.useSidebar();

  return (
    <AppSidebar.Menu>
      <AppSidebar.MenuItem>
        <AppDropdown.Root>
          <AppDropdown.Trigger asChild>
            <AppSidebar.MenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
              <AppAvatar.Root className='h-8 w-8 rounded-lg'>
                <AppAvatar.Image src={user.avatar} alt={user.name} />
                <AppAvatar.Fallback className='rounded-lg'>CN</AppAvatar.Fallback>
              </AppAvatar.Root>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{user.name}</span>
                <span className='truncate text-xs'>{user.email}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </AppSidebar.MenuButton>
          </AppDropdown.Trigger>
          <AppDropdown.Content
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}>
            <AppDropdown.Label className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <AppAvatar.Root className='h-8 w-8 rounded-lg'>
                  <AppAvatar.Image src={user.avatar} alt={user.name} />
                  <AppAvatar.Fallback className='rounded-lg'>CN</AppAvatar.Fallback>
                </AppAvatar.Root>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{user.name}</span>
                  <span className='truncate text-xs'>{user.email}</span>
                </div>
              </div>
            </AppDropdown.Label>
            <AppDropdown.Separator />
            <AppDropdown.Group>
              <AppDropdown.Item>
                <Sparkles />
                Upgrade to Pro
              </AppDropdown.Item>
            </AppDropdown.Group>
            <AppDropdown.Separator />
            <AppDropdown.Group>
              <AppDropdown.Item>
                <BadgeCheck />
                Account
              </AppDropdown.Item>
              <AppDropdown.Item>
                <CreditCard />
                Billing
              </AppDropdown.Item>
              <AppDropdown.Item>
                <Bell />
                Notifications
              </AppDropdown.Item>
            </AppDropdown.Group>
            <AppDropdown.Separator />
            <AppDropdown.Item>
              <LogOut />
              Log out
            </AppDropdown.Item>
          </AppDropdown.Content>
        </AppDropdown.Root>
      </AppSidebar.MenuItem>
    </AppSidebar.Menu>
  );
}
