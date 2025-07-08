'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from 'app/shared/utils/className';

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot='tooltip-provider' delayDuration={delayDuration} {...props} />;
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot='tooltip' {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot='tooltip-content'
        sideOffset={sideOffset}
        className={cn(
          'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-w-sm rounded-md px-3 py-1.5 text-xs',
          className,
        )}
        {...props}>
        {children}
        <TooltipPrimitive.Arrow className='bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]' />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppTooltip` component provides an accessible, customizable
 * tooltip system for providing additional context or information
 * about UI elements.
 *
 * ## Key Features
 * - Fully accessible tooltip interactions
 * - Customizable content and positioning
 * - Responsive design
 * - Seamless integration with Radix UI
 * - Tailwind CSS styling
 * - Multiple component composition
 *
 * ## Example Usage
 * ```tsx
 * import { AppTooltip } from 'app/shared/components/tooltip/AppTooltip';
 * import { AppButton } from 'app/shared/components/button/AppButton';
 * import { InfoIcon } from 'lucide-react';
 *
 * function TooltipExample() {
 *   return (
 *     <AppTooltip.Root>
 *       <AppTooltip.Trigger asChild>
 *         <AppButton variant="outline">
 *           <InfoIcon className="h-4 w-4" />
 *         </AppButton>
 *       </AppTooltip.Trigger>
 *       <AppTooltip.Content side="top">
 *         Additional information about this action
 *       </AppTooltip.Content>
 *     </AppTooltip.Root>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppTooltip` components from the correct path
 * 2. Use `AppTooltip.Root` to wrap tooltip functionality
 * 3. Use `AppTooltip.Trigger` to define the element that triggers the tooltip
 * 4. Use `AppTooltip.Content` to define tooltip text or content
 * 5. Customize positioning and behavior as needed
 *
 * ## Tooltip Components
 * - `Root`: Tooltip state and context management
 * - `Trigger`: Element that shows the tooltip on hover/focus
 * - `Content`: Tooltip text or content container
 *
 * ## Positioning Options
 * - `side`: Tooltip placement (top, right, bottom, left)
 * - `align`: Alignment within the chosen side
 * - `sideOffset`: Distance from trigger element
 *
 * ## Customization Options
 * - Custom styling through Tailwind CSS
 * - Responsive design
 * - Accessibility attributes
 * - Dynamic content rendering
 *
 * ## Best Practices
 * - Keep tooltip text concise
 * - Use for supplementary information
 * - Avoid critical information in tooltips
 * - Ensure readability
 * - Test keyboard and screen reader accessibility
 *
 * ## Accessibility Considerations
 * - Supports keyboard navigation
 * - Screen reader friendly
 * - Configurable delay and interaction modes
 *
 * @see https://www.radix-ui.com/primitives/docs/components/tooltip Radix UI Tooltip Documentation
 * @category Components
 * @category Interaction
 */
export const AppTooltip = {
  Root: Tooltip,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Provider: TooltipProvider,
};
