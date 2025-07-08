import * as React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

import { cn } from 'app/shared/utils/className';

function HoverCard({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot='hover-card' {...props} />;
}

function HoverCardTrigger({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot='hover-card-trigger' {...props} />;
}

function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Content
      data-slot='hover-card-content'
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 rounded-md border p-4 shadow-md outline-hidden',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppHoverCard` component provides an interactive hover preview
 * for displaying additional content when users hover over a trigger element.
 *
 * ## Key Features
 * - Accessible hover interactions
 * - Customizable content and styling
 * - Flexible positioning
 * - Seamless integration with Radix UI
 * - Tailwind CSS styling
 *
 * ## Example Usage
 * ```tsx
 * import { AppHoverCard } from 'app/shared/components/hover-card/AppHoverCard';
 * import { AppAvatar } from 'app/shared/components/avatar/AppAvatar';
 * import { AppTypography } from 'app/shared/components/typography/AppTypography';
 *
 * function UserHoverCard() {
 *   return (
 *     <AppHoverCard.Root>
 *       <AppHoverCard.Trigger>
 *         <AppAvatar
 *           src="/path/to/avatar.jpg"
 *           alt="User avatar"
 *         />
 *       </AppHoverCard.Trigger>
 *       <AppHoverCard.Content>
 *         <div className="flex flex-col space-y-2">
 *           <AppTypography.h4>Jane Doe</AppTypography.h4>
 *           <AppTypography.small>
 *             Senior Software Engineer
 *           </AppTypography.small>
 *           <AppTypography.p>
 *             Passionate about building scalable web applications
 *             and mentoring junior developers.
 *           </AppTypography.p>
 *         </div>
 *       </AppHoverCard.Content>
 *     </AppHoverCard.Root>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppHoverCard` components from the correct path
 * 2. Wrap your trigger and content with `AppHoverCard.Root`
 * 3. Use `AppHoverCard.Trigger` to define the hoverable element
 * 4. Use `AppHoverCard.Content` to define the hover preview content
 * 5. Customize styling using Tailwind CSS classes
 *
 * ## Customization Options
 * - `align`: Horizontal alignment of the hover card
 * - `sideOffset`: Distance from the trigger element
 * - Custom styling through Tailwind CSS classes
 *
 * ## Positioning
 * - `center`: Default alignment
 * - `start`: Align to the start of the trigger
 * - `end`: Align to the end of the trigger
 *
 * ## Best Practices
 * - Keep hover content concise and informative
 * - Ensure hover content adds value
 * - Use consistent styling
 * - Consider accessibility for keyboard and screen reader users
 *
 * @see https://www.radix-ui.com/primitives/docs/components/hover-card Radix UI Hover Card Documentation
 * @category Components
 * @category Interaction
 */
export const AppHoverCard = {
  Root: HoverCard,
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
};
