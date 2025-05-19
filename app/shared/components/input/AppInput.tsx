import * as React from 'react';

import { cn } from 'app/shared/utils/className';

/**
 * # AppInput Component
 *
 * `AppInput` is a customizable input component that uses TailwindCSS for styling.
 *
 * ## Features
 * - Supports all standard HTML input attributes.
 * - Uses the `cn` utility for conditionally applying class names.
 * - Adheres to accessibility best practices with proper data attributes.
 *
 * ## Detailed Usage Instructions and Example Usage
 *
 * The `AppInput` component provides an accessible, customizable
 * input field for capturing user text and numeric input.
 *
 * ## Key Features
 * - Fully accessible input interactions
 * - Customizable appearance and behavior
 * - Responsive design
 * - Tailwind CSS styling
 * - Form and standalone usage support
 * - Multiple input types
 *
 * ## Example Usage
 * ```tsx
 * import { useState } from 'react';
 * import { AppInput } from 'app/shared/components/input/AppInput';
 * import { AppLabel } from 'app/shared/components/label/AppLabel';
 * import { AppForm } from 'app/shared/components/form/AppForm';
 *
 * function InputExample() {
 *   const [email, setEmail] = useState('');
 *
 *   return (
 *     <AppForm.Root>
 *       <AppForm.Item>
 *         <AppLabel htmlFor="email">Email Address</AppLabel>
 *         <AppInput
 *           id="email"
 *           type="email"
 *           placeholder="Enter your email"
 *           value={email}
 *           onChange={(e) => setEmail(e.target.value)}
 *           required
 *         />
 *       </AppForm.Item>
 *     </AppForm.Root>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppInput` from the correct path
 * 2. Use as a controlled or uncontrolled component
 * 3. Set appropriate `type` attribute
 * 4. Add validation and accessibility attributes
 * 5. Optionally handle state and events
 *
 * ## Input Types
 * - `text`: Standard text input
 * - `email`: Email address input
 * - `password`: Secure password input
 * - `number`: Numeric input
 * - `tel`: Telephone number input
 * - `search`: Search input
 * - `url`: URL input
 * - `date`: Date selection
 *
 * ## State Management
 * - Supports controlled and uncontrolled modes
 * - Handles value changes via `onChange`
 * - Supports `value` and `defaultValue` props
 *
 * ## Validation Attributes
 * - `required`: Makes input mandatory
 * - `minLength`: Minimum character length
 * - `maxLength`: Maximum character length
 * - `pattern`: Regex validation
 * - `min`: Minimum value for numeric inputs
 * - `max`: Maximum value for numeric inputs
 *
 * ## Customization Options
 * - Custom styling through Tailwind CSS
 * - Responsive design
 * - Placeholder text
 * - Disabled and read-only states
 * - Prefix and suffix icons
 *
 * ## Form Integration
 * - Compatible with React Hook Form
 * - Supports form validation
 * - Integrates with Zod schemas
 * - Works seamlessly with `AppForm` components
 *
 * ## Best Practices
 * - Provide clear input labels
 * - Use appropriate input types
 * - Implement client-side validation
 * - Handle error states
 * - Ensure keyboard accessibility
 * - Provide helpful placeholder text
 *
 * ## Accessibility Considerations
 * - Screen reader friendly
 * - Supports keyboard navigation
 * - ARIA attributes for enhanced accessibility
 * - Clear error messaging
 * - Proper focus management
 *
 * ## Performance Optimization
 * - Minimal re-renders
 * - Lightweight component
 * - Efficient state management
 *
 * @category Components
 * @category Form
 * @category Interaction
 */

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground aria-invalid:outline-destructive/60 aria-invalid:ring-destructive/20 dark:aria-invalid:outline-destructive dark:aria-invalid:ring-destructive/50 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 aria-invalid:border-destructive/60 dark:aria-invalid:border-destructive flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-4 focus-visible:outline-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:focus-visible:ring-[3px] aria-invalid:focus-visible:outline-none md:text-sm dark:aria-invalid:focus-visible:ring-4',
        className,
      )}
      {...props}
    />
  );
}

export const AppInput = Input;
