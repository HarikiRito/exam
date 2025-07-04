'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Link } from '@remix-run/react';
import { AppCollapsible } from 'app/shared/components/ui/collapsible/AppCollapsible';
import { AppSidebar } from 'app/shared/components/ui/sidebar/AppSidebar';

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem[];
}

interface Props {
  readonly items: NavItem[];
}

export function NavMain({ items }: Props) {
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
                        <Link to={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
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
