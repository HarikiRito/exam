import { Folder, Forward, MoreHorizontal, Trash2, type LucideIcon } from 'lucide-react';

import { AppDropdown } from 'app/shared/components/dropdown/AppDropdown';
import { AppSidebar } from 'app/shared/components/sidebar/AppSidebar';

export function NavProjects({
  projects,
}: {
  readonly projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const { isMobile } = AppSidebar.useSidebar();

  return (
    <AppSidebar.Group className='group-data-[collapsible=icon]:hidden'>
      <AppSidebar.GroupLabel>Projects</AppSidebar.GroupLabel>
      <AppSidebar.Menu>
        {projects.map((item) => (
          <AppSidebar.MenuItem key={item.name}>
            <AppSidebar.MenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </AppSidebar.MenuButton>
            <AppDropdown.Root>
              <AppDropdown.Trigger asChild>
                <AppSidebar.MenuAction showOnHover>
                  <MoreHorizontal />
                  <span className='sr-only'>More</span>
                </AppSidebar.MenuAction>
              </AppDropdown.Trigger>
              <AppDropdown.Content
                className='w-48 rounded-lg'
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}>
                <AppDropdown.Item>
                  <Folder className='text-muted-foreground' />
                  <span>View Project</span>
                </AppDropdown.Item>
                <AppDropdown.Item>
                  <Forward className='text-muted-foreground' />
                  <span>Share Project</span>
                </AppDropdown.Item>
                <AppDropdown.Separator />
                <AppDropdown.Item>
                  <Trash2 className='text-muted-foreground' />
                  <span>Delete Project</span>
                </AppDropdown.Item>
              </AppDropdown.Content>
            </AppDropdown.Root>
          </AppSidebar.MenuItem>
        ))}
        <AppSidebar.MenuItem>
          <AppSidebar.MenuButton className='text-sidebar-foreground/70'>
            <MoreHorizontal className='text-sidebar-foreground/70' />
            <span>More</span>
          </AppSidebar.MenuButton>
        </AppSidebar.MenuItem>
      </AppSidebar.Menu>
    </AppSidebar.Group>
  );
}
