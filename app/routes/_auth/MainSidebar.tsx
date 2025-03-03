import { BookOpen, Bot, Frame, Map, PieChart, Settings2, SquareTerminal } from 'lucide-react';

import { AppSidebar } from 'app/shared/components/sidebar/AppSidebar';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { useElementSpace } from 'app/shared/hooks/useElementSpace';
import { themeStore } from 'app/shared/stores/themeStore';
import { NavMain } from './NavMain';
import { NavProjects } from './NavProjects';
import { NavUser } from './NavUser';
import { TeamSwitcher } from './TeamSwitcher';

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: 'https://picsum.photos/seed/shadcn/200/300',
  },
  navMain: [
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
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
};

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
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </AppSidebar.Content>
      <AppSidebar.Footer>
        <NavUser user={data.user} />
      </AppSidebar.Footer>
      <AppSidebar.Rail />
    </AppSidebar.Root>
  );
}
