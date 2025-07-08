'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from 'app/shared/utils/className';

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppSwitch` component provides an accessible, customizable
 * toggle switch for boolean input interactions.
 *
 * ## Key Features
 * - Fully accessible switch interactions
 * - Customizable appearance and behavior
 * - Responsive design
 * - Seamless integration with Radix UI
 * - Tailwind CSS styling
 * - Form and standalone usage support
 *
 * ## Example Usage
 * ```tsx
 * import { useState } from 'react';
 * import { AppSwitch } from 'app/shared/components/switch/AppSwitch';
 * import { AppTypography } from 'app/shared/components/typography/AppTypography';
 *
 * function SwitchExample() {
 *   const [isEnabled, setIsEnabled] = useState(false);
 *
 *   return (
 *     <div className="flex items-center space-x-4">
 *       <AppTypography>Notifications</AppTypography>
 *       <AppSwitch
 *         checked={isEnabled}
 *         onCheckedChange={setIsEnabled}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppSwitch` from the correct path
 * 2. Use as a controlled or uncontrolled component
 * 3. Optionally add labels or additional context
 * 4. Control state via `checked` and `onCheckedChange` props
 *
 * ## State Management
 * - Controlled via `checked` and `onCheckedChange` props
 * - Supports programmatic state changes
 * - Manages focus and keyboard interactions
 *
 * ## Customization Options
 * - Custom styling through Tailwind CSS
 * - Responsive design
 * - Accessibility attributes
 * - Dynamic state rendering
 *
 * ## Form Integration
 * - Compatible with React Hook Form
 * - Supports controlled and uncontrolled modes
 * - Integrates with form validation
 *
 * ## Best Practices
 * - Use for binary/boolean settings
 * - Provide clear visual and textual context
 * - Ensure immediate feedback on state change
 * - Keep toggle purpose concise
 * - Test keyboard and screen reader accessibility
 *
 * ## Accessibility Considerations
 * - Supports keyboard navigation
 * - Screen reader friendly
 * - Proper semantic structure
 * - ARIA attributes for enhanced accessibility
 *
 * ## Performance Optimization
 * - Minimal re-renders
 * - Lightweight component
 * - Efficient state management
 *
 * @see https://www.radix-ui.com/primitives/docs/components/switch Radix UI Switch Documentation
 * @category Components
 * @category Form
 * @category Interaction
 */

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      className={cn(
        'peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent shadow-xs transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-hidden focus-visible:outline-1 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:focus-visible:ring-0',
        className,
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className={cn(
          'bg-background pointer-events-none block size-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch as AppSwitch };
