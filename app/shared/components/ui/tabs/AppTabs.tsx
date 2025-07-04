import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from 'app/shared/utils/className';

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot='tabs' className={cn('flex flex-col gap-2', className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-1',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      className={cn(
        "data-[state=active]:bg-background data-[state=active]:text-foreground ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 inline-flex items-center justify-center gap-2 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 aria-invalid:focus-visible:ring-0 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      className={cn(
        'ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 flex-1 transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 aria-invalid:focus-visible:ring-0',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppTabs` component provides a flexible, accessible tabbed
 * interface for organizing and navigating between different content sections.
 *
 * ## Key Features
 * - Fully accessible tab interactions
 * - Customizable tab layout and content
 * - Responsive design
 * - Seamless integration with Radix UI
 * - Tailwind CSS styling
 * - Multiple component composition
 *
 * ## Example Usage
 * ```tsx
 * import { AppTabs } from 'app/shared/components/tabs/AppTabs';
 * import { AppTypography } from 'app/shared/components/typography/AppTypography';
 *
 * function TabsExample() {
 *   return (
 *     <AppTabs.Root defaultValue="account">
 *       <AppTabs.List>
 *         <AppTabs.Trigger value="account">
 *           Account
 *         </AppTabs.Trigger>
 *         <AppTabs.Trigger value="password">
 *           Password
 *         </AppTabs.Trigger>
 *       </AppTabs.List>
 *
 *       <AppTabs.Content value="account">
 *         <AppTypography>
 *           Manage your account settings here.
 *         </AppTypography>
 *       </AppTabs.Content>
 *
 *       <AppTabs.Content value="password">
 *         <AppTypography>
 *           Change your account password.
 *         </AppTypography>
 *       </AppTabs.Content>
 *     </AppTabs.Root>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppTabs` components from the correct path
 * 2. Use `AppTabs.Root` to manage tab state
 * 3. Use `AppTabs.List` to contain tab triggers
 * 4. Use `AppTabs.Trigger` for each tab navigation item
 * 5. Use `AppTabs.Content` to define content for each tab
 * 6. Set `defaultValue` to specify initial active tab
 *
 * ## Tabs Components
 * - `Root`: Tab state and context management
 * - `List`: Container for tab triggers
 * - `Trigger`: Individual tab navigation button
 * - `Content`: Content panel for each tab
 *
 * ## State Management
 * - Controlled via `value` and `defaultValue` props
 * - Supports programmatic tab switching
 * - Manages focus and keyboard interactions
 *
 * ## Customization Options
 * - Custom styling through Tailwind CSS
 * - Responsive design
 * - Orientation (horizontal/vertical)
 * - Accessibility attributes
 * - Dynamic content rendering
 *
 * ## Orientation Options
 * - `orientation`: 'horizontal' (default) or 'vertical'
 * - Adjust layout based on design requirements
 *
 * ## Best Practices
 * - Keep tab labels concise
 * - Use for logically grouped content
 * - Ensure clear visual hierarchy
 * - Maintain consistent tab width
 * - Test keyboard navigation
 *
 * ## Accessibility Considerations
 * - Supports keyboard navigation
 * - Screen reader friendly
 * - Proper semantic structure
 * - ARIA attributes for enhanced accessibility
 *
 * @see https://www.radix-ui.com/primitives/docs/components/tabs Radix UI Tabs Documentation
 * @category Components
 * @category Navigation
 */
export const AppTabs = {
  Root: Tabs,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
};
