'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';

import { AppCollapsible } from 'app/shared/components/collapsible/AppCollapsible';
import { AppSidebar } from 'app/shared/components/sidebar/AppSidebar';

export function NavMain({
  items,
}: {
  readonly items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <AppSidebar.Group>
      <AppSidebar.GroupLabel>Platform</AppSidebar.GroupLabel>
      <AppSidebar.Menu>
        {items.map((item) => (
          <AppCollapsible.Root key={item.title} asChild defaultOpen={item.isActive} className='group/collapsible'>
            <AppSidebar.MenuItem>
              <AppCollapsible.Trigger asChild>
                <AppSidebar.MenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                </AppSidebar.MenuButton>
              </AppCollapsible.Trigger>
              <AppCollapsible.Content>
                <AppSidebar.MenuSub>
                  {item.items?.map((subItem) => (
                    <AppSidebar.MenuSubItem key={subItem.title}>
                      <AppSidebar.MenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </AppSidebar.MenuSubButton>
                    </AppSidebar.MenuSubItem>
                  ))}
                </AppSidebar.MenuSub>
              </AppCollapsible.Content>
            </AppSidebar.MenuItem>
          </AppCollapsible.Root>
        ))}
      </AppSidebar.Menu>
    </AppSidebar.Group>
  );
}
