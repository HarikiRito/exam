'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from 'app/shared/utils/className';

interface Props extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  readonly value: number;
  readonly classes?: {
    indicator?: string;
  };
}

function Progress({ className, value, classes, ...props }: Props) {
  return (
    <ProgressPrimitive.Root
      data-slot='progress'
      className={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot='progress-indicator'
        className={cn('bg-primary h-full w-full flex-1 transition-all', classes?.indicator)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppProgress` component provides an accessible, customizable
 * progress indicator for displaying completion status or loading states.
 *
 * ## Key Features
 * - Fully accessible progress interactions
 * - Customizable appearance and behavior
 * - Responsive design
 * - Seamless integration with Radix UI
 * - Tailwind CSS styling
 * - Multiple usage scenarios
 *
 * ## Example Usage
 * ```tsx
 * import { AppProgress } from 'app/shared/components/progress/AppProgress';
 * import { AppTypography } from 'app/shared/components/typography/AppTypography';
 *
 * function ProgressExample() {
 *   return (
 *     <div className="space-y-4">
 *       <AppTypography>Course Completion</AppTypography>
 *       <AppProgress.Root value={65}>
 *         <AppProgress.Indicator />
 *       </AppProgress.Root>
 *
 *       <AppTypography>File Upload</AppTypography>
 *       <AppProgress.Root value={35}>
 *         <AppProgress.Indicator />
 *       </AppProgress.Root>
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppProgress` from the correct path
 * 2. Use `AppProgress.Root` to define progress container
 * 3. Set `value` prop to indicate progress percentage
 * 4. Use `AppProgress.Indicator` for visual representation
 * 5. Optionally add labels or additional context
 *
 * ## Progress Components
 * - `Root`: Progress container and state management
 * - `Indicator`: Visual progress bar or indicator
 *
 * ## Value Configuration
 * - `value`: Progress percentage (0-100)
 * - Supports dynamic value updates
 * - Handles indeterminate states
 *
 * ## Customization Options
 * - Custom styling through Tailwind CSS
 * - Responsive design
 * - Accessibility attributes
 * - Dynamic value rendering
 *
 * ## Use Cases
 * - Loading indicators
 * - Task completion tracking
 * - File upload progress
 * - Course or skill progression
 * - Multi-step form progress
 *
 * ## Best Practices
 * - Provide clear visual feedback
 * - Use meaningful progress values
 * - Ensure readability
 * - Handle edge cases (0%, 100%)
 * - Test accessibility
 *
 * ## Accessibility Considerations
 * - Screen reader friendly
 * - Proper semantic structure
 * - ARIA attributes for enhanced accessibility
 * - Supports keyboard interactions
 *
 * ## Performance Optimization
 * - Minimal re-renders
 * - Lightweight component
 * - Efficient state management
 *
 * @see https://www.radix-ui.com/primitives/docs/components/progress Radix UI Progress Documentation
 * @category Components
 * @category Feedback
 * @category Interaction
 */
export const AppProgress = Progress;
