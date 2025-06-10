import { BookOpen, SquareTerminal } from 'lucide-react';

import { AppSidebar } from 'app/shared/components/sidebar/AppSidebar';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { useElementSpace } from 'app/shared/hooks/useElementSpace';
import { themeStore } from 'app/shared/stores/theme.store';
import { NavItem, NavMain } from './NavMain';
import { NavUser } from './NavUser';
import { TeamSwitcher } from './TeamSwitcher';

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
      </AppSidebar.Footer>
      <AppSidebar.Rail />
    </AppSidebar.Root>
  );
}
