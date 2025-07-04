import { BookOpen, SquareTerminal } from 'lucide-react';

import { PermissionEnum } from 'app/graphql/graphqlTypes';
import { AppSidebar } from 'app/shared/components/ui/sidebar/AppSidebar';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { useElementSpace } from 'app/shared/hooks/useElementSpace';
import { CookieKey, CookieService } from 'app/shared/services/cookie.service';
import { themeStore } from 'app/shared/stores/theme.store';
import client from 'app/shared/utils/apollo';
import { useNavigate } from 'react-router-dom';
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
      {
        title: 'Test Sessions',
        url: APP_ROUTES.testSessions,
        permissions: [PermissionEnum.SessionRead],
      },
    ],
  },
  {
    title: 'Admin',
    url: '#',
    icon: BookOpen,
    permissions: [PermissionEnum.CourseRead, PermissionEnum.QuestionRead, PermissionEnum.TestRead],
    items: [
      {
        title: 'Courses',
        url: APP_ROUTES.adminCourses,
        permissions: [PermissionEnum.CourseRead, PermissionEnum.CourseCreate, PermissionEnum.CourseUpdate],
      },
      {
        title: 'Questions',
        url: APP_ROUTES.adminQuestions,
        permissions: [PermissionEnum.QuestionRead, PermissionEnum.QuestionCreate, PermissionEnum.QuestionUpdate],
      },
      {
        title: 'Question Collections',
        url: APP_ROUTES.adminCollections,
        permissions: [PermissionEnum.QuestionRead, PermissionEnum.QuestionCreate, PermissionEnum.QuestionUpdate],
      },
      {
        title: 'Tests',
        url: APP_ROUTES.adminTests,
        permissions: [PermissionEnum.TestUpdate, PermissionEnum.TestCreate, PermissionEnum.TestDelete],
      },
    ],
  },
];

export function MainSidebar() {
  const [ref] = useElementSpace<HTMLDivElement>((space) => {
    themeStore.sideBarWidth = space.width;
  });

  const navigate = useNavigate();

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
