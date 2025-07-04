import { BookOpen, SquareTerminal } from 'lucide-react';

import { PermissionEnum } from 'app/graphql/graphqlTypes';
import { AppSidebar } from 'app/shared/components/ui/sidebar/AppSidebar';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { useElementSpace } from 'app/shared/hooks/useElementSpace';
import { themeStore } from 'app/shared/stores/theme.store';
import { NavItem, NavMain } from './NavMain';
import { NavUser } from './NavUser';
import { TeamSwitcher } from './TeamSwitcher';
import { PERMISSION_ROUTE } from 'app/shared/constants/permission';

const navMain: NavItem[] = [
  {
    title: 'Features',
    url: '#',
    icon: SquareTerminal,
    isActive: true,
    items: [
      // TODO: WIP features
      // {
      //   title: 'Dashboard',
      //   url: APP_ROUTES.dashboard,
      // },
      // {
      //   title: 'Courses',
      //   url: APP_ROUTES.courses,
      // },
      // {
      //   title: 'Profile',
      //   url: APP_ROUTES.profile,
      // },
      {
        title: 'Test Sessions',
        url: APP_ROUTES.testSessions,
        permissions: PERMISSION_ROUTE.testSessions,
      },
    ],
  },
  {
    title: 'Admin',
    url: '#',
    icon: BookOpen,
    permissions: [PermissionEnum.TestRead],
    items: [
      {
        title: 'Courses',
        url: APP_ROUTES.adminCourses,
        permissions: PERMISSION_ROUTE.adminCourses,
      },
      {
        title: 'Questions',
        url: APP_ROUTES.adminQuestions,
        permissions: PERMISSION_ROUTE.adminQuestions,
      },
      {
        title: 'Question Collections',
        url: APP_ROUTES.adminCollections,
        permissions: PERMISSION_ROUTE.adminCollections,
      },
      {
        title: 'Tests',
        url: APP_ROUTES.adminTests,
        permissions: PERMISSION_ROUTE.adminTests,
      },
      {
        title: 'Users',
        url: APP_ROUTES.adminUsers,
        permissions: PERMISSION_ROUTE.adminUsers,
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
