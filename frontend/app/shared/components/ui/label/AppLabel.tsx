'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from 'app/shared/utils/className';

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot='label'
      className={cn(
        'text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppLabel` component provides an accessible, customizable
 * label for form inputs and other interactive elements.
 *
 * ## Key Features
 * - Fully accessible label interactions
 * - Customizable appearance and styling
 * - Responsive design
 * - Seamless integration with Radix UI
 * - Tailwind CSS styling
 * - Form and standalone usage support
 *
 * ## Example Usage
 * ```tsx
 * import { AppLabel } from 'app/shared/components/label/AppLabel';
 * import { AppInput } from 'app/shared/components/input/AppInput';
 * import { AppForm } from 'app/shared/components/form/AppForm';
 *
 * function LabelExample() {
 *   return (
 *     <AppForm.Root>
 *       <AppForm.Item>
 *         <AppLabel htmlFor="email">Email Address</AppLabel>
 *         <AppInput
 *           id="email"
 *           type="email"
 *           placeholder="Enter your email"
 *         />
 *       </AppForm.Item>
 *     </AppForm.Root>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppLabel` from the correct path
 * 2. Use with form inputs or interactive elements
 * 3. Set `htmlFor` attribute to match input `id`
 * 4. Provide clear, descriptive text
 * 5. Optionally add additional styling or variants
 *
 * ## Label Attributes
 * - `htmlFor`: Associates label with specific input
 * - `className`: Custom styling
 * - Supports all standard HTML label attributes
 *
 * ## Customization Options
 * - Custom styling through Tailwind CSS
 * - Responsive design
 * - Accessibility attributes
 * - Dynamic text rendering
 *
 * ## Form Integration
 * - Compatible with React Hook Form
 * - Works seamlessly with `AppForm` components
 * - Enhances form accessibility
 *
 * ## Best Practices
 * - Always provide labels for form inputs
 * - Keep label text concise and descriptive
 * - Ensure color contrast
 * - Match label text with input purpose
 * - Test screen reader compatibility
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
 * - Efficient rendering
 *
 * @see https://www.radix-ui.com/primitives/docs/components/label Radix UI Label Documentation
 * @category Components
 * @category Form
 * @category Interaction
 */
export const AppLabel = Label;
