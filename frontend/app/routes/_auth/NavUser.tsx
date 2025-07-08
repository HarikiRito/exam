'use client';

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-react';

import { useMeQuery } from 'app/graphql/operations/auth/me.query.generated';
import { AppAvatar } from 'app/shared/components/ui/avatar/AppAvatar';
import { AppDropdown } from 'app/shared/components/ui/dropdown/AppDropdown';
import { AppSidebar } from 'app/shared/components/ui/sidebar/AppSidebar';
import { userStore } from 'app/shared/stores/user.store';
import { CookieKey, CookieService } from 'app/shared/services/cookie.service';
import { APP_ROUTES } from 'app/shared/constants/routes';
import client from 'app/shared/utils/apollo';
import { useNavigate } from 'react-router-dom';

export function NavUser() {
  const { isMobile } = AppSidebar.useSidebar();
  const { data, loading, error } = useMeQuery();
  const navigate = useNavigate();
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !data || !data.me) {
    return <div>Error loading user.</div>;
  }
  const user = data.me;
  // Update user store
  userStore.user = user;

  async function handleLogout() {
    CookieService.removeValue(CookieKey.AccessToken);
    CookieService.removeValue(CookieKey.RefreshToken);
    await client.resetStore();
    navigate(APP_ROUTES.login);
  }

  const userLabel = (
    <AppDropdown.Label className='p-0 font-normal'>
      <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
        <AppAvatar.Root className='h-8 w-8 rounded-lg'>
          {/* <AppAvatar.Image src={user.avatar} alt={user.name} /> */}
          <AppAvatar.Fallback className='rounded-lg'>CN</AppAvatar.Fallback>
        </AppAvatar.Root>
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-medium'>
            {user?.firstName} {user?.lastName}
          </span>
          <span className='truncate text-xs'>{user?.email}</span>
        </div>
      </div>
    </AppDropdown.Label>
  );

  return (
    <AppSidebar.Menu>
      <AppSidebar.MenuItem>
        <AppDropdown.Root>
          <AppDropdown.Trigger asChild>
            <AppSidebar.MenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
              {userLabel}
              <ChevronsUpDown className='ml-auto size-4' />
            </AppSidebar.MenuButton>
          </AppDropdown.Trigger>
          <AppDropdown.Content
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}>
            {userLabel}
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
            <AppDropdown.Item onClick={handleLogout}>
              <LogOut />
              Log out
            </AppDropdown.Item>
          </AppDropdown.Content>
        </AppDropdown.Root>
      </AppSidebar.MenuItem>
    </AppSidebar.Menu>
  );
}
