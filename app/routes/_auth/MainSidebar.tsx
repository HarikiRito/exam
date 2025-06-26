import { BookOpen, SquareTerminal, LogOut } from 'lucide-react';

import { AppButton } from 'app/shared/components/button/AppButton';
import { AppSidebar } from 'app/shared/components/sidebar/AppSidebar';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { useElementSpace } from 'app/shared/hooks/useElementSpace';
import { themeStore } from 'app/shared/stores/theme.store';
import { CookieKey, CookieService } from 'app/shared/services/cookie.service';
import client from 'app/shared/utils/apollo';
import { NavItem, NavMain } from './NavMain';
import { NavUser } from './NavUser';
import { TeamSwitcher } from './TeamSwitcher';
import { useNavigate } from 'react-router-dom';

const navMain: NavItem[] = [
  {
    title: 'Playground',
    url: '#',
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: 'Dashboard',
        url: APP_ROUTES.dashboard,
      },
      {
        title: 'Courses',
        url: APP_ROUTES.courses,
      },
      {
        title: 'Profile',
        url: APP_ROUTES.profile,
      },
      {
        title: 'Tests',
        url: APP_ROUTES.testSessions,
      },
    ],
  },
  {
    title: 'Admin',
    url: '#',
    icon: BookOpen,
    items: [
      {
        title: 'Courses',
        url: APP_ROUTES.adminCourses,
      },
      {
        title: 'Questions',
        url: APP_ROUTES.adminQuestions,
      },
      {
        title: 'Question Collections',
        url: APP_ROUTES.adminCollections,
      },
      {
        title: 'Tests',
        url: APP_ROUTES.adminTests,
      },
    ],
  },
];

export function MainSidebar() {
  const [ref] = useElementSpace<HTMLDivElement>((space) => {
    themeStore.sideBarWidth = space.width;
  });

  const navigate = useNavigate();

  async function handleLogout() {
    CookieService.removeValue(CookieKey.AccessToken);
    CookieService.removeValue(CookieKey.RefreshToken);
    await client.resetStore();
    navigate(APP_ROUTES.login);
  }

  return (
    <AppSidebar.Root collapsible='icon' ref={ref}>
      <AppSidebar.Header>
        <TeamSwitcher />
      </AppSidebar.Header>
      <AppSidebar.Content>
        <NavMain items={navMain} />
      </AppSidebar.Content>
      <AppSidebar.Footer>
        <NavUser />
        <AppButton
          onClick={handleLogout}
          variant='ghost'
          className='w-full justify-start text-sm font-normal'
          aria-label='Logout'
          tabIndex={0}>
          <LogOut className='mr-2 h-4 w-4' />
          Logout
        </AppButton>
      </AppSidebar.Footer>
      <AppSidebar.Rail />
    </AppSidebar.Root>
  );
}
