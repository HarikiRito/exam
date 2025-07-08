import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from 'app/shared/utils/className';

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot='popover' {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot='popover-trigger' {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot='popover-content'
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md outline-hidden',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot='popover-anchor' {...props} />;
}

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppPopover` component provides an interactive overlay
 * for displaying additional content triggered by a user action.
 *
 * ## Key Features
 * - Accessible popover interactions
 * - Customizable content and positioning
 * - Flexible trigger mechanisms
 * - Seamless integration with Radix UI
 * - Tailwind CSS styling
 *
 * ## Example Usage
 * ```tsx
 * import { AppPopover } from 'app/shared/components/popover/AppPopover';
 * import { AppButton } from 'app/shared/components/button/AppButton';
 * import { AppTypography } from 'app/shared/components/typography/AppTypography';
 *
 * function UserProfilePopover() {
 *   return (
 *     <AppPopover.Root>
 *       <AppPopover.Trigger asChild>
 *         <AppButton variant="outline">
 *           View Profile Details
 *         </AppButton>
 *       </AppPopover.Trigger>
 *       <AppPopover.Content>
 *         <div className="space-y-4 p-4">
 *           <AppTypography.h4>User Profile</AppTypography.h4>
 *           <div className="grid grid-cols-2 gap-2">
 *             <AppTypography.small>Name:</AppTypography.small>
 *             <AppTypography.small>John Doe</AppTypography.small>
 *             <AppTypography.small>Email:</AppTypography.small>
 *             <AppTypography.small>john@example.com</AppTypography.small>
 *             <AppTypography.small>Role:</AppTypography.small>
 *             <AppTypography.small>Developer</AppTypography.small>
 *           </div>
 *         </div>
 *       </AppPopover.Content>
 *     </AppPopover.Root>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppPopover` components from the correct path
 * 2. Wrap your trigger and content with `AppPopover.Root`
 * 3. Use `AppPopover.Trigger` to define the element that opens the popover
 * 4. Use `AppPopover.Content` to define the popover's content
 * 5. Customize styling using Tailwind CSS classes
 *
 * ## Popover Components
 * - `Root`: Main popover container
 * - `Trigger`: Element that toggles the popover
 * - `Content`: Popover's content container
 * - `Anchor`: Optional anchor point for positioning
 *
 * ## Positioning Options
 * - `align`: Horizontal alignment ('center', 'start', 'end')
 * - `sideOffset`: Distance from the trigger element
 *
 * ## Customization Options
 * - Custom content styling
 * - Responsive design
 * - Accessibility attributes
 * - Dynamic content rendering
 *
 * ## Best Practices
 * - Keep popover content concise
 * - Ensure content is relevant to the trigger
 * - Use meaningful trigger labels
 * - Consider mobile responsiveness
 * - Implement keyboard navigation
 *
 * @see https://www.radix-ui.com/primitives/docs/components/popover Radix UI Popover Documentation
 * @category Components
 * @category Interaction
 */
export const AppPopover = {
  Root: Popover,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Anchor: PopoverAnchor,
};
